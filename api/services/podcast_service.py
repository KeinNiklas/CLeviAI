import os
import json
from typing import List

from . .models import PodcastResponse, PodcastLine
from .groq_service import GroqService
from .gemini_service import GeminiService

class PodcastService:
    def __init__(self, groq_service: GroqService, gemini_service: GeminiService = None):
        self.groq_service = groq_service
        self.gemini_service = gemini_service

    def generate_script(self, topic_title: str, topic_description: str, language: str = "en", preset: str = "classroom") -> PodcastResponse:
        if not self.groq_service.client:
            raise Exception("Groq API not available for Podcast generation")

        lang_instruction = "English" if language == "en" else "German"
        
        # Preset Logic
        if preset == "deep_dive":
            characters_prompt = """
            Characters:
            1. "Host": Analytical, skeptical, asks deep questions.
            2. "Expert": Highly technical, explains complex details.
            """
        elif preset == "story":
            characters_prompt = """
            Characters:
            1. "Narrator": Engaging storyteller, uses metaphors, calm pace.
            (Monologue style)
            """
        elif preset == "story":
            characters_prompt = """
            Characters:
            1. "Narrator": Engaging storyteller, uses metaphors, calm pace.
            (Monologue style)
            """
        else: # Default: classroom
            characters_prompt = """
            Characters:
            1. "Expert": Knowledgeable, calm, uses analogies.
            2. "Student": Curious, asks clarifying questions.
            """

        prompt = f"""
        Create a short, engaging podcast script about the following study topic.
        
        Topic: {topic_title}
        Context: {topic_description}
        
        {characters_prompt}
        
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

        preferred = os.getenv("PREFERRED_MODEL", "gemini").lower()
        
        # 1. Try Gemini if preferred or Groq not available
        if (preferred == "gemini" or not self.groq_service.client) and self.gemini_service:
            print("🎙️ Using GEMINI for Podcast Script...")
            try:
                model = self.gemini_service.model
                response = model.generate_content(prompt)
                
                # Clean up JSON
                content = response.text
                if "```json" in content:
                    content = content.replace("```json", "").replace("```", "")
                
                data = json.loads(content)
                script_data = data.get("script", [])
                script = [PodcastLine(speaker=line["speaker"], text=line["text"]) for line in script_data]
                
                return PodcastResponse(
                    title=data.get("title", f"Podcast: {topic_title}"),
                    script=script
                )
            except Exception as e:
                print(f"⚠️ Gemini Podcast Gen failed: {e}. Falling back to Groq...")
                # Fall through to Groq

        # 2. Use Groq (Preferred or Fallback)
        if not self.groq_service.client:
             raise Exception("Groq API not available for Podcast generation")

        print("🎙️ Using GROQ for Podcast Script...")
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

        # Voice Selection Map
        # Valid: autumn diana hannah austin daniel troy
        voice = "austin" # Default
        
        speaker_lower = speaker.lower()
        if "student" in speaker_lower or "host" in speaker_lower:
             voice = "diana" # Female, bright
        speaker_lower = speaker.lower()
        if "student" in speaker_lower or "host" in speaker_lower:
             voice = "diana" # Female, bright
        elif "expert" in speaker_lower:
             voice = "daniel" # Male, deep
        elif "narrator" in speaker_lower:
             voice = "troy" # Male, storytelling
        elif "narrator" in speaker_lower:
             voice = "troy" # Male, storytelling
            
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
