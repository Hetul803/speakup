import json
import logging
from gemma_client import OllamaClient
from datetime import datetime
import re

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are SpeakUp, an AI communication assistant for non-verbal and minimally verbal autistic children.

Your job: given multimodal signals from a child (gestures, sounds, objects, visual cards, images) and their personal communication memory, predict what the child is trying to communicate.

CRITICAL RULES:
- Respond with ONLY valid JSON. No text before or after. No markdown code blocks.
- If you see a matching pattern in child_memory, heavily weight it — it was confirmed by a real caregiver.
- Be conservative: when unsure, set needs_confirmation=true and lower confidence.
- For pain, distress, or safety signals: always set urgency="high".
- spoken_phrase must be first-person, warm, natural child language.
- explanation must cite specific signals that led to your prediction.
- Always provide exactly 2 alternatives.

JSON schema (respond with this exact structure):
{
  "intent": "what the child wants or feels (short phrase)",
  "confidence": 0.87,
  "spoken_phrase": "I want water, please.",
  "explanation": "Specific signal analysis...",
  "alternatives": ["alternative 1", "alternative 2"],
  "needs_confirmation": false,
  "urgency": "normal",
  "emotion_detected": "neutral"
}

urgency values: "normal" | "high"
emotion_detected values: "neutral" | "happy" | "distressed" | "frustrated" | "excited" | "tired" | "scared"
confidence: 0.0 to 1.0 (needs_confirmation auto-true when < 0.65)
"""

FALLBACK = {
    "intent": "unclear — needs caregiver help",
    "confidence": 0.3,
    "spoken_phrase": "I want to tell you something.",
    "explanation": "The signals were unclear or Gemma 4 could not be reached. Please check Ollama is running.",
    "alternatives": ["I need help", "I want something"],
    "needs_confirmation": True,
    "urgency": "normal",
    "emotion_detected": "neutral"
}

def _fallback(explanation: str = None) -> dict:
    result = FALLBACK.copy()
    if explanation:
        result["explanation"] = explanation
    result["input_channels"] = []
    result["image_analysis"] = None
    result["model_name"] = None
    return result

def _get_time_of_day() -> str:
    hour = datetime.utcnow().hour
    if 5 <= hour < 12: return "morning"
    elif 12 <= hour < 17: return "afternoon"
    elif 17 <= hour < 21: return "evening"
    return "night"

def _parse_image_description(desc: str) -> dict:
    """Parse Gemma 4's image description into structured fields"""
    result = {"object": None, "people": None, "setting": None, "scene": None}
    for line in desc.split("\n"):
        clean = line.strip()
        if clean.upper().startswith("OBJECT:"):
            result["object"] = clean.split(":", 1)[1].strip()
        elif clean.upper().startswith("PEOPLE:"):
            result["people"] = clean.split(":", 1)[1].strip()
        elif clean.upper().startswith("SETTING:"):
            result["setting"] = clean.split(":", 1)[1].strip()
        elif clean.upper().startswith("SCENE:"):
            result["scene"] = clean.split(":", 1)[1].strip()
    return result

def _extract_json(raw: str) -> dict:
    """Tolerate light model chatter while preserving strict JSON output in the API."""
    raw = raw.strip()
    if "```" in raw:
        parts = [p for p in raw.split("```") if p.strip()]
        raw = next((p for p in parts if "{" in p and "}" in p), raw)
        raw = raw.removeprefix("json").strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if not match:
            raise
        return json.loads(match.group(0))

def _normalize_result(result: dict, channels: list[str], image_analysis: dict | None, model_name: str | None) -> dict:
    defaults = FALLBACK.copy()
    defaults.update(result if isinstance(result, dict) else {})
    normalized = defaults

    try:
        normalized["confidence"] = max(0.0, min(1.0, float(normalized.get("confidence", 0.3))))
    except (TypeError, ValueError):
        normalized["confidence"] = 0.3

    if normalized["confidence"] < 0.65:
        normalized["needs_confirmation"] = True

    if normalized.get("urgency") not in {"normal", "high"}:
        normalized["urgency"] = "normal"

    valid_emotions = {"neutral", "happy", "distressed", "frustrated", "excited", "tired", "scared"}
    if normalized.get("emotion_detected") not in valid_emotions:
        normalized["emotion_detected"] = "neutral"

    if not isinstance(normalized.get("alternatives"), list):
        normalized["alternatives"] = ["I need help", "I want something"]
    normalized["alternatives"] = [str(item) for item in normalized["alternatives"][:2]]
    while len(normalized["alternatives"]) < 2:
        normalized["alternatives"].append("I need help")

    for key in ["intent", "spoken_phrase", "explanation"]:
        normalized[key] = str(normalized.get(key) or FALLBACK[key])

    normalized["input_channels"] = channels
    normalized["image_analysis"] = image_analysis
    normalized["model_name"] = model_name
    return normalized

