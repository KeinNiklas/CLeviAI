import os
import json
from typing import List
from models import Topic
from services.gemini_service import GeminiService
from services.groq_service import GroqService

class AnalyzerService:
    def __init__(self):
        self.gemini_service = GeminiService()
        self.groq_service = GroqService()

    def analyze_text(self, text: str, material_id: str, language: str = "en") -> List[Topic]:
        try:
            # Try Primary (Gemini)
            return self.gemini_service.analyze_text(text, material_id, language)
        except Exception as e:
            error_str = str(e)
            
            # Check for Quota Exceeded (429) or Service Unavailable
            # Note: Explicitly check if Groq key is available before falling back
            if ("429" in error_str or "Quota" in error_str) and self.groq_service.client:
                print(f"⚠️ GEMINI QUOTA EXCEEDED. FALLING BACK TO GROQ API (Llama 3)...")
                return self.groq_service.analyze_text(text, material_id, language)
            
            # If not quota error OR groq not configured, re-raise
            raise e
