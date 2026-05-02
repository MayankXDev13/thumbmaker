import os
import logging
import asyncio


from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlmodel import Session, select

from database import get_session
from models import Job, Thumbnail

from services.generator import process_job, STYLE_ORDER
from services.imagekit_service import upload_file, get_variants


logger = logging.getLogger(__name__)


router = APIRouter(prefix="/api")

# request response schemas

class CreateJobRequest(BaseModel):
    prompt: str
    num_thumbnails: int
    headshot_url: str
    
class CreateJobResponse(BaseModel):
    job_id: str
    
class ThumbnailResponse(BaseModel):
    id: str
    style_name: str
    status: str
    imagekit_url: str | None = None
    error_message: str | None = None
    variants: dict | None = None
    
@router.post("/upload-headshot")
async def upload_headshot(file: UploadFile = File(...)):
    
    contents = await file.read()
    
    url = await upload_file(
        file_bytes=contents,
        original_filename=file.filename or "headshot.jpg",
        folder="headshots",
        content_type=file.content_type or "image/jpeg",
    )
    
    return {"url": url}
    
    
@router.post("/jobs", response_model=CreateJobResponse)
async def create_job(request: CreateJobRequest, session: Session = Depends(get_session)):
    if request.num_thumbnails < 1 or request.num_thumbnails > 3:
        raise HTTPException(status_code=400, detail=f"Number of thumbnails must be between 1 and 3")
    
    job = Job(
        prompt=request.prompt,
        num_thumbnails=request.num_thumbnails,
        headshot_url=request.headshot_url,        
    )
    session.add(job)
    
    styles = STYLE_ORDER[:request.num_thumbnails]
    for style_name in styles:
        thumb = Thumbnail(
            job_id=job.id,
            style_name=style_name,
        )
        session.add(thumb)
        
    session.commit()
    
    # Fire and forget style genration
    asyncio.create_task(process_job(job.id))
    
    return CreateJobResponse(job_id=job.id)

    
    
    