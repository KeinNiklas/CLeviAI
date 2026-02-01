from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import date
from models import Topic, StudyPlan, PodcastResponse
from services.ingestion import IngestionService
from services.analyzer import AnalyzerService
from services.scheduler import SchedulerService
from dotenv import load_dotenv
import os

# Load environment variables
if os.path.exists("key.env"):
    load_dotenv("key.env")
else:
    load_dotenv()

app = FastAPI(title="CLeviAI Backend")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
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

@app.get("/")
def read_root():
    return {"message": "Welcome to CLeviAI API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/analyze-document", response_model=List[Topic])
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

@app.post("/create-plan", response_model=StudyPlan)
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

@app.get("/plans", response_model=List[StudyPlan])
def get_plans():
    return scheduler_service.store.get_all_plans()

@app.get("/plans/{plan_id}", response_model=StudyPlan)
def get_plan(plan_id: str):
    plan = scheduler_service.store.get_plan(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan

@app.delete("/plans/{plan_id}")
def delete_plan(plan_id: str):
    scheduler_service.store.delete_plan(plan_id)
    return {"status": "success", "message": "Plan deleted"}

class PlanUpdate(BaseModel):
    title: Optional[str] = None
    # Add other fields here if we want to allow updating them (e.g. daily_goal)
    
@app.patch("/plans/{plan_id}")
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

@app.patch("/plans/{plan_id}/topics/{topic_id}")
def update_topic_status(plan_id: str, topic_id: str, update: StatusUpdate):
    try:
        scheduler_service.store.update_topic_status(plan_id, topic_id, update.status)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from services.podcast_service import PodcastService
podcast_service = PodcastService(analyzer_service.groq_service)

class PodcastRequest(BaseModel):
    topic_title: str
    topic_description: str
    language: str = "en"
    preset: str = "classroom"

@app.post("/podcast/generate", response_model=PodcastResponse)
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

@app.post("/podcast/audio")
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
