from app.services.vault import vault_service
from app.services.graphrag import policy_graph_service
from app.models.schemas import ContentFormat, Severity

def test_graphrag_detects_forbidden_terms_and_citations():
    brand = vault_service.get_brand("inkloom")
    assert brand is not None

    test_copy = "Our game-changer AI is a revolutionary silver bullet with zero downtime."
    issues = policy_graph_service.scan_text_with_graph(test_copy, brand, ContentFormat.SOCIAL_POST)

    assert len(issues) >= 3
    
    # Check that citations are present
    rule_ids = [issue.rule_id for issue in issues]
    assert "INK-TONE-01" in rule_ids
    assert "INK-CLAIM-01" in rule_ids

    # Check suggested fixes exist and are intent-preserving
    fixes = [issue.suggested_fix for issue in issues]
    assert any("effective solution" in f or "advanced" in f for f in fixes)

def test_graphrag_detects_missing_regulatory_disclosure():
    brand = vault_service.get_brand("inkloom")
    press_release = "Inkloom AI announces general availability of BrandGuard AI for global teams."
    
    issues = policy_graph_service.scan_text_with_graph(press_release, brand, ContentFormat.PRESS_RELEASE)
    disc_issues = [i for i in issues if i.rule_id == "INK-REG-01"]
    
    assert len(disc_issues) >= 1
    assert any("Generated with AI assistance" in i.suggested_fix for i in disc_issues)
