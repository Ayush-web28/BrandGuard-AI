from app.services.vault import vault_service
from app.services.claim_verifier import claim_verifier_service
from app.models.schemas import Severity, GuidelineCategory

def test_claim_verifier_catches_unsubstantiated_superlatives():
    brand = vault_service.get_brand("inkloom")
    assert brand is not None

    test_copy = "BrandGuard AI is the only platform that guarantees 100% bug-free performance."
    issues = claim_verifier_service.verify_claims(test_copy, brand)

    assert len(issues) >= 2
    for issue in issues:
        assert issue.category == GuidelineCategory.FACTUAL_CLAIM
        assert issue.severity == Severity.CRITICAL
        assert issue.source_citation is not None
        assert issue.suggested_fix is not None

def test_claim_verifier_flags_unverified_pricing():
    brand = vault_service.get_brand("inkloom")
    # Official approved price is $499/mo; $99/mo should be flagged
    test_copy = "Get started today for only $99/mo with our enterprise license."
    issues = claim_verifier_service.verify_claims(test_copy, brand)

    price_issues = [i for i in issues if "$99/mo" in i.offending_content]
    assert len(price_issues) == 1
    assert "$499/mo" in price_issues[0].suggested_fix
    assert price_issues[0].severity == Severity.CRITICAL
