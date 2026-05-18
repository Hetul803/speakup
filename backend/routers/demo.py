from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import CaregiverNote, Child, InteractionLog
import crud
import schemas

router = APIRouter()

DEMO_NAME = "Emma Demo"

SCENARIOS = [
    {
        "gesture_label": "Pointing at something",
        "sound_label": 'Soft "mmm"',
        "object_detected": "blue cup",
        "card_selected": "Water",
        "predicted_intent": "I want water",
        "confidence": 0.94,
        "spoken_phrase": "I want water, please.",
        "explanation": "Pointing at the cup, selecting Water, and a soft mmm sound all align with a drink request.",
        "alternatives": ["I want juice", "I am thirsty"],
        "urgency": "normal",
        "emotion_detected": "neutral",
        "input_channels": ["card", "gesture", "sound", "object"],
        "confirmed_intent": "I want water",
        "was_correct": True,
    },
    {
        "gesture_label": "Covering ears",
        "sound_label": "Crying / whimpering",
        "object_detected": "TV / screen",
        "predicted_intent": "The sound is too loud",
        "confidence": 0.91,
        "spoken_phrase": "It is too loud. I need quiet.",
        "explanation": "Covering ears plus crying near a screen strongly suggests sensory overwhelm.",
        "alternatives": ["I need a break", "I feel scared"],
        "urgency": "high",
        "emotion_detected": "distressed",
        "input_channels": ["gesture", "sound", "object"],
        "confirmed_intent": "The sound is too loud",
        "was_correct": True,
    },
    {
        "gesture_label": "Tapping twice",
        "sound_label": "Humming",
        "object_detected": "snack cabinet",
        "predicted_intent": "I want more snack",
        "confidence": 0.89,
        "spoken_phrase": "More snack, please.",
        "explanation": "The double tap was previously confirmed as a more request, and the snack cabinet gives object context.",
        "alternatives": ["I want a different snack", "I want a drink too"],
        "urgency": "normal",
        "emotion_detected": "excited",
        "input_channels": ["gesture", "sound", "object"],
        "confirmed_intent": "I want more snack",
        "was_correct": True,
    },
    {
        "gesture_label": "Reaching out",
        "sound_label": "Fast breathing",
        "card_selected": "Pain/Hurt",
        "predicted_intent": "My stomach hurts",
        "confidence": 0.84,
        "spoken_phrase": "My stomach hurts. I need help.",
        "explanation": "Pain card, reaching for help, and fast breathing indicate discomfort that should be checked.",
        "alternatives": ["I feel sick", "I need the bathroom"],
        "urgency": "high",
        "emotion_detected": "scared",
        "input_channels": ["card", "gesture", "sound"],
        "confirmed_intent": "My stomach hurts",
        "was_correct": True,
    },
    {
        "gesture_label": "Reaching toward door",
        "card_selected": "Outside",
        "predicted_intent": "I want to go outside",
        "confidence": 0.86,
        "spoken_phrase": "I want to go outside.",
        "explanation": "Reaching toward the door and selecting Outside point to the same request.",
        "alternatives": ["I want a walk", "I want to leave this room"],
        "urgency": "normal",
        "emotion_detected": "happy",
        "input_channels": ["card", "gesture"],
        "confirmed_intent": "I want to go outside",
        "was_correct": True,
    },
]

DEMO_NOTE = (
    "Emma often uses a soft mmm sound with cups for drink requests and covers her ears "
    "when sound is painful."
)

THERAPIST_CONTACT = (
    '{"name":"Dr. Maya Rivera","role":"Speech-language pathologist",'
    '"organization":"BrightPath Communication Clinic","email":"maya.rivera@example.com",'
    '"phone":"(555) 014-2218","goal":"Increase reliable independent requests using sounds, '
    'gestures, and visual cards."}'
)

def ensure_demo_note(db: Session, child_id: int, category: str, note: str):
    existing = db.query(CaregiverNote).filter(
        CaregiverNote.child_id == child_id,
        CaregiverNote.category == category,
    ).first()
    if not existing:
        crud.add_caregiver_note(db, child_id, note, category)

@router.post("/seed")
def seed_demo(db: Session = Depends(get_db)):
    child = db.query(Child).filter(Child.name == DEMO_NAME).first()
    if child:
        crud.delete_child(db, child.id)

    child = crud.create_child(db, schemas.ChildCreate(
        name=DEMO_NAME,
        age=6,
        avatar_color="#0f766e",
        notes="Synthetic demo profile for Kaggle judges. No real person data."
    ))

    existing_count = db.query(InteractionLog).filter(InteractionLog.child_id == child.id).count()
    if existing_count < len(SCENARIOS):
        for scenario in SCENARIOS:
            log = crud.create_interaction(
                db=db,
                child_id=child.id,
                gesture_label=scenario.get("gesture_label"),
                sound_label=scenario.get("sound_label"),
                object_detected=scenario.get("object_detected"),
                card_selected=scenario.get("card_selected"),
                predicted_intent=scenario["predicted_intent"],
                confidence=scenario["confidence"],
                spoken_phrase=scenario["spoken_phrase"],
                explanation=scenario["explanation"],
                alternatives=scenario["alternatives"],
                urgency=scenario["urgency"],
                emotion_detected=scenario["emotion_detected"],
                input_channels=scenario["input_channels"],
                model_name="synthetic-demo-seed",
            )
            crud.confirm_interaction(db, log.id, scenario["confirmed_intent"], scenario["was_correct"])

    ensure_demo_note(db, child.id, "demo", DEMO_NOTE)
    ensure_demo_note(db, child.id, "therapist_contact", THERAPIST_CONTACT)

    return {
        "child_id": child.id,
        "child_name": child.name,
        "seeded": True,
        "synthetic": True,
    }
