import os
import google.generativeai as genai
from fastapi import UploadFile
from typing import Optional
import tempfile

class GeminiFileUploadService:
    """Service to upload files to Gemini File API"""
    
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
    
    async def upload_file(self, file: UploadFile) -> str:
        """
        Uploads a file to Gemini File API and returns the file URI.
        This keeps the API key secure on the server side.
        """
        if not self.api_key:
            raise Exception("Google API Key not configured")
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{file.filename}") as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        try:
            # Upload to Gemini File API
            uploaded_file = genai.upload_file(tmp_file_path, display_name=file.filename)
            
            # Return the file URI (name)
            return uploaded_file.name
        finally:
            # Clean up temp file
            if os.path.exists(tmp_file_path):
                os.unlink(tmp_file_path)
