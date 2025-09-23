from abc import ABC, abstractmethod
from typing import List, Dict, Any
import os
from pathlib import Path

class StorageProvider(ABC):
    @abstractmethod
    async def save_file(self, file_path: str, content: bytes) -> str:
        pass
    
    @abstractmethod
    async def get_file(self, file_path: str) -> bytes:
        pass
    
    @abstractmethod
    async def delete_file(self, file_path: str) -> bool:
        pass

class LocalStorageProvider(StorageProvider):
    def __init__(self, base_path: str = "data"):
        self.base_path = Path(base_path)
        self.base_path.mkdir(exist_ok=True)
    
    async def save_file(self, file_path: str, content: bytes) -> str:
        full_path = self.base_path / file_path
        full_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(full_path, 'wb') as f:
            f.write(content)
        
        return str(full_path)
    
    async def get_file(self, file_path: str) -> bytes:
        full_path = self.base_path / file_path
        with open(full_path, 'rb') as f:
            return f.read()
    
    async def delete_file(self, file_path: str) -> bool:
        try:
            full_path = self.base_path / file_path
            if full_path.exists():
                full_path.unlink()
            return True
        except:
            return False

class StorageProviderFactory:
    _providers = {
        'local': LocalStorageProvider
    }
    
    @classmethod
    def create_provider(cls, provider_name: str = "local") -> StorageProvider:
        provider_name = provider_name.lower()
        
        if provider_name not in cls._providers:
            raise ValueError(f"Unknown storage provider: {provider_name}")
        
        return cls._providers[provider_name]()
