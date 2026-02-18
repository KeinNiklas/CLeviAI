from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv("backend/key.env")
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

print(f"Key loaded: {str(os.getenv('GROQ_API_KEY'))[:5]}...")

print("Listing available GROQ models:")
models = client.models.list()
for m in models.data:
    print(f"- {m.id} (Owner: {m.owned_by})")
