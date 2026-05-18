# SpeakUp Gemma 4 Fine-Tune Proof

This folder contains proof metadata for the Colab T4 LoRA fine-tune run used for the Kaggle submission.

## Artifact

- Local adapter zip: `/Users/hetulpatel/Downloads/speakup-gemma4-t4-lora.zip`
- Size: 273 MB
- Not committed to GitHub because it exceeds normal repository file limits.
- Included proof files:
  - `proof/adapter_config.json`
  - `proof/trainer_state.json`
  - `proof/LORA_README.md`
  - `GEMMA4HACKATHON.ipynb`

## Run Summary

| Item | Value |
|------|-------|
| Base model | `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit` |
| Method | Unsloth QLoRA |
| LoRA rank | 8 |
| LoRA alpha | 16 |
| Epochs | 3 |
| Steps | 24 |
| Dataset | `finetune/dataset/aac_training.jsonl` |
| Final logged loss | 0.1734 |

The training log shows loss moving from about `0.99` at the beginning of training to `0.17` at the final logged step.

## How the App Uses It

The backend prefers an Ollama model named `speakup-gemma4` when available. After merging/exporting the LoRA adapter into an Ollama-compatible model, set:

```bash
OLLAMA_MODEL=speakup-gemma4
```

If `speakup-gemma4` is not installed, the app stays Gemma 4-only and falls back to the local Gemma 4 E2B model:

```bash
ollama pull gemma4:e2b-it-q4_K_M
```

The downloaded Colab artifact is a safetensors LoRA adapter. For the most reliable local runtime, merge/export it to GGUF with the included `push_to_ollama.py` flow or an equivalent Unsloth export, then create the Ollama model as `speakup-gemma4`. If your Ollama runtime rejects direct adapter import for Gemma 4, keep the app on the Gemma 4 base model for judging and submit the LoRA zip plus notebook as the fine-tuning proof.

## Submission Note

For Kaggle, attach the Colab notebook, screenshots/logs, and the LoRA adapter artifact as proof. The public GitHub repo should stay lightweight and runnable.
