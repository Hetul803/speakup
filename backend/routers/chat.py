import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from database import get_db
from models import InteractionLog
import crud, schemas
from gemma_client import OllamaClient

router = APIRouter()

CHAT_SYSTEM = """You are SpeakUp's Gemma 4 communication copilot.

You support minimally speaking and non-speaking communicators and their caregivers.
Use the communicator's confirmed memory and recent history before making suggestions.

Rules:
- Do not diagnose or give medical advice.
- Use plain, warm, practical language.
- If the communicator sends a vocalization/signal, infer a likely phrase and ask for caregiver confirmation.
- If a caregiver asks about progress, summarize patterns, changes, and next useful actions.
- Mention uncertainty when evidence is thin.
"""

def _memory_hits(memory: dict, signal_label: str | None) -> list[str]:
    if not signal_label:
        return []
    hits = []
    for group in ["sound_memory", "gesture_memory", "object_memory"]:
        for label, data in memory.get(group, {}).items():
            if signal_label.lower() in label.lower() or label.lower() in signal_label.lower():
                hits.append(f"{label} -> {data.get('intent')} ({data.get('count', 1)}x confirmed)")
    return hits

def _fallback_chat(child, request: schemas.ChatRequest, memory: dict, dashboard: dict, hits: list[str]) -> dict:
    text = (request.message or request.signal_label or "").lower()
    if hits:
        phrase = hits[0].split(" -> ", 1)[1].split(" (", 1)[0]
        return {
            "reply": f"I found a confirmed pattern for {child.name}: {hits[0]}. A careful spoken phrase could be: \"{phrase}.\" Please confirm before saving it.",
            "mode": "memory-match",
            "model_name": "local-memory-fallback",
            "memory_used": hits,
            "suggested_phrase": phrase,
        }
    if any(word in text for word in ["progress", "week", "summary", "report", "patterns"]):
        return {
            "reply": f"{child.name} has {dashboard.get('total_communications', 0)} communications, {dashboard.get('learned_patterns', 0)} learned signal patterns, and {dashboard.get('accuracy_rate', 0)}% confirmed accuracy in the local demo data.",
            "mode": "progress",
            "model_name": "local-memory-fallback",
            "memory_used": [],
            "suggested_phrase": None,
        }
    return {
        "reply": f"I need a little more context for {child.name}. Add a sound, gesture, object, or visual card, then ask me again.",
        "mode": "clarify",
        "model_name": "local-memory-fallback",
        "memory_used": [],
        "suggested_phrase": None,
    }

@router.post("/", response_model=schemas.ChatResponse)
async def chat(request: schemas.ChatRequest, db: Session = Depends(get_db)):
    child = crud.get_child(db, request.child_id)
    if not child:
        raise HTTPException(status_code=404, detail="Profile not found")

    memory = crud.get_child_memory(db, request.child_id)
    dashboard = crud.get_dashboard_data(db, request.child_id) if request.include_progress else {}
    recent_logs = db.query(InteractionLog).filter(
        InteractionLog.child_id == request.child_id
    ).order_by(desc(InteractionLog.created_at)).limit(8).all()
    recent = [{
        "intent": log.confirmed_intent or log.predicted_intent,
        "sound": log.sound_label,
        "gesture": log.gesture_label,
        "object": log.object_detected,
        "card": log.card_selected,
        "confirmed": log.caregiver_confirmed,
        "confidence": log.confidence,
    } for log in recent_logs]
    hits = _memory_hits(memory, request.signal_label or request.message)

    client = OllamaClient()
    runtime = await client.runtime_summary()
    if not runtime["connected"] or not runtime["gemma4_ready"]:
        return _fallback_chat(child, request, memory, dashboard or {}, hits)

    prompt = f"""Profile: {child.name}
Profile notes: {child.notes or "none"}
Sender: {request.sender}
Message: {request.message}
Observed signal or vocalization: {request.signal_label or "none"}

Confirmed memory:
{json.dumps(memory, indent=2)}

Progress summary:
{json.dumps(dashboard or {}, indent=2)}

Recent interactions:
{json.dumps(recent, indent=2)}

Reply as Gemma 4 in 2-5 short sentences. If useful, include one suggested spoken phrase in quotes."""

    try:
        reply = await client.chat(
            messages=[{"role": "user", "content": prompt}],
            system=CHAT_SYSTEM,
            temperature=0.2,
        )
        suggested = None
        if hits:
            suggested = hits[0].split(" -> ", 1)[1].split(" (", 1)[0]
        if '"' in reply:
            parts = reply.split('"')
            if not suggested and len(parts) >= 3 and len(parts[1]) <= 160:
                suggested = parts[1]
        return {
            "reply": reply,
            "mode": "gemma4",
            "model_name": runtime["active_model"],
            "memory_used": hits,
            "suggested_phrase": suggested,
        }
    except Exception:
        return _fallback_chat(child, request, memory, dashboard or {}, hits)
