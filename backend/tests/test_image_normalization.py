"""Tests for image normalization (HEIC handling)."""
import io
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from PIL import Image
from pillow_heif import register_heif_opener, from_pillow
register_heif_opener()

from image_utils import normalize_image_for_ai  # noqa: E402


def test_heic_iphone_photo_normalizes_to_jpeg():
    """iPhone HEIC -> normalized JPEG that gpt-image-1 accepts."""
    img = Image.new("RGB", (3024, 4032), (180, 160, 140))
    buf = io.BytesIO()
    from_pillow(img).save(buf, format="HEIF", quality=80)
    heic_bytes = buf.getvalue()

    data, ct = normalize_image_for_ai(heic_bytes)
    assert ct == "image/jpeg"
    out = Image.open(io.BytesIO(data))
    assert out.format == "JPEG"
    assert max(out.size) <= 1536
    print(f"PASS: HEIC -> JPEG {out.size}, {len(data)} bytes")


def test_rgba_png_flattens_to_jpeg():
    img = Image.new("RGBA", (800, 600), (200, 100, 100, 128))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    data, ct = normalize_image_for_ai(buf.getvalue())
    assert ct == "image/jpeg"
    out = Image.open(io.BytesIO(data))
    assert out.format == "JPEG"
    assert out.mode == "RGB"
    print(f"PASS: PNG RGBA -> flat JPEG {out.size}")


def test_empty_payload_raises():
    try:
        normalize_image_for_ai(b"")
    except ValueError:
        print("PASS: empty payload raises ValueError")
        return
    raise AssertionError("expected ValueError")


def test_garbage_raises():
    try:
        normalize_image_for_ai(b"this is not an image")
    except ValueError:
        print("PASS: garbage raises ValueError")
        return
    raise AssertionError("expected ValueError")


if __name__ == "__main__":
    test_heic_iphone_photo_normalizes_to_jpeg()
    test_rgba_png_flattens_to_jpeg()
    test_empty_payload_raises()
    test_garbage_raises()
    print("\nAll image normalization tests passed ✓")
