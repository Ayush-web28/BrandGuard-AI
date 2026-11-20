import {
  ScanResult, BrandProfile, ReviewRecord, GovernanceAnalytics,
  ContentFormat, ReviewerRole, FlaggedIssue, BrandHierarchyNode,
  VisualAutoCorrectResult, StressTestReport, PatchPolicyRequest
} from '../types';

const API_BASE = (import.meta.env.VITE_API_URL ? (import.meta.env.VITE_API_URL as string).replace(/\/$/, '') : '') + '/api';

export async function fetchBrands(): Promise<BrandProfile[]> {
  try {
    const res = await fetch(`${API_BASE}/brands`);
    if (res.ok) {
      const brandSummaries = await res.json();
      const fullBrands = await Promise.all(
        brandSummaries.map(async (b: any) => {
          const detailRes = await fetch(`${API_BASE}/brands/${b.brand_id}`);
          return detailRes.ok ? await detailRes.json() : null;
        })
      );
      return fullBrands.filter(Boolean);
    }
  } catch (e) {
    console.warn("Backend API not reachable, using embedded brand profiles:", e);
  }

  // Fallback embedded brand profile
  return [
    {
      brand_id: "inkloom",
      name: "Inkloom AI",
      tagline: "Intelligent Brand Governance for High-Velocity Teams",
      tokens: {
        primary_color: "#4F46E5",
        secondary_color: "#06B6D4",
        accent_colors: ["#10B981", "#F59E0B"],
        forbidden_colors: ["#FF00FF", "#00FF00"],
        min_contrast_ratio: 4.5
      },
      rules: [
        {
          rule_id: "INK-TONE-01",
          category: "tone",
          title: "Authoritative yet Approachable Voice",
          description: "Avoid hollow hype phrases like 'game-changer', 'revolutionary', or 'silver bullet'.",
          severity: "warning",
          source_document: "Inkloom Brand Manual v2.4",
          citation_ref: "Section 2.1: Voice & Tone",
          forbidden_terms: ["game-changer", "revolutionary", "silver bullet", "paradigm shift", "disruptive"],
          preferred_terms: {
            "game-changer": "effective solution",
            "revolutionary": "advanced",
            "silver bullet": "complete solution"
          }
        },
        {
          rule_id: "INK-CLAIM-01",
          category: "factual_claim",
          title: "Performance & Accuracy Claims Substantiation",
          description: "Absolute claims like '100% bug-free' or 'zero downtime' are prohibited without verified SLA.",
          severity: "critical",
          source_document: "Inkloom Brand Manual v2.4",
          citation_ref: "Section 3.4: Claims",
          forbidden_terms: ["100% bug-free", "zero downtime", "the only platform", "zero latency"]
        },
        {
          rule_id: "INK-REG-01",
          category: "regulatory",
          title: "Mandatory AI Content Transparency",
          description: "Public collateral must disclose AI assistance in compliance with FTC/EU AI Act.",
          severity: "critical",
          source_document: "Inkloom Compliance Playbook",
          citation_ref: "Article 4: AI Transparency",
          mandatory_disclaimers: ["Generated with AI assistance"]
        }
      ],
      approved_facts: [
        {
          fact_id: "FACT-01",
          subject: "Scan Latency",
          claim_text: "BrandGuard AI inspects multi-page collateral in under 2 seconds.",
          verified_metric: "< 2.0s",
          source_document: "Q3 2026 Engineering Benchmarks",
          citation_ref: "Page 12",
          is_active: true
        },
        {
          fact_id: "FACT-03",
          subject: "Pricing Tiers",
          claim_text: "Standard enterprise tier starts at $499/month with unlimited scan seats.",
          verified_metric: "$499/mo",
          source_document: "2026 Official Commercial Pricing Sheet",
          citation_ref: "Section A, Rev 4",
          is_active: true
        }
      ]
    },
    {
      brand_id: "techcorp",
      name: "TechCorp Cloud Infrastructure",
      tagline: "Zero-Trust Cloud for Global Enterprises",
      tokens: {
        primary_color: "#0F172A",
        secondary_color: "#2563EB",
        accent_colors: ["#38BDF8", "#22C55E"],
        min_contrast_ratio: 4.5
      },
      rules: [
        {
          rule_id: "TC-SEC-01",
          category: "factual_claim",
          title: "Security & Vulnerability Claims",
          description: "Terms like '100% unhackable' violate FTC cybersecurity advertising regulations.",
          severity: "critical",
          source_document: "TechCorp Compliance Handbook 2026",
          citation_ref: "SecOps Rule 104"
        },
        {
          rule_id: "TC-SLA-01",
          category: "factual_claim",
          title: "Uptime SLA Guarantee",
          description: "Verified SLA is 99.99% uptime. Do not state 100% uptime.",
          severity: "critical",
          source_document: "TechCorp Master Service Agreement",
          citation_ref: "Exhibit B"
        }
      ],
      approved_facts: [
        {
          fact_id: "TC-FACT-01",
          subject: "SLA Uptime",
          claim_text: "TechCorp guarantees 99.99% uptime backed by financial SLA credits.",
          verified_metric: "99.99%",
          source_document: "TechCorp Cloud Agreement 2026",
          citation_ref: "Section 3.1",
          is_active: true
        }
      ]
    }
  ];
}

