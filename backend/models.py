from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class StudyMaterial(BaseModel):
    id: str
    filename: str
    content_type: str
    summary: Optional[str] = None
    upload_date: date


class Flashcard(BaseModel):
    question: str
    answer: str

class ChallengeType(BaseModel):
    type: str  # "QUIZ", "MATCH", "TRUE_FALSE"
    question: str
    correct_answer: str
    distractors: List[str] = []  # Wrong answers for Quiz
    pair: Optional[str] = None   # For matching, the corresponding pair

class Topic(BaseModel):
    id: str
    title: str
    description: str
    estimated_hours: float
    material_id: str  # Link back to source material
    flashcards: List[Flashcard] = []
    games: List[ChallengeType] = [] # New field for gamified content
    status: str = "OPEN"  # OPEN, MASTERED, STRUGGLING

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
