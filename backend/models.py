from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class StudyMaterial(BaseModel):
    id: str
    filename: str
    content_type: str
    summary: Optional[str] = None
    upload_date: date

class Topic(BaseModel):
    id: str
    title: str
    description: str
    estimated_hours: float
    material_id: str  # Link back to source material

class DaySchedule(BaseModel):
    date: date
    topics: List[Topic]
    total_hours: float

class StudyPlan(BaseModel):
    id: str
    exam_date: date
    parallel_courses: int
    schedule: List[DaySchedule]
    # Metadata for the plan logic
    created_at: date
