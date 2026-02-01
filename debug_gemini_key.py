
import os
import google.generativeai as genai
from dotenv import load_dotenv

def test_key():
    # Load env
    load_dotenv("backend/key.env")
    api_key = os.getenv("GOOGLE_API_KEY")
    
    if not api_key:
        print("❌ ERROR: GOOGLE_API_KEY not found in backend/key.env")
        return

    print(f"Details Key: {api_key[:5]}...{api_key[-4:]}")
    genai.configure(api_key=api_key)

    print("\n1. Listing Available Models...")
    try:
        found_models = False
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"   - {m.name}")
                found_models = True
        
        if not found_models:
            print("(!) No models found that support 'generateContent'. This usually means the API Key does not have access to Generative AI features.")
        else:
            print("(+) Successfully listed models.")

    except Exception as e:
        print(f"(!) Error listing models: {e}")
        print("   -> This often indicates an invalid API Key or a project without the Generative AI API enabled.")
        return

    print("\n2. Testing Generation (gemini-1.5-flash)...")
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content("Hello, can you hear me?")
        print(f"(+) Response received: {response.text}")
    except Exception as e:
        print(f"(-) Error with gemini-1.5-flash: {e}")

    print("\n2c. Testing Generation (gemini-flash-latest)...")
    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        response = model.generate_content("Hello, can you hear me?")
        print(f"(+) Response received: {response.text}")
    except Exception as e:
        print(f"(-) Error with gemini-flash-latest: {e}")

if __name__ == "__main__":
    test_key()
