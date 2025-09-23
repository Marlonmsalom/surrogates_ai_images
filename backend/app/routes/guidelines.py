from fastapi import APIRouter, UploadFile, File, HTTPException
from ..models.response_models import UploadResponse
import os
import uuid
from pathlib import Path

router = APIRouter()

@router.post("/upload-guideline", response_model=UploadResponse)
async def upload_guideline(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    file_id = str(uuid.uuid4())
    filename = f"{file_id}_{file.filename}"
    file_path = Path("data/uploads") / filename
    
    os.makedirs("data/uploads", exist_ok=True)
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    return UploadResponse(
        file_id=file_id,
        filename=filename,
        file_path=str(file_path),
        message="Guideline uploaded successfully"
    )
