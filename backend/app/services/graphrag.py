import re
import uuid
import networkx as nx
from typing import List, Dict, Tuple, Optional
from app.models.schemas import (
    BrandProfile, Rule, FlaggedIssue, GuidelineCategory, Severity,
    ContentFormat
)

class PolicyGraphService:
    def __init__(self):
        self._graphs: Dict[str, nx.DiGraph] = {}

    def build_or_get_graph(self, brand: BrandProfile) -> nx.DiGraph:
        """Constructs or retrieves a directed Knowledge Graph for the brand's policy rules."""
        brand_id = brand.brand_id.lower()
        if brand_id in self._graphs and self._graphs[brand_id].graph.get("updated_at") == brand.updated_at:
            return self._graphs[brand_id]

        G = nx.DiGraph(updated_at=brand.updated_at, brand_id=brand_id)
        
        # Central Brand Node
        brand_node = f"brand:{brand_id}"
        G.add_node(brand_node, type="brand", name=brand.name)

        for rule in brand.rules:
            rule_node = f"rule:{rule.rule_id}"
            G.add_node(
                rule_node,
                type="rule",
                rule_id=rule.rule_id,
                title=rule.title,
                category=rule.category.value,
                severity=rule.severity.value,
                citation=f"{rule.source_document} ({rule.citation_ref})"
            )
            G.add_edge(brand_node, rule_node, relation="enforces")

            # Connect Source Document Citation
            citation_node = f"source:{rule.source_document}"
            G.add_node(citation_node, type="source_doc", name=rule.source_document)
            G.add_edge(rule_node, citation_node, relation="cited_in", ref=rule.citation_ref)

            # Connect Forbidden Terms
            for term in rule.forbidden_terms:
                term_node = f"term:forbidden:{term.lower()}"
                preferred = rule.preferred_terms.get(term, "")
                G.add_node(term_node, type="forbidden_term", term=term, preferred=preferred)
                G.add_edge(rule_node, term_node, relation="prohibits")

            # Connect Mandatory Disclaimers
            for disclaimer in rule.mandatory_disclaimers:
                disc_node = f"disc:{disclaimer.lower()}"
                G.add_node(disc_node, type="mandatory_disclaimer", text=disclaimer)
                G.add_edge(rule_node, disc_node, relation="requires")

        self._graphs[brand_id] = G
        return G

    def scan_text_with_graph(
        self,
        content: str,
        brand: BrandProfile,
        content_format: ContentFormat = ContentFormat.SOCIAL_POST
    ) -> List[FlaggedIssue]:
        """Scans the given content string against the brand policy graph."""
        G = self.build_or_get_graph(brand)
        issues: List[FlaggedIssue] = []

        # 1. SCAN PROHIBITED TERMS VIA GRAPH EDGES
        for rule_node in [n for n, d in G.nodes(data=True) if d.get("type") == "rule"]:
            rule_data = G.nodes[rule_node]
            rule_id = rule_data["rule_id"]

            # Check outbound edges for prohibited terms
            for _, term_node, edge_data in G.out_edges(rule_node, data=True):
                if edge_data.get("relation") == "prohibits":
                    term_data = G.nodes[term_node]
                    term = term_data["term"]
                    preferred = term_data.get("preferred", "")

                    # If preferred term exists and match is already exactly the preferred term, skip!
                    pattern = r'(?i)\b' + re.escape(term) + r'\b'
                    for match in re.finditer(pattern, content):
                        start, end = match.span()
                        matched_text = content[start:end]

                        # Skip if already exactly matching the canonical preferred form
                        if preferred and matched_text == preferred:
                            continue

                        # If term is a sub-phrase of the canonical form (e.g. 'Brandguard' when followed by ' AI'), check ahead
                        if preferred and preferred.startswith(matched_text) and content[start:start+len(preferred)] == preferred:
                            continue

                        suggested = preferred if preferred else f"[revised without '{matched_text}']"
                        
                        note = (
                            f"Replaced buzzword/prohibited phrase '{matched_text}' with '{suggested}' "
                            f"to adhere to {rule_data['title']} while maintaining original message nuance."
                        )

                        issue = FlaggedIssue(
                            issue_id=f"ISSUE-{uuid.uuid4().hex[:8].upper()}",
                            category=GuidelineCategory(rule_data["category"]),
                            severity=Severity(rule_data["severity"]),
                            title=f"Prohibited Language: '{matched_text}'",
                            explanation=(
                                f"The phrase '{matched_text}' breaches company guidelines. "
                                f"{rule_data['title']}."
                            ),
                            offending_content=matched_text,
                            suggested_fix=suggested,
                            rule_id=rule_id,
                            rule_title=rule_data["title"],
                            source_citation=rule_data["citation"],
                            intent_preservation_note=note,
                            confidence_score=0.95,
                            start_pos=start,
                            end_pos=end
                        )
                        issues.append(issue)

            # 2. CHECK MANDATORY REGULATORY DISCLAIMERS
            for _, disc_node, edge_data in G.out_edges(rule_node, data=True):
                if edge_data.get("relation") == "requires":
                    disc_data = G.nodes[disc_node]
                    disclaimer_text = disc_data["text"]

                    # If not present in content (case-insensitive substring)
                    if disclaimer_text.lower() not in content.lower():
                        # Only strictly required for press releases, formal documents, and marketing articles
                        if content_format in [ContentFormat.PRESS_RELEASE, ContentFormat.DOCUMENT, ContentFormat.TEXT]:
                            issues.append(
                                FlaggedIssue(
                                    issue_id=f"ISSUE-{uuid.uuid4().hex[:8].upper()}",
                                    category=GuidelineCategory(rule_data["category"]),
                                    severity=Severity(rule_data["severity"]),
                                    title=f"Missing Mandatory Disclosure: '{disclaimer_text}'",
                                    explanation=(
                                        f"In accordance with {rule_data['title']}, this {content_format.value} "
                                        f"requires transparent disclosure of AI assistance."
                                    ),
                                    offending_content="[Entire Document / Missing Footer]",
                                    suggested_fix=f"\n\n*Disclosure: {disclaimer_text}.*",
                                    rule_id=rule_id,
                                    rule_title=rule_data["title"],
                                    source_citation=rule_data["citation"],
                                    intent_preservation_note="Appended compliance disclosure without altering creative copy body.",
                                    confidence_score=0.99
                                )
                            )

        # 3. TONE & VOCABULARY DENSITY EVALUATION
        tone_issues = self._evaluate_tone_heuristics(content, brand)
        issues.extend(tone_issues)

        # Sort issues by start_pos where available
        issues.sort(key=lambda x: x.start_pos if x.start_pos is not None else 999999)
        return issues

    def _evaluate_tone_heuristics(self, content: str, brand: BrandProfile) -> List[FlaggedIssue]:
        tone_issues = []
        words = content.split()
        if not words:
            return tone_issues

        # Check for excessive exclamation marks (informal / hyping tone)
        exclamation_count = content.count('!')
        if exclamation_count >= 3:
            tone_issues.append(
                FlaggedIssue(
                    issue_id=f"ISSUE-{uuid.uuid4().hex[:8].upper()}",
                    category=GuidelineCategory.TONE,
                    severity=Severity.WARNING,
                    title="Overly Informal / Promotional Punctuation",
                    explanation=f"Content contains {exclamation_count} exclamation points, which conflicts with an authoritative, restrained brand voice.",
                    offending_content="Multiple exclamation marks (!!!)",
                    suggested_fix="Replace exclamation points with periods (.) to project confident authority.",
                    rule_id="INK-TONE-01",
                    rule_title="Authoritative Voice Standard",
                    source_citation=f"{brand.name} Tone Guidelines",
                    intent_preservation_note="Restores professional cadence while maintaining sentence intent.",
                    confidence_score=0.88
                )
            )

        # Check for ALL CAPS screaming
        caps_words = [w for w in words if len(w) > 3 and w.isupper() and w.isalpha()]
        if len(caps_words) >= 2:
            offending = " ".join(caps_words[:3])
            tone_issues.append(
                FlaggedIssue(
                    issue_id=f"ISSUE-{uuid.uuid4().hex[:8].upper()}",
                    category=GuidelineCategory.TONE,
                    severity=Severity.WARNING,
                    title="Capitalization Formatting Violation",
                    explanation=f"Words in ALL CAPS ({offending}) convey an aggressive tone rather than confident leadership.",
                    offending_content=offending,
                    suggested_fix=offending.title(),
                    rule_id="INK-TONE-01",
                    rule_title="Authoritative Voice Standard",
                    source_citation=f"{brand.name} Style Guide",
                    intent_preservation_note="Applies sentence/title casing preserving meaning.",
                    confidence_score=0.92
                )
            )

        return tone_issues

# Singleton
policy_graph_service = PolicyGraphService()
