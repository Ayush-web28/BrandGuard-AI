from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_list_brands():
    response = client.get("/api/brands")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
    brand_ids = [b["brand_id"] for b in data]
    assert "inkloom" in brand_ids
    assert "techcorp" in brand_ids

def test_end_to_end_content_scan_and_review():
    # Submit off-brand marketing post
    payload = {
        "brand_id": "inkloom",
        "format": "social_post",
        "content_text": "Our game-changer brandguard ai platform is the only tool that guarantees 100% bug-free performance.",
        "author": "Ayush (Creator)"
    }
    response = client.post("/api/scan", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    assert data["overall_score"] < 70
    assert len(data["issues"]) >= 3
    assert data["cleaned_diff_text"] is not None
    # Ensure intent-preserving replacements applied in cleaned text
    assert "100% bug-free" not in data["cleaned_diff_text"]

    # Check that a review was generated
    reviews_res = client.get("/api/reviews?brand_id=inkloom")
    assert reviews_res.status_code == 200
    reviews = reviews_res.json()
    assert len(reviews) >= 1
    
    latest_review = reviews[0]
    review_id = latest_review["review_id"]

    # Reviewer approves with comment
    action_payload = {
        "actor_name": "Brand Lead",
        "actor_role": "brand_manager",
        "action": "approve",
        "payload": {"message": "Approved with suggested corrections."}
    }
    action_res = client.post(f"/api/reviews/{review_id}/action", json=action_payload)
    assert action_res.status_code == 200
    assert action_res.json()["status"] == "approved"

def test_analytics_and_ambiguity_radar():
    response = client.get("/api/analytics?brand_id=inkloom")
    assert response.status_code == 200
    data = response.json()
    assert "ambiguity_radar" in data
    assert len(data["ambiguity_radar"]) >= 1
    assert data["total_scans"] >= 1
