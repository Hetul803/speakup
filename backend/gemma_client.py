import httpx
import json
import os
import logging
import re
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

load_dotenv()

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "").strip()
# Gemma 4 Ollama model names to try in order of preference
GEMMA4_MODELS = [
    "speakup-gemma4",
    "gemma4:31b",
    "gemma4:26b",
    "gemma4:e4b",
    "gemma4:e2b",
    "gemma4",
    "hf.co/unsloth/gemma-4-E4B-it-GGUF",
    "hf.co/unsloth/gemma-4-E2B-it-GGUF",
    "gemma3:12b",
    "gemma3:9b",
    "gemma3:4b",
]

def strip_data_url(image_b64: str | None) -> str | None:
    if not image_b64:
        return image_b64
    return re.sub(r"^data:image/[^;]+;base64,", "", image_b64.strip())

class OllamaClient:
    def __init__(self, base_url: str = OLLAMA_BASE_URL, model: str = OLLAMA_MODEL):
        self.base_url = base_url
        self.model = model or None
        self._resolved_model = None

    async def generate(self, prompt: str, system: str = None, temperature: float = 0.2,
                       images: list = None, json_mode: bool = False) -> str:
        """Generate with optional image list (base64 strings for multimodal)"""
        model = await self.resolve_model()
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": temperature, "top_p": 0.9, "num_predict": 600}
        }
        if system:
            payload["system"] = system
        if images:
            payload["images"] = [strip_data_url(img) for img in images]  # Ollama expects raw base64 strings
        if json_mode:
            payload["format"] = "json"

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(f"{self.base_url}/api/generate", json=payload)
                response.raise_for_status()
                return response.json().get("response", "").strip()
        except httpx.TimeoutException:
            raise Exception("Model is loading or slow — please retry in a moment")
        except httpx.HTTPStatusError as e:
            raise Exception(f"Ollama HTTP error {e.response.status_code}: {e.response.text[:200]}")
        except Exception as e:
            raise Exception(f"Ollama connection failed: {str(e)}")

    async def chat(self, messages: list, system: str = None, temperature: float = 0.2) -> str:
        model = await self.resolve_model()
        formatted = []
        if system:
            formatted.append({"role": "system", "content": system})
        formatted.extend(messages)
        payload = {
            "model": model,
            "messages": formatted,
            "stream": False,
            "options": {"temperature": temperature, "top_p": 0.9, "num_predict": 600}
        }
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(f"{self.base_url}/api/chat", json=payload)
                response.raise_for_status()
                return response.json().get("message", {}).get("content", "").strip()
        except Exception as e:
            raise Exception(f"Ollama chat failed: {str(e)}")

    async def describe_image(self, image_b64: str, context: str = "") -> str:
        """Use Gemma 4 multimodal to describe what is in the image"""
        prompt = f"""Look at this image carefully. A non-verbal child is pointing at or near something in this scene.

Identify:
1. The main object the child is likely pointing at or interested in
2. Any people visible
3. The general environment/setting

{f"Additional context: {context}" if context else ""}

Respond in this exact format:
OBJECT: [the main object, e.g. "red cup", "snack box", "door", "toy car"]
PEOPLE: [any people visible, or "none"]
SETTING: [e.g. "kitchen table", "bedroom", "living room"]
SCENE: [one sentence describing what you see]"""

        try:
            result = await self.generate(prompt=prompt, images=[strip_data_url(image_b64)], temperature=0.1)
            return result
        except Exception as e:
            logger.error(f"Image description failed: {e}")
            return "OBJECT: unknown\nPEOPLE: none\nSETTING: unknown\nSCENE: Could not analyze image"

    async def health_check(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                r = await client.get(f"{self.base_url}/api/tags")
                return r.status_code == 200
        except:
            return False

    async def list_models(self) -> list:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                r = await client.get(f"{self.base_url}/api/tags")
                r.raise_for_status()
                return [m["name"] for m in r.json().get("models", [])]
        except:
            return []

    async def get_best_model(self) -> str:
        """Auto-detect best available Gemma 4 model"""
        available = await self.list_models()
        if self.model and self.model in available:
            return self.model
        for preferred in GEMMA4_MODELS:
            for avail in available:
                if preferred.lower() in avail.lower():
                    return avail
        return available[0] if available else (self.model or "gemma4")

    async def resolve_model(self) -> str:
        if self._resolved_model:
            return self._resolved_model
        self._resolved_model = await self.get_best_model()
        return self._resolved_model

    async def runtime_summary(self) -> dict:
        connected = await self.health_check()
        models = await self.list_models() if connected else []
        active = await self.get_best_model() if connected else (self.model or "gemma4")
        is_gemma4 = connected and (
            "gemma4" in active.lower()
            or "gemma-4" in active.lower()
            or "speakup-gemma4" in active.lower()
        )
        return {
            "connected": connected,
            "available_models": models,
            "active_model": active,
            "gemma4_ready": is_gemma4,
            "multimodal_ready": connected and is_gemma4,
            "base_url": self.base_url,
        }
