from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import crud, schemas
from intent_engine import predict_intent, generate_learning_message, describe_image_only
import json

router = APIRouter()

@router.post("/predict", response_model=schemas.PredictResponse)
async def predict(request: schemas.PredictRequest, db: Session = Depends(get_db)):
    child = crud.get_child(db, request.child_id)
    if not child:
        raise HTTPException(status_code=404, detail="Profile not found")

    has_input = any([
        request.gesture_label, request.sound_label, request.object_detected,
        request.card_selected, request.camera_image_b64, request.camera_description
    ])
    if not has_input:
        raise HTTPException(status_code=400, detail="At least one input signal is required")

    child_memory = crud.get_child_memory(db, request.child_id)

    result = await predict_intent(
        child_name=child.name,
        gesture_label=request.gesture_label,
        sound_label=request.sound_label,
        object_detected=request.object_detected,
        card_selected=request.card_selected,
        camera_image_b64=request.camera_image_b64,
        camera_description=request.camera_description,
        child_memory=child_memory
    )

    log = crud.create_interaction(
        db=db,
        child_id=request.child_id,
        gesture_label=request.gesture_label,
        sound_label=request.sound_label,
        object_detected=request.object_detected,
        card_selected=request.card_selected,
        predicted_intent=result["intent"],
        confidence=result["confidence"],
        spoken_phrase=result["spoken_phrase"],
        explanation=result["explanation"],
        alternatives=result["alternatives"],
        needs_confirmation=result["needs_confirmation"],
        urgency=result.get("urgency", "normal"),
        emotion_detected=result.get("emotion_detected", "neutral"),
        input_channels=result.get("input_channels", []),
        image_analysis=result.get("image_analysis"),
        model_name=result.get("model_name")
    )

    return schemas.PredictResponse(
        interaction_id=log.id,
        intent=result["intent"],
        confidence=result["confidence"],
        spoken_phrase=result["spoken_phrase"],
        explanation=result["explanation"],
        alternatives=result["alternatives"],
        needs_confirmation=result["needs_confirmation"],
        urgency=result.get("urgency", "normal"),
        emotion_detected=result.get("emotion_detected", "neutral"),
        input_channels=result.get("input_channels", []),
        model_name=result.get("model_name"),
        image_analysis=result.get("image_analysis")
    )


@router.post("/describe-image")
async def describe_image(request: schemas.ImageDescribeRequest, db: Session = Depends(get_db)):
    """Standalone endpoint: use Gemma 4 multimodal to identify what is in a captured image"""
    child = crud.get_child(db, request.child_id)
    if not child:
        raise HTTPException(status_code=404, detail="Profile not found")
    result = await describe_image_only(request.image_b64, child.name)
    return result


@router.post("/confirm")
async def confirm(request: schemas.ConfirmRequest, db: Session = Depends(get_db)):
    log = crud.confirm_interaction(db, request.interaction_id, request.confirmed_intent, request.was_correct)
    if not log:
        raise HTTPException(status_code=404, detail="Interaction not found")

    child = crud.get_child(db, log.child_id)
    message = await generate_learning_message(
        log.predicted_intent or "", request.confirmed_intent, child.name
    )

    return {
        "success": True,
        "message": message,
        "pattern_learned": not request.was_correct
    }


@router.get("/history/{child_id}")
def get_history(child_id: int, limit: int = 20, db: Session = Depends(get_db)):
    from models import InteractionLog
    from sqlalchemy import desc
    logs = db.query(InteractionLog).filter(
        InteractionLog.child_id == child_id
    ).order_by(desc(InteractionLog.created_at)).limit(limit).all()
    return [{
        "id": l.id,
        "gesture": l.gesture_label,
        "sound": l.sound_label,
        "object": l.object_detected,
        "card": l.card_selected,
        "predicted_intent": l.predicted_intent,
        "confirmed_intent": l.confirmed_intent,
        "confidence": round(l.confidence * 100) if l.confidence else 0,
        "spoken_phrase": l.spoken_phrase,
        "explanation": l.explanation,
        "alternatives": json.loads(l.alternatives) if l.alternatives else [],
        "urgency": l.urgency or "normal",
        "emotion_detected": l.emotion_detected or "neutral",
        "input_channels": json.loads(l.input_channels) if l.input_channels else [],
        "image_analysis": json.loads(l.image_analysis) if l.image_analysis else None,
        "model_name": l.model_name,
        "caregiver_confirmed": l.caregiver_confirmed,
        "was_correct": l.was_correct,
        "time": l.created_at.strftime("%b %d %Y %I:%M %p")
    } for l in logs]
