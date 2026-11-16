from enum import Enum
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime

class GuidelineCategory(str, Enum):
    TONE = "tone"
    TERMINOLOGY = "terminology"
    FACTUAL_CLAIM = "factual_claim"
    VISUAL = "visual"
    ACCESSIBILITY = "accessibility"
    REGULATORY = "regulatory"

class Severity(str, Enum):
    CRITICAL = "critical"   # Must be fixed before publication
    WARNING = "warning"     # Strongly recommended fix
    INFO = "info"           # Advisory or enhancement

class ContentFormat(str, Enum):
    TEXT = "text"
    SOCIAL_POST = "social_post"
    PRESS_RELEASE = "press_release"
    AD_BANNER = "ad_banner"
    EMAIL = "email"
    DOCUMENT = "document"

class ReviewStatus(str, Enum):
    PENDING = "pending"
    CHANGES_REQUESTED = "changes_requested"
    APPROVED = "approved"
    REJECTED = "rejected"

class ReviewerRole(str, Enum):
    CREATOR = "creator"
    BRAND_MANAGER = "brand_manager"
    LEGAL_COMPLIANCE = "legal_compliance"

# --- BRAND GUIDELINES & ASSETS ---

class Rule(BaseModel):
    rule_id: str
    category: GuidelineCategory
    title: str
    description: str
    severity: Severity = Severity.WARNING
    source_document: str = "Brand Manual v1.0"
    citation_ref: str = "Section 1.0"
    forbidden_terms: List[str] = Field(default_factory=list)
    preferred_terms: Dict[str, str] = Field(default_factory=dict)
    mandatory_disclaimers: List[str] = Field(default_factory=list)
    examples_good: List[str] = Field(default_factory=list)
    examples_bad: List[str] = Field(default_factory=list)

class ApprovedFact(BaseModel):
    fact_id: str
    subject: str
    claim_text: str
    verified_metric: Optional[str] = None
    source_document: str
    citation_ref: str
    is_active: bool = True
    tags: List[str] = Field(default_factory=list)

class DesignTokens(BaseModel):
    primary_color: str = "#4F46E5"        # Indigo
    secondary_color: str = "#06B6D4"      # Cyan
    accent_colors: List[str] = Field(default_factory=lambda: ["#10B981", "#F59E0B"])
    forbidden_colors: List[str] = Field(default_factory=list)
    min_contrast_ratio: float = 4.5       # WCAG AA standard
    logo_aspect_ratio: float = 3.5        # width / height ratio
    logo_min_clear_space_px: int = 16

class ToneProfile(BaseModel):
    voice_description: str = "Empathetic, clear, authoritative, and direct."
    formality_score: float = 0.7          # 0.0 (very casual) to 1.0 (academic/legal)
    confidence_level: float = 0.8         # 0.0 (humble/reserved) to 1.0 (bold/market-leading)
    avoid_buzzwords: List[str] = Field(default_factory=lambda: [
        "game-changer", "revolutionary", "silver bullet", "disruptive", "paradigm shift", "100% bug-free"
    ])

class BrandProfile(BaseModel):
    brand_id: str
    name: str
    tagline: str
    tone: ToneProfile = Field(default_factory=ToneProfile)
    tokens: DesignTokens = Field(default_factory=DesignTokens)
    rules: List[Rule] = Field(default_factory=list)
    approved_facts: List[ApprovedFact] = Field(default_factory=list)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# --- SCANNING & DIAGNOSTICS ---

class FlaggedIssue(BaseModel):
    issue_id: str
    category: GuidelineCategory
    severity: Severity
    title: str
    explanation: str
    offending_content: str
    suggested_fix: str
    rule_id: str
    rule_title: str
    source_citation: str
    intent_preservation_note: str
    confidence_score: float = Field(default=0.9, ge=0.0, le=1.0)
    start_pos: Optional[int] = None
    end_pos: Optional[int] = None
    is_resolved: bool = False
    accepted_fix: bool = False

class VisualMetric(BaseModel):
    extracted_palette: List[str] = Field(default_factory=list)
    palette_compliance_score: float = 1.0
    contrast_ratio: float = 4.5
    wcag_aa_compliant: bool = True
    wcag_aaa_compliant: bool = False
    logo_detected: bool = False
    logo_clear_space_ok: bool = True
    warnings: List[str] = Field(default_factory=list)

class ScanRequest(BaseModel):
    brand_id: str = "inkloom"
    format: ContentFormat = ContentFormat.SOCIAL_POST
    content_text: str
    image_base64: Optional[str] = None
    creator_intent: Optional[str] = None
    author: str = "Content Creator"

class ScanResult(BaseModel):
    scan_id: str
    brand_id: str
    format: ContentFormat
    content_text: str
    overall_score: int = Field(ge=0, le=100)
    status: ReviewStatus = ReviewStatus.PENDING
    issues: List[FlaggedIssue] = Field(default_factory=list)
    visual_metrics: Optional[VisualMetric] = None
    cleaned_diff_text: Optional[str] = None
    scanned_at: datetime = Field(default_factory=datetime.utcnow)
    scanned_by: str = "BrandGuard Engine"

# --- WORKFLOW & COLLABORATION ---

class Comment(BaseModel):
    comment_id: str
    author: str
    role: ReviewerRole
    message: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ReviewRecord(BaseModel):
    review_id: str
    scan_id: str
    brand_id: str
    title: str
    current_content: str
    original_content: str
    format: ContentFormat
    status: ReviewStatus
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    issues: List[FlaggedIssue] = Field(default_factory=list)
    comments: List[Comment] = Field(default_factory=list)
    audit_history: List[Dict[str, Any]] = Field(default_factory=list)
    last_updated: datetime = Field(default_factory=datetime.utcnow)

class ReviewActionRequest(BaseModel):
    actor_name: str
    actor_role: ReviewerRole
    action: str # "approve", "request_changes", "resolve_issue", "add_comment", "update_content"
    payload: Optional[Dict[str, Any]] = None

# --- GOVERNANCE & AMBIGUITY ---

class AmbiguitySignal(BaseModel):
    rule_id: str
    rule_title: str
    violation_count: int
    override_count: int
    ambiguity_score: float # 0.0 to 1.0
    detected_conflict: str
    suggested_clarification: str

class GovernanceAnalytics(BaseModel):
    total_scans: int
    total_approved: int
    total_violations_flagged: int
    recurring_mistakes: Dict[str, int]
    compliance_rate: float
    ambiguity_radar: List[AmbiguitySignal] = Field(default_factory=list)
