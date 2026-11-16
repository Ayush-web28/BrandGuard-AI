import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.api.endpoints import router as api_router
from app.api.webhook_gate import webhook_router

app = FastAPI(
    title="BrandGuard AI — Governance & Pre-Flight API Gateway",
    description="Intelligent Multimodal Brand Governance & Policy Knowledge Graph Platform",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Allow Cross-Origin Requests from Next.js or external CMS webhooks
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register REST endpoints under /api
app.include_router(api_router, prefix="/api")
app.include_router(webhook_router, prefix="/api/webhook")

# Serve frontend build if dist folder exists
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../frontend/dist"))
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "platform": "BrandGuard AI",
            "description": "Pre-flight Multimodal Brand Governance Gateway",
            "team": "ZeroToOne",
            "author": "Ayush Trivedi",
            "docs": "/docs",
            "status": "online"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
