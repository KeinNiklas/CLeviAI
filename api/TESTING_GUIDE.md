# MongoDB Integration - Lokale Tests

## Voraussetzungen

✅ MongoDB Atlas Verbindung funktioniert  
✅ 3 Pläne wurden migriert  
✅ `mongodb.env` ist konfiguriert  

## Lokale Tests durchführen

### 1. Backend-Server starten

```bash
cd api
uvicorn main:app --reload --port 8000
```

Der Server startet auf: `http://localhost:8000`

### 2. API-Dokumentation öffnen

Öffnen Sie im Browser:
```
http://localhost:8000/docs
```

Hier sehen Sie alle verfügbaren Endpoints und können sie direkt testen.

### 3. MongoDB Health Check

**Browser:**
```
http://localhost:8000/health/mongodb
```

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/health/mongodb"
```

Erwartete Antwort:
```json
{
  "status": "healthy",
  "database": "cleviaidb",
  "connected": true
}
```

### 4. Alle Pläne abrufen

**Browser:**
```
http://localhost:8000/plans?user_id=default-user
```

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/plans?user_id=default-user"
```

Sie sollten die 3 migrierten Pläne sehen (VWL, Test, sdfsf).

### 5. Spezifischen Plan abrufen

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/plans/plan_2026-02-01_6?user_id=default-user"
```

### 6. Neuen Plan erstellen

**PowerShell:**
```powershell
$body = @{
    topics = @(
        @{
            id = "topic-1"
            title = "Testthema"
            description = "Dies ist ein Test"
            estimated_hours = 2.0
            material_id = "test-material"
            flashcards = @()
            games = @()
            status = "OPEN"
        }
    )
    exam_date = "2026-03-15"
    parallel_courses = 1
    title = "Mein Testplan"
    daily_goal = 2.0
    study_days = @(0,1,2,3,4,5,6)
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:8000/create-plan?user_id=test-user" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"
```

### 7. Plan aktualisieren

**PowerShell:**
```powershell
$update = @{
    title = "Aktualisierter Titel"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/plans/PLAN_ID?user_id=test-user" `
    -Method Patch `
    -Body $update `
    -ContentType "application/json"
```

### 8. Plan löschen

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/plans/PLAN_ID?user_id=test-user" `
    -Method Delete
```

## Mit Frontend testen

### 1. Frontend starten

```bash
cd frontend
npm run dev
```

Das Frontend startet auf: `http://localhost:3000`

### 2. Frontend-Anpassungen (falls nötig)

Falls das Frontend noch nicht den `user_id` Parameter sendet, müssen Sie die API-Aufrufe anpassen. Beispiel:

```typescript
// Vorher
const response = await fetch('http://localhost:8000/plans');

// Nachher
const userId = 'default-user'; // oder aus dem Auth-System
const response = await fetch(`http://localhost:8000/plans?user_id=${userId}`);
```

## Direkte Datenbank-Tests

### Test-Skripte ausführen

```bash
cd api

# MongoDB Verbindung testen
python test_mongodb.py

# CRUD-Operationen testen
python test_crud.py

# Konfiguration prüfen
python check_config.py
```

## MongoDB Atlas Dashboard

Sie können auch direkt im MongoDB Atlas Dashboard die Daten ansehen:

1. Gehen Sie zu [MongoDB Atlas](https://cloud.mongodb.com)
2. Wählen Sie Ihr Cluster: `clavidb`
3. Klicken Sie auf "Browse Collections"
4. Wählen Sie Database: `cleviaidb`
5. Collection: `study_plans`

Hier sehen Sie alle gespeicherten Pläne in Echtzeit.

## Troubleshooting

### Server startet nicht
```bash
# Prüfen Sie, ob der Port bereits belegt ist
netstat -ano | findstr :8000

# Verwenden Sie einen anderen Port
uvicorn main:app --reload --port 8001
```

### MongoDB Verbindungsfehler
```bash
# Prüfen Sie die Umgebungsvariablen
cd api
python check_config.py

# Testen Sie die Verbindung
python test_mongodb.py
```

### CORS-Fehler im Frontend
Stellen Sie sicher, dass in `api/main.py` die CORS-Middleware korrekt konfiguriert ist:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Nützliche Befehle

```bash
# Backend mit Logs starten
cd api
uvicorn main:app --reload --log-level debug

# Frontend mit Logs starten
cd frontend
npm run dev

# Beide gleichzeitig (wenn start_app.ps1 existiert)
.\start_app.ps1
```

## Nächste Schritte

1. ✅ Backend starten und API-Docs öffnen
2. ✅ Health-Check durchführen
3. ✅ Pläne abrufen und verifizieren
4. ✅ Frontend starten und testen
5. ✅ Neue Pläne erstellen und CRUD-Operationen testen
