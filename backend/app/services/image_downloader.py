import asyncio
import aiohttp
import aiofiles
import os
import logging
from pathlib import Path
from typing import List, Dict, Any
from ..providers.image_providers import ImageProviderFactory

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ImageDownloader:
    def __init__(self):
        # Get project root path (go up from backend/app/services/)
        self.project_root = Path(__file__).parent.parent.parent.parent
        self.images_dir = self.project_root / "data" / "images"
        logger.info(f"ImageDownloader initialized - Images dir: {self.images_dir}")
    
    async def download_images(self, query: str, provider: str, limit: int, job_id: str) -> Dict[str, Any]:
        try:
            logger.info(f"Starting download - Query: {query}, Provider: {provider}, Limit: {limit}, Job: {job_id}")
            
            from ..main import broadcast_to_job
            await broadcast_to_job(job_id, {
                "status": "downloading",
                "progress": 5,
                "message": f"Connecting to {provider}..."
            })
            
            provider_instance = ImageProviderFactory.create_provider(provider)
            logger.info(f"Provider {provider} created successfully")
            
            images = await provider_instance.fetch_images(query, limit)
            logger.info(f"Fetched {len(images)} images from {provider}")
            
            if not images:
                logger.warning("No images found")
                return {"success": False, "message": "No images found", "images": []}
            
            # Create job directory in project root data/images
            job_dir = self.images_dir / job_id
            job_dir.mkdir(parents=True, exist_ok=True)
            logger.info(f"Created job directory: {job_dir}")
            
            downloaded_images = []
            total_images = len(images)
            
            for i, image_data in enumerate(images):
                try:
                    filename = f"{i+1:03d}_{self._clean_filename(image_data.get('description', 'image'))}.jpg"
                    file_path = job_dir / filename
                    
                    success = await provider_instance.download_image(image_data, str(file_path))
                    
                    if success:
                        downloaded_images.append({
                            "filename": filename,
                            "path": str(file_path),
                            "description": image_data.get('description', ''),
                            "author": image_data.get('author', ''),
                            "source": image_data.get('source', provider)
                        })
                        logger.info(f"Successfully downloaded {filename} to {file_path}")
                    
                    progress = int(20 + (i + 1) / total_images * 80)
                    await broadcast_to_job(job_id, {
                        "status": "downloading",
                        "progress": progress,
                        "current_image": i + 1,
                        "total_images": total_images,
                        "message": f"Downloaded {len(downloaded_images)}/{total_images} images..."
                    })
                    
                    await asyncio.sleep(0.5)
                    
                except Exception as e:
                    logger.error(f"Error downloading image {i+1}: {e}")
                    continue
            
            logger.info(f"Download complete: {len(downloaded_images)}/{total_images} images")
            
            return {
                "success": True,
                "message": f"Downloaded {len(downloaded_images)} images",
                "images": downloaded_images,
                "job_id": job_id,
                "query": query,
                "provider": provider
            }
            
        except Exception as e:
            logger.error(f"Error in download_images: {e}")
            return {"success": False, "message": str(e), "images": []}
    
    def _clean_filename(self, filename: str) -> str:
        if not filename:
            return "untitled"
        unsafe_chars = '<>:"/\\|?*'
        for char in unsafe_chars:
            filename = filename.replace(char, '_')
        return filename[:50].strip() or "untitled"
