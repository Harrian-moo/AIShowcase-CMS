from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field

from .database import get_series, init_database, list_series, update_series


class SeriesBasicInfo(BaseModel):
    id: str
    name: str
    subtitle: str
    taglineZh: str
    taglineEn: str
    description: str
    updatedAt: str


class SeriesBasicInfoUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=200)
    subtitle: str = Field(default="", max_length=300)
    taglineZh: str = Field(default="", max_length=200)
    taglineEn: str = Field(default="", max_length=200)
    description: str = Field(default="", max_length=5000)


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_database()
    yield


app = FastAPI(title="AI Showcase CMS API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "PUT", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/api/series", response_model=list[SeriesBasicInfo])
def read_series_list() -> list[dict]:
    return list_series()


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
