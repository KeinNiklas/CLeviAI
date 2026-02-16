import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load env variables
load_dotenv("key.env")

api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("ERROR: GOOGLE_API_KEY not found in key.env or environment.")
    exit(1)

print(f"Key found: {api_key[:5]}...{api_key[-5:]}")

genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.0-flash')

try:
    print("Sending request to Gemini...")
    response = model.generate_content("Hello! Are you working?")
    print("Response received:")
    print(response.text)
    print("API is working correctly.")
except Exception as e:
    print(f"API Error: {e}")
    if "429" in str(e):
        print("QUOTA EXHAUSTED (429).")
    elif "400" in str(e):
        print("BAD REQUEST (400). Key might be invalid.")
    elif "403" in str(e):
        print("PERMISSION DENIED (403).")
