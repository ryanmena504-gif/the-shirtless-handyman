"""
Image normalization for the AI generation pipeline.

Why this exists: OpenAI's gpt-image-1 (and most image-edit endpoints) only accept
PNG / JPEG / WebP. iPhone photos default to HEIC, which causes an
`invalid_image_file` BadRequestError. This module accepts ANY supported input,
applies EXIF rotation, downsizes large photos, and re-encodes as JPEG so the
downstream litellm.image_edit call always gets a clean, accepted file.
"""
import io
import logging
from PIL import Image, ImageOps

# Register HEIC/HEIF support so PIL can open iPhone photos.
try:
    from pillow_heif import register_heif_opener
    register_heif_opener()
except Exception:  # pragma: no cover
    # If pillow-heif isn't available we still handle PNG/JPEG/WebP fine.
    pass

logger = logging.getLogger(__name__)

# gpt-image-1 sweet spot: max edge 1536px, JPEG quality 85, under ~3 MB.
MAX_EDGE = 1536
JPEG_QUALITY = 85
MAX_BYTES = 3 * 1024 * 1024


def normalize_image_for_ai(raw_bytes: bytes) -> tuple[bytes, str]:
    """Return (normalized_jpeg_bytes, 'image/jpeg').

    - Converts HEIC / HEIF / WebP / PNG (with alpha) → flat JPEG.
    - Applies EXIF orientation so portraits aren't sideways.
    - Resizes so the longest edge is ≤ MAX_EDGE.
    - Re-encodes JPEG at quality 85, dropping quality further only if > MAX_BYTES.

    Raises ValueError if the input can't be opened as an image.
    """
    if not raw_bytes:
        raise ValueError("empty image payload")

    try:
        img = Image.open(io.BytesIO(raw_bytes))
    except Exception as e:
        raise ValueError(f"could not decode image: {type(e).__name__}: {e}") from e

    # Apply EXIF rotation (iPhone photos store rotation as metadata, not pixel data).
    img = ImageOps.exif_transpose(img)

    # Flatten transparency onto white — JPEG doesn't support alpha.
    if img.mode in ("RGBA", "LA", "P"):
        background = Image.new("RGB", img.size, (255, 255, 255))
        if img.mode == "P":
            img = img.convert("RGBA")
        background.paste(img, mask=img.split()[-1] if img.mode in ("RGBA", "LA") else None)
        img = background
    elif img.mode != "RGB":
        img = img.convert("RGB")

    # Downsize if necessary.
    longest = max(img.size)
    if longest > MAX_EDGE:
        scale = MAX_EDGE / longest
        new_size = (int(img.size[0] * scale), int(img.size[1] * scale))
        img = img.resize(new_size, Image.LANCZOS)

    # Encode JPEG at quality 85, fall back to lower quality if too big.
    for quality in (JPEG_QUALITY, 75, 65, 55):
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=quality, optimize=True, progressive=True)
        data = buf.getvalue()
        if len(data) <= MAX_BYTES:
            logger.info(
                f"normalize_image: {len(raw_bytes)}B -> {len(data)}B "
                f"({img.size[0]}x{img.size[1]} jpeg q{quality})"
            )
            return data, "image/jpeg"

    logger.warning(f"normalize_image: still {len(data)}B after q55 — sending anyway")
    return data, "image/jpeg"
