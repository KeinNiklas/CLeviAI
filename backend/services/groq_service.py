import os
import json
from groq import Groq
from typing import List
from models import Topic, Flashcard, ChallengeType

class GroqService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if self.api_key:
            self.client = Groq(api_key=self.api_key)
            self.model = "llama-3.3-70b-versatile" 
        else:
            self.client = None

    def analyze_text(self, text: str, material_id: str, language: str = "en") -> List[Topic]:
        """
        Analyzes the given text using Groq (Llama 3) to extract study topics.
        """
        if not self.client:
            raise Exception("Groq API Key not configured")

        lang_instruction = "English" if language == "en" else "German"

        # Similar prompt to Gemini but optimized for Llama execution
        prompt = f"""
        You are a helpful study assistant.
        Analyze the following study material text and break it down into study topics.
        
        Text:
        {text[:25000]}... (truncated if too long)
        
        For each topic, provide:
        1. A title
        2. A brief description
        3. An estimated number of hours to master it
        4. A list of "Games" to test knowledge. These should be a mix of:
            - "QUIZ": A multiple choice question with ONE correct answer and 3 distinct, plausible WRONG answers (distractors).
            - "MATCH": A set of 4 term-definition pairs to match.
        
        IMPORTANT: Provide the response in {lang_instruction} language.

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
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful AI that outputs only JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            
            content = completion.choices[0].message.content
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
                
                # Backward compatibility
                flashcards = []
                for g in games:
                    if g.type == "QUIZ":
                         flashcards.append(Flashcard(question=g.question, answer=g.correct_answer))

                topics.append(Topic(
                    id=f"{material_id}_groq_{i}",
                    title=item.get("title", "Untitled Topic"),
                    description=item.get("description", ""),
                    estimated_hours=float(item.get("hours", 1.0)),
                    material_id=material_id,
                    flashcards=flashcards,
                    games=games
                ))
            return topics

        except Exception as e:
            print(f"Error calling Groq: {e}")
            raise e