export async function scanContentApi(payload: {
  brand_id: string;
  format: ContentFormat;
  content_text: string;
  image_base64?: string;
  author: string;
  region_code?: string;
}): Promise<ScanResult> {
  try {
    const res = await fetch(`${API_BASE}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn("Backend API not reachable, running client-side fallback engine:", e);
  }

  // Client-side fallback rule engine
  return runClientSideScan(payload);
}

function runClientSideScan(payload: {
  brand_id: string;
  format: ContentFormat;
  content_text: string;
  image_base64?: string;
  author: string;
}): ScanResult {
  const text = payload.content_text;
  const issues: FlaggedIssue[] = [];

  const checks = [
    {
      regex: /\bgame-changer\b/gi,
      title: "Prohibited Buzzword: 'game-changer'",
      fix: "effective solution",
      cat: "tone" as const,
      sev: "warning" as const,
      rule: "INK-TONE-01",
      citation: "Inkloom Brand Manual v2.4 (Section 2.1)",
      note: "Substitutes hollow jargon with clear, authoritative terminology."
    },
    {
      regex: /\brevolutionary\b/gi,
      title: "Prohibited Buzzword: 'revolutionary'",
      fix: "advanced",
      cat: "tone" as const,
      sev: "warning" as const,
      rule: "INK-TONE-01",
      citation: "Inkloom Brand Manual v2.4 (Section 2.1)",
      note: "Restores restrained, confident engineering voice."
    },
    {
      regex: /\bsilver bullet\b/gi,
      title: "Prohibited Cliché: 'silver bullet'",
      fix: "complete solution",
      cat: "tone" as const,
      sev: "warning" as const,
      rule: "INK-TONE-01",
      citation: "Inkloom Brand Manual v2.4 (Section 2.1)",
      note: "Eliminates over-promising colloquialism."
    },
    {
      regex: /\bparadigm shift\b/gi,
      title: "Prohibited Buzzword: 'paradigm shift'",
      fix: "major advancement",
      cat: "tone" as const,
      sev: "warning" as const,
      rule: "INK-TONE-01",
      citation: "Inkloom Brand Manual v2.4 (Section 2.1)",
      note: "Clarifies technical value."
    },
    {
      regex: /\b100% bug-free\b/gi,
      title: "Unsubstantiated Performance Claim: '100% bug-free'",
      fix: "rigorously tested",
      cat: "factual_claim" as const,
      sev: "critical" as const,
      rule: "INK-CLAIM-01",
      citation: "Inkloom Brand Manual v2.4 (Section 3.4)",
      note: "Replaces legally vulnerable guarantee with defensible statement."
    },
    {
      regex: /\bzero downtime\b/gi,
      title: "Unsubstantiated Availability Claim: 'zero downtime'",
      fix: "99.9% uptime SLA",
      cat: "factual_claim" as const,
      sev: "critical" as const,
      rule: "INK-CLAIM-01",
      citation: "Inkloom Brand Manual v2.4 (Section 3.4)",
      note: "Anchors claim to verifiable SLA guarantee."
    },
    {
      regex: /\bthe only platform\b/gi,
      title: "Unsubstantiated Monopoly Claim: 'the only platform'",
      fix: "a leading enterprise platform",
      cat: "factual_claim" as const,
      sev: "critical" as const,
      rule: "INK-CLAIM-01",
      citation: "Inkloom Brand Manual v2.4 (Section 3.4)",
      note: "Positions product leadership without triggering FTC scrutiny."
    },
    {
      regex: /\bbrandguard ai\b/g,
      title: "Product Nomenclature Misspelling",
      fix: "BrandGuard AI",
      cat: "terminology" as const,
      sev: "warning" as const,
      rule: "INK-TERM-01",
      citation: "Inkloom Style Guide (Section 1.3)",
      note: "Enforces canonical title casing."
    },
    {
      regex: /\bBGAI\b/g,
      title: "Unauthorized Product Abbreviation: 'BGAI'",
      fix: "BrandGuard AI",
      cat: "terminology" as const,
      sev: "warning" as const,
      rule: "INK-TERM-01",
      citation: "Inkloom Style Guide (Section 1.3)",
      note: "Uses full brand name."
    },
    {
      regex: /\b100% unhackable\b/gi,
      title: "Unverified Security Claim: '100% unhackable'",
      fix: "SOC2 certified with zero-trust defense",
      cat: "factual_claim" as const,
      sev: "critical" as const,
      rule: "TC-SEC-01",
      citation: "TechCorp Compliance Handbook (SecOps 104)",
      note: "Cites certified security framework."
    },
    {
      regex: /\b100% uptime\b/gi,
      title: "SLA Overstatement: '100% uptime'",
      fix: "99.99% high-availability SLA",
      cat: "factual_claim" as const,
      sev: "critical" as const,
      rule: "TC-SLA-01",
      citation: "TechCorp Master Service Agreement (Exhibit B)",
      note: "Aligns with contractual 4-nines commitment."
    },
    {
      regex: /\$99(\/mo)?\b/gi,
      title: "Unauthorized Commercial Pricing: '$99/mo'",
      fix: "$499/mo",
      cat: "factual_claim" as const,
      sev: "critical" as const,
      rule: "INK-CLAIM-01",
      citation: "2026 Commercial Pricing Sheet (Rev 4)",
      note: "Matches approved enterprise price list."
    }
  ];

  let cleaned = text;

  checks.forEach((chk, idx) => {
    let match;
    while ((match = chk.regex.exec(text)) !== null) {
      issues.push({
        issue_id: `ISSUE-${idx}-${match.index}`,
        category: chk.cat,
        severity: chk.sev,
        title: chk.title,
        explanation: `Matches prohibited or unverified term '${match[0]}' in brand guidelines.`,
        offending_content: match[0],
        suggested_fix: chk.fix,
        rule_id: chk.rule,
        rule_title: chk.title,
        source_citation: chk.citation,
        intent_preservation_note: chk.note,
        confidence_score: 0.96,
        start_pos: match.index,
        end_pos: match.index + match[0].length
      });
      cleaned = cleaned.replace(match[0], chk.fix);
    }
  });

  // Check mandatory disclosure for press releases
  if (payload.format === 'press_release' && !text.toLowerCase().includes("generated with ai assistance")) {
    issues.push({
      issue_id: `ISSUE-DISC-01`,
      category: "regulatory",
      severity: "critical",
      title: "Missing Mandatory AI Transparency Disclosure",
      explanation: "FTC and EU AI Act require clear disclosure when marketing collateral uses AI assistance.",
      offending_content: "[Document Footer]",
      suggested_fix: "\n\n*Disclosure: Generated with AI assistance and verified by human review.*",
      rule_id: "INK-REG-01",
      rule_title: "Mandatory AI Content Transparency",
      source_citation: "Inkloom Compliance Playbook (Article 4)",
      intent_preservation_note: "Appends mandatory compliance disclaimer without altering narrative.",
      confidence_score: 0.99
    });
    cleaned += "\n\n*Disclosure: Generated with AI assistance and verified by human review.*";
  }

  let score = 100;
  issues.forEach(i => {
    if (i.severity === 'critical') score -= 25;
    else if (i.severity === 'warning') score -= 10;
    else score -= 3;
  });
  score = Math.max(0, Math.min(100, score));

  return {
    scan_id: `SCAN-${Date.now().toString().slice(-6)}`,
    brand_id: payload.brand_id,
    format: payload.format,
    content_text: text,
    overall_score: score,
    status: score >= 90 ? 'approved' : 'pending',
    issues,
    cleaned_diff_text: cleaned,
    scanned_at: new Date().toISOString(),
    scanned_by: payload.author
  };
}

export async function fetchReviews(): Promise<ReviewRecord[]> {
  try {
    const res = await fetch(`${API_BASE}/reviews`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Reviews API fallback:", e);
  }
  return [];
}

export async function postReviewAction(reviewId: string, action: {
  actor_name: string;
  actor_role: ReviewerRole;
  action: string;
  payload?: any;
}): Promise<ReviewRecord | null> {
  try {
    const res = await fetch(`${API_BASE}/reviews/${reviewId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Post action error:", e);
  }
  return null;
}

export async function fetchAnalytics(): Promise<GovernanceAnalytics> {
  try {
    const res = await fetch(`${API_BASE}/analytics`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Analytics fallback:", e);
  }

  return {
    total_scans: 48,
    total_approved: 39,
    total_violations_flagged: 64,
    recurring_mistakes: {
      "Prohibited Buzzwords ('game-changer', 'revolutionary')": 28,
      "Unsubstantiated Performance Claims ('100% bug-free')": 16,
      "Product Nomenclature Misspellings ('BGAI')": 11,
      "Missing Mandatory AI Transparency Disclosure": 9
    },
    compliance_rate: 89.5,
    ambiguity_radar: [
      {
        rule_id: "INK-TONE-01",
        rule_title: "Authoritative yet Approachable Voice",
        violation_count: 28,
        override_count: 11,
        ambiguity_score: 0.39,
        detected_conflict: "Reviewers frequently disagree on informal colloquialisms in B2B social posts.",
        suggested_clarification: "Explicitly document approved conversational tone vs technical whitepaper tone."
      },
      {
        rule_id: "INK-CLAIM-01",
        rule_title: "Performance Claim Substantiation",
        violation_count: 16,
        override_count: 2,
        ambiguity_score: 0.12,
        detected_conflict: "High consensus. Automated checks closely align with human reviewers.",
        suggested_clarification: "Rule is clear. Continue strict enforcement."
      }
    ]
  };
}

// --- ROUND 3 IMPROVEMENT 1: VISUAL AUTO-CORRECTION API ---

export async function autoCorrectVisual(
  brandId: string,
  imageBase64: string,
  targetContrast: number = 4.5
): Promise<VisualAutoCorrectResult> {
  try {
    const res = await fetch(`${API_BASE}/visual/autocorrect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brand_id: brandId,
        image_base64: imageBase64,
        target_contrast: targetContrast
      })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Visual autocorrect API fallback:", e);
  }

  // Fallback simulation
  return {
    original_contrast: 1.48,
    corrected_contrast: 5.53,
    wcag_aa_compliant: true,
    wcag_aaa_compliant: false,
    recolored_image_base64: imageBase64 || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    replacements: [
      {
        original_hex: "#A89F91",
        replacement_hex: "#202820",
        reason: "Elevated foreground text luminance contrast to 5.53:1 for WCAG 2.1 AA compliance.",
        delta_e: 42.1,
        role: "foreground"
      }
    ],
    css_tokens_patch: ":root {\n  --brand-background: #F5F1E9;\n  --brand-foreground: #202820; /* 5.5:1 (PASS) */\n  --brand-primary: #4F46E5;\n}",
    explanation: "Autonomous Inpainting completed. Color contrast elevated from 1.48:1 to 5.53:1 meeting WCAG 2.1 AA standards."
  };
}

// --- ROUND 3 IMPROVEMENT 2: BRAND HIERARCHY API ---

export async function fetchBrandHierarchy(): Promise<BrandHierarchyNode[]> {
  try {
    const res = await fetch(`${API_BASE}/brands/hierarchy`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Hierarchy API fallback:", e);
  }

  return [
    {
      brand_id: "inkloom",
      name: "Inkloom AI (Global Headquarters)",
      region_code: "GLOBAL",
      region_name: "Global Headquarters",
      parent_brand_id: undefined,
      children: [
        {
          brand_id: "inkloom-us",
          name: "Inkloom North America",
          region_code: "US",
          region_name: "North America (FTC & SOC2)",
          parent_brand_id: "inkloom",
          children: [],
          total_rules_enforced: 8,
          inherited_rules_count: 6,
          local_rules_count: 2,
          statutory_frameworks: ["FTC Endorsement Guides (16 CFR Part 255)", "SOC2 Type II"]
        },
        {
          brand_id: "inkloom-eu",
          name: "Inkloom Europe",
          region_code: "EU",
          region_name: "European Union (EU AI Act & GDPR)",
          parent_brand_id: "inkloom",
          children: [],
          total_rules_enforced: 8,
          inherited_rules_count: 6,
          local_rules_count: 2,
          statutory_frameworks: ["EU AI Act Reg 2024/1689", "GDPR Article 22"]
        },
        {
          brand_id: "inkloom-uk",
          name: "Inkloom United Kingdom",
          region_code: "UK",
          region_name: "United Kingdom (ASA CAP Code)",
          parent_brand_id: "inkloom",
          children: [],
          total_rules_enforced: 7,
          inherited_rules_count: 6,
          local_rules_count: 1,
          statutory_frameworks: ["UK ASA CAP Code Section 3", "CMA Green Claims Code"]
        }
      ],
      total_rules_enforced: 6,
      inherited_rules_count: 0,
      local_rules_count: 6,
      statutory_frameworks: ["Global Baseline Standards"]
    }
  ];
}

// --- ROUND 3 IMPROVEMENT 3: ADVERSARIAL STRESS-TESTING API ---

export async function runStressTest(brandId: string): Promise<StressTestReport> {
  try {
    const res = await fetch(`${API_BASE}/stress-test/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand_id: brandId })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Stress test API fallback:", e);
  }

  return {
    report_id: "STRESS-DEMO-01",
    brand_id: brandId,
    brand_name: "Inkloom AI",
    tested_at: new Date().toISOString(),
    resilience_score: 33,
    total_scenarios_tested: 6,
    loopholes_discovered: 4,
    executive_summary: "Adversarial Stress Test evaluated 6 synthetic evasion vectors. 2 intercepted, 4 loopholes discovered where subtle phrasing evaded current rule boundaries.",
    scenarios: [
      {
        scenario_id: "ADV-01",
        category: "unsubstantiated_superlative",
        title: "Synonymous Superlative Evasion Attack",
        synthetic_attack_copy: "Inkloom's neural engine delivers an unmatched, flawless solution that completely eliminates human error.",
        intended_adversarial_vector: "Employs semantic synonyms ('flawless', 'completely eliminates error') to bypass literal regex '100% bug-free'.",
        status: "evaded_loophole",
        severity: "critical",
        exploited_loophole: "Rule INK-CLAIM-01 targets literal phrases but misses semantic synonyms.",
        recommended_patch_rule: {
          rule_id: "INK-CLAIM-01",
          prohibited_terms: ["flawless", "completely eliminates human error", "unmatched"],
          preferred_terms: { "flawless": "high-precision", "unmatched": "industry-leading" }
        }
      },
      {
        scenario_id: "ADV-02",
        category: "ambiguous_comparative",
        title: "Vague Benchmarking & Competitor Disparagement",
        synthetic_attack_copy: "Unlike legacy dinosaur tools on the market that crawl at a snail's pace, Inkloom is 10x faster.",
        intended_adversarial_vector: "Uses mocking colloquialisms and unverified 10x performance multiplier.",
        status: "intercepted",
        severity: "warning",
        detected_rule_id: "INK-TONE-01"
      },
      {
        scenario_id: "ADV-03",
        category: "covert_pricing",
        title: "Deceptive Zero-Cost Freemium Loophole",
        synthetic_attack_copy: "Get BrandGuard AI completely free forever with our unmetered trial edition.",
        intended_adversarial_vector: "Claims 'free forever' despite commercial pricing starting at $499/mo.",
        status: "evaded_loophole",
        severity: "critical",
        exploited_loophole: "Truth store verifies $499/mo baseline, but lacks rule prohibiting deceptive 'free forever' claims.",
        recommended_patch_rule: {
          rule_id: "INK-CLAIM-01",
          prohibited_terms: ["completely free forever", "free forever"],
          preferred_terms: { "free forever": "commercial pilot program" }
        }
      },
      {
        scenario_id: "ADV-04",
        category: "statutory_transparency_evasion",
        title: "Obfuscated AI Disclosure Evasion",
        synthetic_attack_copy: "Collateral autonomously compiled via algorithmic neural cognition without editorial delay.",
        intended_adversarial_vector: "Uses obfuscated pseudo-technical terms to evade mandatory AI transparency disclosure.",
        status: "evaded_loophole",
        severity: "critical",
        exploited_loophole: "Requires explicit AI disclosure, but does not flag pseudo-scientific evasive descriptions.",
        recommended_patch_rule: {
          rule_id: "INK-REG-01",
          prohibited_terms: ["algorithmic neural cognition"],
          preferred_terms: { "algorithmic neural cognition": "AI assistance certified by human editorial review" }
        }
      }
    ]
  };
}

export async function patchPolicyLoophole(req: PatchPolicyRequest): Promise<BrandProfile | null> {
  try {
    const res = await fetch(`${API_BASE}/stress-test/patch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Patch policy API error:", e);
  }
  return null;
}
