"""
API KYB — capa backend (validación, persistencia, integraciones).
El front (Next.js) vive en ../web y consume este servicio en desarrollo en :8000.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="KYB Onboarding API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "kyb-api"}


@app.post("/api/v1/onboarding/draft")
def save_draft(payload: dict):
    """Placeholder: aquí guardarías borrador (DB, S3, CRM)."""
    return {"received": True, "keys": list(payload.keys())}
