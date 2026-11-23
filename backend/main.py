from contextlib import asynccontextmanager
import os
from pathlib import Path
from typing import Literal
from uuid import uuid4

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from poof import (
    AuthError,
    PaymentRequiredError,
    Poof,
    PoofError,
    RateLimitError,
    ValidationError,
)
from pydantic import BaseModel, ConfigDict, Field
from starlette.concurrency import run_in_threadpool

from .database import (
    create_series,
    create_sku,
    delete_sku,
    get_series,
    init_database,
    list_series,
    list_skus,
    update_series,
    update_sku,
)


BACKEND_DIR = Path(__file__).resolve().parent
load_dotenv(BACKEND_DIR / ".env")


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


class SkuInfo(BaseModel):
    id: str
    seriesId: str
    skuCode: str
    name: str
    englishName: str
    volume: str
    abv: str
    price: str
    packaging: str
    shelfSlot: str
    status: Literal["active", "inactive"]
    sortOrder: int
    highlight: str
    description: str
    servingSuggestion: str
    imageUrl: str
    updatedAt: str


class SkuPayload(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    skuCode: str = Field(min_length=1, max_length=100)
    name: str = Field(min_length=1, max_length=300)
    englishName: str = Field(default="", max_length=300)
    volume: str = Field(default="", max_length=100)
    abv: str = Field(default="", max_length=100)
    price: str = Field(default="", max_length=100)
    packaging: str = Field(default="", max_length=200)
    shelfSlot: str = Field(default="", max_length=100)
    status: Literal["active", "inactive"] = "active"
    sortOrder: int = Field(default=0, ge=0)
    highlight: str = Field(default="", max_length=1000)
    description: str = Field(default="", max_length=5000)
    servingSuggestion: str = Field(default="", max_length=2000)
    imageUrl: str = ""


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

UPLOADS_DIR = BACKEND_DIR / "data" / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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


def generate_standard_showcase_image(content: bytes) -> bytes:
    api_key = os.getenv("POOF_API_KEY", "").strip()
    if not api_key:
        raise HTTPException(status_code=503, detail="POOF_API_KEY is not configured")

    base_url = os.getenv("POOF_API_BASE_URL", "https://api.poof.bg/v1").strip()
    with Poof(api_key=api_key, base_url=base_url, timeout=90) as client:
        result = client.remove_background(
            content,
            format="png",
            channels="rgb",
            bg_color="#ffffff",
            crop=True,
            padding="8%",
            width=900,
            height=1200,
            fit="contain",
        )
    return bytes(result)


@app.post("/api/media/standard-showcase", response_model=UploadMediaResult, status_code=201)
async def create_standard_showcase_image(
    request: Request, file: UploadFile = File(...)
) -> dict[str, str]:
    content = await file.read()
    if len(content) > 20 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image file must not exceed 20 MB")
    if detect_image_extension(content) is None:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, WebP and GIF images are supported")

    try:
        processed = await run_in_threadpool(generate_standard_showcase_image, content)
    except HTTPException:
        raise
    except AuthError as error:
        raise HTTPException(status_code=502, detail="POOF API authentication failed") from error
    except PaymentRequiredError as error:
        raise HTTPException(status_code=402, detail="POOF credits are insufficient") from error
    except RateLimitError as error:
        raise HTTPException(status_code=429, detail="POOF request limit reached; please retry later") from error
    except ValidationError as error:
        raise HTTPException(status_code=400, detail=f"POOF rejected the image: {error.message}") from error
    except PoofError as error:
        raise HTTPException(status_code=502, detail=f"POOF processing failed: {error.message}") from error

    stored_name = f"{uuid4().hex}.png"
    (UPLOADS_DIR / stored_name).write_bytes(processed)
    base_url = str(request.base_url).rstrip("/")
    return {
        "url": f"{base_url}/uploads/{stored_name}",
        "filename": f"standard-{Path(file.filename or stored_name).stem}.png",
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


@app.get("/api/series/{series_id}/skus", response_model=list[SkuInfo])
def read_sku_list(series_id: str) -> list[dict]:
    if get_series(series_id) is None:
        raise HTTPException(status_code=404, detail="Product series not found")
    return list_skus(series_id)


@app.post("/api/series/{series_id}/skus", response_model=SkuInfo, status_code=201)
def create_sku_item(series_id: str, payload: SkuPayload) -> dict:
    if get_series(series_id) is None:
        raise HTTPException(status_code=404, detail="Product series not found")
    return create_sku(series_id, payload.model_dump())


@app.put("/api/series/{series_id}/skus/{sku_id}", response_model=SkuInfo)
def save_sku_item(series_id: str, sku_id: str, payload: SkuPayload) -> dict:
    sku = update_sku(series_id, sku_id, payload.model_dump())
    if sku is None:
        raise HTTPException(status_code=404, detail="SKU not found")
    return sku


@app.delete("/api/series/{series_id}/skus/{sku_id}", status_code=204)
def remove_sku_item(series_id: str, sku_id: str) -> None:
    if not delete_sku(series_id, sku_id):
        raise HTTPException(status_code=404, detail="SKU not found")
