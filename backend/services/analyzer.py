import os
import json
from typing import List
from models import Topic
from services.gemini_service import GeminiService

class AnalyzerService:
    def __init__(self):
        self.gemini_service = GeminiService()

    def analyze_text(self, text: str, material_id: str, language: str = "en") -> List[Topic]:
        return self.gemini_service.analyze_text(text, material_id, language)
