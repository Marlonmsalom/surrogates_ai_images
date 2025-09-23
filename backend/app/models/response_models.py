from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class JobResponse(BaseModel):
    job_id: str
    status: str
    message: str

class ImageDownloadResponse(BaseModel):
    success: bool
    message: str
    images: List[Dict[str, Any]]
    job_id: str
    query: str
    provider: str

class AnalysisResponse(BaseModel):
    success: bool
    message: str
    ratings: List[Dict[str, Any]]
    job_id: str
    usage: Optional[Dict[str, Any]] = None

class UploadResponse(BaseModel):
    file_id: str
    filename: str
    file_path: str
    message: str

class HealthResponse(BaseModel):
    status: str
    message: str
