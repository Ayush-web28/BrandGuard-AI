from app.services.vault import vault_service
from app.services.graphrag import policy_graph_service
from app.services.claim_verifier import claim_verifier_service
from app.services.rewriter import rewriter_service
from app.models.schemas import ContentFormat

def test_rewriter_generates_compliant_cleaned_text():
    brand = vault_service.get_brand("inkloom")
    original = "Our game-changer AI is the only platform that guarantees 100% bug-free performance."
    
    # Gather issues from GraphRAG and ClaimVerifier
    issues = policy_graph_service.scan_text_with_graph(original, brand, ContentFormat.SOCIAL_POST)
    issues.extend(claim_verifier_service.verify_claims(original, brand))

    cleaned = rewriter_service.generate_cleaned_text(original, issues)
    
    # Ensure forbidden phrases were removed
    assert "game-changer" not in cleaned
    assert "the only platform" not in cleaned
    assert "100% bug-free" not in cleaned
    
    # Ensure replacements preserve intent
    assert "effective solution" in cleaned or "advanced" in cleaned or "leading enterprise" in cleaned
    
    # Check score deduction
    score = rewriter_service.calculate_overall_score(issues)
    assert score < 70 # Heavy violations
