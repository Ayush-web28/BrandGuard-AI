import uuid
from typing import List, Dict, Optional, Any
from datetime import datetime, timezone
from app.models.schemas import (
    BrandProfile, StressTestScenario, StressTestReport, PatchPolicyRequest,
    Severity, Rule, GuidelineCategory
)
from app.services.vault import vault_service
from app.services.graphrag import policy_graph_service
from app.services.claim_verifier import claim_verifier_service

class StressTesterService:
    """
    Adversarial Brand Stress-Testing & Policy Loophole Agent (Round 3 Improvement 3).
    Simulates adversarial marketing copy, deceptive promotional evasion, and regulatory
    loopholes to evaluate whether newly written brand guidelines can be bypassed before rollout.
    """
    def __init__(self):
        pass

    def _get_benchmark_scenarios(self, brand: BrandProfile) -> List[Dict[str, Any]]:
        is_eu = "eu" in brand.brand_id.lower() or brand.region_code == "EU"
        is_us = "us" in brand.brand_id.lower() or brand.region_code == "US"

        scenarios = [
            {
                "scenario_id": "ADV-01",
                "category": "unsubstantiated_superlative",
                "title": "Synonymous Superlative Evasion Attack",
                "synthetic_attack_copy": "Inkloom's neural engine delivers an unmatched, flawless solution that completely eliminates human error.",
                "intended_adversarial_vector": "Avoids literal forbidden terms '100% bug-free' by employing synonyms 'flawless' and 'completely eliminates human error'.",
                "severity": Severity.CRITICAL,
                "evasion_pattern": ["flawless", "completely eliminates human error", "unmatched"],
                "target_rule_id": "INK-CLAIM-01",
                "loophole_desc": "Rule INK-CLAIM-01 targets explicit terms ('100% bug-free', 'zero errors') but leaves semantic synonyms like 'flawless' unconstrained.",
                "patch_terms": ["flawless", "completely eliminates human error", "unmatched"],
                "patch_preferred": {
                    "flawless": "high-precision",
                    "completely eliminates human error": "significantly reduces operational error",
                    "unmatched": "industry-leading"
                }
            },
            {
                "scenario_id": "ADV-02",
                "category": "ambiguous_comparative",
                "title": "Vague Benchmarking & Competitor Disparagement",
                "synthetic_attack_copy": "Unlike legacy dinosaur tools on the market that crawl at a snail's pace, Inkloom is 10x faster.",
                "intended_adversarial_vector": "Combines disparaging colloquial phrasing ('dinosaur tools', 'snail pace') with unverified 10x performance multipliers.",
                "severity": Severity.WARNING,
                "evasion_pattern": ["dinosaur tools", "snail's pace", "10x faster"],
                "target_rule_id": "INK-TONE-01",
                "loophole_desc": "Tone policy proscribes 'hollow corporate buzzwords' but lacks explicit prohibition against informal mocking metaphors.",
                "patch_terms": ["dinosaur tools", "snail's pace", "10x faster"],
                "patch_preferred": {
                    "dinosaur tools": "traditional governance processes",
                    "snail's pace": "manual review cycles",
                    "10x faster": "sub-2-second automated verification"
                }
            },
            {
                "scenario_id": "ADV-03",
                "category": "covert_pricing",
                "title": "Deceptive Zero-Cost Freemium Loophole",
                "synthetic_attack_copy": "Get BrandGuard AI completely free forever with our unmetered trial edition.",
                "intended_adversarial_vector": "Proclaims 'completely free forever' to generate clickthroughs despite enterprise commercial contracts starting at $499/mo.",
                "severity": Severity.CRITICAL,
                "evasion_pattern": ["completely free forever", "free forever"],
                "target_rule_id": "INK-CLAIM-01",
                "loophole_desc": "Truth store asserts standard pricing is $499/mo, but verifier lacked regex intercept for deceptive zero-dollar freemium phrasing.",
                "patch_terms": ["completely free forever", "free forever"],
                "patch_preferred": {
                    "completely free forever": "14-day full-featured enterprise trial",
                    "free forever": "commercial pilot program"
                }
            },
            {
                "scenario_id": "ADV-04",
                "category": "statutory_transparency_evasion",
                "title": "Obfuscated AI Disclosure Evasion",
                "synthetic_attack_copy": "Collateral autonomously compiled via algorithmic neural cognition without editorial delay.",
                "intended_adversarial_vector": "Uses pseudo-scientific terminology ('algorithmic neural cognition') to disguise AI generation and circumvent transparency statutes.",
                "severity": Severity.CRITICAL,
                "evasion_pattern": ["algorithmic neural cognition"],
                "target_rule_id": "INK-REG-01",
                "loophole_desc": "Compliance policy requires disclosure of 'AI assistance', allowing evasive circumventions using alternative phrasing like 'algorithmic neural cognition'.",
                "patch_terms": ["algorithmic neural cognition"],
                "patch_preferred": {
                    "algorithmic neural cognition": "AI assistance certified by human editorial review"
                }
            },
            {
                "scenario_id": "ADV-05",
                "category": "security_absolute",
                "title": "Absolute Cybersecurity Guarantee",
                "synthetic_attack_copy": "Our zero-trust architecture is 100% unbreachable and impervious to all nation-state threats.",
                "intended_adversarial_vector": "Asserts unbreachable cybersecurity invulnerability in violation of FTC Act Section 5 advertising enforcement rules.",
                "severity": Severity.CRITICAL,
                "evasion_pattern": ["100% unbreachable", "impervious to all"],
                "target_rule_id": "TC-SEC-01",
                "loophole_desc": "Security guidelines prohibit '100% unhackable' but miss synonymous absolute claims like '100% unbreachable'.",
                "patch_terms": ["100% unbreachable", "impervious to all"],
                "patch_preferred": {
                    "100% unbreachable": "SOC2 certified with defense-in-depth architecture",
                    "impervious to all": "resilient against modern threat vectors"
                }
            },
            {
                "scenario_id": "ADV-06",
                "category": "tone_drift",
                "title": "Aggressive False Urgency Manipulation",
                "synthetic_attack_copy": "Act in the next 10 minutes or your brand will suffer catastrophic reputation loss.",
                "intended_adversarial_vector": "Uses coercive psychological pressure and fear-mongering contradictory to the brand's authoritative and approachable ethos.",
                "severity": Severity.WARNING,
                "evasion_pattern": ["next 10 minutes", "catastrophic reputation loss"],
                "target_rule_id": "INK-TONE-01",
                "loophole_desc": "Brand tone guidelines do not explicitly proscribe dark pattern false urgency mechanisms.",
                "patch_terms": ["next 10 minutes", "catastrophic reputation loss"],
                "patch_preferred": {
                    "next 10 minutes": "at your earliest convenience",
                    "catastrophic reputation loss": "unnecessary compliance risk"
                }
            }
        ]

        if is_eu:
            scenarios.append({
                "scenario_id": "ADV-EU-01",
                "category": "eu_ai_act_transparency",
                "title": "EU AI Act Article 50 Watermarking Omission",
                "synthetic_attack_copy": "Discover the European brand standard synthesized by Inkloom AI for immediate EU distribution.",
                "intended_adversarial_vector": "Omits mandatory machine-readable synthetic indicator label required under Regulation 2024/1689.",
                "severity": Severity.CRITICAL,
                "evasion_pattern": ["immediate EU distribution"],
                "target_rule_id": "EU-AIACT-01",
                "loophole_desc": "Marketing copy mentions EU distribution without including the mandatory statutory disclosure statement.",
                "patch_terms": ["immediate EU distribution"],
                "patch_preferred": {
                    "immediate EU distribution": "distribution (Certified compliant with EU AI Act Reg 2024/1689)"
                }
            })

        return scenarios

    def run_stress_test(self, brand_id: str) -> StressTestReport:
        """Runs the adversarial simulation suite against the specified brand's policy graph."""
        brand = vault_service.get_effective_brand_profile(brand_id)
        if not brand:
            brand = vault_service.get_brand("inkloom")

        scenarios_raw = self._get_benchmark_scenarios(brand)
        evaluated_scenarios: List[StressTestScenario] = []
        loopholes_count = 0

        # Scan each scenario through the brand's live policy graph and claim verifier
        for s in scenarios_raw:
            text = s["synthetic_attack_copy"]
            graph_issues = policy_graph_service.scan_text_with_graph(text, brand)
            claim_issues = claim_verifier_service.verify_claims(text, brand)
            all_issues = graph_issues + claim_issues

            is_intercepted = False
            detected_rule = None

            # Check if any issue matched this scenario's prohibited concepts
            for issue in all_issues:
                for term in s["evasion_pattern"]:
                    if term.lower() in issue.offending_content.lower() or term.lower() in text.lower() and issue.rule_id == s.get("target_rule_id"):
                        is_intercepted = True
                        detected_rule = issue.rule_id
                        break
                if is_intercepted:
                    break

            # If none of the evasion patterns were intercepted by the current policy
            if not is_intercepted:
                loopholes_count += 1
                evaluated_scenarios.append(
                    StressTestScenario(
                        scenario_id=s["scenario_id"],
                        category=s["category"],
                        title=s["title"],
                        synthetic_attack_copy=text,
                        intended_adversarial_vector=s["intended_adversarial_vector"],
                        status="evaded_loophole",
                        severity=s["severity"],
                        exploited_loophole=s["loophole_desc"],
                        recommended_patch_rule={
                            "rule_id": s["target_rule_id"],
                            "prohibited_terms": s["patch_terms"],
                            "preferred_terms": s["patch_preferred"]
                        },
                        detected_rule_id=None
                    )
                )
            else:
                evaluated_scenarios.append(
                    StressTestScenario(
                        scenario_id=s["scenario_id"],
                        category=s["category"],
                        title=s["title"],
                        synthetic_attack_copy=text,
                        intended_adversarial_vector=s["intended_adversarial_vector"],
                        status="intercepted",
                        severity=s["severity"],
                        exploited_loophole=None,
                        recommended_patch_rule=None,
                        detected_rule_id=detected_rule
                    )
                )

        total = len(evaluated_scenarios)
        intercepted = total - loopholes_count
        resilience = int((intercepted / total) * 100) if total > 0 else 100

        summary = (
            f"Adversarial Stress Test completed for {brand.name}. {total} synthetic adversarial vectors evaluated. "
            f"{intercepted} attacks successfully intercepted by active policy graph ({resilience}% resilience). "
            f"{loopholes_count} policy loopholes identified where phrasing circumvented existing rule bounds. "
            f"Automated remediation patches generated for 1-click policy fortification."
        )

        return StressTestReport(
            report_id=f"STRESS-{uuid.uuid4().hex[:8].upper()}",
            brand_id=brand.brand_id,
            brand_name=brand.name,
            tested_at=datetime.now(timezone.utc),
            resilience_score=resilience,
            total_scenarios_tested=total,
            loopholes_discovered=loopholes_count,
            scenarios=evaluated_scenarios,
            executive_summary=summary
        )

    def apply_policy_patch(self, req: PatchPolicyRequest) -> BrandProfile:
        """Patches the brand's policy graph in the Vault, resolving an identified loophole."""
        brand = vault_service.get_brand(req.brand_id)
        if not brand:
            raise ValueError(f"Brand '{req.brand_id}' not found")

        # Find target rule to patch or add new rule
        if req.patch_type == "add_rule" and req.rule_patch:
            vault_service.add_rule(brand.brand_id, req.rule_patch)
        else:
            # Patch existing rule with new prohibited terms and canonical replacements
            target_rule = None
            for r in brand.rules:
                if req.scenario_id in r.rule_id or r.rule_id == "INK-CLAIM-01" or r.rule_id == "INK-TONE-01":
                    target_rule = r
                    break
            if not target_rule and brand.rules:
                target_rule = brand.rules[0]

            if target_rule:
                for term in req.forbidden_terms:
                    if term not in target_rule.forbidden_terms:
                        target_rule.forbidden_terms.append(term)
                for k, v in req.preferred_terms.items():
                    target_rule.preferred_terms[k] = v

                if req.mandatory_disclaimer and req.mandatory_disclaimer not in target_rule.mandatory_disclaimers:
                    target_rule.mandatory_disclaimers.append(req.mandatory_disclaimer)

                vault_service.add_rule(brand.brand_id, target_rule)

        # Force rebuild of policy graph
        policy_graph_service.build_or_get_graph(brand)
        return brand

# Singleton instance
stress_tester_service = StressTesterService()
