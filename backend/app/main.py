from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import os
import asyncio
import json
import logging
from typing import Dict, Set
from pathlib import Path
from .routes import images, guidelines, status

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="Surrogates AI Images", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

connections: Dict[str, Set[WebSocket]] = {}

@app.websocket("/ws/{job_id}")
async def websocket_endpoint(websocket: WebSocket, job_id: str):
    await websocket.accept()
    logger.info(f"WebSocket connection accepted for job: {job_id}")
    
    if job_id not in connections:
        connections[job_id] = set()
    connections[job_id].add(websocket)
    
    try:
        while True:
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for job: {job_id}")
        connections[job_id].remove(websocket)
        if not connections[job_id]:
            del connections[job_id]
    except Exception as e:
        logger.error(f"WebSocket error for job {job_id}: {e}")
        if websocket in connections.get(job_id, set()):
            connections[job_id].remove(websocket)

async def broadcast_to_job(job_id: str, message: dict):
    logger.info(f"Broadcasting to job {job_id}: {message}")
    if job_id in connections:
        disconnected = set()
        for websocket in connections[job_id]:
            try:
                await websocket.send_text(json.dumps(message))
                logger.info(f"Message sent to WebSocket for job {job_id}")
            except Exception as e:
                logger.error(f"Error sending message to WebSocket: {e}")
                disconnected.add(websocket)
        
        for websocket in disconnected:
            connections[job_id].remove(websocket)
    else:
        logger.warning(f"No connections found for job {job_id}")

app.include_router(images.router, prefix="/api")
app.include_router(guidelines.router, prefix="/api")
app.include_router(status.router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    logger.info("Application starting up...")
    
    # Get project root path (go up from backend/app/)
    current_file = Path(__file__)
    project_root = current_file.parent.parent.parent
    
    # Create directories using pathlib
    (project_root / "data" / "uploads").mkdir(parents=True, exist_ok=True)
    (project_root / "data" / "images").mkdir(parents=True, exist_ok=True)
    (project_root / "data" / "results").mkdir(parents=True, exist_ok=True)
    
    logger.info(f"Directories created successfully in: {project_root / 'data'}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
