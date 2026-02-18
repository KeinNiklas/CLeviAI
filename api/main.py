from fastapi import FastAPI, UploadFile, File, HTTPException, Form, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import date
try:
    from models import Topic, StudyPlan, PodcastResponse
except ImportError:
    from .models import Topic, StudyPlan, PodcastResponse
try:
    from .services.ingestion import IngestionService
    from .services.analyzer import AnalyzerService
    from .services.scheduler import SchedulerService
except ImportError:
    from services.ingestion import IngestionService
    from services.analyzer import AnalyzerService
    from services.scheduler import SchedulerService
from dotenv import load_dotenv
import os

# Load environment variables
# Load environment variables
if os.path.exists("key.env"):
    load_dotenv("key.env")
if os.path.exists("mongodb.env"):
    # Check if it's a standard env file or just a raw connection string
    with open("mongodb.env", "r") as f:
        content = f.read().strip()
    if content.startswith("mongodb"):
         os.environ["MONGODB_TEST_URI"] = content
    else:
         load_dotenv("mongodb.env")

app = FastAPI(title="CLeviAI Backend")
router = APIRouter()

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

analyzer_service = AnalyzerService()
scheduler_service = SchedulerService()

# Startup Check (Reload Triggered)
if analyzer_service.groq_service.client:
    print("✅ Groq Fallback Activated: Ready to take over if Gemini fails.")
else:
    print("⚠️ Groq API Key missing. Fallback system disabled. Checked: GROQ_API_KEY")

@router.get("/")
def read_root():
    return {"message": "Welcome to CLeviAI API"}

@router.get("/health")
def health_check():
    return {"status": "healthy"}

@router.post("/analyze-document", response_model=List[Topic])
async def analyze_document(files: List[UploadFile] = File(...), language: str = Form("en")):
    try:
        # Pre-check API availability
        # If Gemini is down/quota limited, we check if Groq is available as fallback
        try:
             analyzer_service.gemini_service.check_availability()
        except Exception as e:
             if not analyzer_service.groq_service.client:
                  # If both are down/missing, raise the error
                  raise e
             print("Gemini check failed, but Groq is available. Proceeding with fallback.")

        all_topics = []
        for file in files:
            # 1. Ingest
            text = await IngestionService.extract_text(file)
            if not text or len(text.strip()) == 0:
                print(f"Skipping empty or unreadable file: {file.filename}")
                continue
            
            # 2. Analyze
            topics = analyzer_service.analyze_text(text, material_id=file.filename, language=language)
            all_topics.extend(topics)
            
        return all_topics
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "Quota exceeded" in error_msg:
             raise HTTPException(status_code=429, detail=f"Gemini API Quota Exceeded. Please try again later.")
        raise HTTPException(status_code=500, detail=str(e))

class PlanRequest(BaseModel):
    topics: List[Topic]
    exam_date: date
    parallel_courses: int
    title: str = "My Journey"
    daily_goal: float = 2.0
    study_days: List[int] = [0,1,2,3,4,5,6]

@router.post("/create-plan", response_model=StudyPlan)
def create_plan(request: PlanRequest):
    try:
        plan = scheduler_service.create_plan(
            topics=request.topics,
            exam_date=request.exam_date,
            parallel_courses=request.parallel_courses,
            title=request.title,
            daily_goal=request.daily_goal,
            study_days=request.study_days
        )
        return plan
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/plans", response_model=List[StudyPlan])
def get_plans():
    return scheduler_service.store.get_all_plans()

