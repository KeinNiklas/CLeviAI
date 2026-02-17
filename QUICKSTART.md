# MongoDB Integration - Schnellstart

## 🚀 Server starten

```powershell
cd api
uvicorn main:app --reload --port 8000
```

Server läuft auf: **http://localhost:8000**

## ✅ Schnelltests

### 1. API-Dokumentation

Browser öffnen:
```
http://localhost:8000/docs
```

### 2. MongoDB Health Check

```
http://localhost:8000/health/mongodb
```

Erwartete Antwort:
```json
{
  "status": "healthy",
  "database": "cleviaidb",
  "connected": true
}
```

### 3. Alle Pläne anzeigen

```
http://localhost:8000/plans?user_id=default-user
```

### 4. PowerShell Tests

```powershell
# Health Check
Invoke-RestMethod -Uri "http://localhost:8000/health/mongodb"

# Alle Pläne
Invoke-RestMethod -Uri "http://localhost:8000/plans?user_id=default-user"
```

### 5. Neuen Plan erstellen

```powershell
$body = @{
    topics = @(
        @{
            id = "test-1"
            title = "Testthema"
            description = "MongoDB Test"
            estimated_hours = 2.0
            material_id = "test"
            flashcards = @()
            games = @()
            status = "OPEN"
        }
    )
    exam_date = "2026-03-20"
    parallel_courses = 1
    title = "Testplan"
    daily_goal = 2.0
    study_days = @(0,1,2,3,4)
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:8000/create-plan?user_id=test-user" `
    -Method Post -Body $body -ContentType "application/json"
```

## 🎯 Frontend testen

```powershell
cd frontend
npm run dev
```

Frontend: **http://localhost:3000**

## 📊 MongoDB Atlas Dashboard

1. https://cloud.mongodb.com
2. Cluster: **clavidb**
3. Browse Collections → **cleviaidb** → **study_plans**

## 🔧 Test-Skripte

```powershell
cd api

# Verbindung testen
python test_mongodb.py

# CRUD-Operationen testen
python test_crud.py
```

## 📝 Wichtige Endpoints

- `/docs` - API-Dokumentation
- `/health/mongodb` - MongoDB Status
- `/plans?user_id=...` - Alle Pläne
- `/create-plan?user_id=...` - Neuen Plan erstellen

Alle Endpoints unterstützen `user_id` Parameter!
