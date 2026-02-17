# CLeviAI - Vercel Deployment Guide

## 🚀 Deploying to Vercel

### Prerequisites
- GitHub repository with your code
- Vercel account
- MongoDB Atlas database

## Backend Deployment (Python API)

### Option 1: Deploy Backend to Vercel

1. **Create `vercel.json` in the `api` directory:**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "main.py",
         "use": "@vercel/python"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "main.py"
       }
     ]
   }
   ```

2. **Set Environment Variables in Vercel:**
   - Go to your Vercel project → Settings → Environment Variables
   - Add the following:
     ```
     MONGODB_URI=mongodb+srv://Vercel-Admin-clavidb:ISH7P6R9gRU7q6To@clavidb.qkkcbfh.mongodb.net/?retryWrites=true&w=majority&appName=clavidb
     MONGODB_DATABASE=cleviaidb
     GEMINI_API_KEY=your_gemini_api_key
     GROQ_API_KEY=your_groq_api_key (optional)
     ```

3. **Deploy:**
   ```bash
   cd api
   vercel
   ```

4. **Note the deployed URL** (e.g., `https://your-api.vercel.app`)

### Option 2: Deploy Backend Elsewhere

If you deploy the backend to another platform (Railway, Render, etc.), note the URL.

## Frontend Deployment

1. **Set Environment Variables in Vercel:**
   - Go to your Vercel project → Settings → Environment Variables
   - Add:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
     API_URL=https://your-backend-url.vercel.app
     ```

2. **Deploy Frontend:**
   ```bash
   cd frontend
   vercel
   ```

## Important Notes

### MongoDB Connection
- The MongoDB URI contains your password - **NEVER commit this to Git**
- Always use Environment Variables in Vercel
- Ensure your IP is whitelisted in MongoDB Atlas (or use `0.0.0.0/0` for all IPs)

### API Routes
The frontend uses Next.js API routes as proxies to the Python backend:
- `/api/analyze-document` → `{BACKEND}/analyze-document`
- `/api/create-plan` → `{BACKEND}/create-plan`
- `/api/plans` → `{BACKEND}/plans`
- `/api/plans/[id]` → `{BACKEND}/plans/{id}`
- `/api/settings/config` → `{BACKEND}/settings/config`
- `/api/settings/keys` → `{BACKEND}/settings/keys`

### Testing After Deployment

1. **Check Backend Health:**
   ```
   https://your-backend-url.vercel.app/health
   https://your-backend-url.vercel.app/health/mongodb
   ```

2. **Check Frontend:**
   ```
   https://your-frontend-url.vercel.app
   ```

3. **Test Document Upload:**
   - Upload a PDF/DOCX file
   - Should analyze and create a study plan
   - Data should be saved to MongoDB

## Troubleshooting

### "Failed to execute 'text' on 'Response': body stream already read"
✅ **Fixed** - The FileUploader now clones responses before reading

### Backend Connection Errors
- Check that `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Verify backend is deployed and accessible
- Check CORS settings in backend `main.py`

### MongoDB Connection Errors
- Verify `MONGODB_URI` is set in backend environment variables
- Check MongoDB Atlas Network Access (IP whitelist)
- Verify database user credentials

### CORS Errors
Ensure your backend `main.py` has:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Environment Variables Summary

### Backend (Python API)
```
MONGODB_URI=mongodb+srv://...
MONGODB_DATABASE=cleviaidb
GEMINI_API_KEY=...
GROQ_API_KEY=... (optional)
```

### Frontend (Next.js)
```
NEXT_PUBLIC_API_URL=https://your-backend-url
API_URL=https://your-backend-url
```

## Local Development

### Backend
```bash
cd api
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm run dev
```

Make sure to create `.env.local` in the frontend directory with:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
API_URL=http://localhost:8000
```
