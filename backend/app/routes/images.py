from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import uuid
import asyncio
import os
from pathlib import Path
from ..services.image_downloader import ImageDownloader
from ..services.image_analyzer import ImageAnalyzer
from ..models.response_models import JobResponse
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

class DownloadImagesRequest(BaseModel):
    query: str
    provider: str = "unsplash"
    limit: int = 20

class AnalyzeImagesRequest(BaseModel):
    job_id: str
    guideline_path: str

active_jobs = {}

@router.get("/image/{job_id}/{filename}")
async def get_image(job_id: str, filename: str):
    """Serve images from job directory"""
    try:
        logger.info(f"Serving image - job_id: {job_id}, filename: {filename}")
        
        # Get absolute path from project root
        current_file = Path(__file__)
        project_root = current_file.parent.parent.parent.parent
        file_path = project_root / "data" / "images" / job_id / filename
        
        logger.info(f"Looking for file at: {file_path}")
        
        if not file_path.exists():
            logger.error(f"File not found: {file_path}")
            raise HTTPException(status_code=404, detail=f"Image not found: {filename}")
        
        return FileResponse(
            path=str(file_path),
            media_type="image/jpeg",
            filename=filename
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error serving image: {e}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("/download-images", response_model=JobResponse)
async def download_images(request: DownloadImagesRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    active_jobs[job_id] = {"status": "started", "progress": 0}
    
    background_tasks.add_task(download_images_task, job_id, request)
    
    return JobResponse(
        job_id=job_id,
        status="started",
        message=f"Starting download of {request.limit} images for query: {request.query}"
    )

async def download_images_task(job_id: str, request: DownloadImagesRequest):
    try:
        from ..main import broadcast_to_job
        
        await broadcast_to_job(job_id, {"status": "downloading", "progress": 0})
        
        downloader = ImageDownloader()
        result = await downloader.download_images(
            query=request.query,
            provider=request.provider,
            limit=request.limit,
            job_id=job_id
        )
        
        active_jobs[job_id] = {
            "status": "completed",
            "progress": 100,
            "result": result,
            "type": "download"
        }
        
        await broadcast_to_job(job_id, {
            "status": "completed",
            "progress": 100,
            "result": result
        })
        
    except Exception as e:
        active_jobs[job_id] = {"status": "error", "error": str(e)}
        await broadcast_to_job(job_id, {"status": "error", "error": str(e)})

@router.post("/analyze-images", response_model=JobResponse)
async def analyze_images(request: AnalyzeImagesRequest, background_tasks: BackgroundTasks):
    active_jobs[request.job_id] = {"status": "analyzing", "progress": 0}
    
    background_tasks.add_task(analyze_images_task, request.job_id, request)
    
    return JobResponse(
        job_id=request.job_id,
        status="started",
        message="Starting image analysis"
    )

async def analyze_images_task(job_id: str, request: AnalyzeImagesRequest):
    try:
        from ..main import broadcast_to_job
        
        await broadcast_to_job(job_id, {"status": "analyzing", "progress": 0})
        
        analyzer = ImageAnalyzer()
        result = await analyzer.analyze_images(
            guideline_path=request.guideline_path,
            job_id=job_id
        )
        
        active_jobs[job_id] = {
            "status": "completed",
            "progress": 100,
            "result": result,
            "type": "analysis"
        }
        
        await broadcast_to_job(job_id, {
            "status": "completed",
            "progress": 100,
            "result": result
        })
        
    except Exception as e:
        active_jobs[job_id] = {"status": "error", "error": str(e)}
        await broadcast_to_job(job_id, {"status": "error", "error": str(e)})

@router.get("/job-status/{job_id}")
async def get_job_status(job_id: str):
    if job_id not in active_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return active_jobs[job_id]
