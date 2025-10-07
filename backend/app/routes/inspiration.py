from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import os
import json
import asyncio
import aiohttp
import google.generativeai as genai
import logging
import traceback
from pathlib import Path

logger = logging.getLogger(__name__)
router = APIRouter()

class InspirationRequest(BaseModel):
    keywords: List[str]
    count: int = 10

class InspirationResponse(BaseModel):
    success: bool
    websites: List[Dict[str, str]]
    message: str = ""

async def is_url_alive(url: str) -> bool:
    try:
        timeout = aiohttp.ClientTimeout(total=3)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.head(url, allow_redirects=True) as response:
                return response.status < 400
    except:
        return False

def load_prompt_template() -> str:
    prompt_file = Path(__file__).parent.parent.parent / "prompts_inspire.txt"
    
    if not prompt_file.exists():
        error_msg = f"""
ERROR: Prompt file not found at {prompt_file}
Please create the file with the following command:

cat > {prompt_file} << 'PROMPT_EOF'
[Insert your custom prompt here with placeholders like {{count}}, {{user_keywords}}]
PROMPT_EOF
"""
        raise FileNotFoundError(error_msg)
    
    with open(prompt_file, 'r') as f:
        return f.read()

def get_inspiration_from_gemini(keywords: List[str], api_key: str, count: int = 10) -> List[Dict]:
    try:
        logger.info(f"Contacting Gemini with keywords: {', '.join(keywords)}")
        
        client_options = {"api_endpoint": "generativelanguage.googleapis.com"}
        genai.configure(api_key=api_key, client_options=client_options)
        model = genai.GenerativeModel('models/gemini-2.5-pro')
        
        user_keywords = ", ".join(keywords)
        prompt_template = load_prompt_template()
        prompt = prompt_template.format(count=count, user_keywords=user_keywords)
        
        generation_config = genai.types.GenerationConfig(response_mime_type="application/json")
        response = model.generate_content(prompt, generation_config=generation_config)
        results = json.loads(response.text)
        
        logger.info(f"Gemini returned {len(results)} results. Verifying if alive...")
        return results
        
    except json.JSONDecodeError:
        logger.error("Gemini did not return valid JSON")
        return []
    except Exception as e:
        logger.error(f"Error calling Gemini API: {e}")
        logger.error(traceback.format_exc())
        return []

@router.post("/inspiration", response_model=InspirationResponse)
async def get_inspiration(request: InspirationRequest):
    try:
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        if not gemini_api_key:
            raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")
        
        logger.info(f"Fetching inspiration for keywords: {request.keywords}")
        
        inspiration_list = get_inspiration_from_gemini(
            request.keywords, 
            gemini_api_key, 
            request.count
        )
        
        if not inspiration_list:
            return InspirationResponse(
                success=False,
                websites=[],
                message="Could not get results from Gemini"
            )
        
        tasks = [is_url_alive(item.get('url')) for item in inspiration_list]
        results = await asyncio.gather(*tasks)
        
        live_websites = []
        for item, is_alive in zip(inspiration_list, results):
            url = item.get('url')
            if is_alive:
                live_websites.append(item)
            else:
                logger.warning(f"Discarding unavailable URL: {url}")
        
        if not live_websites:
            return InspirationResponse(
                success=False,
                websites=[],
                message="No live URLs found in Gemini results"
            )
        
        logger.info(f"Returning {len(live_websites)} verified websites")
        return InspirationResponse(
            success=True,
            websites=live_websites,
            message=f"Found {len(live_websites)} design references"
        )
        
    except Exception as e:
        logger.error(f"Error in inspiration endpoint: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
