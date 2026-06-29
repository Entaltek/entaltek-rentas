from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import health, leads, properties
from app.core.config import settings
from app.core.exceptions import unhandled_exception_handler

app = FastAPI(
    title="Entaltek Rentas API",
    version="0.1.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(Exception, unhandled_exception_handler)

app.include_router(health.router)
app.include_router(properties.router, prefix="/api/v1")
app.include_router(leads.router, prefix="/api/v1")

# Serve local media files (only when using local storage backend)
if settings.STORAGE_BACKEND == "local":
    import os

    os.makedirs(settings.STORAGE_LOCAL_DIR, exist_ok=True)
    app.mount("/media", StaticFiles(directory=settings.STORAGE_LOCAL_DIR), name="media")
