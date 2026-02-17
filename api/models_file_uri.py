from pydantic import BaseModel

class FileURIRequest(BaseModel):
    file_uri: str
    filename: str
    language: str = "en"
