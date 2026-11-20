from contextlib import asynccontextmanager
from pathlib import Path
from uuid import uuid4

from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, ConfigDict, Field

from .database import create_series, get_series, init_database, list_series, update_series


class TastingNotes(BaseModel):
    aromaLabel: str
    aromaValue: str
    palateLabel: str
    palateValue: str
    finishLabel: str
    finishValue: str


class SeriesBasicInfo(BaseModel):
    id: str
    name: str
    subtitle: str
    taglineZh: str
    taglineEn: str
    description: str
    imageUrl: str
    tasting: TastingNotes
    origin: str
    abv: str
    updatedAt: str


class SeriesBasicInfoUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=200)
    subtitle: str = Field(default="", max_length=300)
    taglineZh: str = Field(default="", max_length=200)
    taglineEn: str = Field(default="", max_length=200)
    description: str = Field(default="", max_length=5000)
    imageUrl: str = ""
    tasting: TastingNotes
    origin: str = Field(default="", max_length=300)
    abv: str = Field(default="", max_length=100)


class SeriesBasicInfoCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=200)
    subtitle: str = Field(default="", max_length=300)
    taglineZh: str = Field(default="", max_length=200)
    taglineEn: str = Field(default="", max_length=200)
    description: str = Field(default="", max_length=5000)
    imageUrl: str = ""
    tasting: TastingNotes | None = None
    origin: str = Field(default="", max_length=300)
    abv: str = Field(default="", max_length=100)


class UploadMediaResult(BaseModel):
    url: str
    filename: str


def detect_image_extension(content: bytes) -> str | None:
    if content.startswith(b"\x89PNG\r\n\x1a\n"):
        return ".png"
    if content.startswith(b"\xff\xd8\xff"):
        return ".jpg"
    if content.startswith((b"GIF87a", b"GIF89a")):
        return ".gif"
    if len(content) >= 12 and content[:4] == b"RIFF" and content[8:12] == b"WEBP":
        return ".webp"
    return None


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_database()
    yield


app = FastAPI(title="AI Showcase CMS API", lifespan=lifespan)

UPLOADS_DIR = Path(__file__).resolve().parent / "data" / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/api/series", response_model=list[SeriesBasicInfo])
def read_series_list() -> list[dict]:
    return list_series()


@app.post("/api/series", response_model=SeriesBasicInfo, status_code=201)
def create_series_item(payload: SeriesBasicInfoCreate) -> dict:
    data = payload.model_dump()
    data["subtitle"] = data["subtitle"] or "COGNAC FINE CHAMPAGNE"
    data["taglineZh"] = data["taglineZh"] or "典藏风范"
    data["taglineEn"] = data["taglineEn"] or "HERITAGE"
    data["description"] = data["description"] or "甄选优质香槟区珍稀生命之水调配而成，呈现优雅而深邃的层次风味。"
    data["imageUrl"] = data["imageUrl"] or "/assets/remy/bottle-club.png"
    data["tasting"] = data["tasting"] or {
        "aromaLabel": "香气",
        "aromaValue": "花果 · 香料",
        "palateLabel": "口感",
        "palateValue": "圆润 · 醇厚",
        "finishLabel": "余韵",
        "finishValue": "悠长 · 雅致",
    }
    data["origin"] = data["origin"] or "大香槟区 & 小香槟区"
    data["abv"] = data["abv"] or "40% VOL."
    return create_series(data)


@app.post("/api/media/upload", response_model=UploadMediaResult, status_code=201)
async def upload_series_image(
    request: Request, file: UploadFile = File(...)
) -> dict[str, str]:
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image file must not exceed 10 MB")

    extension = detect_image_extension(content)
    if extension is None:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, WebP and GIF images are supported")

    stored_name = f"{uuid4().hex}{extension}"
    (UPLOADS_DIR / stored_name).write_bytes(content)
    base_url = str(request.base_url).rstrip("/")
    return {
        "url": f"{base_url}/uploads/{stored_name}",
        "filename": file.filename or stored_name,
    }


@app.get("/api/series/{series_id}", response_model=SeriesBasicInfo)
def read_series_detail(series_id: str) -> dict:
    series = get_series(series_id)
    if series is None:
        raise HTTPException(status_code=404, detail="Product series not found")
    return series


@app.put("/api/series/{series_id}", response_model=SeriesBasicInfo)
def save_series_detail(series_id: str, payload: SeriesBasicInfoUpdate) -> dict:
    series = update_series(series_id, payload.model_dump())
    if series is None:
        raise HTTPException(status_code=404, detail="Product series not found")
    return series
