import asyncio
from abc import ABC, abstractmethod
from typing import List, Dict, Any
from openai import OpenAI
from ..core.config import get_settings

class AIProvider(ABC):
    @abstractmethod
    async def analyze_images(self, images_base64: List[str], prompt: str) -> Dict[str, Any]:
        pass

class OpenAIProvider(AIProvider):
    def __init__(self):
        self.settings = get_settings()
        # Simplificar inicialización - solo API key
        self.client = OpenAI(api_key=self.settings.OPENAI_API_KEY)
    
    async def analyze_images(self, images_base64: List[str], prompt: str) -> Dict[str, Any]:
        try:
            messages = [
                {
                    "role": "system",
                    "content": "You are an expert image analyst. Analyze the provided images based on the given criteria and return a detailed response."
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt}
                    ] + [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{img_b64}"
                            }
                        } for img_b64 in images_base64
                    ]
                }
            ]
            
            # Llamada síncrona simple
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                max_tokens=1000
            )
            
            usage_info = {}
            if response.usage:
                usage_info = {
                    'prompt_tokens': response.usage.prompt_tokens,
                    'completion_tokens': response.usage.completion_tokens,
                    'total_tokens': response.usage.total_tokens
                }
            
            return {
                'success': True,
                'response': response.choices[0].message.content,
                'usage': usage_info
            }
            
        except Exception as e:
            print(f"OpenAI API Error: {e}")
            return {
                'success': False,
                'error': str(e),
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
