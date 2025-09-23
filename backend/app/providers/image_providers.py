import asyncio
import aiohttp
import logging
from abc import ABC, abstractmethod
from typing import List, Dict, Any
from ..core.config import get_settings

logger = logging.getLogger(__name__)

class ImageProvider(ABC):
    @abstractmethod
    async def fetch_images(self, query: str, limit: int) -> List[Dict[str, Any]]:
        pass
    
    @abstractmethod
    async def download_image(self, image_data: Dict[str, Any], save_path: str) -> bool:
        pass

class UnsplashProvider(ImageProvider):
    def __init__(self):
        self.settings = get_settings()
        self.api_key = self.settings.UNSPLASH_API_KEY
        self.base_url = "https://api.unsplash.com"
        logger.info(f"UnsplashProvider initialized with API key: {self.api_key[:10]}...")
    
    async def fetch_images(self, query: str, limit: int) -> List[Dict[str, Any]]:
        headers = {
            'Authorization': f'Client-ID {self.api_key}',
            'Accept-Version': 'v1'
        }
        
        params = {
            'query': query,
            'per_page': min(limit, 30),
            'orientation': 'landscape'
        }
        
        timeout = aiohttp.ClientTimeout(total=30)
        
        async with aiohttp.ClientSession(timeout=timeout) as session:
            try:
                url = f"{self.base_url}/search/photos"
                logger.info(f"Fetching from Unsplash: {url}")
                logger.info(f"Parameters: {params}")
                
                async with session.get(url, headers=headers, params=params) as response:
                    logger.info(f"Unsplash response status: {response.status}")
                    
                    if response.status == 200:
                        data = await response.json()
                        total_results = data.get('total', 0)
                        results = data.get('results', [])
                        
                        logger.info(f"Unsplash returned {len(results)} images (total available: {total_results})")
                        
                        images = []
                        for item in results:
                            images.append({
                                'id': item.get('id'),
                                'description': item.get('description') or item.get('alt_description', ''),
                                'url': item.get('urls', {}).get('regular'),
                                'download_url': item.get('urls', {}).get('full'),
                                'author': item.get('user', {}).get('name', 'Unknown'),
                                'source': 'unsplash',
                                'width': item.get('width'),
                                'height': item.get('height')
                            })
                        
                        logger.info(f"Processed {len(images)} images from Unsplash")
                        return images
                    else:
                        error_text = await response.text()
                        logger.error(f"Unsplash API error {response.status}: {error_text}")
                        return []
                        
            except Exception as e:
                logger.error(f"Error fetching from Unsplash: {e}")
                return []
    
    async def download_image(self, image_data: Dict[str, Any], save_path: str) -> bool:
        url = image_data.get('download_url') or image_data.get('url')
        if not url:
            logger.error("No download URL found for image")
            return False
        
        timeout = aiohttp.ClientTimeout(total=30)
        
        async with aiohttp.ClientSession(timeout=timeout) as session:
            try:
                logger.info(f"Downloading image from: {url}")
                async with session.get(url) as response:
                    if response.status == 200:
                        content = await response.read()
                        with open(save_path, 'wb') as f:
                            f.write(content)
                        logger.info(f"Image downloaded successfully: {save_path}")
                        return True
                    else:
                        logger.error(f"Failed to download image, status: {response.status}")
                        return False
            except Exception as e:
                logger.error(f"Error downloading image: {e}")
                return False

class PexelsProvider(ImageProvider):
    def __init__(self):
        self.settings = get_settings()
        self.api_key = self.settings.PEXELS_API_KEY
        self.base_url = "https://api.pexels.com/v1"
        logger.info(f"PexelsProvider initialized")
    
    async def fetch_images(self, query: str, limit: int) -> List[Dict[str, Any]]:
        if not self.api_key or self.api_key == "your_pexels_api_key_here":
            logger.error("Pexels API key not configured")
            return []
            
        headers = {'Authorization': self.api_key}
        
        params = {
            'query': query,
            'per_page': min(limit, 80),
            'orientation': 'landscape'
        }
        
        timeout = aiohttp.ClientTimeout(total=30)
        
        async with aiohttp.ClientSession(timeout=timeout) as session:
            try:
                url = f"{self.base_url}/search"
                logger.info(f"Fetching from Pexels: {url}")
                
                async with session.get(url, headers=headers, params=params) as response:
                    logger.info(f"Pexels response status: {response.status}")
                    
                    if response.status == 200:
                        data = await response.json()
                        results = data.get('photos', [])
                        
                        logger.info(f"Pexels returned {len(results)} images")
                        
                        images = []
                        for item in results:
                            images.append({
                                'id': item.get('id'),
                                'description': item.get('alt', ''),
                                'url': item.get('src', {}).get('large'),
                                'download_url': item.get('src', {}).get('original'),
                                'author': item.get('photographer', 'Unknown'),
                                'source': 'pexels',
                                'width': item.get('width'),
                                'height': item.get('height')
                            })
                        
                        return images
                    else:
                        error_text = await response.text()
                        logger.error(f"Pexels API error {response.status}: {error_text}")
                        return []
                        
            except Exception as e:
                logger.error(f"Error fetching from Pexels: {e}")
                return []
    
    async def download_image(self, image_data: Dict[str, Any], save_path: str) -> bool:
        url = image_data.get('download_url') or image_data.get('url')
        if not url:
            return False
        
        headers = {'Authorization': self.api_key}
        timeout = aiohttp.ClientTimeout(total=30)
        
        async with aiohttp.ClientSession(timeout=timeout) as session:
            try:
                async with session.get(url, headers=headers) as response:
                    if response.status == 200:
                        content = await response.read()
                        with open(save_path, 'wb') as f:
                            f.write(content)
                        return True
                    return False
            except Exception as e:
                logger.error(f"Error downloading image: {e}")
                return False

class ImageProviderFactory:
    _providers = {
        'unsplash': UnsplashProvider,
        'pexels': PexelsProvider
    }
    
    @classmethod
    def create_provider(cls, provider_name: str) -> ImageProvider:
        provider_name = provider_name.lower()
        
        if provider_name not in cls._providers:
            available = ', '.join(cls._providers.keys())
            raise ValueError(f"Unknown provider: {provider_name}. Available: {available}")
        
        return cls._providers[provider_name]()
    
    @classmethod
    def get_available_providers(cls) -> List[str]:
        return list(cls._providers.keys())
