# Vercel Deployment - Troubleshooting "Fetch Failed"

## Problem: "Fetch failed" Fehler

Dieser Fehler tritt auf, wenn das Frontend das Backend nicht erreichen kann.

## Häufigste Ursachen und Lösungen

### 1. Backend-URL nicht konfiguriert (HÄUFIGSTE URSACHE)

**Problem:** Die Environment Variable `NEXT_PUBLIC_API_URL` ist in Vercel nicht gesetzt.

**Lösung:**
1. Gehen Sie zu Vercel → Ihr Frontend-Projekt → Settings → Environment Variables
2. Fügen Sie hinzu:
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://ihr-backend-url.vercel.app
   ```
3. Fügen Sie auch hinzu:
   ```
   Name: API_URL
   Value: https://ihr-backend-url.vercel.app
   ```
4. Klicken Sie auf "Save"
5. Gehen Sie zu Deployments → Klicken Sie auf "..." → "Redeploy"

**So finden Sie Ihre Backend-URL:**
- Gehen Sie zu Ihrem Backend-Projekt in Vercel
- Die URL steht oben (z.B. `https://clevi-ai-api.vercel.app`)

### 2. Backend ist nicht deployed

**Problem:** Das Backend wurde noch nicht zu Vercel deployed.

**Lösung:**
1. Erstellen Sie ein neues Vercel-Projekt für das Backend
2. Verlinken Sie es mit Ihrem GitHub Repository
3. Setzen Sie den Root Directory auf `api`
4. Fügen Sie die Environment Variables hinzu (siehe unten)
5. Deploy

**Backend Environment Variables:**
```
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/?retryWrites=true&w=majority
MONGODB_DATABASE=cleviaidb
GEMINI_API_KEY=ihr_gemini_key
GROQ_API_KEY=ihr_groq_key (optional)
```

### 3. CORS-Problem

**Problem:** Backend blockiert Anfragen vom Frontend.

**Lösung:** 
✅ Bereits behoben - `main.py` erlaubt jetzt alle Origins (`allow_origins=["*"]`)

### 4. Backend-Fehler

**Problem:** Das Backend startet nicht oder hat Fehler.

**Lösung:**
1. Gehen Sie zu Vercel → Backend-Projekt → Deployments
2. Klicken Sie auf das neueste Deployment
3. Schauen Sie in die "Function Logs"
4. Suchen Sie nach Fehlern

**Häufige Backend-Fehler:**
- `ModuleNotFoundError` → Dependency fehlt in `requirements.txt`
- `MongoDB connection failed` → MONGODB_URI falsch oder IP nicht whitelisted
- `Import error` → Mangum-Adapter fehlt (sollte jetzt behoben sein)

### 5. Lokales Testen

**Testen Sie lokal, ob es funktioniert:**

```powershell
# Terminal 1 - Backend
cd api
uvicorn main:app --reload --port 8000

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

Öffnen Sie `http://localhost:3000` - wenn es lokal funktioniert, ist es ein Vercel-Konfigurationsproblem.

## Debugging-Schritte

### Schritt 1: Browser DevTools öffnen
1. Drücken Sie F12 in Ihrem Browser
2. Gehen Sie zum "Console" Tab
3. Versuchen Sie, ein Dokument hochzuladen
4. Schauen Sie sich die Fehlermeldung an

**Mögliche Fehler:**
- `Failed to fetch` → Backend-URL falsch oder Backend nicht erreichbar
- `CORS error` → CORS-Problem (sollte behoben sein)
- `404 Not Found` → API-Route existiert nicht
- `500 Internal Server Error` → Backend-Fehler

### Schritt 2: Network Tab prüfen
1. Gehen Sie zum "Network" Tab in DevTools
2. Versuchen Sie erneut, ein Dokument hochzuladen
3. Klicken Sie auf den fehlgeschlagenen Request
4. Schauen Sie sich "Request URL" an

**Was Sie sehen sollten:**
- Request URL: `https://ihr-frontend.vercel.app/api/analyze-document`
- Diese sollte dann zu `https://ihr-backend.vercel.app/analyze-document` weiterleiten

### Schritt 3: Vercel Function Logs
1. Gehen Sie zu Vercel → Frontend-Projekt → Deployments
2. Klicken Sie auf das neueste Deployment
3. Klicken Sie auf "View Function Logs"
4. Schauen Sie nach `[analyze-document]` Logs

**Was Sie sehen sollten:**
```
[analyze-document] Forwarding request to: https://ihr-backend.vercel.app/analyze-document
[analyze-document] Backend response status: 200
[analyze-document] Success, returning data
```

## Schnelle Lösung

**Wenn Sie nicht warten wollen, bis das Backend auf Vercel läuft:**

Verwenden Sie vorerst das lokale Backend:

1. Starten Sie das Backend lokal:
   ```powershell
   cd api
   uvicorn main:app --reload --port 8000
   ```

2. Verwenden Sie ngrok für einen öffentlichen Tunnel:
   ```powershell
   ngrok http 8000
   ```

3. Kopieren Sie die ngrok-URL (z.B. `https://abc123.ngrok.io`)

4. Setzen Sie in Vercel:
   ```
   NEXT_PUBLIC_API_URL=https://abc123.ngrok.io
   ```

5. Redeploy das Frontend

**Hinweis:** Dies ist nur für Tests - für Production sollten Sie das Backend auf Vercel deployen.

## Checkliste

- [ ] Backend ist auf Vercel deployed
- [ ] Backend Environment Variables sind gesetzt (MONGODB_URI, etc.)
- [ ] Backend-URL notiert (z.B. `https://clevi-ai-api.vercel.app`)
- [ ] Frontend Environment Variables gesetzt (NEXT_PUBLIC_API_URL, API_URL)
- [ ] Frontend redeployed nach Setzen der Variables
- [ ] Browser DevTools gecheckt für genaue Fehlermeldung
- [ ] Vercel Function Logs gecheckt

## Kontakt

Wenn Sie immer noch Probleme haben, teilen Sie mir mit:
1. Die genaue Fehlermeldung aus der Browser Console
2. Die Backend-URL (falls deployed)
3. Screenshots der Vercel Environment Variables (ohne sensitive Daten)
