import os
import json
import google.generativeai as genai
from typing import List
from models import Topic

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-flash-latest')
        else:
            self.model = None

    def analyze_text(self, text: str, material_id: str, language: str = "en") -> List[Topic]:
        """
        Analyzes the given text using Google Gemini to extract study topics.
        """
        if not self.model:
            print("Warning: No Google API Key found. Returning empty list.")
            return []

        lang_instruction = "English" if language == "en" else "German"

        prompt = f"""
        You are a helpful study assistant.
        Analyze the following study material text and break it down into study topics.
        For each topic, provide a title, a brief description, and an estimated number of hours to master it.
        
        IMPORTANT: Provide the response in {lang_instruction} language.

        Text:
        {text[:20000]}... (truncated if too long)

        Return ONLY valid JSON in the following format:
        {{
            "topics": [
                {{
                    "title": "Topic Title ({lang_instruction})",
                    "description": "Short description in {lang_instruction}",
                    "hours": 1.5
                }}
            ]
        }}
        """

        try:
            # Generate content requests JSON format implicitly via prompt instructions
            # For stricter JSON mode, we can use generation_config={'response_mime_type': 'application/json'}
            response = self.model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            
            content = response.text
            data = json.loads(content)
            
            topics_data = data.get("topics", [])
            # Fallback if top-level list
            if not topics_data and isinstance(data, list):
                topics_data = data
            
            topics = []
            for i, item in enumerate(topics_data):
                topics.append(Topic(
                    id=f"{material_id}_{i}",
                    title=item.get("title", "Untitled Topic"),
                    description=item.get("description", ""),
                    estimated_hours=float(item.get("hours", 1.0)),
                    material_id=material_id
                ))
            return topics

        except Exception as e:
            with open("gemini_debug.log", "a") as f:
                f.write(f"Error calling Gemini: {e}\n")
            print(f"Error calling Gemini: {e}")
            # Fallback for demonstration/verification if API fails
            return [
                Topic(
                    id=f"{material_id}_fallback_1",
                    title="Introduction to Subject (Fallback)",
                    description="This is a fallback topic because the AI analysis failed. Please check your API key.",
                    estimated_hours=2.0,
                    material_id=material_id
                ),
                Topic(
                    id=f"{material_id}_fallback_2",
                    title="Advanced Concepts (Fallback)",
                    description="Another fallback topic to demonstrate the scheduling algorithm.",
                    estimated_hours=3.5,
                    material_id=material_id
                )
            ]
