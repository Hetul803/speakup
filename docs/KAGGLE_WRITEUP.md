# SpeakUp: A Privacy-First Local AI Communication Companion

## Subtitle
Empowering minimally speaking and non-speaking communicators with a free, offline AI that learns their unique communication language — powered by Gemma 4 via Ollama.

---

## The Problem

Approximately 3.5 million Americans are non-verbal or minimally verbal because of autism, cerebral palsy, aphasia, developmental disability, injury, or other conditions. Augmentative and Alternative Communication (AAC) devices — the gold standard for helping these individuals communicate — cost between $6,000 and $12,000. The result: most families cannot access them.

Beyond cost, traditional AAC systems are fundamentally static. They present a grid of buttons and hope the communicator learns to press the right ones. But minimally speaking and non-speaking people often develop their own communication language: a specific sound for hunger, a gesture for "too loud," a routine behavior that signals tiredness. These personal systems take caregivers and therapists months or years to learn. No AAC device learns them for you.

SpeakUp solves both problems.

---

## The Solution

SpeakUp is a local-first AI communication companion that:
1. Accepts multimodal input — visual cards, gestures, sounds, objects, camera
2. Uses Gemma 4 (via Ollama) to interpret the communicator's likely communication intent
3. Speaks the interpreted phrase aloud using on-device text-to-speech
4. Asks caregivers to confirm low-confidence predictions
5. Stores confirmed patterns in a local SQLite memory
6. Improves over time by learning each profile's unique signals

**Everything runs locally after setup. Communication data stays on the device for inference. Zero cost to the family.**

---

## Gemma 4 Integration

Gemma 4 serves as the core reasoning engine for SpeakUp. It is accessed via Ollama for fully local inference.

**Input structure sent to Gemma 4:**
```json
{
  "current_signals": {
    "gesture": "pointing",
    "sound": "soft mmm",
    "object": "cup",
    "time_of_day": "afternoon"
  },
  "profile_memory": {
    "soft mmm + cup": { "intent": "water", "confirmed": 4 },
    "afternoon": { "common_intent": "drink time" }
  }
}
```

**Gemma 4 returns structured JSON:**
```json
{
  "intent": "I want water",
  "confidence": 0.94,
  "spoken_phrase": "I want water, please.",
  "explanation": "Soft mmm + cup has been confirmed 4 times as water. Afternoon aligns with drink routine.",
  "alternatives": ["I want juice", "I am thirsty"],
  "needs_confirmation": false,
  "urgency": "normal",
  "emotion_detected": "neutral"
}
```

This structured output enables reliable downstream processing: text-to-speech, caregiver confirmation UI, and memory storage.

SpeakUp also uses Gemma 4 multimodal input in the camera path. A captured frame is sent to Gemma 4 for object and scene analysis, then the same frame and structured scene are included in the final intent-prediction prompt. This makes vision a first-class signal rather than a decorative upload widget.

---

## Architecture

**Backend**: FastAPI + SQLAlchemy + SQLite
**Frontend**: React + Tailwind CSS + Recharts
**AI Runtime**: Gemma 4 via Ollama (local inference)
**Fine-tuning**: Reproducible Unsloth LoRA pipeline on AAC dataset
**TTS**: Web Speech API (on-device)

The system is stateless at the API level — all state lives in SQLite per communicator profile.

---

## The Memory and Learning Loop

1. Communicator produces signals (gesture, sound, card, object)
2. FastAPI retrieves profile memory from SQLite
3. Memory + signals sent to Gemma 4 as structured prompt
4. Gemma 4 returns intent prediction
5. If confidence >= 0.65: speak phrase, offer quick confirm
6. If confidence < 0.65: show confirmation modal to caregiver
7. Caregiver confirms or corrects
8. Confirmed intent stored as new pattern in SQLite
9. On next similar signal, step 3 includes this confirmed pattern → higher confidence

---

## Fine-tuning with Unsloth

The repository includes a reproducible Unsloth LoRA pipeline targeting `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit` by default, with an optional `unsloth/gemma-4-31B-it-unsloth-bnb-4bit` override for A100/H100 runs. The dataset contains 61 AAC communication scenarios covering gesture-intent pairs, sound-intent mappings, multi-signal combinations, object/camera context, urgency detection, and emotion recognition.

For the final Kaggle submission, report fine-tuning metrics only after the Colab/A100 run completes. If the LoRA is completed, load the exported GGUF into Ollama as `speakup-gemma4` and set `OLLAMA_MODEL=speakup-gemma4`.

---

## Impact

- **Cost**: $0 vs $12,000 for dedicated AAC devices
- **Privacy**: No cloud inference. Communication data belongs to families.
- **Offline**: Works in rural areas, schools with poor internet, low-income homes
- **Scale**: 3.5M non-verbal individuals in the US; 70M globally
- **Personalization**: Learns this person's specific communication patterns — not a generic model

---

## Ethical Considerations

SpeakUp is explicitly positioned as an assistive communication tool, not a medical device:
- All predictions include confidence scores and require optional caregiver confirmation
- Urgency flagging for distress signals directs caregivers to act immediately
- No real person data was used in development
- Export and delete controls give families full data ownership
- Synthetic judge demo data is labeled clearly as synthetic

---

## Track Eligibility

- **Main Track**: Demonstrated real-world impact, technical depth, compelling story
- **Health & Sciences**: Direct benefit to disabled communicators and families
- **Ollama Special Track**: Core inference via Ollama local runtime
- **Unsloth Special Track**: Reproducible Gemma 4 LoRA pipeline included; submit this track only after the run is completed and proof is attached
