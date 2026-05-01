import asyncio
import logging
from sqlmodel import Session, select

from database import engine
from models import Job, Thumbnail
from services.openai_service import generate_thumbnail
from services.imagekit_service import upload_file

logger = logging.getLogger(__name__)


STYLES = {
    "bold_dramatic": (
        "Create a bold, dramatic YouTube thumbnail with high contrast, "
        "cinematic lighting, dark moody background, and powerful composition. "
        "The person's face should be prominent with a dramatic expression."
    ),
    "clean_minimal": (
        "Create a clean, minimal YouTube thumbnail with bright lighting, "
        "white/light background, modern professional aesthetic, plenty of "
        "whitespace, and sharp clean composition. The person should look "
        "approachable and professional."
    ),
    "vibrant_energetic": (
        "Create a vibrant, energetic YouTube thumbnail with colorful gradients, "
        "dynamic angles, eye-catching pop-art style colors, and energetic "
        "composition. The person should have an excited or engaging expression."
    ),
}

STYLE_ORDER = ["bold_dramatic", "clean_minimal", "vibrant_energetic"]

async def generate_single_thumbnail(thumbnail_id: str, prompt: str, headshot_url: str):
    # DB mark -> generating
    with Session(engine) as session:
        thumb = session.get(Thumbnail, thumbnail_id)
        thumb.status = "generating"
        style_name = thumb.style_name
        session.add(thumb)
        session.commit()
    
    style_prompt = STYLES[style_name]       
    # AI call 
    try:
       image_byte = await generate_thumbnail(prompt, style_prompt, headshot_url)
       with Session() as session:
           thumb = session.get(Thumbnail, thumbnail_id)
           job_id = thumb.job_id
           
        # upload  this image
       url = await upload_file(
            file_bytes=image_byte,
            file_name=f"{thumbnail_id}.png",
            folder_path=f"thumbnails/{job_id}/"
        )
       # DB call save the url + mark uploaded
       with Session(engine) as session:
           thumb = session.get(Thumbnail, thumbnail_id)
           thumb.imagekit_url = url
           thumb.status = "uploaded"
           session.add(thumb)
           session.commit()        
    except Exception as e:
        logger.error(f"Error generating thumbnail {thumbnail_id}: {e}")
        with Session(engine) as session:
            thumb = session.get(Thumbnail, thumbnail_id)
            thumb.status = "failed"
            thumb.error_message = str(e)[:500]
            session.add(thumb)
            session.commit()