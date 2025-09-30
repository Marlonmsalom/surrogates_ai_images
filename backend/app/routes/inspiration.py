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
    """Verifica si una URL está activa de forma asíncrona"""
    try:
        timeout = aiohttp.ClientTimeout(total=3)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.head(url, allow_redirects=True) as response:
                return response.status < 400
    except:
        return False

def get_inspiration_from_gemini(keywords: List[str], api_key: str, count: int = 10) -> List[Dict]:
    """Llama a Gemini para obtener inspiración de diseño web"""
    try:
        logger.info(f"Contacting Gemini with keywords: {', '.join(keywords)}")
        
        client_options = {"api_endpoint": "generativelanguage.googleapis.com"}
        genai.configure(api_key=api_key, client_options=client_options)
        model = genai.GenerativeModel('models/gemini-2.5-pro')
        
        user_keywords = ", ".join(keywords)
        prompt = (
            "You are an *international* web design and marketing curator with a focus on global trends. "
            "Your task is to find "
            f"{count} world-class websites that are true references in design and marketing.\n"
            "They MUST meet these criteria:\n"
            "1. The list MUST include the best designs, regardless of country or language, NOT just English-speaking ones. Actively search for top-tier examples from regions with best taste such as Asia, Scandinavia or Europe.\n"
            "2. They must be currently live and operational.\n"
            "3. They must have been launched or significantly redesigned in the last year (2024-2025).\n"
            "4. They must be recognized for their innovative design, similar to winners on Awwwards, FWA, or CSSDA.\n"
            f"5. Their aesthetic should reflect the following themes: '{user_keywords}'.\n"
            "\n---CRITICAL INSTRUCTIONS---\n"
            "Your response MUST be a valid JSON array of objects. Each object must contain two keys: "
            "'url' (the website URL) and 'description' (a concise, one-sentence explanation of why "
            "it's a great design reference based on the requested themes).\n"
            "Example format: [{\"url\": \"https://example.com\", \"description\": \"This site uses bold typography and a minimalist layout to create a powerful user experience.\"}]"
        )
        
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
    """Obtiene inspiración de diseño web usando Gemini"""
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
