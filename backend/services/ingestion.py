import os
from pypdf import PdfReader
from docx import Document
from fastapi import UploadFile

class IngestionService:
    @staticmethod
    async def extract_text(file: UploadFile) -> str:
        content = await file.read()
        filename = file.filename.lower()
        
        # Save temp file for libraries that need file path or file-like object
        # For simple in-memory processing:
        if filename.endswith(".pdf"):
            return IngestionService._read_pdf(content)
        elif filename.endswith(".docx"):
            return IngestionService._read_docx(content)
        elif filename.endswith(".txt"):
            return content.decode("utf-8")
        else:
            return "Unsupported file format."

    @staticmethod
    def _read_pdf(content: bytes) -> str:
        import io
        stream = io.BytesIO(content)
        reader = PdfReader(stream)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text

    @staticmethod
    def _read_docx(content: bytes) -> str:
        import io
        stream = io.BytesIO(content)
        doc = Document(stream)
        text = "\n".join([para.text for para in doc.paragraphs])
        return text
