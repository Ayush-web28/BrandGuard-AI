import uuid
import hmac
import hashlib
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Header, Request

from app.models.schemas import ScanRequest, ContentFormat, Severity
from app.services.vault import vault_service
from app.services.graphrag import policy_graph_service
from app.services.claim_verifier import claim_verifier_service
from app.services.rewriter import rewriter_service

webhook_router = APIRouter()

class CMSPublishWebhookPayload(BaseModel):
    cms_source: str = "webflow" # webflow, wordpress, notion, strapi
    brand_id: str = "inkloom"
    post_id: str
    title: str
    body_markdown: str
    target_channel: str = "production"
    author_email: str

class CMSPublishDecisionResponse(BaseModel):
    allowed: bool
    status: str # "CERTIFIED_APPROVED" or "GOVERNANCE_BLOCKED"
    brand_score: int
    critical_violations_count: int
    blocking_reasons: List[str]
    suggested_remediations: List[Dict[str, str]]
    audit_certificate_token: Optional[str] = None
    evaluated_at: str

@webhook_router.post("/publish-gate", response_model=CMSPublishDecisionResponse)
def evaluate_cms_publish_gate(payload: CMSPublishWebhookPayload):
    """
    Named Improvement #3: Pre-Publish Webhook Gateway for Headless CMS & CI/CD Pipelines.
    Enforces automated brand governance before content flips to 'Published' status in external CMS platforms.
    """
    brand = vault_service.get_brand(payload.brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail=f"Brand profile '{payload.brand_id}' not found")

    content = f"{payload.title}\n\n{payload.body_markdown}"

    # Run GraphRAG policy checks
    issues = policy_graph_service.scan_text_with_graph(content, brand, ContentFormat.DOCUMENT)
    
    # Run deterministic claim verification
    claim_issues = claim_verifier_service.verify_claims(content, brand)
    issues.extend(claim_issues)

    critical_issues = [i for i in issues if i.severity == Severity.CRITICAL]
    warning_issues = [i for i in issues if i.severity == Severity.WARNING]

    score = rewriter_service.calculate_overall_score(issues)
    is_allowed = score >= 85 and len(critical_issues) == 0

    now_iso = datetime.now(timezone.utc).isoformat()

    if is_allowed:
        # Generate cryptographically verifiable compliance audit token
        token_seed = f"{payload.brand_id}:{payload.post_id}:{score}:{now_iso}"
        audit_token = f"CERT-BGAI-{hashlib.sha256(token_seed.encode()).hexdigest()[:24].upper()}"

        return CMSPublishDecisionResponse(
            allowed=True,
            status="CERTIFIED_APPROVED",
            brand_score=score,
            critical_violations_count=0,
            blocking_reasons=[],
            suggested_remediations=[],
            audit_certificate_token=audit_token,
            evaluated_at=now_iso
        )
    else:
        blocking_reasons = [
            f"[{i.rule_id}] {i.title}: {i.explanation}"
            for i in critical_issues
        ]
        remediations = [
            {"offending": i.offending_content, "suggested_fix": i.suggested_fix, "citation": i.source_citation}
            for i in issues[:5]
        ]

        return CMSPublishDecisionResponse(
            allowed=False,
            status="GOVERNANCE_BLOCKED",
            brand_score=score,
            critical_violations_count=len(critical_issues),
            blocking_reasons=blocking_reasons,
            suggested_remediations=remediations,
            audit_certificate_token=None,
            evaluated_at=now_iso
        )