async def predict_intent(
    child_name: str,
    gesture_label: str = None,
    sound_label: str = None,
    object_detected: str = None,
    card_selected: str = None,
    camera_image_b64: str = None,
    camera_description: str = None,
    child_memory: dict = None,
    time_of_day: str = None
) -> dict:
    client = OllamaClient()
    time_of_day = time_of_day or _get_time_of_day()
    now = datetime.utcnow()
    channels = []

    # Step 1: If camera image provided, run multimodal analysis first
    image_analysis = None
    images_for_prompt = []
    if camera_image_b64:
        channels.append("camera")
        try:
            logger.info("Running Gemma 4 multimodal image analysis...")
            desc = await client.describe_image(camera_image_b64, context=f"Child's name: {child_name}, time: {time_of_day}")
            image_analysis = _parse_image_description(desc)
            # Use detected object if none explicitly set
            if image_analysis.get("object") and not object_detected:
                object_detected = image_analysis["object"]
            images_for_prompt = [camera_image_b64]
            logger.info(f"Image analysis: {image_analysis}")
        except Exception as e:
            logger.error(f"Multimodal image analysis failed: {e}")
            image_analysis = {"scene": "Image analysis unavailable"}
    elif camera_description:
        channels.append("camera-note")
        image_analysis = {"scene": camera_description}

    # Step 2: Build input context
    input_signals = {}
    if gesture_label:
        input_signals["gesture"] = gesture_label
        channels.append("gesture")
    if sound_label:
        input_signals["vocalization"] = sound_label
        channels.append("sound")
    if object_detected:
        input_signals["object_in_view"] = object_detected
        channels.append("object")
    if card_selected:
        input_signals["visual_card_selected"] = card_selected
        channels.append("card")
    if image_analysis: input_signals["camera_analysis"] = image_analysis
    input_signals["time_of_day"] = time_of_day
    input_signals["time"] = now.strftime("%I:%M %p")

    # Step 3: Build relevant memory (only matching patterns)
    relevant_memory = {}
    if child_memory:
        gm = child_memory.get("gesture_memory", {})
        sm = child_memory.get("sound_memory", {})
        om = child_memory.get("object_memory", {})
        rm = child_memory.get("routine_memory", {})
        notes = child_memory.get("caregiver_notes", [])

        if gesture_label and gesture_label in gm:
            relevant_memory["KNOWN_GESTURE_PATTERN"] = gm[gesture_label]
        if sound_label and sound_label in sm:
            relevant_memory["KNOWN_SOUND_PATTERN"] = sm[sound_label]
        if object_detected and object_detected in om:
            relevant_memory["KNOWN_OBJECT_PATTERN"] = om[object_detected]
        if time_of_day in rm:
            relevant_memory["ROUTINE_PATTERN"] = rm[time_of_day]
        if notes:
            relevant_memory["CAREGIVER_NOTES"] = notes[:3]

    has_memory = bool(relevant_memory)
    memory_note = "Established personal patterns found — weight these heavily." if has_memory else "No established patterns yet — this may be a new signal."

    prompt = f"""Child: {child_name}

CURRENT SIGNALS:
{json.dumps(input_signals, indent=2)}

PERSONAL MEMORY ({memory_note}):
{json.dumps(relevant_memory if relevant_memory else {}, indent=2)}

Predict what {child_name} is communicating right now.

Important:
- If camera_analysis includes an object, use it as visual evidence, but do not over-trust it when other signals disagree.
- If signals conflict, surface uncertainty and set needs_confirmation=true.
- If the child may be in pain, scared, overwhelmed, unsafe, or distressed, set urgency="high".
- Return only the JSON object matching the schema."""

    # Step 4: Call Gemma 4
    model_name = None
    try:
        model_name = await client.resolve_model()
        raw = await client.generate(
            prompt=prompt,
            system=SYSTEM_PROMPT,
            temperature=0.15,
            images=images_for_prompt if images_for_prompt else None,
            json_mode=True
        )

        result = _normalize_result(
            _extract_json(raw),
            channels=channels,
            image_analysis=image_analysis,
            model_name=model_name
        )

        logger.info(f"Predicted: {result['intent']} ({result['confidence']:.0%})")
        return result

    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error: {e} | Raw: {repr(raw[:300])}")
        return _fallback("Gemma returned a non-JSON response. Please retry or confirm manually.")
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        return _fallback(f"Gemma 4 error: {str(e)}. Make sure Ollama is running and a Gemma 4 model is pulled.")


async def describe_image_only(image_b64: str, child_name: str) -> dict:
    """Standalone endpoint: just identify what's in the image"""
    client = OllamaClient()
    try:
        desc = await client.describe_image(image_b64, context=f"Child: {child_name}")
        return _parse_image_description(desc)
    except Exception as e:
        return {"error": str(e), "object": None}


async def generate_learning_message(original_intent: str, corrected_intent: str, child_name: str) -> str:
    client = OllamaClient()
    try:
        prompt = f"""Generate one warm, encouraging sentence acknowledging that you learned from a caregiver correction.
Original AI prediction: "{original_intent}"
Caregiver's correction: "{corrected_intent}"
Child's name: {child_name}
Example: "Got it! I'll remember that this means '{corrected_intent}' for {child_name} next time."
Respond with just the sentence."""
        return (await client.generate(prompt, temperature=0.5)).strip()
    except:
        return f"Got it! I've learned that this signal means '{corrected_intent}' for {child_name}."
