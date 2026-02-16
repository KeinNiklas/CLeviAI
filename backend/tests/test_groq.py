
import os
import pytest
from groq import Groq

def test_groq_api_key_presence():
    """Test that the Groq API key is present in environment variables."""
    api_key = os.getenv("GROQ_API_KEY")
    assert api_key is not None, "GROQ_API_KEY not found in environment"
    assert len(api_key) > 0, "GROQ_API_KEY is empty"

def test_groq_configuration():
    """Test that we can configure the Groq client."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        pytest.skip("Skipping Groq test because GROQ_API_KEY is missing")
    
    client = Groq(api_key=api_key)
    assert client is not None

@pytest.mark.integration
def test_groq_response_generation():
    """Integration test: actually call Groq API (requires valid key)."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        pytest.skip("Skipping integration test because GROQ_API_KEY is missing")
    
    client = Groq(api_key=api_key)
    model = "llama-3.1-8b-instant"
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": "Hello, is this working?",
                }
            ],
            model=model,
        )
        response_content = chat_completion.choices[0].message.content
        assert response_content is not None
        assert len(response_content) > 0
    except Exception as e:
         pytest.fail(f"Groq API Error: {e}")
