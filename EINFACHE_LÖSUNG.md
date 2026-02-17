# Einfache Lösung: Bestehendes Vercel-Projekt nutzen

## Sie müssen NICHTS neu aufsetzen! 

Ihr Code ist perfekt. Sie müssen nur die Environment Variables in Ihrem **bestehenden** Vercel-Projekt setzen.

## Welches Projekt haben Sie deployed?

### Fall 1: Sie haben nur das Frontend deployed

**Das ist wahrscheinlich der Fall, wenn:**
- Ihr Vercel-Projekt heißt "CLeviAI" oder "cleviai-frontend"
- Der Root Directory ist `frontend` oder leer

**Lösung:**

1. **Gehen Sie zu Vercel** → Ihr Projekt → Settings → Environment Variables

2. **Fügen Sie hinzu:**
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   API_URL=http://localhost:8000
   ```
   
   ⚠️ **WICHTIG:** Verwenden Sie erstmal `localhost:8000` zum Testen!

3. **Redeploy:** Deployments → "..." → "Redeploy"

4. **Testen Sie lokal:**
   ```powershell
   # Terminal 1 - Backend lokal
   cd api
   uvicorn main:app --reload --port 8000
   
   # Terminal 2 - Frontend von Vercel
   # Öffnen Sie einfach Ihre Vercel-URL im Browser
   ```

**Problem:** Das Backend läuft nur lokal, nicht auf Vercel.

**Nächster Schritt:** Backend auch auf Vercel deployen (siehe unten)

### Fall 2: Sie haben das ganze Projekt deployed

**Das ist der Fall, wenn:**
- Root Directory ist leer oder `/`
- Vercel versucht, beides zu bauen

**Lösung:**

1. **Gehen Sie zu Vercel** → Ihr Projekt → Settings → General

2. **Ändern Sie:**
   - **Root Directory:** `frontend`
   - **Framework Preset:** Next.js

3. **Environment Variables setzen:**
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   API_URL=http://localhost:8000
   ```

4. **Redeploy**

## Backend auf Vercel deployen (Optional aber empfohlen)

Sie können Ihr bestehendes Vercel-Projekt nutzen und ein zweites für das Backend erstellen:

### Schnelle Methode:

1. **Gehen Sie zu:** https://vercel.com/new

2. **Wählen Sie:** Dasselbe GitHub Repository

3. **Konfigurieren:**
   - Project Name: `cleviai-api` (oder ähnlich)
   - Root Directory: `api`
   - Framework: Other

4. **Environment Variables:**
   ```
   MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/?retryWrites=true&w=majority
   MONGODB_DATABASE=cleviaidb
   GEMINI_API_KEY=ihr_key
   ```

5. **Deploy**

6. **Backend-URL kopieren** (z.B. `https://cleviai-api.vercel.app`)

7. **Zurück zum Frontend-Projekt:**
   - Settings → Environment Variables
   - Ändern Sie:
     ```
     NEXT_PUBLIC_API_URL=https://cleviai-api.vercel.app
     API_URL=https://cleviai-api.vercel.app
     ```
   - Redeploy

## Temporäre Lösung: Nur Frontend auf Vercel, Backend lokal

Wenn Sie nicht warten wollen:

1. **Frontend auf Vercel** mit `NEXT_PUBLIC_API_URL=http://localhost:8000`
2. **Backend lokal laufen lassen**
3. **Nur lokal testen**

Das funktioniert für Entwicklung, aber nicht für Production.

## Zusammenfassung

**Sie müssen nichts neu aufsetzen!**

**Minimale Schritte:**
1. ✅ Ihr Code ist fertig
2. ✅ Setzen Sie Environment Variables in Vercel
3. ✅ Redeploy
4. ✅ (Optional) Erstellen Sie ein zweites Vercel-Projekt für Backend

**Das dauert nur 5 Minuten!**
