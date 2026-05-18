# SpeakUp Validation Snapshot

This file records the local demo validation used for the Kaggle submission. It avoids clinical or fine-tuning claims unless those runs are completed and documented.

## Current Local Runtime

| Check | Result |
|-------|--------|
| Ollama reachable | Pass |
| Active model | `gemma4:e2b-it-q4_K_M` |
| Non-Gemma fallback | Disabled |
| Frontend production build | Pass |
| Backend import/compile check | Pass |
| Demo data | Synthetic only |

## Smoke Tests

| Flow | Result |
|------|--------|
| `/health` | Reports Gemma 4 ready |
| Demo seed | Creates Emma Demo with synthetic patterns and care-team contact |
| Intent prediction | Returns structured JSON from `gemma4:e2b-it-q4_K_M` |
| Gemma chat signal | Uses memory: `Soft "mmm" -> I want water` |
| Caregiver progress chat | Summarizes confirmed demo progress |
| Camera controls | Preview toggle, stop button, and hidden-preview mode present |
| Sound controls | MediaRecorder, waveform toggle, and stop button present |

## Submission Notes

- Do not claim clinical accuracy. SpeakUp is an assistive communication companion.
- Do not claim Unsloth fine-tuning is complete unless the Colab run is finished and loss/export proof is added.
- The current model integration is Gemma 4 through Ollama. The repository also includes a reproducible Unsloth LoRA pipeline.
