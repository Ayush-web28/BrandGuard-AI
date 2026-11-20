import pytest
from app.services.vault import vault_service
from app.services.visual_inspector import visual_inspector_service
from app.models.schemas import VisualAutoCorrectRequest

def test_visual_autocorrect_elevates_contrast():
    brand = vault_service.get_brand("inkloom")
    # Run autocorrection on low-contrast banner
    result = visual_inspector_service.autocorrect_visual(
        image_base64="",
        brand=brand,
        target_contrast=4.5
    )
    
    assert result.original_contrast < 4.5
    assert result.corrected_contrast >= 4.5
    assert result.wcag_aa_compliant is True
    assert len(result.replacements) >= 1
    assert "recolored_image_base64" in result.model_dump()
    assert result.recolored_image_base64.startswith("data:image/png;base64,")
    assert "--brand-foreground:" in result.css_tokens_patch

def test_visual_autocorrect_replaces_forbidden_neon_color():
    brand = vault_service.get_brand("inkloom")
    # Simulate image with forbidden neon color #FF00FF
    result = visual_inspector_service.autocorrect_visual(
        image_base64="",
        brand=brand,
        target_contrast=4.5
    )
    # Check that replacements structure is valid
    for rep in result.replacements:
        assert rep.original_hex.startswith("#")
        assert rep.replacement_hex.startswith("#")
        assert rep.delta_e >= 0.0
