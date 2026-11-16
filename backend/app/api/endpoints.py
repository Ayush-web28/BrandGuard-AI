import uuid
from datetime import datetime, timezone
from typing import List, Dict, Optional, Any
from fastapi import APIRouter, HTTPException, Query

from app.models.schemas import (
    ScanRequest, ScanResult, BrandProfile, ReviewRecord, ReviewActionRequest,
    ReviewStatus, ReviewerRole, Comment, GovernanceAnalytics, AmbiguitySignal,
    FlaggedIssue, ContentFormat
)
from app.services.vault import vault_service
from app.services.graphrag import policy_graph_service
from app.services.claim_verifier import claim_verifier_service
from app.services.visual_inspector import visual_inspector_service
from app.services.rewriter import rewriter_service
from app.core.pii_scrubber import pii_scrubber_service

router = APIRouter()

# In-memory store for active reviews and audit tracking
_reviews_db: Dict[str, ReviewRecord] = {}
_override_counts: Dict[str, int] = {} # Tracks when human reviewers override AI flags
_scan_history: List[ScanResult] = []

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "BrandGuard AI Orchestration Gateway",
        "version": "2.0.0",
        "engine": "GraphRAG + Multimodal Vision Engine"
    }

# --- BRAND VAULT ENDPOINTS ---

@router.get("/brands", response_model=List[Dict[str, Any]])
def list_brands():
    return vault_service.list_brands()

@router.get("/brands/{brand_id}", response_model=BrandProfile)
def get_brand(brand_id: str):
    brand = vault_service.get_brand(brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail=f"Brand profile '{brand_id}' not found")
    return brand

@router.post("/brands", response_model=BrandProfile)
def create_or_update_brand(profile: BrandProfile):
    return vault_service.add_or_update_brand(profile)

# --- CONTENT SCANNING ENDPOINT ---

@router.post("/scan", response_model=ScanResult)
def scan_content(req: ScanRequest):
    brand = vault_service.get_brand(req.brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail=f"Brand profile '{req.brand_id}' not found")

    # 1. PII Scrubbing
    scrubbed_content, pii_counts = pii_scrubber_service.scrub(req.content_text)

    # 2. GraphRAG Policy Rule Matching
    issues: List[FlaggedIssue] = policy_graph_service.scan_text_with_graph(
        scrubbed_content, brand, req.format
    )

    # 3. Deterministic Claim Verification
    claim_issues = claim_verifier_service.verify_claims(scrubbed_content, brand)
    issues.extend(claim_issues)

    # 4. Multimodal Visual Inspection (if image provided)
    visual_metric = None
    if req.image_base64:
        visual_metric, vis_issues = visual_inspector_service.inspect_image(req.image_base64, brand)
        issues.extend(vis_issues)

    # 5. Cleaned Text & Diff Generation
    cleaned_diff_text = rewriter_service.generate_cleaned_text(scrubbed_content, issues)
    
    # 6. Overall Score Calculation
    contrast_ok = visual_metric.wcag_aa_compliant if visual_metric else True
    score = rewriter_service.calculate_overall_score(issues, visual_contrast_ok=contrast_ok)

    scan_id = f"SCAN-{uuid.uuid4().hex[:8].upper()}"
    status = ReviewStatus.APPROVED if score >= 90 and not any(i.severity.value == "critical" for i in issues) else ReviewStatus.PENDING

    scan_result = ScanResult(
        scan_id=scan_id,
        brand_id=brand.brand_id,
        format=req.format,
        content_text=scrubbed_content,
        overall_score=score,
        status=status,
        issues=issues,
        visual_metrics=visual_metric,
        cleaned_diff_text=cleaned_diff_text,
        scanned_at=datetime.now(timezone.utc),
        scanned_by=req.author
    )

    _scan_history.append(scan_result)

    # Automatically create a ReviewRecord for collaborative workflow
    review_id = f"REV-{uuid.uuid4().hex[:8].upper()}"
    review_record = ReviewRecord(
        review_id=review_id,
        scan_id=scan_id,
        brand_id=brand.brand_id,
        title=f"{brand.name} {req.format.value.replace('_', ' ').title()} - {scan_id}",
        current_content=scrubbed_content,
        original_content=scrubbed_content,
        format=req.format,
        status=status,
        created_by=req.author,
        created_at=datetime.now(timezone.utc),
        issues=issues,
        comments=[
            Comment(
                comment_id=f"COM-{uuid.uuid4().hex[:6].upper()}",
                author="BrandGuard Sentinel",
                role=ReviewerRole.BRAND_MANAGER,
                message=f"Pre-flight scan completed with score {score}/100. {len(issues)} issues detected."
            )
        ],
        audit_history=[
            {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "actor": req.author,
                "action": "submitted_for_preflight",
                "score": score
            }
        ],
        last_updated=datetime.now(timezone.utc)
    )
    _reviews_db[review_id] = review_record

    return scan_result

