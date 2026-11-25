from dataclasses import dataclass
import base64
import binascii
import json
import os
import time
from typing import Any, Protocol


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


class Seedream46Provider:
    def __init__(self) -> None:
        self.ak = os.getenv("SEEDREAM_AK", "").strip() or os.getenv("AK", "").strip()
        self.sk = os.getenv("SEEDREAM_SK", "").strip() or os.getenv("SK", "").strip()
        if not self.ak or not self.sk:
            raise ImageGenerationError("Seedream AK/SK is not configured")

        self.req_key = os.getenv(
            "SEEDREAM_REQ_KEY", "jimeng_seedream46_cvtob"
        ).strip()
        self.timeout_seconds = _read_positive_int("SEEDREAM_TIMEOUT_SECONDS", 180)
        self.poll_interval_seconds = _read_positive_int(
            "SEEDREAM_POLL_INTERVAL_SECONDS", 3
        )

        try:
            from volcengine.visual.VisualService import VisualService
        except ImportError as error:
            raise ImageGenerationError(
                "Seedream SDK is not installed; install backend requirements"
            ) from error

        self.service = VisualService()
        self.service.set_scheme("https")
        self.service.set_connection_timeout(30)
        self.service.set_socket_timeout(120)
        self.service.set_ak(self.ak)
        self.service.set_sk(self.sk)

        proxy_url = os.getenv("SEEDREAM_PROXY_URL", "").strip()
        if proxy_url:
            self.service.session.trust_env = False
            self.service.session.proxies = {
                "http": proxy_url,
                "https": proxy_url,
            }

    def generate(self, reference_image: str, prompt: str) -> GeneratedImage:
        if reference_image.startswith("data:"):
            raise ImageGenerationError(
                "Seedream 4.6 requires a publicly accessible reference image URL"
            )

        submit_form: dict[str, Any] = {
            "req_key": self.req_key,
            "image_urls": [reference_image],
            "prompt": prompt,
            "width": 2560,
            "height": 1440,
            "scale": 30,
            "force_single": True,
        }

        try:
            response = self.service.cv_sync2async_submit_task(submit_form)
        except Exception as error:
            raise ImageGenerationError(
                f"Seedream task submission failed: {error.__class__.__name__}"
            ) from error

        _ensure_success(response, "task submission")
        data = response.get("data")
        task_id = data.get("task_id") if isinstance(data, dict) else None
        if not isinstance(task_id, str) or not task_id:
            raise ImageGenerationError("Seedream returned no task ID")

        deadline = time.monotonic() + self.timeout_seconds
        query_form = {
            "req_key": self.req_key,
            "task_id": task_id,
            "req_json": json.dumps({"return_url": False}),
        }

        while time.monotonic() < deadline:
            try:
                result = self.service.cv_sync2async_get_result(query_form)
            except Exception as error:
                raise ImageGenerationError(
                    f"Seedream result query failed: {error.__class__.__name__}"
                ) from error

            _ensure_success(result, "result query")
            result_data = result.get("data")
            if not isinstance(result_data, dict):
                raise ImageGenerationError("Seedream returned invalid result data")

            status = result_data.get("status")
            if status == "done":
                return self._decode_result(result_data)
            if status in {"not_found", "expired"}:
                raise ImageGenerationError(f"Seedream task ended with status: {status}")

            time.sleep(self.poll_interval_seconds)

        raise ImageGenerationError(
            f"Seedream generation timed out after {self.timeout_seconds} seconds"
        )

    def _decode_result(self, data: dict[str, Any]) -> GeneratedImage:
        images = data.get("binary_data_base64")
        encoded = images[0] if isinstance(images, list) and images else None
        if not isinstance(encoded, str) or not encoded:
            raise ImageGenerationError("Seedream returned no generated image")

        if encoded.startswith("data:image"):
            _, encoded = encoded.split(",", 1)

        try:
            content = base64.b64decode(encoded, validate=True)
        except (binascii.Error, ValueError) as error:
            raise ImageGenerationError("Seedream returned invalid image data") from error

        return GeneratedImage(
            content=content,
            extension=".png",
            provider="seedream-4.6",
            model=self.req_key,
        )


def _read_positive_int(name: str, default: int) -> int:
    raw_value = os.getenv(name, str(default)).strip()
    try:
        value = int(raw_value)
    except ValueError as error:
        raise ImageGenerationError(f"{name} must be an integer") from error
    if value <= 0:
        raise ImageGenerationError(f"{name} must be greater than zero")
    return value


def _ensure_success(response: Any, operation: str) -> None:
    if not isinstance(response, dict):
        raise ImageGenerationError(f"Seedream returned invalid {operation} response")
    if response.get("code") == 10000:
        return

    message = response.get("message") or response.get("msg") or "unknown error"
    raise ImageGenerationError(f"Seedream {operation} failed: {message}")


def get_image_generation_provider() -> ImageGenerationProvider:
    provider_name = os.getenv("AI_IMAGE_PROVIDER", "seedream-4.6").strip().lower()
    if provider_name in {"seedream-4.6", "seedream46"}:
        return Seedream46Provider()
    raise ImageGenerationError(f"Unsupported AI image provider: {provider_name}")
