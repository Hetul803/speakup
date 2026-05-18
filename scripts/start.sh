#!/bin/bash
echo "Starting SpeakUp..."

# Start Ollama if not running
if ! pgrep -f "ollama serve" > /dev/null; then
  echo "Starting Ollama..."
  ollama serve &
  sleep 3
fi

# Start backend
cd "$(dirname "$0")/../backend"
source venv/bin/activate
BACKEND_PORT="${BACKEND_PORT:-8000}"
if lsof -nP -iTCP:$BACKEND_PORT -sTCP:LISTEN >/dev/null 2>&1; then
  BACKEND_PORT=8001
fi
echo "Starting FastAPI backend on port $BACKEND_PORT..."
uvicorn main:app --host 0.0.0.0 --port "$BACKEND_PORT" --reload &
BACKEND_PID=$!
cd ..

sleep 2

# Start frontend
cd frontend
echo "Starting React frontend on port 5173..."
export VITE_API_TARGET="http://localhost:$BACKEND_PORT"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "=============================="
echo "SpeakUp is running!"
echo "Open: http://localhost:5173"
echo ""
echo "Ctrl+C to stop"
echo "=============================="

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
