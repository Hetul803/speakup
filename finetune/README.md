# SpeakUp — Fine-tuning Guide

## Overview
Fine-tune Gemma 4 on AAC (Augmentative & Alternative Communication) data to improve intent prediction accuracy.
This qualifies for the **Unsloth Special Track ($10,000 prize)**.

## Requirements
- GPU with 16GB+ VRAM (A100, RTX 4090, or use Google Colab Pro)
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

By default this trains `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`, which is the best deadline-safe choice for the Unsloth track. To chase maximum quality on an A100/H100, override the base:

```bash
MODEL_NAME=unsloth/gemma-4-31B-it-unsloth-bnb-4bit python finetune_gemma.py
```

Training takes about 15–30 minutes on an A100 for the current 61-example AAC dataset.

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
