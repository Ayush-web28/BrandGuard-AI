from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router as api_router

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