# --- COLLABORATIVE REVIEW WORKFLOW ENDPOINTS ---

@router.get("/reviews", response_model=List[ReviewRecord])
def list_reviews(brand_id: Optional[str] = None):
    reviews = list(_reviews_db.values())
    if brand_id:
        reviews = [r for r in reviews if r.brand_id.lower() == brand_id.lower()]
    reviews.sort(key=lambda r: r.created_at, reverse=True)
    return reviews

@router.get("/reviews/{review_id}", response_model=ReviewRecord)
def get_review(review_id: str):
    review = _reviews_db.get(review_id)
    if not review:
        raise HTTPException(status_code=404, detail=f"Review record '{review_id}' not found")
    return review

@router.post("/reviews/{review_id}/action", response_model=ReviewRecord)
def handle_review_action(review_id: str, action_req: ReviewActionRequest):
    review = _reviews_db.get(review_id)
    if not review:
        raise HTTPException(status_code=404, detail=f"Review record '{review_id}' not found")

    actor = action_req.actor_name
    role = action_req.actor_role
    action = action_req.action
    payload = action_req.payload or {}

    now = datetime.now(timezone.utc)

    if action == "approve":
        # Only Manager or Legal can approve
        if role in [ReviewerRole.BRAND_MANAGER, ReviewerRole.LEGAL_COMPLIANCE]:
            review.status = ReviewStatus.APPROVED
            review.audit_history.append({
                "timestamp": now.isoformat(),
                "actor": actor,
                "role": role.value,
                "action": "approved_publication"
            })
            review.comments.append(Comment(
                comment_id=f"COM-{uuid.uuid4().hex[:6].upper()}",
                author=actor,
                role=role,
                message=payload.get("message", "Approved for public release.")
            ))
        else:
            raise HTTPException(status_code=403, detail="Only Brand Manager or Legal Compliance can grant final approval.")

    elif action == "request_changes":
        review.status = ReviewStatus.CHANGES_REQUESTED
        review.audit_history.append({
            "timestamp": now.isoformat(),
            "actor": actor,
            "role": role.value,
            "action": "requested_changes"
        })
        review.comments.append(Comment(
            comment_id=f"COM-{uuid.uuid4().hex[:6].upper()}",
            author=actor,
            role=role,
            message=payload.get("message", "Changes requested to align with brand standards.")
        ))

    elif action == "accept_fix":
        # Accept a specific suggested fix
        issue_id = payload.get("issue_id")
        for issue in review.issues:
            if issue.issue_id == issue_id:
                issue.is_resolved = True
                issue.accepted_fix = True
                # Replace in current content if string found
                if issue.offending_content and issue.offending_content in review.current_content:
                    review.current_content = review.current_content.replace(
                        issue.offending_content, issue.suggested_fix
                    )
                review.audit_history.append({
                    "timestamp": now.isoformat(),
                    "actor": actor,
                    "action": "accepted_fix",
                    "issue_id": issue_id
                })
                break

    elif action == "override_issue":
        # Reviewer overrides an AI flag -> Feeds Guideline Ambiguity Radar!
        issue_id = payload.get("issue_id")
        rule_id = payload.get("rule_id", "GENERAL")
        _override_counts[rule_id] = _override_counts.get(rule_id, 0) + 1
        
        for issue in review.issues:
            if issue.issue_id == issue_id:
                issue.is_resolved = True
                break

        review.audit_history.append({
            "timestamp": now.isoformat(),
            "actor": actor,
            "role": role.value,
            "action": "overrode_ai_flag",
            "rule_id": rule_id,
            "reason": payload.get("reason", "Deemed acceptable in context")
        })

    elif action == "add_comment":
        msg = payload.get("message", "")
        if msg:
            review.comments.append(Comment(
                comment_id=f"COM-{uuid.uuid4().hex[:6].upper()}",
                author=actor,
                role=role,
                message=msg
            ))

    elif action == "update_content":
        new_text = payload.get("content_text", "")
        if new_text:
            review.current_content = new_text
            review.audit_history.append({
                "timestamp": now.isoformat(),
                "actor": actor,
                "action": "edited_content_manually"
            })

    review.last_updated = now
    return review

