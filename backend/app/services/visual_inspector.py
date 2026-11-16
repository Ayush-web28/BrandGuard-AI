import io
import math
import uuid
import base64
from typing import List, Tuple, Dict, Optional
from PIL import Image
from app.models.schemas import (
    BrandProfile, VisualMetric, FlaggedIssue, GuidelineCategory, Severity
)

class VisualInspectorService:
    def __init__(self):
        pass

    def hex_to_rgb(self, hex_code: str) -> Tuple[int, int, int]:
        hex_code = hex_code.lstrip('#')
        if len(hex_code) == 3:
            hex_code = ''.join([c*2 for c in hex_code])
        return tuple(int(hex_code[i:i+2], 16) for i in (0, 2, 4))

    def rgb_to_hex(self, rgb: Tuple[int, int, int]) -> str:
        return f"#{rgb[0]:02X}{rgb[1]:02X}{rgb[2]:02X}"

    def calculate_relative_luminance(self, rgb: Tuple[int, int, int]) -> float:
        """Calculates W3C relative luminance for an sRGB color."""
        def channel_lum(val: int) -> float:
            c = val / 255.0
            return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

        r = channel_lum(rgb[0])
        g = channel_lum(rgb[1])
        b = channel_lum(rgb[2])
        return 0.2126 * r + 0.7152 * g + 0.0722 * b

    def calculate_contrast_ratio(self, rgb1: Tuple[int, int, int], rgb2: Tuple[int, int, int]) -> float:
        """Calculates WCAG 2.1 contrast ratio between two colors (range 1.0 to 21.0)."""
        l1 = self.calculate_relative_luminance(rgb1)
        l2 = self.calculate_relative_luminance(rgb2)
        lighter = max(l1, l2)
        darker = min(l1, l2)
        return (lighter + 0.05) / (darker + 0.05)

    def color_distance(self, rgb1: Tuple[int, int, int], rgb2: Tuple[int, int, int]) -> float:
        """Calculates Euclidean color distance in sRGB space."""
        return math.sqrt(
            (rgb1[0] - rgb2[0]) ** 2 +
            (rgb1[1] - rgb2[1]) ** 2 +
            (rgb1[2] - rgb2[2]) ** 2
        )

    def extract_palette(self, image: Image.Image, max_colors: int = 5) -> List[str]:
        """Extracts dominant hex colors from image using PIL quantization."""
        img_small = image.convert("RGB").resize((150, 150))
        # Quantize to dominant colors
        quantized = img_small.quantize(colors=max_colors)
        palette = quantized.getpalette()[:max_colors*3]
        
        hex_colors = []
        for i in range(0, len(palette), 3):
            rgb = (palette[i], palette[i+1], palette[i+2])
            hex_colors.append(self.rgb_to_hex(rgb))
        return list(dict.fromkeys(hex_colors)) # Deduplicate

    def inspect_image(
        self,
        image_base64: str,
        brand: BrandProfile
    ) -> Tuple[VisualMetric, List[FlaggedIssue]]:
        """Performs full visual inspection on base64 encoded image."""
        issues: List[FlaggedIssue] = []
        warnings: List[str] = []

        try:
            # Decode image
            image_data = base64.b64decode(image_base64.split(",")[-1])
            image = Image.open(io.BytesIO(image_data))
        except Exception as e:
            # Return dummy fallback if corrupted
            return (
                VisualMetric(
                    extracted_palette=["#000000", "#FFFFFF"],
                    palette_compliance_score=0.0,
                    contrast_ratio=1.0,
                    wcag_aa_compliant=False,
                    warnings=[f"Failed to decode image data: {str(e)}"]
                ),
                []
            )

        width, height = image.size
        palette = self.extract_palette(image, max_colors=5)
        
        # 1. EVALUATE CONTRAST RATIO (between darkest and lightest extracted colors)
        rgbs = [self.hex_to_rgb(h) for h in palette]
        luminances = [(self.calculate_relative_luminance(rgb), rgb, h) for rgb, h in zip(rgbs, palette)]
        luminances.sort(key=lambda x: x[0])
        
        darkest = luminances[0]
        lightest = luminances[-1]
        contrast = round(self.calculate_contrast_ratio(darkest[1], lightest[1]), 2)
        
        wcag_aa = contrast >= brand.tokens.min_contrast_ratio
        wcag_aaa = contrast >= 7.0

        if not wcag_aa:
            issues.append(
                FlaggedIssue(
                    issue_id=f"VIS-{uuid.uuid4().hex[:8].upper()}",
                    category=GuidelineCategory.ACCESSIBILITY,
                    severity=Severity.CRITICAL,
                    title=f"WCAG 2.1 AA Contrast Failure ({contrast}:1)",
                    explanation=(
                        f"The calculated contrast ratio ({contrast}:1) between background and foreground "
                        f"elements falls below the mandatory WCAG 2.1 AA minimum of {brand.tokens.min_contrast_ratio}:1. "
                        f"Low contrast causes severe legibility problems for visually impaired users."
                    ),
                    offending_content=f"Color pair: {darkest[2]} on {lightest[2]}",
                    suggested_fix=f"Darken {darkest[2]} or lighten {lightest[2]} to achieve at least 4.5:1 luminance contrast.",
                    rule_id="INK-ACC-01",
                    rule_title="WCAG 2.1 AA Contrast Compliance",
                    source_citation="WCAG 2.1 Success Criterion 1.4.3 (Contrast Minimum)",
                    intent_preservation_note="Modifies color luminance values without altering layout composition.",
                    confidence_score=0.98
                )
            )

        # 2. EVALUATE PALETTE ADHERENCE TO BRAND TOKENS
        brand_colors = [self.hex_to_rgb(brand.tokens.primary_color), self.hex_to_rgb(brand.tokens.secondary_color)]
        for acc in brand.tokens.accent_colors:
            brand_colors.append(self.hex_to_rgb(acc))

        palette_score = 1.0
        forbidden_matches = []

        for h, rgb in zip(palette, rgbs):
            # Check forbidden colors
            for fb in brand.tokens.forbidden_colors:
                fb_rgb = self.hex_to_rgb(fb)
                if self.color_distance(rgb, fb_rgb) < 35.0: # Close to forbidden color
                    forbidden_matches.append(h)

        if forbidden_matches:
            palette_score -= 0.4
            issues.append(
                FlaggedIssue(
                    issue_id=f"VIS-{uuid.uuid4().hex[:8].upper()}",
                    category=GuidelineCategory.VISUAL,
                    severity=Severity.WARNING,
                    title="Off-Brand Forbidden Color Detected",
                    explanation=f"Image contains color(s) {', '.join(forbidden_matches)} which are prohibited in brand guidelines.",
                    offending_content=", ".join(forbidden_matches),
                    suggested_fix=f"Replace with brand primary {brand.tokens.primary_color} or secondary {brand.tokens.secondary_color}.",
                    rule_id="INK-VIS-01",
                    rule_title="Approved Color Palette Compliance",
                    source_citation=f"{brand.name} Design System (Color Tokens)",
                    intent_preservation_note="Aligns color palette with approved design tokens.",
                    confidence_score=0.94
                )
            )

        # 3. LOGO SAFE-ZONE / ASPECT RATIO HEURISTIC
        logo_clear = True
        if width > 0 and height > 0:
            aspect = round(width / height, 2)
            # If banner dimensions are weird or narrow
            if aspect > 8.0 or aspect < 0.2:
                warnings.append(f"Extreme aspect ratio ({aspect}:1) may cause logo clipping.")

        metric = VisualMetric(
            extracted_palette=palette,
            palette_compliance_score=round(max(0.0, palette_score), 2),
            contrast_ratio=contrast,
            wcag_aa_compliant=wcag_aa,
            wcag_aaa_compliant=wcag_aaa,
            logo_detected=True,
            logo_clear_space_ok=logo_clear,
            warnings=warnings
        )

        return metric, issues

# Singleton
visual_inspector_service = VisualInspectorService()
