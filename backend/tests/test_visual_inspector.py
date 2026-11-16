import base64
import io
from PIL import Image
from app.services.vault import vault_service
from app.services.visual_inspector import visual_inspector_service
from app.models.schemas import GuidelineCategory

def create_test_image_base64(color1=(255, 255, 255), color2=(0, 0, 0)) -> str:
    # 100x100 half color1, half color2
    img = Image.new("RGB", (100, 100), color1)
    for x in range(50):
        for y in range(100):
            img.putpixel((x, y), color2)
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode("utf-8")

def test_visual_inspector_high_contrast_passes():
    brand = vault_service.get_brand("inkloom")
    # Black on White -> 21:1 contrast ratio
    b64 = create_test_image_base64((255, 255, 255), (0, 0, 0))
    metric, issues = visual_inspector_service.inspect_image(b64, brand)

    assert metric.wcag_aa_compliant is True
    assert metric.contrast_ratio >= 4.5
    # No contrast failure issue
    assert not any(i.category == GuidelineCategory.ACCESSIBILITY for i in issues)

def test_visual_inspector_low_contrast_flags_failure():
    brand = vault_service.get_brand("inkloom")
    # Light gray on white -> very low contrast ~1.2:1
    b64 = create_test_image_base64((255, 255, 255), (230, 230, 230))
    metric, issues = visual_inspector_service.inspect_image(b64, brand)

    assert metric.wcag_aa_compliant is False
    assert metric.contrast_ratio < 4.5
    assert any(i.category == GuidelineCategory.ACCESSIBILITY for i in issues)
