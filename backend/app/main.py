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

# Configure CORS
# Using allow_origin_regex to allow all local origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
if os.path.exists(static_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")
    
    # Catch-all for SPA
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # If API request, return 404 (should be handled by routers above, but just in case)
        if full_path.startswith("api/"):
            return {"error": "Not found"}, 404
            
        # Serve index.html for any other path (SPA routing)
        index_path = os.path.join(static_dir, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"error": "Frontend not found"}, 404
else:
    @app.get("/")
    async def root():
        """Root endpoint (Development mode)"""
        return {
            "message": "Welcome to AniList Sequel Finder API",
            "version": "1.0.0",
            "docs": "/docs",
            "note": "Frontend not served in development mode (or static folder missing)"
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
