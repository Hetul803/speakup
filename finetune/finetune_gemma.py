#!/usr/bin/env python3

"""
SpeakUp — Gemma 4 Fine-tuning with Unsloth
Targets the Unsloth Special Track ($10,000 prize)

Install:
  pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"
  pip install --no-deps trl peft accelerate bitsandbytes

Run:
  python finetune_gemma.py

After training, weights are saved to ./speakup-gemma4-lora/
Then run push_to_ollama.py to use locally.
"""

import os
import json
from datasets import Dataset

try:
    from unsloth import FastLanguageModel
    import torch
    UNSLOTH_AVAILABLE = True
except ImportError:
    print("WARNING: Unsloth not installed. Install it first.")
    UNSLOTH_AVAILABLE = False

# === Config ===
# T4-safe default. Override with Gemma 4 E4B/31B only if your GPU has enough VRAM.
MODEL_NAME = os.getenv("MODEL_NAME", "unsloth/gemma-4-E2B-it-unsloth-bnb-4bit")
MAX_SEQ_LENGTH = int(os.getenv("MAX_SEQ_LENGTH", "1024"))
LOAD_IN_4BIT = True
LORA_RANK = int(os.getenv("LORA_RANK", "8"))
LORA_ALPHA = int(os.getenv("LORA_ALPHA", str(LORA_RANK * 2)))
OUTPUT_DIR = "./speakup-gemma4-lora"
NUM_EPOCHS = int(os.getenv("NUM_EPOCHS", "3"))
BATCH_SIZE = int(os.getenv("BATCH_SIZE", "1"))
GRAD_ACCUMULATION = int(os.getenv("GRAD_ACCUMULATION", "8"))
LEARNING_RATE = float(os.getenv("LEARNING_RATE", "2e-4"))

SYSTEM_PROMPT = """You are SpeakUp's AI intent engine for minimally speaking and non-speaking communicators. Respond ONLY with valid JSON."""

def load_dataset_from_jsonl(path: str):
    data = []
    with open(path) as f:
        for line in f:
            item = json.loads(line.strip())
            data.append(item)
    return data

def format_conversation(example):
    """Format for Gemma chat template"""
    messages = example["messages"]
    text = ""
    for msg in messages:
        if msg["role"] == "system":
            text += f"<start_of_turn>user\n[System: {msg['content']}]\n"
        elif msg["role"] == "user":
            text += f"{msg['content']}<end_of_turn>\n"
            text += "<start_of_turn>model\n"
        elif msg["role"] == "assistant":
            text += f"{msg['content']}<end_of_turn>\n"
    return {"text": text}

def main():
    if not UNSLOTH_AVAILABLE:
        print("Please install Unsloth first. See: https://github.com/unslothai/unsloth")
        return

    print(f"Loading {MODEL_NAME} with Unsloth...")
    model, tokenizer = FastLanguageModel.from_pretrained(
        model_name=MODEL_NAME,
        max_seq_length=MAX_SEQ_LENGTH,
        load_in_4bit=LOAD_IN_4BIT,
        dtype=None,
    )

    # Add LoRA adapters
    model = FastLanguageModel.get_peft_model(
        model,
        r=LORA_RANK,
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
        lora_alpha=LORA_ALPHA,
        lora_dropout=0.05,
        bias="none",
        use_gradient_checkpointing="unsloth",
        random_state=42,
        use_rslora=True,
    )

    # Load dataset
    print("Loading AAC training data...")
    raw_data = load_dataset_from_jsonl("dataset/aac_training.jsonl")
    dataset = Dataset.from_list(raw_data)
    dataset = dataset.map(format_conversation, remove_columns=dataset.column_names)

    print(f"Training on {len(dataset)} examples")

    from trl import SFTTrainer
    from transformers import TrainingArguments

    trainer = SFTTrainer(
        model=model,
        tokenizer=tokenizer,
        train_dataset=dataset,
        dataset_text_field="text",
        max_seq_length=MAX_SEQ_LENGTH,
        dataset_num_proc=2,
        packing=False,
        args=TrainingArguments(
            per_device_train_batch_size=BATCH_SIZE,
            gradient_accumulation_steps=GRAD_ACCUMULATION,
            warmup_steps=5,
            num_train_epochs=NUM_EPOCHS,
            learning_rate=LEARNING_RATE,
            fp16=not torch.cuda.is_bf16_supported(),
            bf16=torch.cuda.is_bf16_supported(),
            logging_steps=1,
            optim="adamw_8bit",
            weight_decay=0.01,
            lr_scheduler_type="linear",
            output_dir=OUTPUT_DIR,
            report_to="none",
            save_strategy="epoch",
        ),
    )

    print("Starting fine-tuning...")
    trainer.train()

    print(f"Saving LoRA adapter to {OUTPUT_DIR}")
    model.save_pretrained(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)

    print("Fine-tuning complete!")
    print(f"Model saved to {OUTPUT_DIR}")
    print("Run push_to_ollama.py to convert and load into Ollama")

    # Benchmark
    print("\n=== Quick Benchmark ===")
    FastLanguageModel.for_inference(model)
    test_input = """Communicator: points at cup, soft mmm sound. Time: afternoon. Memory: soft mmm + cup = water (confirmed 3x)."""
    inputs = tokenizer([f"<start_of_turn>user\n{test_input}<end_of_turn>\n<start_of_turn>model\n"], return_tensors="pt").to("cuda")
    outputs = model.generate(**inputs, max_new_tokens=256, temperature=0.2)
    print(tokenizer.decode(outputs[0], skip_special_tokens=True))

if __name__ == "__main__":
    main()
