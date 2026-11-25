from dataclasses import dataclass
import base64
import os
from typing import Protocol

import httpx


class ImageGenerationError(RuntimeError):
    pass


@dataclass(frozen=True)
class GeneratedImage:
    content: bytes
    extension: str
    provider: str
    model: str


class ImageGenerationProvider(Protocol):
    def generate(self, reference_image: str, prompt: str) -> GeneratedImage: ...


class Seedream45Provider:
    def __init__(self) -> None:
        self.api_key = (
            os.getenv("SEEDREAM_API_KEY", "").strip()
            or os.getenv("LAS_API_KEY", "").strip()
        )
        if not self.api_key:
            raise ImageGenerationError("Seedream API key is not configured")

        self.endpoint = os.getenv(
            "SEEDREAM_API_URL",
            "https://operator.las.cn-beijing.volces.com/api/v1/images/generations",
        ).strip()
        self.model = os.getenv(
            "SEEDREAM_MODEL", "doubao-seedream-4-5-251128"
        ).strip()

    def generate(self, reference_image: str, prompt: str) -> GeneratedImage:
        payload = {
            "model": self.model,
            "prompt": prompt,
            "image": reference_image,
            "size": "2560x1440",
            "sequential_image_generation": "disabled",
            "response_format": "b64_json",
            "watermark": False,
        }
        try:
            with httpx.Client(timeout=180) as client:
                response = client.post(
                    self.endpoint,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                )
        except httpx.HTTPError as error:
            raise ImageGenerationError(
                f"Seedream request failed: {error.__class__.__name__}"
            ) from error

        try:
            body = response.json()
        except ValueError as error:
            raise ImageGenerationError(
                f"Seedream returned HTTP {response.status_code} without JSON"
            ) from error

        if response.is_error:
            error_info = body.get("error") if isinstance(body, dict) else None
            message = (
                error_info.get("message")
                if isinstance(error_info, dict)
                else f"HTTP {response.status_code}"
            )
            raise ImageGenerationError(f"Seedream rejected the request: {message}")

        data = body.get("data") if isinstance(body, dict) else None
        first = data[0] if isinstance(data, list) and data else None
        encoded = first.get("b64_json") if isinstance(first, dict) else None
        if not isinstance(encoded, str) or not encoded:
            raise ImageGenerationError("Seedream returned no generated image")

        try:
            content = base64.b64decode(encoded, validate=True)
        except ValueError as error:
            raise ImageGenerationError("Seedream returned invalid image data") from error

        return GeneratedImage(
            content=content,
            extension=".jpg",
            provider="seedream-4.5",
            model=self.model,
        )


def get_image_generation_provider() -> ImageGenerationProvider:
    provider_name = os.getenv("AI_IMAGE_PROVIDER", "seedream-4.5").strip().lower()
    if provider_name == "seedream-4.5":
        return Seedream45Provider()
    raise ImageGenerationError(f"Unsupported AI image provider: {provider_name}")
