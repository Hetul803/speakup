from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import crud

router = APIRouter()

@router.get("/{child_id}")
def get_memory(child_id: int, db: Session = Depends(get_db)):
    child = crud.get_child(db, child_id)
    if not child:
        raise HTTPException(status_code=404, detail="Profile not found")
    return crud.get_child_memory(db, child_id)

@router.get("/{child_id}/patterns")
def get_patterns(child_id: int, db: Session = Depends(get_db)):
    data = crud.get_all_patterns(db, child_id)
    return {
        "gestures": [{"id": g.id, "gesture": g.gesture_label, "context": g.context, "intent": g.confirmed_intent, "count": g.count} for g in data["gestures"]],
        "sounds": [{"id": s.id, "sound": s.sound_label, "context": s.context, "intent": s.confirmed_intent, "count": s.count} for s in data["sounds"]],
        "objects": [{"id": o.id, "object": o.object_label, "gesture_context": o.gesture_context, "intent": o.confirmed_intent, "count": o.count} for o in data["objects"]]
    }
