export type GuidelineCategory = 'tone' | 'terminology' | 'factual_claim' | 'visual' | 'accessibility' | 'regulatory';
export type Severity = 'critical' | 'warning' | 'info';
export type ContentFormat = 'text' | 'social_post' | 'press_release' | 'ad_banner' | 'email' | 'document';
export type ReviewStatus = 'pending' | 'changes_requested' | 'approved' | 'rejected';
export type ReviewerRole = 'creator' | 'brand_manager' | 'legal_compliance';

export interface Rule {
  rule_id: string;
  category: GuidelineCategory;
  title: string;
  description: string;
  severity: Severity;
  source_document: string;
  citation_ref: string;
  forbidden_terms?: string[];
  preferred_terms?: Record<string, string>;
  mandatory_disclaimers?: string[];
  examples_good?: string[];
  examples_bad?: string[];
}

export interface ApprovedFact {
  fact_id: string;
  subject: string;
  claim_text: string;
  verified_metric?: string;
  source_document: string;
  citation_ref: string;
  is_active: boolean;
  tags?: string[];
}

export interface DesignTokens {
  primary_color: string;
  secondary_color: string;
  accent_colors: string[];
  forbidden_colors?: string[];
  min_contrast_ratio: number;
}

export interface BrandProfile {
  brand_id: string;
  name: string;
  tagline: string;
  tokens: DesignTokens;
  rules: Rule[];
  approved_facts: ApprovedFact[];
}

export interface FlaggedIssue {
  issue_id: string;
  category: GuidelineCategory;
  severity: Severity;
  title: string;
  explanation: string;
  offending_content: string;
  suggested_fix: string;
  rule_id: string;
  rule_title: string;
  source_citation: string;
  intent_preservation_note: string;
  confidence_score: number;
  start_pos?: number;
  end_pos?: number;
  is_resolved?: boolean;
  accepted_fix?: boolean;
}

export interface VisualMetric {
  extracted_palette: string[];
  palette_compliance_score: number;
  contrast_ratio: number;
  wcag_aa_compliant: boolean;
  wcag_aaa_compliant: boolean;
  logo_detected: boolean;
  logo_clear_space_ok: boolean;
  warnings: string[];
}

export interface ScanResult {
  scan_id: string;
  brand_id: string;
  format: ContentFormat;
  content_text: string;
  overall_score: number;
  status: ReviewStatus;
  issues: FlaggedIssue[];
  visual_metrics?: VisualMetric;
  cleaned_diff_text?: string;
  scanned_at: string;
  scanned_by: string;
}

export interface Comment {
  comment_id: string;
  author: string;
  role: ReviewerRole;
  message: string;
  created_at: string;
}

export interface ReviewRecord {
  review_id: string;
  scan_id: string;
  brand_id: string;
  title: string;
  current_content: string;
  original_content: string;
  format: ContentFormat;
  status: ReviewStatus;
  created_by: string;
  created_at: string;
  issues: FlaggedIssue[];
  comments: Comment[];
  audit_history: Array<{
    timestamp: string;
    actor: string;
    role?: string;
    action: string;
    [key: string]: any;
  }>;
  last_updated: string;
}

export interface AmbiguitySignal {
  rule_id: string;
  rule_title: string;
  violation_count: number;
  override_count: number;
  ambiguity_score: number;
  detected_conflict: string;
  suggested_clarification: string;
}

export interface GovernanceAnalytics {
  total_scans: number;
  total_approved: number;
  total_violations_flagged: number;
  recurring_mistakes: Record<string, number>;
  compliance_rate: number;
  ambiguity_radar: AmbiguitySignal[];
}
