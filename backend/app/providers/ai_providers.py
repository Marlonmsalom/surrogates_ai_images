import asyncio
import os
import json
import requests
from abc import ABC, abstractmethod
from typing import List, Dict, Any

class AIProvider(ABC):
    @abstractmethod
    async def analyze_images(self, images_base64: List[str], prompt: str) -> Dict[str, Any]:
        pass

class OpenAIProvider(AIProvider):
    def __init__(self):
        from ..core.config import get_settings
        self.settings = get_settings()
        self.api_key = self.settings.OPENAI_API_KEY
        self.base_url = "https://api.openai.com/v1/chat/completions"
        print("OpenAI provider initialized with requests-based approach")
    
    async def analyze_images(self, images_base64: List[str], prompt: str) -> Dict[str, Any]:
        try:
            print(f"Starting analysis with {len(images_base64)} images")
            
            # Preparar contenido
            content = [{"type": "text", "text": prompt}]
            
            # Máximo 3 imágenes
            limited_images = images_base64[:3]
            print(f"Processing {len(limited_images)} images")
            
            for i, img_b64 in enumerate(limited_images):
                content.append({
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{img_b64}",
                        "detail": "low"
                    }
                })
                print(f"Added image {i+1}")
            
            # Payload para la API
            payload = {
                "model": "gpt-4o",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an expert brand guidelines analyst. Rate each image from 0-10 based on brand compliance."
                    },
                    {
                        "role": "user",
                        "content": content
                    }
                ],
                "max_tokens": 1500,
                "temperature": 0.1
            }
            
            # Headers
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
            
            print("Sending request to OpenAI API...")
            
            # Llamada HTTP directa
            response = requests.post(
                self.base_url, 
                headers=headers, 
                json=payload, 
                timeout=60
            )
            
            if response.status_code == 200:
                data = response.json()
                print("Response received from OpenAI")
                
                usage_info = {}
                if 'usage' in data:
                    usage_info = {
                        'prompt_tokens': data['usage'].get('prompt_tokens', 0),
                        'completion_tokens': data['usage'].get('completion_tokens', 0),
                        'total_tokens': data['usage'].get('total_tokens', 0)
                    }
                
                return {
                    'success': True,
                    'response': data['choices'][0]['message']['content'],
                    'usage': usage_info
                }
            else:
                error_msg = f"API request failed: {response.status_code} - {response.text}"
                print(error_msg)
                return {
                    'success': False,
                    'error': error_msg,
                    'response': None
                }
                
        except Exception as e:
            error_msg = f"Request Error: {str(e)}"
            print(error_msg)
            return {
                'success': False,
                'error': error_msg,
                'response': None
            }

class AIProviderFactory:
    _providers = {
        'openai': OpenAIProvider
    }
    
    @classmethod
    def create_provider(cls, provider_name: str) -> AIProvider:
        provider_name = provider_name.lower()
        
        if provider_name not in cls._providers:
            raise ValueError(f"Unknown AI provider: {provider_name}")
        
        return cls._providers[provider_name]()
