from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from models import Child, InteractionLog, GesturePattern, SoundPattern, ObjectPattern, RoutinePattern, CaregiverNote
from schemas import ChildCreate, ChildUpdate
from datetime import datetime, timedelta
import json

# --- Child CRUD ---
def create_child(db: Session, child: ChildCreate):
    db_child = Child(**child.model_dump())
    db.add(db_child)
    db.commit()
    db.refresh(db_child)
    return db_child

def get_child(db: Session, child_id: int):
    return db.query(Child).filter(Child.id == child_id).first()

def get_all_children(db: Session):
    return db.query(Child).all()

def update_child(db: Session, child_id: int, update: ChildUpdate):
    child = db.query(Child).filter(Child.id == child_id).first()
    if not child:
        return None
    for k, v in update.model_dump(exclude_none=True).items():
        setattr(child, k, v)
    child.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(child)
    return child

def delete_child(db: Session, child_id: int):
    child = db.query(Child).filter(Child.id == child_id).first()
    if child:
        db.delete(child)
        db.commit()
    return child

# --- Interaction CRUD ---
def create_interaction(db: Session, child_id: int, gesture_label=None, sound_label=None,
                       object_detected=None, card_selected=None, predicted_intent=None,
                       confidence=None, spoken_phrase=None, explanation=None,
                       alternatives=None, needs_confirmation=False, urgency="normal",
                       emotion_detected="neutral", input_channels=None,
                       image_analysis=None, model_name=None):
    now = datetime.utcnow()
    hour = now.hour
    if 5 <= hour < 12:
        time_of_day = "morning"
    elif 12 <= hour < 17:
        time_of_day = "afternoon"
    elif 17 <= hour < 21:
        time_of_day = "evening"
    else:
        time_of_day = "night"

    log = InteractionLog(
        child_id=child_id,
        gesture_label=gesture_label,
        sound_label=sound_label,
        object_detected=object_detected,
        card_selected=card_selected,
        time_of_day=time_of_day,
        predicted_intent=predicted_intent,
        confidence=confidence,
        spoken_phrase=spoken_phrase,
        explanation=explanation,
        alternatives=json.dumps(alternatives or []),
        urgency=urgency,
        emotion_detected=emotion_detected,
        input_channels=json.dumps(input_channels or []),
        image_analysis=json.dumps(image_analysis) if image_analysis else None,
        model_name=model_name,
        caregiver_confirmed=False,
        created_at=now
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

def confirm_interaction(db: Session, interaction_id: int, confirmed_intent: str, was_correct: bool):
    log = db.query(InteractionLog).filter(InteractionLog.id == interaction_id).first()
    if not log:
        return None
    log.confirmed_intent = confirmed_intent
    log.caregiver_confirmed = True
    log.was_correct = was_correct
    db.commit()
    # Update memory patterns
    _update_patterns(db, log, confirmed_intent)
    db.refresh(log)
    return log

def _update_patterns(db: Session, log: InteractionLog, confirmed_intent: str):
    """Update memory patterns based on caregiver confirmation"""
    if log.gesture_label:
        existing = db.query(GesturePattern).filter(
            GesturePattern.child_id == log.child_id,
            GesturePattern.gesture_label == log.gesture_label,
            GesturePattern.confirmed_intent == confirmed_intent
        ).first()
        if existing:
            existing.count += 1
            existing.last_used = datetime.utcnow()
        else:
            db.add(GesturePattern(
                child_id=log.child_id,
                gesture_label=log.gesture_label,
                context=log.object_detected,
                confirmed_intent=confirmed_intent
            ))

    if log.sound_label:
        existing = db.query(SoundPattern).filter(
            SoundPattern.child_id == log.child_id,
            SoundPattern.sound_label == log.sound_label,
            SoundPattern.confirmed_intent == confirmed_intent
        ).first()
        if existing:
            existing.count += 1
            existing.last_used = datetime.utcnow()
        else:
            db.add(SoundPattern(
                child_id=log.child_id,
                sound_label=log.sound_label,
                context=log.object_detected,
                confirmed_intent=confirmed_intent
            ))

    if log.object_detected:
        existing = db.query(ObjectPattern).filter(
            ObjectPattern.child_id == log.child_id,
            ObjectPattern.object_label == log.object_detected,
            ObjectPattern.confirmed_intent == confirmed_intent
        ).first()
        if existing:
            existing.count += 1
            existing.last_used = datetime.utcnow()
        else:
            db.add(ObjectPattern(
                child_id=log.child_id,
                object_label=log.object_detected,
                gesture_context=log.gesture_label,
                confirmed_intent=confirmed_intent
            ))

    # Update routine pattern
    existing_routine = db.query(RoutinePattern).filter(
        RoutinePattern.child_id == log.child_id,
        RoutinePattern.time_window == log.time_of_day,
        RoutinePattern.common_intent == confirmed_intent
    ).first()
    if existing_routine:
        existing_routine.count += 1
    else:
        db.add(RoutinePattern(
            child_id=log.child_id,
            time_window=log.time_of_day,
            common_intent=confirmed_intent
        ))
    db.commit()

# --- Memory retrieval ---
def get_child_memory(db: Session, child_id: int) -> dict:
    gestures = db.query(GesturePattern).filter(
        GesturePattern.child_id == child_id
    ).order_by(desc(GesturePattern.count)).limit(20).all()

    sounds = db.query(SoundPattern).filter(
        SoundPattern.child_id == child_id
    ).order_by(desc(SoundPattern.count)).limit(20).all()

    objects = db.query(ObjectPattern).filter(
        ObjectPattern.child_id == child_id
    ).order_by(desc(ObjectPattern.count)).limit(20).all()

    routines = db.query(RoutinePattern).filter(
        RoutinePattern.child_id == child_id
    ).order_by(desc(RoutinePattern.count)).limit(10).all()

    notes = db.query(CaregiverNote).filter(
        CaregiverNote.child_id == child_id
    ).order_by(desc(CaregiverNote.created_at)).limit(5).all()

    return {
        "gesture_memory": {f"{g.gesture_label}": {"intent": g.confirmed_intent, "count": g.count, "context": g.context} for g in gestures},
        "sound_memory": {f"{s.sound_label}": {"intent": s.confirmed_intent, "count": s.count} for s in sounds},
        "object_memory": {f"{o.object_label}": {"intent": o.confirmed_intent, "count": o.count} for o in objects},
        "routine_memory": {f"{r.time_window}": {"intent": r.common_intent, "count": r.count} for r in routines},
        "caregiver_notes": [n.note for n in notes]
    }

# --- Dashboard ---
def get_dashboard_data(db: Session, child_id: int) -> dict:
    child = get_child(db, child_id)
    if not child:
        return None

    total = db.query(InteractionLog).filter(InteractionLog.child_id == child_id).count()

    week_ago = datetime.utcnow() - timedelta(days=7)
    this_week = db.query(InteractionLog).filter(
        InteractionLog.child_id == child_id,
        InteractionLog.created_at >= week_ago
    ).count()

    confirmed = db.query(InteractionLog).filter(
        InteractionLog.child_id == child_id,
        InteractionLog.caregiver_confirmed == True
    ).count()

    correct = db.query(InteractionLog).filter(
        InteractionLog.child_id == child_id,
        InteractionLog.was_correct == True
    ).count()

    accuracy = round(correct / confirmed * 100, 1) if confirmed > 0 else 0
    avg_confidence = db.query(func.avg(InteractionLog.confidence)).filter(
        InteractionLog.child_id == child_id,
        InteractionLog.confidence != None
    ).scalar()
    avg_confidence = round((avg_confidence or 0) * 100, 1)

    high_urgency = db.query(InteractionLog).filter(
        InteractionLog.child_id == child_id,
        InteractionLog.urgency == "high"
    ).count()

    # Top intents
    top_raw = db.query(
        InteractionLog.confirmed_intent,
        func.count(InteractionLog.id).label("count")
    ).filter(
        InteractionLog.child_id == child_id,
        InteractionLog.confirmed_intent != None
    ).group_by(InteractionLog.confirmed_intent).order_by(desc("count")).limit(8).all()
    top_intents = [{"intent": r[0], "count": r[1]} for r in top_raw]

    # Learned patterns
    g_count = db.query(GesturePattern).filter(GesturePattern.child_id == child_id).count()
    s_count = db.query(SoundPattern).filter(SoundPattern.child_id == child_id).count()
    o_count = db.query(ObjectPattern).filter(ObjectPattern.child_id == child_id).count()
    learned_patterns = g_count + s_count + o_count

    # Recent interactions
    recent_raw = db.query(InteractionLog).filter(
        InteractionLog.child_id == child_id
    ).order_by(desc(InteractionLog.created_at)).limit(10).all()
    recent = [{
        "id": r.id,
        "time": r.created_at.strftime("%b %d %H:%M"),
        "intent": r.confirmed_intent or r.predicted_intent,
        "confidence": round(r.confidence * 100) if r.confidence else 0,
        "confirmed": r.caregiver_confirmed,
        "urgency": r.urgency or "normal",
        "emotion": r.emotion_detected or "neutral",
        "channels": json.loads(r.input_channels) if r.input_channels else [],
        "model": r.model_name,
    } for r in recent_raw]

    # Daily trend (last 7 days)
    daily_trend = []
    for i in range(6, -1, -1):
        day = datetime.utcnow() - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0)
        day_end = day.replace(hour=23, minute=59, second=59)
        count = db.query(InteractionLog).filter(
            InteractionLog.child_id == child_id,
            InteractionLog.created_at >= day_start,
            InteractionLog.created_at <= day_end
        ).count()
        daily_trend.append({"day": day.strftime("%a"), "count": count})

    # Milestones
    milestones = []
    if total >= 1:
        milestones.append("First communication recorded!")
    if learned_patterns >= 3:
        milestones.append(f"Learned {learned_patterns} personal signals")
    if this_week >= 5:
        milestones.append(f"Communicated {this_week} times this week")
    if accuracy >= 80 and confirmed >= 5:
        milestones.append(f"AI accuracy reached {accuracy}%")
    if total >= 50:
        milestones.append(f"50 total communications milestone!")

    channel_counts = {}
    for raw_channels in db.query(InteractionLog.input_channels).filter(InteractionLog.child_id == child_id).all():
        if not raw_channels[0]:
            continue
        try:
            channels = json.loads(raw_channels[0])
        except json.JSONDecodeError:
            channels = []
        for channel in channels:
            channel_counts[channel] = channel_counts.get(channel, 0) + 1
    signal_mix = [{"channel": channel, "count": count} for channel, count in sorted(channel_counts.items())]

    return {
        "child_id": child_id,
        "child_name": child.name,
        "total_communications": total,
        "this_week": this_week,
        "confirmed_count": confirmed,
        "accuracy_rate": accuracy,
        "high_urgency_count": high_urgency,
        "average_confidence": avg_confidence,
        "top_intents": top_intents,
        "learned_patterns": learned_patterns,
        "recent_interactions": recent,
        "daily_trend": daily_trend,
        "signal_mix": signal_mix,
        "milestones": milestones
    }

def get_all_patterns(db: Session, child_id: int):
    gestures = db.query(GesturePattern).filter(GesturePattern.child_id == child_id).all()
    sounds = db.query(SoundPattern).filter(SoundPattern.child_id == child_id).all()
    objects = db.query(ObjectPattern).filter(ObjectPattern.child_id == child_id).all()
    return {"gestures": gestures, "sounds": sounds, "objects": objects}

def add_caregiver_note(db: Session, child_id: int, note: str, category: str = "general"):
    n = CaregiverNote(child_id=child_id, note=note, category=category)
    db.add(n)
    db.commit()
    db.refresh(n)
    return n

def get_caregiver_notes(db: Session, child_id: int, category: str = None, limit: int = 20):
    query = db.query(CaregiverNote).filter(CaregiverNote.child_id == child_id)
    if category:
        query = query.filter(CaregiverNote.category == category)
    return query.order_by(desc(CaregiverNote.created_at)).limit(limit).all()