@router.get("/plans/{plan_id}", response_model=StudyPlan)
def get_plan(plan_id: str):
    plan = scheduler_service.store.get_plan(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan

@router.delete("/plans/{plan_id}")
def delete_plan(plan_id: str):
    scheduler_service.store.delete_plan(plan_id)
    return {"status": "success", "message": "Plan deleted"}

class PlanUpdate(BaseModel):
    title: Optional[str] = None
    # Add other fields here if we want to allow updating them (e.g. daily_goal)
    
@router.patch("/plans/{plan_id}")
def update_plan(plan_id: str, update: PlanUpdate):
    # Filter out None values
    updates = {k: v for k, v in update.model_dump().items() if v is not None}
    
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    success = scheduler_service.store.update_plan(plan_id, updates)
    if not success:
         raise HTTPException(status_code=404, detail="Plan not found")
    
    return {"status": "success", "message": "Plan updated"}

class StatusUpdate(BaseModel):
    status: str

@router.patch("/plans/{plan_id}/topics/{topic_id}")
def update_topic_status(plan_id: str, topic_id: str, update: StatusUpdate):
    try:
        scheduler_service.store.update_topic_status(plan_id, topic_id, update.status)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/settings/config")
def get_settings_config():
    """Return masked config and preferred model status"""
    # Force reload from file in case it was edited manually
    load_dotenv("key.env", override=True)
    groq_key = os.getenv("GROQ_API_KEY", "")
    google_key = os.getenv("GOOGLE_API_KEY", "")
    preferred_model = os.getenv("PREFERRED_MODEL", "gemini")

    return {
        "groq_configured": bool(groq_key),
        "google_configured": bool(google_key),
        # Return full keys as requested
        "groq_key": groq_key,
        "google_key": google_key,
        "preferred_model": preferred_model
    }

class APIKeyUpdate(BaseModel):
    groq_api_key: Optional[str] = None
    google_api_key: Optional[str] = None
    preferred_model: Optional[str] = None

@router.post("/settings/keys")
def update_api_keys(keys: APIKeyUpdate):
    try:
        # Read existing keys
        env_vars = {}
        if os.path.exists("key.env"):
            with open("key.env", "r") as f:
                for line in f:
                    if "=" in line:
                        k, v = line.strip().split("=", 1)
                        env_vars[k] = v
        
        # Update with new values
        if keys.groq_api_key:
            env_vars["GROQ_API_KEY"] = keys.groq_api_key
            os.environ["GROQ_API_KEY"] = keys.groq_api_key 
        if keys.google_api_key:
            env_vars["GOOGLE_API_KEY"] = keys.google_api_key
            os.environ["GOOGLE_API_KEY"] = keys.google_api_key
        if keys.preferred_model:
            env_vars["PREFERRED_MODEL"] = keys.preferred_model
            os.environ["PREFERRED_MODEL"] = keys.preferred_model
            
        # Write back to file
        with open("key.env", "w") as f:
            for k, v in env_vars.items():
                f.write(f"{k}={v}\n")
                
        # Reload services
        global analyzer_service
        analyzer_service = AnalyzerService()
        
        return {"status": "success", "message": "Settings updated"}
    except Exception as e:
        print(f"Error updating keys: {e}")
        raise HTTPException(status_code=500, detail=str(e))
try:
    from .services.podcast_service import PodcastService
except ImportError:
    from services.podcast_service import PodcastService
podcast_service = PodcastService(analyzer_service.groq_service, analyzer_service.gemini_service)

class PodcastRequest(BaseModel):
    topic_title: str
    topic_description: str
    language: str = "en"
    preset: str = "classroom"

@router.post("/podcast/generate", response_model=PodcastResponse)
def generate_podcast(req: PodcastRequest):
    try:
        return podcast_service.generate_script(req.topic_title, req.topic_description, req.language, req.preset)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class AudioRequest(BaseModel):
    text: str
    speaker: str
    language: str = "en"

from fastapi.responses import StreamingResponse
import io

@router.post("/podcast/audio")
def generate_audio(req: AudioRequest):
    try:
        audio_bytes = podcast_service.generate_audio_segment(req.text, req.speaker, req.language)
        return StreamingResponse(io.BytesIO(audio_bytes), media_type="audio/wav")
    except Exception as e:
        error_str = str(e).lower()
        if "rate limit" in error_str or "429" in error_str:
             print(f"Rate Limit Hit: {e}")
             raise HTTPException(status_code=429, detail="Rate Limit Exceeded")
        raise HTTPException(status_code=500, detail=str(e))

# Mount router for Vercel and local dev
app.include_router(router)
app.include_router(router, prefix="/api")
