import os
import json
from typing import List, Optional, Dict, Any
from openai import OpenAI
from models import Topic

class OpenAIService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.api_key) if self.api_key else None

    def analyze_text(self, text: str, material_id: str) -> List[Topic]:
        """
        Analyzes the given text using OpenAI to extract study topics.
        """
        if not self.client:
            print("Warning: No OpenAI API Key found. Returning empty list.")
            return []

        prompt = f"""
        Analyze the following study material text and break it down into study topics.
        For each topic, provide a title, a brief description, and an estimated number of hours to master it.
        
        Text:
        {text[:15000]}... (truncated if too long)

        Return ONLY valid JSON in the following format:
        {{
            "topics": [
                {{
                    "title": "Topic Title",
                    "description": "Short description",
                    "hours": 1.5
                }}
            ]
        }}
        """

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a helpful study assistant that extracts structured study topics from text."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            if not content:
                print("Error: Empty response from OpenAI")
                return []

            data = json.loads(content)
            
            # Robust extraction of the list
            topics_data = data.get("topics", [])
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
            print(f"Error calling OpenAI: {e}")
            return []
