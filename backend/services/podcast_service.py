import json
from typing import List
from models import PodcastResponse, PodcastLine
from services.groq_service import GroqService

class PodcastService:
    def __init__(self, groq_service: GroqService):
        self.groq_service = groq_service

    def generate_script(self, topic_title: str, topic_description: str, language: str = "en") -> PodcastResponse:
        if not self.groq_service.client:
            raise Exception("Groq API not available for Podcast generation")

        lang_instruction = "English" if language == "en" else "German"
        
        prompt = f"""
        Create a short, engaging podcast script about the following study topic.
        
        Topic: {topic_title}
        Context: {topic_description}
        
        Characters:
        1. "Expert": Knowledgeable, calm, uses analogies.
        2. "Student": Curious, asks clarifying questions, reacts with "Wow" or "I see".
        
        Format:
        - The dialogue should remain under 2 minutes (approx 15-20 exchanges).
        - It should be fun and easy to understand (EL5 style).
        - Language: {lang_instruction} ONLY.

        Return valid JSON:
        {{
            "title": "Catchy Episode Title",
            "script": [
                {{ "speaker": "Expert", "text": "Welcome back! Today we are looking at..."}},
                {{ "speaker": "Student", "text": "I've always wondered about this..."}}
            ]
        }}
        """

        try:
            completion = self.groq_service.client.chat.completions.create(
                model=self.groq_service.model,
                messages=[
                    {"role": "system", "content": "You are a creative scriptwriter. Output JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7, # Slightly higher for creativity
                response_format={"type": "json_object"}
            )
            
            content = completion.choices[0].message.content
            data = json.loads(content)
            
            script_data = data.get("script", [])
            script = [PodcastLine(speaker=line["speaker"], text=line["text"]) for line in script_data]
            
            return PodcastResponse(
                title=data.get("title", f"Podcast: {topic_title}"),
                script=script
            )

        except Exception as e:
            print(f"Error generating podcast: {e}")
            raise e

    def generate_audio_segment(self, text: str, speaker: str, language: str = "en") -> bytes:
        if not self.groq_service.client:
             raise Exception("Groq API not available for Audio generation")

        # Voice Selection
        # Valid: autumn diana hannah austin daniel troy
        # Strategy:
        # Expert (Male) -> Austin or Daniel
        # Student (Female) -> Diana or Hannah
        voice = "austin" # Default Expert
        if speaker == "Student":
            voice = "diana"
        elif speaker == "Expert":
            voice = "daniel"
            
        # Model Selection
        # English: canopylabs/orpheus-v1-english
        # Arabic: canopylabs/orpheus-arabic-saudi
        # Note: User wants "Realistic" voices. Orpheus English handles English/German input phonetically reasonably well or we assume user is okay with English accent if text is German.
        # Actually, based on my previous test, it generated audio for German input.
        model = "canopylabs/orpheus-v1-english"

        try:
            response = self.groq_service.client.audio.speech.create(
                model=model,
                voice=voice,
                input=text,
                response_format="wav"
            )
            return response.read()
        except Exception as e:
            print(f"Error generating audio for '{text[:20]}...': {e}")
            raise e
