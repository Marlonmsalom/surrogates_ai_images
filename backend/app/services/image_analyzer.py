import asyncio
import base64
import os
from pathlib import Path
from typing import List, Dict, Any, Optional
from PIL import Image
import PyPDF2
from ..providers.ai_providers import AIProviderFactory
from ..core.config import get_settings

class ImageAnalyzer:
    def __init__(self):
        self.settings = get_settings()
        self.project_root = Path(__file__).parent.parent.parent.parent
        self.images_dir = self.project_root / "data" / "images"
        self.uploads_dir = self.project_root / "data" / "uploads"
    
    async def analyze_images(self, guideline_path: str, job_id: str) -> Dict[str, Any]:
        try:
            # Convert relative path to absolute path if needed
            if not Path(guideline_path).is_absolute():
                guideline_full_path = self.project_root / guideline_path
            else:
                guideline_full_path = Path(guideline_path)
                
            pdf_content = self._read_pdf_content(str(guideline_full_path))
            if not pdf_content:
                return {"success": False, "message": "Could not read PDF content"}
            
            # Use correct path to job images
            images_dir = self.images_dir / job_id
            if not images_dir.exists():
                return {"success": False, "message": f"Images not found for job: {images_dir}"}
            
            image_files = list(images_dir.glob("*.jpg"))
            if not image_files:
                return {"success": False, "message": "No images found to analyze"}
            
            from ..main import broadcast_to_job
            await broadcast_to_job(job_id, {
                "status": "analyzing",
                "progress": 10,
                "message": f"Processing {len(image_files)} images..."
            })
            
            # Procesar imágenes de forma optimizada
            images_base64, image_info = await self._process_images_async(image_files, job_id)
            
            if not images_base64:
                return {"success": False, "message": "No images could be processed"}
            
            await broadcast_to_job(job_id, {
                "status": "analyzing",
                "progress": 30,
                "message": f"Sending {len(images_base64)} images to AI for analysis..."
            })
            
            ai_provider = AIProviderFactory.create_provider("openai")
            
            # Preparar prompt optimizado para lotes
            prompt = self._create_batch_prompt(pdf_content, image_info)
            
            # Usar el nuevo sistema de análisis por lotes CON job_id
            result = await ai_provider.analyze_images(images_base64, prompt, job_id)
            
            await broadcast_to_job(job_id, {
                "status": "analyzing",
                "progress": 90,
                "message": "Processing AI response..."
            })
            
            if result["success"]:
                ratings = self._parse_ratings(result["response"], image_info)
                
                # Guardar resultados
                await self._save_analysis_results(job_id, result, ratings)
                
                return {
                    "success": True,
                    "message": f"Analysis completed successfully. Processed {len(ratings)} images.",
                    "ratings": ratings,
                    "ai_response": result["response"],
                    "usage": result.get("usage", {}),
                    "batches_info": {
                        "batches_processed": result.get("batches_processed", 1),
                        "total_batches": result.get("total_batches", 1)
                    },
                    "job_id": job_id
                }
            else:
                return {"success": False, "message": result.get("error", "AI analysis failed")}
                
        except Exception as e:
            return {"success": False, "message": str(e)}
    
    async def _process_images_async(self, image_files: List[Path], job_id: str) -> tuple:
        """Procesa imágenes de forma asíncrona y optimizada"""
        images_base64 = []
        image_info = []
        
        from ..main import broadcast_to_job
        
        for i, img_path in enumerate(image_files):
            try:
                # Progreso durante procesamiento de imágenes
                progress = int(10 + (i / len(image_files)) * 20)
                await broadcast_to_job(job_id, {
                    "status": "analyzing", 
                    "progress": progress,
                    "message": f"Processing image {i+1}/{len(image_files)}: {img_path.name}"
                })
                
                base64_img = self._image_to_base64(str(img_path))
                if base64_img:
                    images_base64.append(base64_img)
                    image_info.append({
                        "filename": img_path.name,
                        "path": str(img_path)
                    })
                    print(f"Successfully processed image {i+1}: {img_path.name}")
                else:
                    print(f"Failed to process image {i+1}: {img_path.name}")
                
                # Pequeña pausa para no bloquear el event loop
                if i % 5 == 0:
                    await asyncio.sleep(0.1)
                    
            except Exception as e:
                print(f"Error processing image {img_path}: {e}")
                continue
        
        print(f"Final: processed {len(images_base64)} images successfully")
        return images_base64, image_info
    
    def _create_batch_prompt(self, pdf_content: str, image_info: List[Dict]) -> str:
        """Crea un prompt optimizado para procesamiento por lotes"""
        filenames_list = [img["filename"] for img in image_info]
        filenames_text = "\n".join([f"- {fname}" for fname in filenames_list])
        
        return f"""I am sending you {len(image_info)} images along with brand guidelines. Please analyze each image and rate it from 0-10 based on brand compliance.

BRAND GUIDELINES:
{pdf_content}

IMAGES TO ANALYZE:
{filenames_text}

TASK:
Rate each image from 0 to 10 based on how well it complies with the brand guidelines:
- 0 = Completely inconsistent with guidelines
- 5 = Neutral/partially consistent  
- 10 = Perfect compliance with guidelines

RESPONSE FORMAT:
Please provide your response in this EXACT format:

RATINGS:
{filenames_list[0]}: [score] - [brief explanation]
{filenames_list[1] if len(filenames_list) > 1 else 'example.jpg'}: [score] - [brief explanation]
...continue for ALL images

Use the EXACT filename for each image."""
    
    async def _save_analysis_results(self, job_id: str, result: Dict, ratings: List[Dict]) -> None:
        """Guarda los resultados del análisis"""
        try:
            results_dir = self.project_root / "data" / "results"
            results_dir.mkdir(exist_ok=True)
            
            results_data = {
                "job_id": job_id,
                "timestamp": str(asyncio.get_event_loop().time()),
                "ratings": ratings,
                "usage": result.get("usage", {}),
                "batches_info": result.get("batches_processed", 1)
            }
            
            import json
            results_file = results_dir / f"{job_id}_analysis.json"
            with open(results_file, 'w') as f:
                json.dump(results_data, f, indent=2)
                
        except Exception as e:
            print(f"Error saving results: {e}")
    
    def _read_pdf_content(self, pdf_path: str) -> Optional[str]:
        try:
            text_content = []
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page_num, page in enumerate(pdf_reader.pages, 1):
                    try:
                        page_text = page.extract_text()
                        if page_text.strip():
                            text_content.append(f"=== PAGE {page_num} ===\n{page_text.strip()}")
                    except:
                        continue
            
            if text_content:
                return "\n\n".join(text_content)
            return None
            
        except Exception as e:
            print(f"Error reading PDF: {e}")
            return None
    
    def _image_to_base64(self, image_path: str, max_size: tuple = (800, 800)) -> str:
        """Optimizado para reducir tamaño y memoria"""
        try:
            print(f"Converting image to base64: {image_path}")
            
            # Verificar que el archivo exista
            if not os.path.exists(image_path):
                print(f"Image file does not exist: {image_path}")
                return ""
            
            with Image.open(image_path) as img:
                # Verificar que la imagen se abrió correctamente
                print(f"Image opened: {img.size}, mode: {img.mode}")
                
                if img.mode in ('RGBA', 'P'):
                    img = img.convert('RGB')
                    print("Converted image to RGB")
                
                # Redimensionar si es necesario (tamaño reducido para OpenAI)
                if img.size[0] > max_size[0] or img.size[1] > max_size[1]:
                    original_size = img.size
                    img.thumbnail(max_size, Image.LANCZOS)
                    print(f"Resized from {original_size} to {img.size}")
                
                import io
                buffer = io.BytesIO()
                # Calidad reducida para optimizar tamaño
                img.save(buffer, format='JPEG', quality=75, optimize=True)
                
                encoded_string = base64.b64encode(buffer.getvalue()).decode('utf-8')
                print(f"Base64 encoded: {len(encoded_string)} characters")
                return encoded_string
                
        except Exception as e:
            print(f"Error processing image {image_path}: {e}")
            import traceback
            traceback.print_exc()
            return ""
    
    def _parse_ratings(self, response_text: str, image_info: List[Dict]) -> List[Dict]:
        ratings = []
        filename_to_info = {info["filename"]: info for info in image_info}
        
        try:
            lines = response_text.split('\n')
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                import re
                pattern = r'([^:]+\.(?:jpg|jpeg|png|gif|webp))\s*:\s*(\d+)(?:/10)?'
                match = re.search(pattern, line, re.IGNORECASE)
                
                if match:
                    filename = match.group(1).strip()
                    score = int(match.group(2))
                    
                    explanation = ""
                    if " - " in line:
                        explanation = line.split(" - ", 1)[1]
                    
                    img_info = filename_to_info.get(filename, {})
                    
                    ratings.append({
                        "filename": filename,
                        "score": score,
                        "explanation": explanation,
                        "path": img_info.get("path", ""),
                        "status": "excellent" if score >= 8 else "good" if score >= 6 else "fair" if score >= 4 else "poor"
                    })
            
            ratings.sort(key=lambda x: x["score"], reverse=True)
            return ratings
            
        except Exception as e:
            print(f"Error parsing ratings: {e}")
            return []
