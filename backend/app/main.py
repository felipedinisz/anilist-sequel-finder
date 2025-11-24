"""
FastAPI Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

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

# Configure CORS - MUST be added before routers
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    max_age=3600,
)

# Include routers
app.include_router(
    auth.router, prefix=f"{settings.API_V1_PREFIX}/auth", tags=["authentication"]
)

# Sequels router
app.include_router(
    sequels_router, prefix=f"{settings.API_V1_PREFIX}/sequels", tags=["sequels"]
)

# Serve static files (Frontend)
# We expect the frontend build to be in the 'static' directory
# In Docker, this is /app/static
# In local dev, static folder won't exist and API will run without serving frontend
import sys
app_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # /app
static_dir = os.path.join(app_root, "static")

# Check if static directory exists and has index.html
has_static = os.path.exists(static_dir) and os.path.exists(os.path.join(static_dir, "index.html"))

if has_static:
    # Mount assets folder
    if os.path.exists(os.path.join(static_dir, "assets")):
        app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")
    
    # Explicit root handler for SPA
    @app.get("/")
    async def root_spa():
        return FileResponse(os.path.join(static_dir, "index.html"))

    # Catch-all for SPA
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # If API request, return 404 (should be handled by routers above, but just in case)
        if full_path.startswith("api/"):
            return {"error": "Not found"}, 404
            
        # Serve index.html for any other path (SPA routing)
        index_path = os.path.join(static_dir, "index.html")
        return FileResponse(index_path)

else:
    @app.get("/")
    async def root():
        """Root endpoint (Development mode or missing build)"""
        return {
            "message": "Welcome to AniList Sequel Finder API",
            "version": "1.0.0",
            "docs": "/docs",
            "status": "Frontend build not found",
            "search_path": static_dir,
            "cwd": os.getcwd()
        }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.get("/debug/config")
async def debug_config():
    """Debug endpoint - shows current configuration"""
    if not settings.DEBUG:
        return {"error": "Debug endpoint only available in development mode"}, 403
    
    return {
        "cors_origins": settings.CORS_ORIGINS,
        "cors_origins_type": str(type(settings.CORS_ORIGINS)),
        "app_env": settings.APP_ENV,
        "debug": settings.DEBUG,
        "static_dir": static_dir,
        "has_static": has_static,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG
    )
