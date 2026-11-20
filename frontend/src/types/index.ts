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
  parent_brand_id?: string;
  region_code?: string;
  region_name?: string;
  jurisdiction_disclosures?: Array<{ regulation: string; clause: string; disclosure: string }>;
  inherited_rules_count?: number;
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
  inheritance_source?: 'global_parent' | 'regional_statutory' | 'local';
  statutory_reference?: string;
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

// --- ROUND 3 IMPROVEMENT 1: VISUAL AUTO-CORRECTION ---

export interface ColorReplacement {
  original_hex: string;
  replacement_hex: string;
  reason: string;
  delta_e: number;
  role: 'foreground' | 'background' | 'accent';
}

export interface VisualAutoCorrectResult {
  original_contrast: number;
  corrected_contrast: number;
  wcag_aa_compliant: boolean;
  wcag_aaa_compliant: boolean;
  recolored_image_base64: string;
  replacements: ColorReplacement[];
  css_tokens_patch: string;
  svg_filter_snippet?: string;
  explanation: string;
}

// --- ROUND 3 IMPROVEMENT 2: MULTI-BRAND & REGIONAL INHERITANCE ---

export interface BrandHierarchyNode {
  brand_id: string;
  name: string;
  region_code: string;
  region_name: string;
  parent_brand_id?: string;
  children: BrandHierarchyNode[];
  total_rules_enforced: number;
  inherited_rules_count: number;
  local_rules_count: number;
  statutory_frameworks: string[];
}

// --- ROUND 3 IMPROVEMENT 3: ADVERSARIAL STRESS-TESTING ---

export interface StressTestScenario {
  scenario_id: string;
  category: string;
  title: string;
  synthetic_attack_copy: string;
  intended_adversarial_vector: string;
  status: 'evaded_loophole' | 'intercepted';
  severity: Severity;
  exploited_loophole?: string;
  recommended_patch_rule?: {
    rule_id: string;
    prohibited_terms: string[];
    preferred_terms: Record<string, string>;
  };
  detected_rule_id?: string;
}

export interface StressTestReport {
  report_id: string;
  brand_id: string;
  brand_name: string;
  tested_at: string;
  resilience_score: number;
  total_scenarios_tested: number;
  loopholes_discovered: number;
  scenarios: StressTestScenario[];
  executive_summary: string;
}

export interface PatchPolicyRequest {
  brand_id: string;
  scenario_id: string;
  patch_type: 'add_rule' | 'add_forbidden_term' | 'add_statutory_disclosure';
  rule_patch?: Rule;
  forbidden_terms: string[];
  preferred_terms: Record<string, string>;
  mandatory_disclaimer?: string;
}
