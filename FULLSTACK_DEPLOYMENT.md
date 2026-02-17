# CLeviAI - Fullstack Deployment auf Vercel

## Problem: Fullstack-Projekt mit Frontend (Next.js) und Backend (Python/FastAPI)

Vercel unterstützt **nicht** das gleichzeitige Deployment von Next.js und Python im selben Projekt.

## Lösung: Zwei separate Vercel-Projekte

### Option 1: Zwei separate Projekte (EMPFOHLEN)

#### Schritt 1: Backend deployen

1. **Neues Vercel-Projekt erstellen:**
   - Gehen Sie zu https://vercel.com/new
   - Wählen Sie Ihr GitHub Repository `CLeviAI`
   - Klicken Sie auf "Import"

2. **Projekt konfigurieren:**
   - **Project Name:** `cleviai-backend` (oder ähnlich)
   - **Framework Preset:** Other
   - **Root Directory:** `api` ← WICHTIG!
   - **Build Command:** (leer lassen)
   - **Output Directory:** (leer lassen)

3. **Environment Variables setzen:**
   ```
   MONGODB_URI=mongodb+srv://Vercel-Admin-clavidb:ISH7P6R9gRU7q6To@clavidb.qkkcbfh.mongodb.net/?retryWrites=true&w=majority&appName=clavidb
   MONGODB_DATABASE=cleviaidb
   GEMINI_API_KEY=ihr_key
   GROQ_API_KEY=ihr_key
   ```

4. **Deploy klicken**

5. **Backend-URL notieren** (z.B. `https://cleviai-backend.vercel.app`)

#### Schritt 2: Frontend deployen

1. **Neues Vercel-Projekt erstellen:**
   - Wieder zu https://vercel.com/new
   - Wählen Sie dasselbe GitHub Repository `CLeviAI`
   - Klicken Sie auf "Import"

2. **Projekt konfigurieren:**
   - **Project Name:** `cleviai-frontend` (oder ähnlich)
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend` ← WICHTIG!
   - **Build Command:** `npm run build`
   - **Output Directory:** (automatisch erkannt)

3. **Environment Variables setzen:**
   ```
   NEXT_PUBLIC_API_URL=https://cleviai-backend.vercel.app
   API_URL=https://cleviai-backend.vercel.app
   ```
   ⚠️ Verwenden Sie die Backend-URL aus Schritt 1!

4. **Deploy klicken**

5. **Frontend-URL notieren** (z.B. `https://cleviai-frontend.vercel.app`)

### Option 2: Monorepo mit Vercel (Komplizierter)

Vercel kann Monorepos handhaben, aber es erfordert spezielle Konfiguration:

1. Beide Projekte müssen im selben Vercel-Account sein
2. Sie müssen `vercel.json` im Root mit speziellen Routing-Regeln erstellen
3. Das ist komplizierter und nicht empfohlen für Python + Next.js

## Empfohlene Architektur

```
GitHub Repository: CLeviAI
├── api/                    → Vercel Projekt 1 (Backend)
│   ├── main.py
│   ├── index.py
│   ├── vercel.json
│   └── requirements.txt
│
└── frontend/               → Vercel Projekt 2 (Frontend)
    ├── app/
    ├── components/
    ├── package.json
    └── next.config.js
```

**Kommunikation:**
```
User → Frontend (Vercel) → API Routes (/api/*) → Backend (Vercel) → MongoDB Atlas
```

## Automatisches Deployment

Beide Projekte werden automatisch neu deployed, wenn Sie zu GitHub pushen:

- **Backend:** Deployed bei Änderungen im `api/` Ordner
- **Frontend:** Deployed bei Änderungen im `frontend/` Ordner

Sie können das in Vercel unter Settings → Git konfigurieren:
- **Ignored Build Step:** Nur deployen wenn sich der Root Directory ändert

## Zusammenfassung

**Sie brauchen:**
1. ✅ Ein Vercel-Projekt für Backend (`api/` als Root Directory)
2. ✅ Ein Vercel-Projekt für Frontend (`frontend/` als Root Directory)
3. ✅ Backend-URL im Frontend als Environment Variable

**Das ist normal** für Fullstack-Projekte auf Vercel!

## Alternative: Andere Hosting-Plattformen

Wenn Sie alles in einem Projekt haben möchten:

- **Railway.app** - Unterstützt Fullstack besser
- **Render.com** - Kann beide gleichzeitig hosten
- **Fly.io** - Gute Docker-Unterstützung

Aber Vercel ist für Next.js am besten optimiert, daher ist die Zwei-Projekte-Lösung empfohlen.
