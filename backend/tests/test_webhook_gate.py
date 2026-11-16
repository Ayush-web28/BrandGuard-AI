from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_cms_publish_gate_blocks_violating_post():
    payload = {
        "cms_source": "webflow",
        "brand_id": "inkloom",
        "post_id": "post-9821",
        "title": "Introducing our revolutionary brandguard ai platform",
        "body_markdown": "This game-changer AI tool is the only platform that guarantees 100% bug-free marketing.",
        "target_channel": "production",
        "author_email": "marketing@inkloom.ai"
    }
    response = client.post("/api/webhook/publish-gate", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["allowed"] is False
    assert data["status"] == "GOVERNANCE_BLOCKED"
    assert data["critical_violations_count"] >= 1
    assert len(data["blocking_reasons"]) >= 1
    assert data["audit_certificate_token"] is None

def test_cms_publish_gate_approves_compliant_post():
    payload = {
        "cms_source": "ghost",
        "brand_id": "inkloom",
        "post_id": "post-9822",
        "title": "Enhancing Content Velocity with BrandGuard AI",
        "body_markdown": "BrandGuard AI provides verifiable brand governance across enterprise pipelines with sub-50ms latency.\n\n*Disclosure: Generated with AI assistance and verified by human review.*",
        "target_channel": "production",
        "author_email": "editorial@inkloom.ai"
    }
    response = client.post("/api/webhook/publish-gate", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["allowed"] is True
    assert data["status"] == "CERTIFIED_APPROVED"
    assert data["critical_violations_count"] == 0
    assert data["audit_certificate_token"].startswith("CERT-BGAI-")
