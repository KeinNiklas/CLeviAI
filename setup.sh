#!/bin/bash

# Farben definieren
CYAN='\033[0;36m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${CYAN}Setting up CLeviAI Environment...${NC}"

# Backend Setup
echo -e "${GREEN}--- Backend Setup ---${NC}"
cd api || { echo -e "${RED}Backend/API directory not found${NC}"; exit 1; }

if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv .venv || { echo -e "${RED}Failed to create venv${NC}"; exit 1; }
else
    echo "Virtual environment already exists."
fi

echo "Installing Python dependencies..."
source .venv/bin/activate || { echo -e "${RED}Failed to activate venv${NC}"; exit 1; }
./.venv/bin/pip install -r requirements.txt || { echo -e "${RED}Failed to install requirements${NC}"; exit 1; }

cd ..

# Frontend Setup
echo -e "${BLUE}--- Frontend Setup ---${NC}"
cd frontend || { echo -e "${RED}Frontend directory not found${NC}"; exit 1; }

if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install || { echo -e "${RED}Failed to install npm packages${NC}"; exit 1; }
else
    echo "Node modules already installed."
fi

cd ..

echo -e "${MAGENTA}Setup complete! You can now run './start_app.sh'${NC}"