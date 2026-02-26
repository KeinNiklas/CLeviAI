Write-Host "Setting up CLeviAI Environment..." -ForegroundColor Cyan

# Backend Setup
Write-Host "--- Backend Setup ---" -ForegroundColor Green
Push-Location api
try {
    if (-not (Test-Path .venv)) {
        Write-Host "Creating Python virtual environment..."
        python -m venv .venv
        if ($LASTEXITCODE -ne 0) { throw "Failed to create venv" }
    } else {
        Write-Host "Virtual environment already exists."
    }

    Write-Host "Installing Python dependencies..."
    .\.venv\Scripts\activate
    pip install -r requirements.txt
    if ($LASTEXITCODE -ne 0) { throw "Failed to install requirements" }
} catch {
    Write-Host "Error in Backend setup: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

# Frontend Setup
Write-Host "--- Frontend Setup ---" -ForegroundColor Blue
Push-Location frontend
try {
    if (-not (Test-Path node_modules)) {
        Write-Host "Installing Node.js dependencies..."
        npm install
        if ($LASTEXITCODE -ne 0) { throw "Failed to install npm packages" }
    } else {
        Write-Host "Node modules already installed."
    }
} catch {
    Write-Host "Error in Frontend setup: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

Write-Host "Setup complete! You can now run 'start_app.ps1'" -ForegroundColor Magenta
