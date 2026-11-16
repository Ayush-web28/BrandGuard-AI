import os
import difflib
from typing import List, Dict, Optional, Tuple
from app.models.schemas import (
    BrandProfile, FlaggedIssue, Severity, ScanResult, ContentFormat, ReviewStatus
)

class IntentPreservingRewriterService:
    def __init__(self):
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "")

    def calculate_overall_score(self, issues: List[FlaggedIssue], visual_contrast_ok: bool = True) -> int:
        score = 100
        for issue in issues:
            if issue.severity == Severity.CRITICAL:
                score -= 25
            elif issue.severity == Severity.WARNING:
                score -= 10
            elif issue.severity == Severity.INFO:
                score -= 3

        if not visual_contrast_ok:
            score -= 15

        return max(0, min(100, score))

    def generate_cleaned_text(self, original_text: str, issues: List[FlaggedIssue]) -> str:
        """Applies suggested fixes sequentially to create a compliant draft preserving author structure."""
        # Sort issues with start_pos in reverse order so replacements don't shift earlier character indices
        positioned_issues = [i for i in issues if i.start_pos is not None and i.end_pos is not None]
        positioned_issues.sort(key=lambda x: x.start_pos, reverse=True)

        cleaned = original_text
        for issue in positioned_issues:
            start = issue.start_pos
            end = issue.end_pos
            if start is not None and end is not None and 0 <= start <= end <= len(cleaned):
                cleaned = cleaned[:start] + issue.suggested_fix + cleaned[end:]

        # If any mandatory regulatory disclaimer is flagged, append to the end
        disclaimer_issues = [i for i in issues if i.start_pos is None and i.suggested_fix.startswith("\n")]
        for d in disclaimer_issues:
            if d.suggested_fix not in cleaned:
                cleaned += d.suggested_fix

        return cleaned

    def generate_diff_html(self, original_text: str, cleaned_text: str) -> str:
        """Generates inline HTML diff highlighting deletions in red and insertions in green."""
        matcher = difflib.SequenceMatcher(None, original_text, cleaned_text)
        result = []
        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            if tag == 'equal':
                result.append(original_text[i1:i2])
            elif tag == 'delete':
                result.append(f'<del class="bg-red-100 text-red-700 line-through px-1 rounded">{original_text[i1:i2]}</del>')
            elif tag == 'insert':
                result.append(f'<ins class="bg-emerald-100 text-emerald-800 font-medium px-1 rounded no-underline">{cleaned_text[j1:j2]}</ins>')
            elif tag == 'replace':
                result.append(f'<del class="bg-red-100 text-red-700 line-through px-1 rounded">{original_text[i1:i2]}</del>')
                result.append(f'<ins class="bg-emerald-100 text-emerald-800 font-medium px-1 rounded no-underline">{cleaned_text[j1:j2]}</ins>')
        return "".join(result)

    def enhance_rewrite_with_llm(
        self,
        original_text: str,
        issues: List[FlaggedIssue],
        brand: BrandProfile,
        creator_intent: Optional[str] = None
    ) -> Optional[str]:
        """Optional LLM enhancement using Gemini if GEMINI_API_KEY is available."""
        if not self.gemini_api_key:
            return None

        try:
            from google import genai
            client = genai.Client(api_key=self.gemini_api_key)
            prompt = (
                f"You are BrandGuard AI's brand rewriting co-pilot for {brand.name}.\n"
                f"Brand Tone: {brand.tone.voice_description}\n"
                f"Creator's Stated Intent: {creator_intent or 'Publish professional marketing copy.'}\n\n"
                f"Original Text:\n'''{original_text}'''\n\n"
                f"Issues to fix:\n" +
                "\n".join([f"- {i.title}: {i.explanation} (Suggest: {i.suggested_fix})" for i in issues]) +
                "\n\nTask: Rewrite the text to fix all issues while preserving the creator's exact purpose and style. "
                "Do not add fluff. Output ONLY the rewritten text."
            )
            response = client.models.generate_content(
                model="gemini-1.5-flash",
                contents=prompt
            )
            if response and response.text:
                return response.text.strip()
        except Exception:
            pass
        return None

# Singleton
rewriter_service = IntentPreservingRewriterService()
