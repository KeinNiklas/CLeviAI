#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "=========================================="
echo "    CLeviAI Automated Test Runner"
echo "=========================================="

# Backend Tests
echo ""
echo "[1/2] Running Backend Tests (pytest)..."
echo "------------------------------------------"
cd backend
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi
source .venv/bin/activate
echo "Installing/Updating backend dependencies..."
pip install -q -r requirements.txt
echo "Running pytest..."
pytest
deactivate
cd ..

# Frontend Tests
echo ""
echo "[2/2] Running Frontend Tests (Jest)..."
echo "------------------------------------------"
cd frontend
echo "Installing/Updating frontend dependencies..."
npm install --silent
echo "Running Jest..."
npm test
cd ..

echo ""
echo "=========================================="
echo "    All Tests Completed Successfully!"
echo "=========================================="
