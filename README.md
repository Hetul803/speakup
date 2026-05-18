# SpeakUp 🗣️

**A privacy-first, local AI communication companion for minimally speaking and non-speaking communicators.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Gemma 4](https://img.shields.io/badge/AI-Gemma%204-blue)](https://ai.google.dev/gemma)
[![Ollama](https://img.shields.io/badge/Runtime-Ollama-green)](https://ollama.com)

> *Every communicator has a voice. SpeakUp helps make it heard.*

## 🏆 Kaggle Gemma 4 Good Hackathon Submission

**Tracks targeted:**
- Main Track ($50,000)
- Health & Sciences Impact Track ($10,000)
- Ollama Special Track ($10,000)
- Unsloth Special Track ($10,000) if the included LoRA run is completed before submission

## The Problem

- **3.5 million** non-verbal or minimally verbal individuals in the US
- Traditional AAC (Augmentative & Alternative Communication) devices cost **$6,000–$12,000**
- Most systems are **static** — they provide buttons, but cannot learn each person's personal signals
- Sensitive communication data sent to **cloud servers** — a privacy violation

## The Solution

SpeakUp runs **100% locally** on any laptop or tablet. It:

1. Accepts **multimodal input** — visual cards, gestures, sounds, pointing, camera
2. Uses **Gemma 4 via Ollama** to interpret the communicator's likely intent
3. **Learns each profile's unique communication patterns** through caregiver feedback
4. **Speaks the interpreted phrase aloud** using on-device TTS
5. **Never sends data to any server** — complete privacy

```
Communicator points at cup + makes "mmm" sound
         ↓
   Gemma 4 (local)
   + profile memory
         ↓
"I want water, please." 🔊
         ↓
Caregiver confirms → pattern stored → AI improves
```

## ⚡ Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- [Ollama](https://ollama.com)

### Setup
```bash
git clone https://github.com/Hetul803/speakup
cd speakup
chmod +x scripts/*.sh
./scripts/setup.sh
```

### Pull Gemma 4 model
```bash
ollama pull gemma4:e2b-it-q4_K_M
```

### Start
```bash
./scripts/start.sh
# Open http://localhost:5173
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│              SpeakUp Frontend               │
│         React + Tailwind CSS                │
│   Visual Cards | Gesture | Sound | Camera  │
└──────────────────┬──────────────────────────┘
                   │ REST API
┌──────────────────▼──────────────────────────┐
│          FastAPI Backend                    │
│   Intent Engine → Memory Engine → DB       │
│         SQLite (fully local)               │
└──────────────────┬──────────────────────────┘
                   │ Ollama API
┌──────────────────▼──────────────────────────┐
│         Gemma 4 (via Ollama)               │
│    Multimodal reasoning + JSON output      │
│       Runs 100% on your device             │
└─────────────────────────────────────────────┘
```

## 📁 Repository Structure

```
speakup/
├── backend/              # FastAPI + SQLite + Gemma 4 integration
│   ├── main.py           # API entry point
│   ├── intent_engine.py  # Core AI — Gemma 4 prompt & reasoning
│   ├── memory_engine.py  # Profile-specific pattern memory
│   ├── crud.py           # Database operations
│   └── routers/          # API endpoints
├── frontend/             # React + Tailwind
│   └── src/
│       ├── pages/        # Home, CommunicationScreen, Dashboard, Therapist
│       └── components/   # VisualCards, Gesture, Sound, Camera, Confirmation
├── finetune/             # Unsloth fine-tuning for Gemma 4
│   ├── finetune_gemma.py # Training script
│   ├── push_to_ollama.py # Convert & load fine-tuned model
│   └── dataset/          # AAC training data (JSONL)
├── docs/                 # Architecture, benchmarks, writeup
└── scripts/              # Setup and start scripts
```

## 🔬 Technical Details

### Gemma 4 Usage
- **Model**: `gemma4:e2b-it-q4_K_M` via Ollama by default; `speakup-gemma4` after LoRA fine-tuning
- **Input**: Structured multimodal context + profile memory as JSON
- **Output**: Structured JSON (intent, confidence, spoken_phrase, explanation, alternatives)
- **Temperature**: 0.2 — deterministic, reliable outputs
- **Privacy**: No cloud inference after the Gemma 4 model is downloaded

### Memory System
Each communicator has a private memory profile:
- Gesture patterns → confirmed intents
- Sound patterns → confirmed intents
- Object associations → confirmed intents
- Time/routine patterns
- Caregiver notes (fed to AI context)

### Learning Loop
1. Communicator signals → Gemma 4 predicts intent
2. If confidence < 65% → ask caregiver to confirm
3. Caregiver confirms or corrects
4. Pattern saved to SQLite
5. Next prediction uses updated memory → improved accuracy

## 📊 Benchmarks

| Metric | Current Status |
|--------|----------------|
| Local Gemma 4 health | Verified with `gemma4:e2b-it-q4_K_M` |
| Intent JSON output | Verified in local smoke test |
| Memory-aware chat | Verified with synthetic Emma demo |
| Memory lookup | Local SQLite, sub-second |
| Storage per profile | Small local SQLite records |

## 🔒 Privacy

- All data stored in local SQLite database
- No API keys required
- No telemetry
- No internet required after model download
- Profile data never leaves the device

## 🏥 Ethical Statement

SpeakUp is an **assistive communication tool** — not a medical device or diagnostic tool.
- All predictions require caregiver review
- Low-confidence cases always ask for confirmation
- Urgency flagging for distress signals
- No real profile data used in development

## 🤝 License

MIT — free for personal, educational, and research use.

---

*Built for the Kaggle Gemma 4 Good Hackathon — using Gemma 4 + Ollama + Unsloth*
