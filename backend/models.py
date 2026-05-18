from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Child(Base):
    __tablename__ = "children"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    age = Column(Integer)
    notes = Column(Text)
    avatar_color = Column(String(20), default="#6366f1")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    interactions = relationship("InteractionLog", back_populates="child", cascade="all, delete-orphan")
    gesture_patterns = relationship("GesturePattern", back_populates="child", cascade="all, delete-orphan")
    sound_patterns = relationship("SoundPattern", back_populates="child", cascade="all, delete-orphan")
    object_patterns = relationship("ObjectPattern", back_populates="child", cascade="all, delete-orphan")
    routine_patterns = relationship("RoutinePattern", back_populates="child", cascade="all, delete-orphan")
    caregiver_notes = relationship("CaregiverNote", back_populates="child", cascade="all, delete-orphan")

class InteractionLog(Base):
    __tablename__ = "interaction_logs"
    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id"), nullable=False)
    input_type = Column(String(50))
    gesture_label = Column(String(100))
    sound_label = Column(String(100))
    object_detected = Column(String(100))
    card_selected = Column(String(100))
    time_of_day = Column(String(20))
    predicted_intent = Column(String(200))
    confidence = Column(Float)
    spoken_phrase = Column(String(300))
    explanation = Column(Text)
    alternatives = Column(Text)
    urgency = Column(String(20), default="normal")
    emotion_detected = Column(String(50), default="neutral")
    input_channels = Column(Text)
    image_analysis = Column(Text)
    model_name = Column(String(160))
    confirmed_intent = Column(String(200))
    caregiver_confirmed = Column(Boolean, default=False)
    was_correct = Column(Boolean)
    created_at = Column(DateTime, default=datetime.utcnow)
    child = relationship("Child", back_populates="interactions")

class GesturePattern(Base):
    __tablename__ = "gesture_patterns"
    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id"), nullable=False)
    gesture_label = Column(String(100), nullable=False)
    context = Column(String(200))
    confirmed_intent = Column(String(200), nullable=False)
    count = Column(Integer, default=1)
    last_used = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    child = relationship("Child", back_populates="gesture_patterns")

class SoundPattern(Base):
    __tablename__ = "sound_patterns"
    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id"), nullable=False)
    sound_label = Column(String(100), nullable=False)
    context = Column(String(200))
    confirmed_intent = Column(String(200), nullable=False)
    count = Column(Integer, default=1)
    last_used = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    child = relationship("Child", back_populates="sound_patterns")

class ObjectPattern(Base):
    __tablename__ = "object_patterns"
    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id"), nullable=False)
    object_label = Column(String(100), nullable=False)
    gesture_context = Column(String(100))
    confirmed_intent = Column(String(200), nullable=False)
    count = Column(Integer, default=1)
    last_used = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    child = relationship("Child", back_populates="object_patterns")

class RoutinePattern(Base):
    __tablename__ = "routine_patterns"
    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id"), nullable=False)
    time_window = Column(String(50), nullable=False)
    common_intent = Column(String(200), nullable=False)
    count = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    child = relationship("Child", back_populates="routine_patterns")

class CaregiverNote(Base):
    __tablename__ = "caregiver_notes"
    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id"), nullable=False)
    note = Column(Text, nullable=False)
    category = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    child = relationship("Child", back_populates="caregiver_notes")
