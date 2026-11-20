import json
from typing import Dict, List, Optional
from datetime import datetime
from app.models.schemas import (
    BrandProfile, Rule, ApprovedFact, DesignTokens, ToneProfile,
    GuidelineCategory, Severity, BrandHierarchyNode
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
            name="Inkloom AI (Global Headquarters)",
            tagline="Intelligent Brand Governance for High-Velocity Teams",
            parent_brand_id=None,
            region_code="GLOBAL",
            region_name="Global Headquarters",
            jurisdiction_disclosures=[
                {"regulation": "Global Core Standards", "clause": "Enterprise Baseline", "disclosure": "Universal trademark, ethical AI, and contrast compliance standard."}
            ],
            inherited_rules_count=0,
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

        # 1A. INKLOOM NORTH AMERICA (Regional Subsidiary - FTC Jurisdiction)
        inkloom_us_rules = [
            Rule(
                rule_id="US-FTC-01",
                category=GuidelineCategory.REGULATORY,
                title="FTC 16 CFR Part 255 Endorsement Disclosure",
                description="Any promotional collaboration or creator post must feature clear and conspicuous commercial disclosure (#ad, #sponsored, or 'Sponsored by Inkloom').",
                severity=Severity.CRITICAL,
                source_document="FTC Guides Concerning the Use of Endorsements (16 CFR Part 255)",
                citation_ref="Section 255.5: Disclosure of Material Connections",
                mandatory_disclaimers=["#ad", "#sponsored", "Sponsored by Inkloom"],
                examples_good=["Loving how BrandGuard AI caught our compliance drift! #sponsored"],
                examples_bad=["Best tool we ever tried! (omitting #ad or sponsorship note)"]
            ),
            Rule(
                rule_id="US-PRICE-01",
                category=GuidelineCategory.FACTUAL_CLAIM,
                title="US Dollar Pricing Standards",
                description="US commercial communications must specify price in US Dollars (USD or $) with explicit recurring billing frequency ('billed annually' or 'per month').",
                severity=Severity.WARNING,
                source_document="US Commercial Pricing Policy",
                citation_ref="Sec 10-A",
                forbidden_terms=["$499 only", "just $499"],
                preferred_terms={
                    "$499 only": "$499/month billed annually",
                    "just $499": "$499/month (annual commitment)"
                }
            )
        ]
        self._profiles["inkloom-us"] = BrandProfile(
            brand_id="inkloom-us",
            name="Inkloom North America",
            tagline="Enterprise AI Governance — US Jurisdiction",
            parent_brand_id="inkloom",
            region_code="US",
            region_name="North America (FTC & SOC2)",
            jurisdiction_disclosures=[
                {"regulation": "FTC Endorsement Guides", "clause": "16 CFR Part 255", "disclosure": "Clear and conspicuous disclosure required for sponsored endorsements."}
            ],
            inherited_rules_count=len(inkloom_rules),
            tone=ToneProfile(
                voice_description="Direct, innovative, commercially compelling, and compliant with US FTC standards.",
                formality_score=0.72,
                confidence_level=0.88
            ),
            tokens=DesignTokens(
                primary_color="#4F46E5",
                secondary_color="#06B6D4",
                accent_colors=["#10B981", "#F59E0B"],
                forbidden_colors=["#FF00FF", "#00FF00"],
                min_contrast_ratio=4.5
            ),
            rules=inkloom_us_rules,
            approved_facts=inkloom_facts
        )

        # 1B. INKLOOM EUROPE (Regional Subsidiary - EU AI Act & GDPR Jurisdiction)
        inkloom_eu_rules = [
            Rule(
                rule_id="EU-AIACT-01",
                category=GuidelineCategory.REGULATORY,
                title="EU Artificial Intelligence Act Transparency Mandate",
                description="Under EU Regulation 2024/1689 Article 50 & 52, AI-generated or AI-assisted synthetic content must be marked with a machine-readable indicator and prominent disclosure.",
                severity=Severity.CRITICAL,
                source_document="EU AI Act (Regulation 2024/1689)",
                citation_ref="Article 50(2) & Article 52 Transparency Obligations",
                mandatory_disclaimers=["Generated with Inkloom AI assistance", "Certified in compliance with EU AI Act Reg 2024/1689"],
                examples_good=["Synthesized in collaboration with Inkloom AI; certified in compliance with EU AI Act."],
                examples_bad=["Marketing collateral generated automatically (no EU disclosure)."]
            ),
            Rule(
                rule_id="EU-GDPR-01",
                category=GuidelineCategory.REGULATORY,
                title="GDPR Profiling & Personal Data Safeguard",
                description="Marketing copy must not imply automated user profiling or processing of special category data without GDPR Article 6/9 lawful consent notice.",
                severity=Severity.CRITICAL,
                source_document="EU General Data Protection Regulation (GDPR)",
                citation_ref="Article 22: Automated Individual Decision-Making",
                forbidden_terms=["secret profiling", "tracks your every move", "unmonitored data collection"],
                preferred_terms={
                    "secret profiling": "privacy-preserving telemetry",
                    "tracks your every move": "consensual user analytics",
                    "unmonitored data collection": "anonymized aggregate metrics"
                }
            )
        ]
        self._profiles["inkloom-eu"] = BrandProfile(
            brand_id="inkloom-eu",
            name="Inkloom Europe",
            tagline="Enterprise AI Governance — European Union (EU AI Act)",
            parent_brand_id="inkloom",
            region_code="EU",
            region_name="European Union (EU AI Act & GDPR)",
            jurisdiction_disclosures=[
                {"regulation": "EU AI Act 2024/1689", "clause": "Article 50 & 52", "disclosure": "Providers and deployers must ensure AI-generated output is marked in a machine-readable format and detectable as artificially generated."}
            ],
            inherited_rules_count=len(inkloom_rules),
            tone=ToneProfile(
                voice_description="Authoritative, privacy-centric, ethical, and strictly aligned with European digital single market regulations.",
                formality_score=0.82,
                confidence_level=0.80
            ),
            tokens=DesignTokens(
                primary_color="#4F46E5",
                secondary_color="#06B6D4",
                accent_colors=["#10B981", "#3B82F6"],
                forbidden_colors=["#FF00FF", "#00FF00"],
                min_contrast_ratio=4.5
            ),
            rules=inkloom_eu_rules,
            approved_facts=inkloom_facts
        )

        # 1C. INKLOOM UK & COMMONWEALTH (Regional Subsidiary - ASA CAP Code Jurisdiction)
        inkloom_uk_rules = [
            Rule(
                rule_id="UK-ASA-01",
                category=GuidelineCategory.REGULATORY,
                title="UK ASA CAP Code Substantiation Standard",
                description="Under UK Advertising Standards Authority Rule 3.1 & 3.3, all objective comparative claims must hold robust prior documentary evidence.",
                severity=Severity.CRITICAL,
                source_document="UK Advertising Standards Authority (CAP Code)",
                citation_ref="Section 3: Misleading Advertising & Substantiation",
                forbidden_terms=["unrivaled in Britain", "the UK's favorite AI", "market leader in Europe"],
                preferred_terms={
                    "unrivaled in Britain": "a leading UK enterprise governance platform",
                    "the UK's favorite AI": "trusted by leading UK creative agencies",
                    "market leader in Europe": "a prominent European AI governance provider"
                }
            )
        ]
        self._profiles["inkloom-uk"] = BrandProfile(
            brand_id="inkloom-uk",
            name="Inkloom United Kingdom",
            tagline="Enterprise AI Governance — UK & Commonwealth",
            parent_brand_id="inkloom",
            region_code="UK",
            region_name="United Kingdom (ASA CAP Code)",
            jurisdiction_disclosures=[
                {"regulation": "UK ASA CAP Code", "clause": "Rule 3.1 & 3.3", "disclosure": "Objective advertising claims require prior documentary substantiation."}
            ],
            inherited_rules_count=len(inkloom_rules),
            tone=ToneProfile(
                voice_description="Measured, understated, sophisticated, and strictly substantiated.",
                formality_score=0.80,
                confidence_level=0.82
            ),
            tokens=DesignTokens(
                primary_color="#4F46E5",
                secondary_color="#06B6D4",
                accent_colors=["#10B981", "#D97745"],
                min_contrast_ratio=4.5
            ),
            rules=inkloom_uk_rules,
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

    def get_effective_brand_profile(self, brand_id: str, region_code: Optional[str] = None) -> Optional[BrandProfile]:
        """
        Resolves Hierarchical Multi-Brand Policy Inheritance (Round 3 Improvement 2).
        Merges parent global brand rules with regional subsidiary statutory rules,
        tagging each rule with its statutory jurisdiction and inheritance lineage.
        """
        bid = brand_id.lower()
        if region_code:
            regional_id = f"{bid}-{region_code.lower()}"
            if regional_id in self._profiles:
                bid = regional_id

        target = self.get_brand(bid)
        if not target:
            return None

        if not target.parent_brand_id:
            return target

        parent = self.get_brand(target.parent_brand_id)
        if not parent:
            return target

        merged_rules: List[Rule] = []
        rule_ids_seen = set()

        # 1. Child / Regional specific rules take precedence
        for r in target.rules:
            r_copy = r.model_copy()
            r_copy.source_document = f"{r.source_document} [{target.region_code} Statutory Policy]"
            merged_rules.append(r_copy)
            rule_ids_seen.add(r.rule_id)

        # 2. Inherited global rules from parent
        inherited_count = 0
        for pr in parent.rules:
            if pr.rule_id not in rule_ids_seen:
                pr_copy = pr.model_copy()
                pr_copy.source_document = f"{pr.source_document} [Global Parent Policy]"
                merged_rules.append(pr_copy)
                rule_ids_seen.add(pr.rule_id)
                inherited_count += 1

        merged_facts = list(target.approved_facts)
        fact_ids = {f.fact_id for f in target.approved_facts}
        for pf in parent.approved_facts:
            if pf.fact_id not in fact_ids:
                merged_facts.append(pf)
                fact_ids.add(pf.fact_id)

        effective_profile = BrandProfile(
            brand_id=target.brand_id,
            name=target.name,
            tagline=target.tagline,
            parent_brand_id=target.parent_brand_id,
            region_code=target.region_code,
            region_name=target.region_name,
            jurisdiction_disclosures=list(target.jurisdiction_disclosures) + list(parent.jurisdiction_disclosures),
            inherited_rules_count=inherited_count,
            tone=target.tone,
            tokens=target.tokens,
            rules=merged_rules,
            approved_facts=merged_facts,
            updated_at=datetime.utcnow()
        )
        return effective_profile

    def get_brand_hierarchy(self) -> List[BrandHierarchyNode]:
        """Returns the hierarchical multi-brand tree for enterprise organizations."""
        nodes: Dict[str, BrandHierarchyNode] = {}
        
        for p in self._profiles.values():
            statutory = [d.get("regulation", "") for d in p.jurisdiction_disclosures if d.get("regulation")]
            nodes[p.brand_id] = BrandHierarchyNode(
                brand_id=p.brand_id,
                name=p.name,
                region_code=p.region_code or "GLOBAL",
                region_name=p.region_name or "Global Headquarters",
                parent_brand_id=p.parent_brand_id,
                children=[],
                total_rules_enforced=len(p.rules) + p.inherited_rules_count,
                inherited_rules_count=p.inherited_rules_count,
                local_rules_count=len(p.rules),
                statutory_frameworks=statutory
            )

        root_nodes: List[BrandHierarchyNode] = []
        for p in self._profiles.values():
            node = nodes[p.brand_id]
            if p.parent_brand_id and p.parent_brand_id in nodes:
                nodes[p.parent_brand_id].children.append(node)
            else:
                root_nodes.append(node)

        return root_nodes

# Singleton instance
vault_service = BrandVaultService()
