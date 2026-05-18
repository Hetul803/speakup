from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class ChildCreate(BaseModel):
    name: str
    age: Optional[int] = None
    notes: Optional[str] = None
    avatar_color: Optional[str] = "#6366f1"

class ChildUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    notes: Optional[str] = None
    avatar_color: Optional[str] = None

class ChildResponse(BaseModel):
    id: int
    name: str
    age: Optional[int]
    notes: Optional[str]
    avatar_color: str
    created_at: datetime
    class Config:
        from_attributes = True

class PredictRequest(BaseModel):
    child_id: int
    gesture_label: Optional[str] = None
    sound_label: Optional[str] = None
    object_detected: Optional[str] = None
    card_selected: Optional[str] = None
    camera_image_b64: Optional[str] = None   # base64 JPEG from camera
    camera_description: Optional[str] = None  # manual description fallback

class PredictResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    interaction_id: int
    intent: str
    confidence: float
    spoken_phrase: str
    explanation: str
    alternatives: List[str]
    needs_confirmation: bool
    urgency: str
    emotion_detected: str
    input_channels: List[str] = Field(default_factory=list)
    model_name: Optional[str] = None
    image_analysis: Optional[Dict[str, Any]] = None

class ConfirmRequest(BaseModel):
    interaction_id: int
    confirmed_intent: str
    was_correct: bool

class CaregiverNoteCreate(BaseModel):
    child_id: int
    note: str
    category: Optional[str] = "general"

class CaregiverNoteResponse(BaseModel):
    id: int
    child_id: int
    note: str
    category: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True

class ImageDescribeRequest(BaseModel):
    child_id: int
    image_b64: str

class ChatRequest(BaseModel):
    child_id: int
    message: str
    sender: Optional[str] = "caregiver"  # caregiver | communicator
    signal_label: Optional[str] = None
    include_progress: bool = True

class ChatResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    reply: str
    mode: str
    model_name: Optional[str] = None
    memory_used: List[str] = Field(default_factory=list)
    suggested_phrase: Optional[str] = None

class DashboardResponse(BaseModel):
    child_id: int
    child_name: str
    total_communications: int
    this_week: int
    confirmed_count: int
    accuracy_rate: float
    high_urgency_count: int = 0
    average_confidence: float = 0
    top_intents: List[dict]
    learned_patterns: int
    recent_interactions: List[dict]
    daily_trend: List[dict]
    signal_mix: List[dict] = Field(default_factory=list)
    milestones: List[str]
