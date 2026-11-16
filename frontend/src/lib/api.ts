import {
  ScanResult, BrandProfile, ReviewRecord, GovernanceAnalytics,
  ContentFormat, ReviewerRole, FlaggedIssue
} from '../types';

const API_BASE = '/api';

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
