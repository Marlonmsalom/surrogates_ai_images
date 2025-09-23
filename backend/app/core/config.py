from pydantic_settings import BaseSettings
from functools import lru_cache
import os

class Settings(BaseSettings):
    OPENAI_API_KEY: str
    UNSPLASH_API_KEY: str
    PEXELS_API_KEY: str = ""
    
    MODEL_NAME: str = "gpt-4o"
    MAX_IMAGE_SIZE: tuple = (1024, 1024)
    MAX_IMAGES_DOWNLOAD: int = 50
    DOWNLOAD_TIMEOUT: int = 30
    
    class Config:
        env_file = "../.env"  # Buscar .env en la raíz del proyecto

@lru_cache()
def get_settings():
    return Settings()
