import os
import json
from openai import OpenAI
from typing import List
from models import Topic

class AnalyzerService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.api_key) if self.api_key else None

    def analyze_text(self, text: str, material_id: str) -> List[Topic]:
        if not self.client:
            # Fallback/Mock for testing without API Key
            print("Warning: No OpenAI API Key found. Using mock data.")
            return [
                Topic(id=f"{material_id}_1", title="Introduction", description="Basic concepts", estimated_hours=2.0, material_id=material_id),
                Topic(id=f"{material_id}_2", title="Advanced Concepts", description="Complex variations", estimated_hours=3.5, material_id=material_id)
            ]

        prompt = f"""
        Analyze the following study material text and break it down into study topics.
        For each topic, provide a title, a brief description, and an estimated number of hours to master it.
        
        Text:
        {text[:4000]}... (truncated)

        Return ONLY valid JSON in the following format:
        [
            {{
                "title": "Topic Title",
                "description": "Short description",
                "hours": 1.5
            }}
        ]
        """

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "system", "content": "You are a study assistant."},
                          {"role": "user", "content": prompt}],
                temperature=0.2,
                response_format={"type": "json_object"}
            )
            content = response.choices[0].message.content
            data = json.loads(content)
            
            # Handle potential wrapper keys like {"topics": [...]} if GPT adds them
            topics_data = data if isinstance(data, list) else data.get("topics", [])
            
            topics = []
            for i, item in enumerate(topics_data):
                topics.append(Topic(
                    id=f"{material_id}_{i}",
                    title=item["title"],
                    description=item["description"],
                    estimated_hours=float(item["hours"]),
                    material_id=material_id
                ))
            return topics

        except Exception as e:
            print(f"Error calling OpenAI: {e}")
            return []
