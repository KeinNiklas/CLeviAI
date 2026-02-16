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
        preferred = os.getenv("PREFERRED_MODEL", "gemini").lower()
        
        if preferred == "groq" and self.groq_service.client:
            print(f"🚀 Using Preferred Model: GROQ (Llama 3)")
            try:
                return self.groq_service.analyze_text(text, material_id, language)
            except Exception as e:
                print(f"⚠️ Groq failed, falling back to Gemini: {e}")
                return self.gemini_service.analyze_text(text, material_id, language)
        else:
            # Default to Gemini
            try:
                return self.gemini_service.analyze_text(text, material_id, language)
            except Exception as e:
                error_str = str(e)
                # Check for Quota Exceeded (429) or Service Unavailable
                if ("429" in error_str or "Quota" in error_str) and self.groq_service.client:
                    print(f"⚠️ GEMINI QUOTA EXCEEDED. FALLING BACK TO GROQ API (Llama 3)...")
                    try:
                        return self.groq_service.analyze_text(text, material_id, language)
                    except Exception as groq_e:
                        raise Exception(f"Gemini Quota Exceeded AND Groq Fallback Failed. Gemini Error: {e}. Groq Error: {groq_e}")
                
                # If not quota error OR groq not configured, re-raise
                raise e
