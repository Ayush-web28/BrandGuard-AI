import pytest
from app.services.vault import vault_service
from app.services.graphrag import policy_graph_service

def test_hierarchical_policy_inheritance_eu():
    # Fetch effective profile for European subsidiary
    eu_brand = vault_service.get_effective_brand_profile("inkloom-eu")
    assert eu_brand is not None
    assert eu_brand.parent_brand_id == "inkloom"
    assert eu_brand.region_code == "EU"
    
    # Check that EU rules + inherited global rules are present
    rule_ids = [r.rule_id for r in eu_brand.rules]
    assert "EU-AIACT-01" in rule_ids # Regional statutory rule
    assert "EU-GDPR-01" in rule_ids   # Regional statutory rule
    assert "INK-TONE-01" in rule_ids  # Inherited global parent rule
    assert "INK-CLAIM-01" in rule_ids # Inherited global parent rule
    assert eu_brand.inherited_rules_count >= 5

def test_hierarchical_policy_inheritance_us():
    us_brand = vault_service.get_effective_brand_profile("inkloom-us")
    assert us_brand is not None
    assert us_brand.parent_brand_id == "inkloom"
    assert us_brand.region_code == "US"
    
    rule_ids = [r.rule_id for r in us_brand.rules]
    assert "US-FTC-01" in rule_ids    # FTC Endorsement Rule
    assert "INK-TONE-01" in rule_ids  # Inherited Global Rule

def test_brand_hierarchy_tree_structure():
    tree = vault_service.get_brand_hierarchy()
    assert len(tree) >= 1
    
    # Find inkloom root node
    inkloom_root = next((n for n in tree if n.brand_id == "inkloom"), None)
    assert inkloom_root is not None
    assert len(inkloom_root.children) >= 2 # US and EU children
    
    child_ids = [c.brand_id for c in inkloom_root.children]
    assert "inkloom-us" in child_ids
    assert "inkloom-eu" in child_ids
