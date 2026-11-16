import json
from typing import Dict, List, Optional
from datetime import datetime
from app.models.schemas import (
    BrandProfile, Rule, ApprovedFact, DesignTokens, ToneProfile,
    GuidelineCategory, Severity
)

class BrandVaultService:
    def __init__(self):
        self._profiles: Dict[str, BrandProfile] = {}
        self._initialize_default_brands()

    def _initialize_default_brands(self):
        # 1. INKLOOM AI (Official Hackathon Host Profile)
        inkloom_rules = [
            Rule(
                rule_id="INK-TONE-01",
                category=GuidelineCategory.TONE,
                title="Authoritative yet Approachable Voice",
                description="Our voice communicates deep technical expertise without sounding condescending. Avoid excessive corporate jargon and hollow buzzwords.",
                severity=Severity.WARNING,
                source_document="Inkloom Brand Manual v2.4",
                citation_ref="Section 2.1: Voice & Tone",
                forbidden_terms=["game-changer", "revolutionary", "silver bullet", "paradigm shift", "disruptive"],
                preferred_terms={
                    "game-changer": "effective solution",
                    "revolutionary": "advanced",
                    "silver bullet": "complete solution",
                    "paradigm shift": "major advancement"
                },
                examples_good=["Our platform provides verifiable brand governance across enterprise pipelines."],
                examples_bad=["Our game-changer AI is a revolutionary silver bullet for marketing."]
            ),
            Rule(
                rule_id="INK-CLAIM-01",
                category=GuidelineCategory.FACTUAL_CLAIM,
                title="Performance & Accuracy Claims Substantiation",
                description="Absolute superlatives like '100% bug-free', 'zero errors', or 'the only AI tool' are strictly prohibited unless verified by third-party benchmark.",
                severity=Severity.CRITICAL,
                source_document="Inkloom Brand Manual v2.4",
                citation_ref="Section 3.4: Legal & Promotional Claims",
                forbidden_terms=["100% bug-free", "zero latency", "zero downtime", "the only platform", "100% error-free", "guaranteed #1"],
                preferred_terms={
                    "100% bug-free": "rigorously tested",
                    "zero latency": "ultra-low sub-50ms latency",
                    "zero downtime": "99.9% uptime SLA",
                    "the only platform": "a leading enterprise platform",
                    "100% error-free": "high-precision"
                },
                examples_good=["Engineered with high test coverage and sub-50ms response times."],
                examples_bad=["Guaranteed 100% bug-free software with zero latency."]
            ),
            Rule(
                rule_id="INK-REG-01",
                category=GuidelineCategory.REGULATORY,
                title="Mandatory AI Content Transparency",
                description="Any public content or feature generated or supplemented by AI must clearly disclose the presence of AI assistance in accordance with FTC & EU AI Act standards.",
                severity=Severity.CRITICAL,
                source_document="Inkloom Legal & Compliance Playbook",
                citation_ref="Article 4: AI Transparency & Ethics",
                mandatory_disclaimers=["Generated with AI assistance", "Verified by human review"],
                examples_good=["This report was synthesized using AI assistance and certified by our editorial team."],
                examples_bad=["Here is the human-written analysis (omitting AI disclosure)."]
            ),
            Rule(
                rule_id="INK-TERM-01",
                category=GuidelineCategory.TERMINOLOGY,
                title="Canonical Product Naming Standards",
                description="Always refer to the flagship product as 'BrandGuard AI' with capitalized 'B', 'G', and 'AI'. Never abbreviate as 'BGAI' or write as 'brandguard ai'.",
                severity=Severity.WARNING,
                source_document="Inkloom Style Guide",
                citation_ref="Section 1.3: Nomenclature",
                forbidden_terms=["BGAI", "brandguard ai", "Brandguard", "Brand guard", "BrandGuard-ai"],
                preferred_terms={
                    "BGAI": "BrandGuard AI",
                    "brandguard ai": "BrandGuard AI",
                    "Brandguard": "BrandGuard AI",
                    "Brand guard": "BrandGuard AI",
                    "BrandGuard-ai": "BrandGuard AI"
                }
            ),
            Rule(
                rule_id="INK-VIS-01",
                category=GuidelineCategory.VISUAL,
                title="Approved Color Palette Compliance",
                description="Primary content backgrounds and hero accents must utilize Inkloom Brand Indigo (#4F46E5) or Deep Slate (#0F172A). Off-brand saturated neon colors are prohibited.",
                severity=Severity.WARNING,
                source_document="Inkloom Design System",
                citation_ref="Tokens / Color Standards",
                forbidden_terms=["#FF00FF", "#00FF00", "#FF0000"]
            ),
            Rule(
                rule_id="INK-ACC-01",
                category=GuidelineCategory.ACCESSIBILITY,
                title="WCAG 2.1 AA Contrast Compliance",
                description="All text rendered over graphics or solid backgrounds must achieve a minimum contrast ratio of 4.5:1 for standard text and 3:1 for large display headers.",
                severity=Severity.CRITICAL,
                source_document="Inkloom Design System",
                citation_ref="Accessibility Guidelines v1.2"
            )
        ]

        inkloom_facts = [
            ApprovedFact(
                fact_id="FACT-01",
                subject="Content Scan Latency",
                claim_text="BrandGuard AI inspects multi-page collateral in under 2 seconds.",
                verified_metric="< 2.0s",
                source_document="Q3 2026 Engineering Benchmarks",
                citation_ref="Page 12, Benchmark Table 2",
                tags=["performance", "latency", "speed"]
            ),
            ApprovedFact(
                fact_id="FACT-02",
                subject="Consistency Revenue Impact",
                claim_text="Consistent brand governance increases enterprise revenue by 10% to 33%.",
                verified_metric="10% - 33%",
                source_document="Marq State of Brand Consistency Report 2024-2025",
                citation_ref="Executive Summary, Page 4",
                tags=["roi", "revenue", "market-data"]
            ),
            ApprovedFact(
                fact_id="FACT-03",
                subject="Pricing Tiers",
                claim_text="Standard enterprise tier starts at $499/month with unlimited scan seats.",
                verified_metric="$499/mo",
                source_document="2026 Official Commercial Pricing Sheet",
                citation_ref="Section A, Rev 4",
                tags=["pricing", "commercial"]
            )
        ]

        self._profiles["inkloom"] = BrandProfile(
            brand_id="inkloom",
            name="Inkloom AI",
            tagline="Intelligent Brand Governance for High-Velocity Teams",
            tone=ToneProfile(
                voice_description="Authoritative, approachable, transparent, and precise.",
                formality_score=0.75,
                confidence_level=0.85
            ),
            tokens=DesignTokens(
                primary_color="#4F46E5",
                secondary_color="#06B6D4",
                accent_colors=["#10B981", "#F59E0B"],
                forbidden_colors=["#FF00FF", "#00FF00"],
                min_contrast_ratio=4.5
            ),
            rules=inkloom_rules,
            approved_facts=inkloom_facts
        )

        # 2. TECHCORP CLOUD (Enterprise B2B Cloud Profile)
        techcorp_rules = [
            Rule(
                rule_id="TC-SEC-01",
                category=GuidelineCategory.FACTUAL_CLAIM,
                title="Security & Vulnerability Claims",
                description="Terms like '100% unhackable' or 'bulletproof defense' violate FTC cybersecurity advertising regulations.",
                severity=Severity.CRITICAL,
                source_document="TechCorp Compliance Handbook 2026",
                citation_ref="SecOps Rule 104",
                forbidden_terms=["unhackable", "bulletproof security", "100% secure", "invulnerable"],
                preferred_terms={
                    "unhackable": "SOC2 certified with zero-trust defense",
                    "bulletproof security": "defense-in-depth architecture",
                    "100% secure": "enterprise-grade security",
                    "invulnerable": "resilient"
                }
            ),
            Rule(
                rule_id="TC-SLA-01",
                category=GuidelineCategory.FACTUAL_CLAIM,
                title="Uptime SLA Guarantee",
                description="The verified SLA is 99.99% uptime. Do not state 100% uptime.",
                severity=Severity.CRITICAL,
                source_document="TechCorp Master Service Agreement",
                citation_ref="Exhibit B: Service Level Commitments",
                forbidden_terms=["100% uptime", "zero outages", "infinite availability"],
                preferred_terms={
                    "100% uptime": "99.99% high-availability SLA",
                    "zero outages": "four-nines uptime reliability",
                    "infinite availability": "geo-redundant architecture"
                }
            )
        ]

        techcorp_facts = [
            ApprovedFact(
                fact_id="TC-FACT-01",
                subject="SLA Uptime",
                claim_text="TechCorp guarantees 99.99% uptime backed by financial SLA credits.",
                verified_metric="99.99%",
                source_document="TechCorp Cloud Agreement 2026",
                citation_ref="Section 3.1"
            )
        ]

        self._profiles["techcorp"] = BrandProfile(
            brand_id="techcorp",
            name="TechCorp Cloud Infrastructure",
            tagline="Zero-Trust Cloud for Global Enterprises",
            tone=ToneProfile(
                voice_description="Direct, engineering-first, robust, and conservative.",
                formality_score=0.9,
                confidence_level=0.9
            ),
            tokens=DesignTokens(
                primary_color="#0F172A",
                secondary_color="#2563EB",
                accent_colors=["#38BDF8", "#22C55E"],
                min_contrast_ratio=4.5
            ),
            rules=techcorp_rules,
            approved_facts=techcorp_facts
        )

    def get_brand(self, brand_id: str) -> Optional[BrandProfile]:
        return self._profiles.get(brand_id.lower())

    def list_brands(self) -> List[Dict[str, str]]:
        return [
            {
                "brand_id": p.brand_id,
                "name": p.name,
                "tagline": p.tagline,
                "rules_count": len(p.rules),
                "facts_count": len(p.approved_facts)
            }
            for p in self._profiles.values()
        ]

    def add_or_update_brand(self, profile: BrandProfile) -> BrandProfile:
        profile.updated_at = datetime.utcnow()
        self._profiles[profile.brand_id.lower()] = profile
        return profile

    def add_rule(self, brand_id: str, rule: Rule) -> bool:
        brand = self.get_brand(brand_id)
        if not brand:
            return False
        # Remove existing rule with same id if any
        brand.rules = [r for r in brand.rules if r.rule_id != rule.rule_id]
        brand.rules.append(rule)
        brand.updated_at = datetime.utcnow()
        return True

    def add_approved_fact(self, brand_id: str, fact: ApprovedFact) -> bool:
        brand = self.get_brand(brand_id)
        if not brand:
            return False
        brand.approved_facts = [f for f in brand.approved_facts if f.fact_id != fact.fact_id]
        brand.approved_facts.append(fact)
        brand.updated_at = datetime.utcnow()
        return True

# Singleton instance
vault_service = BrandVaultService()
