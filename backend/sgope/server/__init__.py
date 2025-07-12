from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from sgope.server.routes import router
from sgope.server.sse import sse_router
from sgope.server.websocket import websocket_router


def create_app() -> FastAPI:
    """Create and configure the FastAPI application"""
    app = FastAPI(
        title="sgope API",
        description="Real-time file and action suggestion API with SSE streaming",
        version="0.1.0"
    )
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include routers
    app.include_router(router, prefix="/api")
    app.include_router(websocket_router)
    app.include_router(sse_router, prefix="/api")
    
    return app
