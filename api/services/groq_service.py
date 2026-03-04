import os
import json
from groq import Groq
from typing import List
try:
    from models import Topic, Flashcard, ChallengeType
except ImportError:
    from ..models import Topic, Flashcard, ChallengeType

class GroqService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if self.api_key:
            self.client = Groq(api_key=self.api_key)
            # Switch to 8b-instant to avoid Rate Limits (TPD) on 70b
            self.model = "llama-3.1-8b-instant" 
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
        You are an expert instructional designer and AI study assistant.

        Transform the following study material into a structured, high-quality learning journey.

        Text:
        {text[:25000]}... (truncated if too long)

        STEP 1 – STRUCTURE DETECTION
        - If the text contains headings, numbered sections, bullet lists, or visible semantic structure, you MUST preserve and use this structure as the backbone of the learning journey.
        - Maintain hierarchical relationships between topics and subtopics where appropriate.
        - Only create new topics if the text lacks structure or if restructuring significantly improves learning clarity.
        - Merge redundant sections where appropriate.

        STEP 2 – TOPIC CREATION
        For each topic, provide:
        1. A clear and concise title
        2. A structured description explaining:
        - Core concepts
        - Key definitions
        - Relationships between ideas
        - Why the topic matters
        3. 2–5 explicit learning objectives using action verbs (e.g., explain, compare, apply, analyze)
        4. An estimated number of hours required to master the topic
        - Base this on density, abstraction level, and number of concepts.

        STEP 3 – ADAPTIVE KNOWLEDGE GAMES
        Generate a proportional number of games based on complexity:

        - Topics under 1 hour → 3–5 games
        - 1–3 hours → 5–8 games
        - 3+ hours → 8–15 games

        You MUST vary difficulty levels (recall, understanding, application, analysis).

        IMPORTANT GAME RESTRICTION:
        Only use the following game types:
        - "QUIZ": One correct answer and exactly 3 distinct plausible distractors.
        - "MATCH": Exactly 4 term-definition pairs in the format:
        "Term1:Def1;Term2:Def2;Term3:Def3;Term4:Def4"

        CRITICAL QUALITY RULES:
        - Do NOT generate trivial recall-only questions for complex topics.
        - At least 30% of questions must test application or reasoning for topics over 2 hours.
        - Avoid repeating the same concept in multiple games.
        - Distractors must be plausible and conceptually close.
        - Use precise terminology from the text.
        - Ensure factual correctness.

        IMPORTANT:
        Provide the response in {lang_instruction} language.

        Return ONLY valid JSON in the following format:

        {{
            "topics": [
                {{
                    "title": "Topic Title ({lang_instruction})",
                    "description": "Structured explanation including core concepts, key definitions, relationships, and relevance",
                    "learning_objectives": [
                        "Objective 1",
                        "Objective 2"
                    ],
                    "hours": 2.5,
                    "games": [
                        {{
                            "type": "QUIZ",
                            "question": "Question text",
                            "correct_answer": "Correct answer",
                            "distractors": ["Distractor 1", "Distractor 2", "Distractor 3"]
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
