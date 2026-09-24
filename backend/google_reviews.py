"""
Google Places (New) — fetch business reviews + aggregate rating via Place ID.

Cached in MongoDB for 12 hours via TTL index. API key stays server-side.
If GOOGLE_PLACES_API_KEY is missing, returns an empty payload (graceful degrade)
so the frontend widget can hide itself without crashing.
"""
import os
import logging
from datetime import datetime, timezone
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

PLACES_BASE_URL = "https://places.googleapis.com/v1/places"

# Field mask — only what the widget actually renders.
FIELD_MASK = ",".join([
    "id",
    "displayName",
    "rating",
    "userRatingCount",
    "googleMapsUri",
    "reviews.rating",
    "reviews.text",
    "reviews.relativePublishTimeDescription",
    "reviews.authorAttribution.displayName",
    "reviews.authorAttribution.photoUri",
    "reviews.authorAttribution.uri",
])

CACHE_TTL_SECONDS = 12 * 60 * 60  # 12 hours


async def ensure_indexes(db) -> None:
    """Create the TTL index on the google_reviews_cache collection."""
    try:
        await db.google_reviews_cache.create_index(
            "cached_at",
            expireAfterSeconds=CACHE_TTL_SECONDS,
        )
    except Exception as e:  # noqa: BLE001
        logger.warning(f"Could not ensure google_reviews_cache TTL index: {e}")


async def _fetch_from_google(place_id: str) -> Optional[dict]:
    """Call Places API (New) Place Details with the right field mask + key.
    Returns None if not configured or upstream fails."""
    api_key = os.environ.get("GOOGLE_PLACES_API_KEY", "").strip()
    if not api_key:
        return None
    headers = {
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": FIELD_MASK,
        "Content-Type": "application/json",
    }
    url = f"{PLACES_BASE_URL}/{place_id}"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(url, headers=headers)
            r.raise_for_status()
            return r.json()
    except Exception as e:  # noqa: BLE001
        logger.warning(f"Google Places fetch failed for {place_id}: {e}")
        return None


def _normalize(raw: dict, place_id: str) -> dict:
    """Shape Google's payload for the frontend widget."""
    reviews = []
    for r in (raw.get("reviews") or []):
        author = r.get("authorAttribution") or {}
        text = r.get("text")
        text_value = text.get("text") if isinstance(text, dict) else (text or "")
        reviews.append({
            "rating": r.get("rating"),
            "author_name": author.get("displayName") or "Google user",
            "author_photo_url": author.get("photoUri") or "",
            "author_url": author.get("uri") or "",
            "text": text_value,
            "relative_time": r.get("relativePublishTimeDescription") or "",
        })
    return {
        "place_id": place_id,
        "name": (raw.get("displayName") or {}).get("text") or "",
        "rating": raw.get("rating"),
        "review_count": raw.get("userRatingCount"),
        "maps_url": raw.get("googleMapsUri") or f"https://www.google.com/maps/place/?q=place_id:{place_id}",
        "reviews": reviews,
    }


async def get_reviews(db, place_id: str) -> dict:
    """Cache-aside read. Returns {place_id, rating, reviews:[], ...}.
    Empty `reviews` + null `rating` indicate the widget should hide itself."""
    if not place_id:
        return {"place_id": "", "rating": None, "reviews": [], "review_count": None}

    # 1. Cache hit
    doc = await db.google_reviews_cache.find_one({"place_id": place_id}, {"_id": 0})
    if doc and doc.get("payload"):
        return doc["payload"]

    # 2. Cache miss — call Google
    raw = await _fetch_from_google(place_id)
    if not raw:
        # Return an empty shape so the widget gracefully hides itself.
        return {"place_id": place_id, "rating": None, "reviews": [], "review_count": None}

    payload = _normalize(raw, place_id)
    try:
        await db.google_reviews_cache.update_one(
            {"place_id": place_id},
            {"$set": {
                "place_id": place_id,
                "payload": payload,
                "cached_at": datetime.now(timezone.utc),
            }},
            upsert=True,
        )
    except Exception as e:  # noqa: BLE001
        logger.warning(f"Could not cache google reviews: {e}")
    return payload
