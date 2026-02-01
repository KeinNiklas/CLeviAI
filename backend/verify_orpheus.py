from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv("backend/key.env")
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

print("Attempting to generate audio with Orpheus...")
try:
    response = client.audio.speech.create(
        model="canopylabs/orpheus-v1-english",
        voice="austin", # Valid voice
        input="Hallo! Ich bin eine realistische KI-Stimme.",
        response_format="wav"
    )
    
    # Save to file manually
    with open("test_german.wav", "wb") as f:
        f.write(response.read())
    print("Success! Saved to test_german.wav")

except Exception as e:
    print(f"Error: {e}")
