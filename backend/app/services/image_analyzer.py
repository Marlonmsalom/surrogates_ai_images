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
    
    async def analyze_images(self, guideline_path: str, job_id: str) -> Dict[str, Any]:
        try:
            pdf_content = self._read_pdf_content(guideline_path)
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
                "message": "Processing images..."
            })
            
            images_base64 = []
            image_info = []
            
            for img_path in image_files:
                base64_img = self._image_to_base64(str(img_path))
                if base64_img:
                    images_base64.append(base64_img)
                    image_info.append({
                        "filename": img_path.name,
                        "path": str(img_path)
                    })
            
            await broadcast_to_job(job_id, {
                "status": "analyzing",
                "progress": 30,
                "message": "Sending to AI for analysis..."
            })
            
            ai_provider = AIProviderFactory.create_provider("openai")
            
            filenames_list = [img["filename"] for img in image_info]
            filenames_text = "\n".join([f"Image {i+1}: {fname}" for i, fname in enumerate(filenames_list)])
            
            prompt = f"""You are an expert brand guidelines analyst. I will provide you with brand guidelines and {len(images_base64)} images to analyze.

BRAND GUIDELINES:
{pdf_content}

IMAGES TO ANALYZE:
{filenames_text}

TASK:
Rate each image from 0 to 10 based on how well it complies with the brand guidelines:
- 0 = Completely inconsistent with guidelines
- 5 = Neutral/partially consistent  
- 10 = Perfect compliance with guidelines

CRITICAL: Use the EXACT filenames I provided above. Provide your response in this EXACT format:

RATINGS:
{filenames_list[0]}: [score] - [explanation]
{filenames_list[1] if len(filenames_list) > 1 else 'example.jpg'}: [score] - [explanation]
{filenames_list[2] if len(filenames_list) > 2 else 'example.jpg'}: [score] - [explanation]
...continue for ALL {len(filenames_list)} images using their EXACT filenames.

Use the EXACT filename for each image, not generic names."""
            
            result = await ai_provider.analyze_images(images_base64, prompt)
            
            await broadcast_to_job(job_id, {
                "status": "analyzing",
                "progress": 80,
                "message": "Processing AI response..."
            })
            
            if result["success"]:
                ratings = self._parse_ratings(result["response"], image_info)
                
                return {
                    "success": True,
                    "message": "Analysis completed successfully",
                    "ratings": ratings,
                    "ai_response": result["response"],
                    "usage": result.get("usage", {}),
                    "job_id": job_id
                }
            else:
                return {"success": False, "message": result.get("error", "AI analysis failed")}
                
        except Exception as e:
            return {"success": False, "message": str(e)}
    
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
    
    def _image_to_base64(self, image_path: str, max_size: tuple = (1024, 1024)) -> str:
        try:
            with Image.open(image_path) as img:
                if img.mode in ('RGBA', 'P'):
                    img = img.convert('RGB')
                
                if img.size[0] > max_size[0] or img.size[1] > max_size[1]:
                    img.thumbnail(max_size, Image.LANCZOS)
                
                import io
                buffer = io.BytesIO()
                img.save(buffer, format='JPEG', quality=85)
                
                encoded_string = base64.b64encode(buffer.getvalue()).decode('utf-8')
                return encoded_string
                
        except Exception as e:
            print(f"Error processing image {image_path}: {e}")
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
