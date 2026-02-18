from services.podcast_service import PodcastService
from services.groq_service import GroqService
from dotenv import load_dotenv
import os
import json

# Setup
load_dotenv("backend/key.env")
groq_service = GroqService()
service = PodcastService(groq_service)

# Test Lunte Generation
print("Generating script with Lunte preset...")
try:
    response = service.generate_script(
        topic_title="Quantum Physics", 
        topic_description="Basic introduction to particles", 
        language="en", 
        preset="lunte"
    )

    print(f"\nTitle: {response.title}")
    for line in response.script:
        print(f"{line.speaker}: {line.text}")

    # Check for phonetic markers (heuristic)
    lunte_lines = [l.text for l in response.script if "Lunte" in l.speaker]
    text = " ".join(lunte_lines).lower()
    
    triggers = ["zis", "zat", "ve", "gut", "vat"]
    if any(t in text for t in triggers):
        print("\nSUCCESS: Lunte accent detected!")
    else:
        print("\nWARNING: Lunte accent might be weak.")

except Exception as e:
    print(f"Error: {e}")
