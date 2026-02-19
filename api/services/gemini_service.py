import os
import json
import google.generativeai as genai
from typing import List
try:
    from models import Topic, Flashcard, ChallengeType
except ImportError:
    from ..models import Topic, Flashcard, ChallengeType

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash') 
        else:
            self.model = None

    def check_availability(self) -> bool:
        """
        Lightweight check to see if API is reachable and quota is available.
        """
        if not self.model:
            raise Exception("Google API Key not configured")
        
        try:
            # Simple prompt to test connectivity
            self.model.generate_content("Ping")
            return True
        except Exception as e:
            # Re-raise so controller catches it
            raise e

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
        For each topic, provide:
        1. A title
        2. A brief description
        3. An estimated number of hours to master it
        4. A list of "Games" to test knowledge. These should be a mix of:
            - "QUIZ": A multiple choice question with ONE correct answer and 3 distinct, plausible WRONG answers (distractors).
            - "MATCH": A set of 4 term-definition pairs to match.
        
        IMPORTANT: Provide the response in {lang_instruction} language.

        Text:
        {text[:25000]}... (truncated if too long)

        Return ONLY valid JSON in the following format:
        {{
            "topics": [
                {{
                    "title": "Topic Title ({lang_instruction})",
                    "description": "Short description",
                    "hours": 1.5,
                    "games": [
                        {{
                            "type": "QUIZ",
                            "question": "What is X?",
                            "correct_answer": "X is Y",
                            "distractors": ["X is Z", "X is A", "X is B"] 
                        }},
                        {{
                            "type": "MATCH",
                            "question": "Match the terms",
                            "correct_answer": "ignored",
                            "pair": "Term1:Def1;Term2:Def2;Term3:Def3;Term4:Def4"
                        }}
                    ]
                }}
            ]
        }}
        """

        try:
            # Generate content requests JSON format implicitly via prompt instructions
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
                # Parse games
                games_data = item.get("games", [])
                games = []
                for g in games_data:
                    games.append(ChallengeType(
                        type=g.get("type", "QUIZ"),
                        question=g.get("question", "Unknown Question"),
                        correct_answer=g.get("correct_answer", ""),
                        distractors=g.get("distractors", []),
                        pair=g.get("pair", None)
                    ))
                
                # Backward compatibility for flashcards if needed, or just map games to flashcards for legacy views
                flashcards = []
                for g in games:
                    if g.type == "QUIZ":
                         flashcards.append(Flashcard(question=g.question, answer=g.correct_answer))

                topics.append(Topic(
                    id=f"{material_id}_{i}",
                    title=item.get("title", "Untitled Topic"),
                    description=item.get("description", ""),
                    estimated_hours=float(item.get("hours", 1.0)),
                    material_id=material_id,
                    flashcards=flashcards,
                    games=games
                ))
            return topics

        except Exception as e:
            with open("gemini_debug.log", "a") as f:
                f.write(f"Error calling Gemini: {e}\n")
            print(f"Error calling Gemini: {e}")
            # Fallback for demonstration/verification if API fails
            # Fallback removed - user requested explicit error
            # Re-raise the exception to be handled by the caller
            raise e
