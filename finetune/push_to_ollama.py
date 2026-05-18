#!/usr/bin/env python3
"""
Convert fine-tuned LoRA model to GGUF and load into Ollama
Run AFTER finetune_gemma.py completes.
"""
import subprocess
import os
import glob

LORA_DIR = "./speakup-gemma4-lora"
GGUF_PATH = "./speakup-gemma4.gguf"
OLLAMA_MODEL_NAME = "speakup-gemma4"

MODELFILE = f"""FROM {GGUF_PATH}

SYSTEM You are SpeakUp's AI intent engine. You help non-verbal and minimally verbal autistic children communicate. Given multimodal signals and child memory, predict communication intent. Respond ONLY with valid JSON.

PARAMETER temperature 0.2
PARAMETER top_p 0.9
PARAMETER num_predict 512
"""

def main():
    print("Step 1: Merging LoRA weights into base model...")
    try:
        from unsloth import FastLanguageModel
        model, tokenizer = FastLanguageModel.from_pretrained(LORA_DIR)
        model.save_pretrained_gguf("speakup-gemma4", tokenizer, quantization_method="q4_k_m")
        generated = sorted(glob.glob("speakup-gemma4*.gguf"))
        if generated:
            global GGUF_PATH, MODELFILE
            GGUF_PATH = f"./{generated[0]}"
            MODELFILE = MODELFILE.replace("./speakup-gemma4.gguf", GGUF_PATH)
        print(f"GGUF saved to {GGUF_PATH}")
    except Exception as e:
        print(f"Merge failed: {e}")
        print("Try manually: python -c \"from unsloth import FastLanguageModel; m,t = FastLanguageModel.from_pretrained('./speakup-gemma4-lora'); m.save_pretrained_gguf('speakup-gemma4', t)\"")
        return

    print("Step 2: Creating Modelfile...")
    with open("Modelfile", "w") as f:
        f.write(MODELFILE)

    print("Step 3: Creating Ollama model...")
    result = subprocess.run(["ollama", "create", OLLAMA_MODEL_NAME, "-f", "Modelfile"], capture_output=True, text=True)
    if result.returncode == 0:
        print(f"\nSuccess! Model '{OLLAMA_MODEL_NAME}' created in Ollama")
        print(f"Update OLLAMA_MODEL in backend/.env to: {OLLAMA_MODEL_NAME}")
    else:
        print(f"Ollama create failed: {result.stderr}")

    print("Step 4: Testing model...")
    result = subprocess.run(
        ["ollama", "run", OLLAMA_MODEL_NAME, "Child: points at cup. Time: afternoon. Predict intent."],
        capture_output=True, text=True, timeout=30
    )
    print(result.stdout)

if __name__ == "__main__":
    main()
