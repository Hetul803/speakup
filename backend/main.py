from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import engine, Base
from routers import children, interactions, memory, dashboard, demo, chat
import logging
from sqlalchemy import text, inspect

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def _migrate_sqlite_columns():
    """Tiny local migration helper for hackathon-speed SQLite upgrades."""
    if engine.dialect.name != "sqlite":
        return
    inspector = inspect(engine)
    if "interaction_logs" not in inspector.get_table_names():
        return
    existing = {col["name"] for col in inspector.get_columns("interaction_logs")}
    columns = {
        "urgency": "VARCHAR(20) DEFAULT 'normal'",
        "emotion_detected": "VARCHAR(50) DEFAULT 'neutral'",
        "input_channels": "TEXT",
        "image_analysis": "TEXT",
        "model_name": "VARCHAR(160)",
    }
    with engine.begin() as conn:
        for name, ddl in columns.items():
            if name not in existing:
                conn.execute(text(f"ALTER TABLE interaction_logs ADD COLUMN {name} {ddl}"))

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    _migrate_sqlite_columns()
    logger.info("SpeakUp API started — database initialized")
    yield

app = FastAPI(title="SpeakUp API", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(children.router, prefix="/api/children", tags=["children"])
app.include_router(interactions.router, prefix="/api/interactions", tags=["interactions"])
app.include_router(memory.router, prefix="/api/memory", tags=["memory"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(demo.router, prefix="/api/demo", tags=["demo"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])

@app.get("/")
def root():
    return {"status": "SpeakUp API v2.0 running", "ai": "Gemma 4 via Ollama"}

async def _health_payload():
    from gemma_client import OllamaClient
    client = OllamaClient()
    runtime = await client.runtime_summary()
    return {
        "status": "healthy",
        "ollama": "connected" if runtime["connected"] else "disconnected — run: ollama serve",
        "available_models": runtime["available_models"],
        "active_model": runtime["active_model"],
        "gemma4_ready": runtime["gemma4_ready"],
        "multimodal": runtime["multimodal_ready"],
        "storage": "local SQLite, no cloud inference",
        "privacy": "100% on-device",
        "recommended_models": [
            "speakup-gemma4",
            "gemma4:e2b-it-q4_K_M",
            "gemma4:e4b",
        ],
    }

@app.get("/health")
async def health():
    return await _health_payload()

@app.get("/api/health")
async def api_health():
    return await _health_payload()
