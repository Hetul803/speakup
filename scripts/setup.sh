#!/bin/bash
set -e
echo "=============================="
echo "  SpeakUp Setup"
echo "=============================="

# Check Ollama
if command -v ollama &>/dev/null; then
  echo "Ollama found"
  echo "Pulling Gemma 4 model..."
  ollama pull gemma4:e2b-it-q4_K_M || echo "Pull failed — run: ollama pull gemma4:e2b-it-q4_K_M"
else
  echo "INSTALL OLLAMA FIRST: https://ollama.com"
  echo "Then re-run this script"
  exit 1
fi

# Backend
echo "Setting up Python backend..."
cd "$(dirname "$0")/../backend"
PYTHON_BIN="${PYTHON_BIN:-$(command -v python3.10 || command -v python3.11 || command -v python3)}"
"$PYTHON_BIN" -m venv venv
source venv/bin/activate
pip install -r requirements.txt --quiet
cp .env.example .env 2>/dev/null || true
echo "Backend ready"

# Frontend
echo "Setting up React frontend..."
cd ../frontend
npm install --silent
echo "Frontend ready"

echo ""
echo "=============================="
echo "Setup complete! Now run:"
echo "  ./scripts/start.sh"
echo "=============================="
