"""
FastAPI Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1 import auth
from app.api.v1.sequels import router as sequels_router

# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
    version="1.0.0",
    description="Find missing anime sequels from your AniList account",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Note: Static files and templates commented out until frontend is ready
# app.mount("/static", StaticFiles(directory="../frontend/static"), name="static")
# templates = Jinja2Templates(directory="../frontend/templates")

# Include routers
app.include_router(
    auth.router, prefix=f"{settings.API_V1_PREFIX}/auth", tags=["authentication"]
)

# Sequels router
app.include_router(
    sequels_router, prefix=f"{settings.API_V1_PREFIX}/sequels", tags=["sequels"]
)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to AniList Sequel Finder API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG
    )
