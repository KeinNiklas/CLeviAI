
import os
import pytest
import google.generativeai as genai

def test_api_key_presence():
    """Test that the API key is present in environment variables."""
    api_key = os.getenv("GOOGLE_API_KEY")
    assert api_key is not None, "GOOGLE_API_KEY not found in environment"
    assert len(api_key) > 0, "GOOGLE_API_KEY is empty"

def test_gemini_configuration():
    """Test that we can configure the Gemini client."""
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        pytest.skip("Skipping Gemini test because GOOGLE_API_KEY is missing")
    
    genai.configure(api_key=api_key)
    # Just checking if configuration throws no error
    assert True

@pytest.mark.integration
def test_gemini_response_generation():
    """Integration test: actually call Gemini API (requires valid key)."""
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        pytest.skip("Skipping integration test because GOOGLE_API_KEY is missing")
        
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.0-flash')
    
    try:
        response = model.generate_content("Hello, this is a test.")
        assert response is not None
        assert response.text is not None
        assert len(response.text) > 0
    except Exception as e:
        if "429" in str(e):
            pytest.skip("Quota exhausted (429), skipping test.")
        elif "403" in str(e) or "400" in str(e):
             pytest.fail(f"API Error (Invalid Key?): {e}")
        else:
             pytest.fail(f"Unexpected API Error: {e}")
