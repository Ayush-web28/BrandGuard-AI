import re
import uuid
from typing import List, Dict, Optional, Tuple
from app.models.schemas import (
    BrandProfile, ApprovedFact, FlaggedIssue, GuidelineCategory, Severity
)

class ClaimVerifierService:
    def __init__(self):
        # Patterns for unverified superlatives and absolute claims
        self.superlative_patterns = [
            (r'\b(the only|the world\'s only|the first and only)\b', "Unsubstantiated Monopoly Claim"),
            (r'\b(100% (bug-free|error-free|secure|unhackable|uptime))\b', "Unsubstantiated Absolute Performance Claim"),
            (r'\b(zero (latency|downtime|bugs|errors|outages))\b', "Unsubstantiated Zero-Tolerance Claim"),
            (r'\b(guaranteed (top|#1|market leader|success))\b', "Unverified Commercial Guarantee"),
            (r'\b(\d+x faster|\d+x better|\d+x more powerful)\b', "Unverified Multiplier Comparison")
        ]

    def verify_claims(self, content: str, brand: BrandProfile) -> List[FlaggedIssue]:
        issues: List[FlaggedIssue] = []

        # 1. SCAN FOR PROHIBITED / UNSUBSTANTIATED SUPERLATIVES
        for pattern, claim_type in self.superlative_patterns:
            for match in re.finditer(pattern, content, re.IGNORECASE):
                start, end = match.span()
                claim_str = content[start:end]

                # Check if this claim is backed by an approved fact
                matching_fact = self._find_matching_approved_fact(claim_str, brand.approved_facts)

                if not matching_fact:
                    # Look for the relevant claim rule
                    claim_rule = next(
                        (r for r in brand.rules if r.category == GuidelineCategory.FACTUAL_CLAIM),
                        None
                    )
                    rule_id = claim_rule.rule_id if claim_rule else "CLAIM-VERIFY-01"
                    rule_title = claim_rule.title if claim_rule else "Performance Claim Substantiation"
                    citation = (
                        f"{claim_rule.source_document} ({claim_rule.citation_ref})"
                        if claim_rule else f"{brand.name} Commercial Claims Policy"
                    )

                    # Generate intent-preserving replacement
                    suggested = self._generate_substantiated_alternative(claim_str)

                    issues.append(
                        FlaggedIssue(
                            issue_id=f"CLAIM-{uuid.uuid4().hex[:8].upper()}",
                            category=GuidelineCategory.FACTUAL_CLAIM,
                            severity=Severity.CRITICAL,
                            title=f"{claim_type}: '{claim_str}'",
                            explanation=(
                                f"The assertion '{claim_str}' lacks documented substantiation in the "
                                f"approved brand fact vault. Unsubstantiated claims expose the organization to legal liability."
                            ),
                            offending_content=claim_str,
                            suggested_fix=suggested,
                            rule_id=rule_id,
                            rule_title=rule_title,
                            source_citation=citation,
                            intent_preservation_note=(
                                f"Softens absolute claim '{claim_str}' to a legally defensible statement "
                                f"('{suggested}') while highlighting product strength."
                            ),
                            confidence_score=0.96,
                            start_pos=start,
                            end_pos=end
                        )
                    )

        # 2. CHECK VERIFIED FACTS & OUTDATED PRICING / STATS
        pricing_issues = self._verify_pricing_and_metrics(content, brand)
        issues.extend(pricing_issues)

        return issues

    def _find_matching_approved_fact(self, claim_str: str, approved_facts: List[ApprovedFact]) -> Optional[ApprovedFact]:
        claim_lower = claim_str.lower()
        for fact in approved_facts:
            if fact.is_active:
                if fact.verified_metric and fact.verified_metric.lower() in claim_lower:
                    return fact
                if fact.subject.lower() in claim_lower:
                    return fact
        return None

    def _generate_substantiated_alternative(self, claim_str: str) -> str:
        c = claim_str.lower()
        if "the only" in c:
            return "a leading enterprise"
        if "100% bug-free" in c:
            return "rigorously tested"
        if "100% unhackable" in c or "100% secure" in c:
            return "SOC2 certified with zero-trust architecture"
        if "100% uptime" in c or "zero downtime" in c or "zero outages" in c:
            return "99.99% high-availability SLA"
        if "zero latency" in c:
            return "sub-50ms ultra-low latency"
        if "faster" in c:
            return "demonstrably faster"
        return f"proven {claim_str}"

    def _verify_pricing_and_metrics(self, content: str, brand: BrandProfile) -> List[FlaggedIssue]:
        issues = []
        # Look for price mentions like $99, $199, etc.
        price_matches = re.finditer(r'\$(\d+)(/mo|/month)?\b', content, re.IGNORECASE)
        
        pricing_facts = [f for f in brand.approved_facts if "pricing" in f.tags or "$" in (f.verified_metric or "")]
        
        if pricing_facts:
            approved_prices = [f.verified_metric for f in pricing_facts if f.verified_metric]
            for match in price_matches:
                found_price = match.group(0)
                # Check if found price is among approved
                is_approved = any(ap.lower() == found_price.lower() or found_price in ap for ap in approved_prices)
                if not is_approved:
                    best_fact = pricing_facts[0]
                    start, end = match.span()
                    issues.append(
                        FlaggedIssue(
                            issue_id=f"CLAIM-{uuid.uuid4().hex[:8].upper()}",
                            category=GuidelineCategory.FACTUAL_CLAIM,
                            severity=Severity.CRITICAL,
                            title=f"Unverified Pricing Figure: '{found_price}'",
                            explanation=(
                                f"The price '{found_price}' is not listed in the active commercial pricing schedule. "
                                f"Official approved tier is {best_fact.verified_metric}."
                            ),
                            offending_content=found_price,
                            suggested_fix=best_fact.verified_metric or "$499/mo",
                            rule_id="INK-CLAIM-01",
                            rule_title="Commercial Pricing Verification",
                            source_citation=f"{best_fact.source_document} ({best_fact.citation_ref})",
                            intent_preservation_note="Replaced obsolete/incorrect pricing with approved active rate.",
                            confidence_score=0.98,
                            start_pos=start,
                            end_pos=end
                        )
                    )
        return issues

# Singleton
claim_verifier_service = ClaimVerifierService()
