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
                "You are the best creative director in history with training from the world's top art & design schools "
                "and deep experience across Architecture, Fine Arts, Design, Photography, Tech, and Fashion. "
                "You have an exceptional sense for composition, color, style, and creative references.\n"
                "Your task is to find " + str(count) + " world-class, moodboard-ready image links that precisely match the user's creative intention.\n"
                "They MUST meet these criteria:\n"
                "1. The search MUST span Google (with site restrictions), Pinterest, Unsplash, Pexels, Behance, and Tumblr, prioritizing editorial/filmic quality (NOT cosplay/AI).\n"
                "2. Use Google with site filters when helpful (e.g., site:pinterest.com, site:behance.net, site:tumblr.com) and avoid rehosts or low-quality aggregators.\n"
                "3. Balance sources: include ≥3 Pinterest links, ≥2 from Unsplash/Pexels combined, and ≥2 from Behance/Tumblr combined (if available).\n"
                "4. Favor: teal–red or analogous cinematic palettes, shallow DOF, rim/back light, window/rain reflections, graphic composition, and/or material/texture plates — as appropriate to the brief.\n"
                "5. Apply negative filters to ALL searches: -ai -midjourney -stable diffusion -overprocessed -cheesy -stocky -poster -quote.\n"
                "6. Only include links that are currently live and display-friendly (embedding or hotlinking allowed by the source's standard terms). Always link to the ORIGINAL page (pin/post/project), not rehosts.\n"
                "Rewrite & optimize the user's rough idea into a concise creative brief (tone, palette, lighting, composition, era, references, negative tastes), then search and return the results.\n"
                "--- CRITICAL INSTRUCTIONS ---\n"
                "Your response MUST be a valid JSON array of objects.\n"
                "Each object MUST contain exactly two keys:\n"
                "- 'url': the original page URL (Pin/Post/Project or stock item page).\n"
                "- 'description': a concise, one-sentence justification of why this link fits the brief (e.g., lighting, palette, hair/texture/form/composition, or background plate).\n"
                "User input (unqualified): '" + user_keywords + "'"
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
