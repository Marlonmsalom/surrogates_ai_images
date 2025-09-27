import asyncio
import os
import json
import requests
import gc
from abc import ABC, abstractmethod
from typing import List, Dict, Any

class AIProvider(ABC):
    @abstractmethod
    async def analyze_images(self, images_base64: List[str], prompt: str, job_id: str = None) -> Dict[str, Any]:
        pass

class OpenAIProvider(AIProvider):
    def __init__(self):
        from ..core.config import get_settings
        self.settings = get_settings()
        self.api_key = self.settings.OPENAI_API_KEY
        self.base_url = "https://api.openai.com/v1/chat/completions"
        
        # Configuración optimizada para OpenAI
        self.BATCH_SIZE = 2  # Solo 2 imágenes por request
        self.TIMEOUT_PER_BATCH = 45  # 45s por lote
        self.MAX_RETRIES = 3  # 3 intentos por lote
        self.DELAY_BETWEEN_BATCHES = 2  # 2s entre requests
        
        print("OpenAI provider initialized with batch processing strategy")
    
    async def analyze_images(self, images_base64: List[str], prompt: str, job_id: str = None) -> Dict[str, Any]:
        try:
            print(f"Starting batch analysis with {len(images_base64)} images")
            
            if len(images_base64) <= self.BATCH_SIZE:
                # Procesamiento simple para lotes pequeños - usar prompt original
                return await self._process_single_batch(images_base64, prompt, None)
            else:
                # Procesamiento por lotes para conjuntos grandes - necesitamos info de archivos
                return await self._process_images_in_batches(images_base64, prompt, job_id)
                
        except Exception as e:
            error_msg = f"Analysis Error: {str(e)}"
            print(error_msg)
            return {
                'success': False,
                'error': error_msg,
                'response': None
            }
    
    async def _process_images_in_batches(self, images_base64: List[str], prompt: str, job_id: str = None) -> Dict[str, Any]:
        """Procesa imágenes en lotes pequeños para maximizar confiabilidad"""
        try:
            from ..main import broadcast_to_job
            
            total_images = len(images_base64)
            total_batches = (total_images + self.BATCH_SIZE - 1) // self.BATCH_SIZE
            all_responses = []
            all_usage = {'prompt_tokens': 0, 'completion_tokens': 0, 'total_tokens': 0}
            
            print(f"Processing {total_images} images in {total_batches} batches of {self.BATCH_SIZE}")
            
            # Extraer nombres de archivo del prompt original
            image_filenames = self._extract_filenames_from_prompt(prompt)
            
            # Crear un prompt base simplificado
            base_prompt = self._create_simplified_prompt(prompt)
            
            for i in range(0, total_images, self.BATCH_SIZE):
                batch_num = (i // self.BATCH_SIZE) + 1
                batch = images_base64[i:i + self.BATCH_SIZE]
                
                # Obtener nombres de archivo para este lote
                batch_filenames = image_filenames[i:i + self.BATCH_SIZE]
                
                print(f"Processing batch {batch_num}/{total_batches} with {len(batch)} images")
                print(f"Batch filenames: {batch_filenames}")
                
                # Actualizar progreso
                if job_id and broadcast_to_job:
                    base_progress = 30  # El análisis empieza en 30%
                    batch_progress = int(base_progress + (batch_num - 1) / total_batches * 50)
                    
                    await broadcast_to_job(job_id, {
                        "status": "analyzing",
                        "progress": batch_progress,
                        "message": f"Analyzing batch {batch_num}/{total_batches}..."
                    })
                
                # Crear prompt específico para este lote con nombres de archivo
                batch_prompt = self._create_batch_prompt_with_filenames(base_prompt, batch_filenames)
                
                # Procesar lote con reintentos usando prompt específico
                batch_result = await self._process_batch_with_retries(batch, batch_prompt, batch_num)
                
                if batch_result['success']:
                    all_responses.append(batch_result['response'])
                    
                    # Acumular estadísticas de uso
                    usage = batch_result.get('usage', {})
                    for key in all_usage:
                        all_usage[key] += usage.get(key, 0)
                    
                    print(f"Batch {batch_num} completed successfully")
                else:
                    print(f"Batch {batch_num} failed: {batch_result.get('error', 'Unknown error')}")
                    # Continuar con el siguiente lote en caso de error
                
                # Pausa entre lotes para respetar rate limits
                if batch_num < total_batches:
                    await asyncio.sleep(self.DELAY_BETWEEN_BATCHES)
                
                # Liberar memoria
                gc.collect()
            
            # Combinar todas las respuestas
            if all_responses:
                combined_response = "\n\n".join(all_responses)
                return {
                    'success': True,
                    'response': combined_response,
                    'usage': all_usage,
                    'batches_processed': len(all_responses),
                    'total_batches': total_batches
                }
            else:
                return {
                    'success': False,
                    'error': 'All batches failed to process',
                    'response': None
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f"Batch processing error: {str(e)}",
                'response': None
            }
    
    def _extract_filenames_from_prompt(self, prompt: str) -> List[str]:
        """Extrae los nombres de archivo del prompt original"""
        try:
            filenames = []
            lines = prompt.split('\n')
            
            for line in lines:
                # Buscar líneas que contengan nombres de archivo
                if '.jpg' in line.lower():
                    # Extraer nombre de archivo de líneas como "Image 1: filename.jpg"
                    parts = line.split(':')
                    if len(parts) > 1:
                        filename_part = parts[1].strip()
                        if '.jpg' in filename_part.lower():
                            filenames.append(filename_part)
                    # También buscar líneas que empiecen con "- filename.jpg"
                    elif line.strip().startswith('- ') and '.jpg' in line.lower():
                        filename = line.strip()[2:].strip()
                        filenames.append(filename)
            
            print(f"Extracted filenames: {filenames}")
            return filenames
            
        except Exception as e:
            print(f"Error extracting filenames: {e}")
            return [f"image_{i+1}.jpg" for i in range(10)]  # Fallback
    
    def _create_simplified_prompt(self, original_prompt: str) -> str:
        """Crea un prompt base simplificado"""
        try:
            # Extraer las brand guidelines
            if "BRAND GUIDELINES:" in original_prompt and "TASK:" in original_prompt:
                start = original_prompt.find("BRAND GUIDELINES:")
                end = original_prompt.find("TASK:")
                guidelines = original_prompt[start:end].strip()
            else:
                guidelines = "BRAND GUIDELINES:\n" + original_prompt[:800]
            
            return f"""{guidelines}

TASK:
Rate each image from 0 to 10 based on brand compliance:
- 0 = Completely inconsistent with guidelines  
- 5 = Neutral/partially consistent
- 10 = Perfect compliance with guidelines"""
            
        except Exception as e:
            print(f"Error creating simplified prompt: {e}")
            return "Rate these images from 0-10 based on brand compliance."
    
    def _create_batch_prompt_with_filenames(self, base_prompt: str, filenames: List[str]) -> str:
        """Crea un prompt específico para el lote actual con nombres de archivo"""
        
        # Crear lista de imágenes para este lote
        images_list = "\n".join([f"Image {i+1}: {filename}" for i, filename in enumerate(filenames)])
        
        batch_prompt = f"""{base_prompt}

IMAGES IN THIS BATCH:
{images_list}

CRITICAL: I'm showing you {len(filenames)} images in the exact order listed above.

RESPONSE FORMAT (REQUIRED):
For each image, provide exactly this format:
{filenames[0]}: [score] - [brief explanation]
{filenames[1] if len(filenames) > 1 else "example.jpg"}: [score] - [brief explanation]

Use the EXACT filenames listed above. Do not use generic names."""
        
        print(f"Created batch prompt with {len(filenames)} filenames")
        return batch_prompt
    
    async def _process_batch_with_retries(self, batch: List[str], prompt: str, batch_num: int) -> Dict[str, Any]:
        """Procesa un lote con sistema de reintentos"""
        for attempt in range(1, self.MAX_RETRIES + 1):
            try:
                print(f"Batch {batch_num}, attempt {attempt}/{self.MAX_RETRIES}")
                
                result = await self._process_single_batch(batch, prompt, batch_num)
                
                if result['success']:
                    return result
                else:
                    print(f"Batch {batch_num} attempt {attempt} failed: {result.get('error', 'Unknown')}")
                    
                    if attempt < self.MAX_RETRIES:
                        await asyncio.sleep(attempt * 2)  # Backoff exponencial
                    
            except Exception as e:
                print(f"Batch {batch_num} attempt {attempt} exception: {str(e)}")
                
                if attempt < self.MAX_RETRIES:
                    await asyncio.sleep(attempt * 2)
        
        return {
            'success': False,
            'error': f'Batch {batch_num} failed after {self.MAX_RETRIES} attempts',
            'response': None
        }
    
    async def _process_single_batch(self, images_base64: List[str], prompt: str, batch_num: int = None) -> Dict[str, Any]:
        """Procesa un solo lote de imágenes"""
        try:
            # Verificar que las imágenes base64 sean válidas
            valid_images = []
            for i, img_b64 in enumerate(images_base64):
                if img_b64 and len(img_b64) > 100:  # Verificación básica
                    valid_images.append(img_b64)
                    print(f"Image {i+1}: {len(img_b64)} chars")
                else:
                    print(f"Image {i+1}: Invalid or empty base64")
            
            if not valid_images:
                return {
                    'success': False,
                    'error': 'No valid images to process',
                    'response': None
                }
            
            # Preparar contenido
            content = [{"type": "text", "text": prompt}]
            
            # Añadir imágenes al contenido
            for i, img_b64 in enumerate(valid_images):
                content.append({
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{img_b64}",
                        "detail": "low"
                    }
                })
                print(f"Added valid image {i+1}")
            
            # Payload optimizado para la API
            payload = {
                "model": "gpt-4o",
                "messages": [
                    {
                        "role": "user",
                        "content": content
                    }
                ],
                "max_tokens": 1000,
                "temperature": 0.1
            }
            
            # Headers
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
            
            print(f"Sending batch request to OpenAI API with {len(valid_images)} valid images...")
            
            # Llamada HTTP con timeout optimizado
            response = requests.post(
                self.base_url, 
                headers=headers, 
                json=payload, 
                timeout=self.TIMEOUT_PER_BATCH
            )
            
            print(f"OpenAI API Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("Batch response received from OpenAI")
                
                # Verificar que tenemos una respuesta válida
                if 'choices' in data and len(data['choices']) > 0:
                    response_content = data['choices'][0]['message']['content']
                    print(f"Response preview: {response_content[:200]}...")
                    
                    usage_info = {}
                    if 'usage' in data:
                        usage_info = {
                            'prompt_tokens': data['usage'].get('prompt_tokens', 0),
                            'completion_tokens': data['usage'].get('completion_tokens', 0),
                            'total_tokens': data['usage'].get('total_tokens', 0)
                        }
                    
                    return {
                        'success': True,
                        'response': response_content,
                        'usage': usage_info
                    }
                else:
                    return {
                        'success': False,
                        'error': 'Invalid response structure from OpenAI',
                        'response': None
                    }
            else:
                error_msg = f"API request failed: {response.status_code} - {response.text}"
                print(error_msg)
                return {
                    'success': False,
                    'error': error_msg,
                    'response': None
                }
                
        except requests.exceptions.Timeout:
            return {
                'success': False,
                'error': 'Request timeout - batch took too long',
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