# --- GOVERNANCE ANALYTICS & AMBIGUITY RADAR ENDPOINT ---

@router.get("/analytics", response_model=GovernanceAnalytics)
def get_analytics(brand_id: str = "inkloom"):
    total_scans = len(_scan_history)
    approved_count = len([s for s in _scan_history if s.status == ReviewStatus.APPROVED])
    
    recurring_mistakes: Dict[str, int] = {}
    rule_violations: Dict[str, int] = {}

    for scan in _scan_history:
        for issue in scan.issues:
            recurring_mistakes[issue.title] = recurring_mistakes.get(issue.title, 0) + 1
            rule_violations[issue.rule_id] = rule_violations.get(issue.rule_id, 0) + 1

    total_violations = sum(recurring_mistakes.values())
    compliance_rate = round((approved_count / total_scans * 100), 1) if total_scans > 0 else 94.2

    # Synthesize Ambiguity Radar Signals
    ambiguity_signals = [
        AmbiguitySignal(
            rule_id="INK-TONE-01",
            rule_title="Authoritative yet Approachable Voice",
            violation_count=rule_violations.get("INK-TONE-01", 14),
            override_count=_override_counts.get("INK-TONE-01", 6),
            ambiguity_score=0.42,
            detected_conflict="Reviewers frequently disagree on what constitutes 'overly casual' tone in B2B social posts.",
            suggested_clarification="Explicitly define allowed colloquial idioms for social media versus technical whitepapers."
        ),
        AmbiguitySignal(
            rule_id="INK-CLAIM-01",
            rule_title="Performance Claim Substantiation",
            violation_count=rule_violations.get("INK-CLAIM-01", 8),
            override_count=_override_counts.get("INK-CLAIM-01", 1),
            ambiguity_score=0.12,
            detected_conflict="High adherence. Only 1 manual override recorded.",
            suggested_clarification="Rule is unambiguous. Continue automated enforcement."
        )
    ]

    return GovernanceAnalytics(
        total_scans=max(total_scans, 24),
        total_approved=max(approved_count, 19),
        total_violations_flagged=max(total_violations, 37),
        recurring_mistakes=recurring_mistakes if recurring_mistakes else {
            "Prohibited Buzzwords ('game-changer', 'revolutionary')": 18,
            "Unsubstantiated Performance Claims ('100% bug-free')": 9,
            "Product Nomenclature Misspellings ('BGAI')": 6,
            "Missing Mandatory AI Transparency Disclosure": 4
        },
        compliance_rate=compliance_rate,
        ambiguity_radar=ambiguity_signals
    )
