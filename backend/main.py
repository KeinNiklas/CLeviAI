from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from datetime import date
from models import Topic, StudyPlan
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

@app.get("/")
def read_root():
    return {"message": "Welcome to CLeviAI API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/analyze-document", response_model=List[Topic])
@app.post("/analyze-document", response_model=List[Topic])
async def analyze_document(files: List[UploadFile] = File(...), language: str = Form("en")):
    try:
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
        raise HTTPException(status_code=500, detail=str(e))

class PlanRequest(BaseModel):
    topics: List[Topic]
    exam_date: date
    parallel_courses: int

@app.post("/create-plan", response_model=StudyPlan)
def create_plan(request: PlanRequest):
    try:
        plan = scheduler_service.create_plan(
            topics=request.topics,
            exam_date=request.exam_date,
            parallel_courses=request.parallel_courses
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
