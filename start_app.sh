#!/bin/bash

# Farben definieren
CYAN='\033[0;36m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${CYAN}Starting CLeviAI...${NC}"

# Unter macOS ist Node.js in der Regel bereits im PATH (/usr/local/bin oder /opt/homebrew/bin)
# Eine manuelle Pfad-Erweiterung wie unter Windows ist meist nicht erforderlich.

# Start Backend in einem neuen Fenster
echo -e "${GREEN}Starting Backend (FastAPI)...${NC}"
osascript -e "tell application \"Terminal\" to do script \"cd '$(pwd)/backend' && source .venv/bin/activate && uvicorn main:app --reload --port 8000\""

# Start Frontend in einem neuen Fenster
echo -e "${BLUE}Starting Frontend (Next.js)...${NC}"
osascript -e "tell application \"Terminal\" to do script \"cd '$(pwd)/frontend' && npm run dev\""

echo -e "${MAGENTA}Application starting! Check the new windows.${NC}"
echo -e "Frontend: http://localhost:3000"
echo -e "Backend:  http://localhost:8000/docs"