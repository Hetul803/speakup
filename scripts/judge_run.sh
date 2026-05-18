#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "=============================="
echo " SpeakUp Judge Demo"
echo "=============================="

if ! command -v ollama >/dev/null 2>&1; then
  echo "Ollama is required. Install it from https://ollama.com, then run this command again."
  exit 1
fi

if ! pgrep -f "ollama serve" >/dev/null 2>&1; then
  echo "Starting Ollama..."
  ollama serve >/tmp/speakup-ollama.log 2>&1 &
  sleep 3
fi

if ! ollama list | grep -q "gemma4:e2b-it-q4_K_M"; then
  echo "Pulling Gemma 4 E2B. This is a one-time download."
  ollama pull gemma4:e2b-it-q4_K_M
fi

if [ ! -d backend/venv ] || [ ! -d frontend/node_modules ]; then
  echo "Installing app dependencies..."
  ./scripts/setup.sh
fi

echo "Starting SpeakUp..."
echo "Note: the first Gemma 4 response can take 30-90 seconds while the model loads. Later replies are faster."
./scripts/start.sh
