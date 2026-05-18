# SpeakUp — Fine-tuning Guide

## Overview
Fine-tune Gemma 4 on AAC (Augmentative & Alternative Communication) data to improve intent prediction accuracy.
This qualifies for the **Unsloth Special Track ($10,000 prize)**.

## Requirements
- T4 16GB works with the default E2B QLoRA settings
- A100/RTX 4090 can use E4B or 31B overrides
- Python 3.10+

## Setup
```bash
pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"
pip install --no-deps trl peft accelerate bitsandbytes datasets transformers
```

## Run Fine-tuning
```bash
cd finetune
python finetune_gemma.py
```

By default this trains `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit` with T4-safe settings. To chase higher quality on A100/H100, override the base:

```bash
MODEL_NAME=unsloth/gemma-4-E4B-it-unsloth-bnb-4bit MAX_SEQ_LENGTH=2048 LORA_RANK=16 BATCH_SIZE=1 GRAD_ACCUMULATION=8 python finetune_gemma.py
MODEL_NAME=unsloth/gemma-4-31B-it-unsloth-bnb-4bit python finetune_gemma.py
```

Training takes about 30–70 minutes on a Colab T4 for the current 61-example AAC dataset, depending on runtime speed.

## Colab T4 Notebook
Use `SpeakUp_Gemma4_T4_Finetune.ipynb` when you only have free/low-cost Colab T4 access. It trains and downloads the small LoRA adapter. Do not upload a 5GB GGUF to Kaggle unless you actually have storage and time; for submission, the public repo plus notebook, logs, and LoRA adapter proof is usually the safer path.

## Convert & Load to Ollama
```bash
python push_to_ollama.py
```

## Update Backend
In `backend/.env`, set:
```
OLLAMA_MODEL=speakup-gemma4
```

## Dataset
`dataset/aac_training.jsonl` — 61 expert-crafted AAC communication scenarios.
The dataset teaches the model to:
- Interpret gesture + sound + object combinations
- Apply profile-specific memory patterns
- Assign accurate confidence scores
- Detect urgency and emotion
- Return structured JSON reliably

## Benchmarks
Run `python evaluate.py` to measure:
- JSON parse success rate (target: 98%+)
- Confidence calibration
- Intent accuracy on held-out test set
