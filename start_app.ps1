Write-Host "Starting CLeviAI..." -ForegroundColor Cyan

# Ensure Node.js is in PATH
$NodeDir = "C:\Program Files\nodejs"
if (Test-Path $NodeDir) {
    $env:Path = "$NodeDir;$env:Path"
    Write-Host "Added Node.js to PATH." -ForegroundColor Gray
}

# Start Backend
Write-Host "Starting Backend (FastAPI)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd api; .\.venv\Scripts\activate; uvicorn main:app --reload --port 8000"

# Start Frontend
Write-Host "Starting Frontend (Next.js)..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "Application starting! Check the new windows." -ForegroundColor Magenta
Write-Host "Frontend: http://localhost:3000"
Write-Host "Backend:  http://localhost:8000/docs"
