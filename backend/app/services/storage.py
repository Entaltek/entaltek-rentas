"""
Storage abstraction layer.

Current implementation: local filesystem.
Swap STORAGE_BACKEND env var to enable S3/R2/Supabase Storage without changing callers.

TODO: implement S3StorageBackend, R2StorageBackend, SupabaseStorageBackend
      when cloud storage is required.
"""

import contextlib
import uuid
from pathlib import Path

import aiofiles

from app.core.config import settings
from app.core.exceptions import StorageError, ValidationError


def _validate_image(filename: str, size: int) -> str:
    """Return sanitized filename extension or raise."""
    if size > settings.IMAGE_MAX_SIZE_BYTES:
        raise ValidationError(
            f"Image exceeds maximum size of {settings.IMAGE_MAX_SIZE_BYTES // (1024 * 1024)} MB."
        )
    ext = Path(filename).suffix.lstrip(".").lower()
    if ext not in settings.IMAGE_ALLOWED_EXTENSIONS:
        allowed = ", ".join(sorted(settings.IMAGE_ALLOWED_EXTENSIONS))
        raise ValidationError(f"File type '.{ext}' not allowed. Allowed: {allowed}.")
    return ext


class LocalStorageBackend:
    def __init__(self) -> None:
        self._base_dir = Path(settings.STORAGE_LOCAL_DIR)
        self._base_url = settings.STORAGE_BASE_URL.rstrip("/")

    def _ensure_dir(self, path: Path) -> None:
        path.mkdir(parents=True, exist_ok=True)

    async def save(self, data: bytes, filename: str, folder: str = "") -> str:
        ext = _validate_image(filename, len(data))
        dest_dir = self._base_dir / folder
        self._ensure_dir(dest_dir)
        unique_name = f"{uuid.uuid4().hex}.{ext}"
        dest_path = dest_dir / unique_name
        try:
            async with aiofiles.open(dest_path, "wb") as f:
                await f.write(data)
        except OSError as exc:
            raise StorageError("Could not save image.") from exc
        rel = f"{folder}/{unique_name}" if folder else unique_name
        return f"{self._base_url}/{rel}"

    async def delete(self, url: str) -> None:
        rel = url.removeprefix(self._base_url).lstrip("/")
        target = self._base_dir / rel
        with contextlib.suppress(OSError):
            target.unlink(missing_ok=True)


def get_storage() -> LocalStorageBackend:
    """
    Factory — extend with match/case on settings.STORAGE_BACKEND
    when S3/R2/Supabase backends are implemented.
    """
    # TODO: match settings.STORAGE_BACKEND:
    #     case "s3": return S3StorageBackend()
    #     case "r2": return R2StorageBackend()
    #     case "supabase": return SupabaseStorageBackend()
    return LocalStorageBackend()
