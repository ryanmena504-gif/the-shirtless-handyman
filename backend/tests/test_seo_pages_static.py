"""Verify robots.txt and sitemap.xml are served correctly and include neighborhood pages."""
import os
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://design-reveal.preview.emergentagent.com").rstrip("/")


def test_robots_txt_includes_required_bots():
    r = requests.get(f"{BASE_URL}/robots.txt", timeout=15)
    assert r.status_code == 200
    txt = r.text
    for bot in ["Bingbot", "YandexBot", "Twitterbot", "facebookexternalhit"]:
        assert bot in txt, f"{bot} missing in robots.txt"


def test_sitemap_includes_all_6_neighborhood_urls():
    r = requests.get(f"{BASE_URL}/sitemap.xml", timeout=15)
    assert r.status_code == 200
    txt = r.text
    for slug in [
        "lakeview-handyman", "uptown-handyman", "mid-city-handyman",
        "bywater-handyman", "french-quarter-handyman", "garden-district-handyman",
    ]:
        assert slug in txt, f"{slug} missing in sitemap.xml"


def test_neighborhood_pages_return_200():
    """Smoke test that the SPA index serves with 200 for each neighborhood route."""
    for slug in [
        "lakeview-handyman", "uptown-handyman", "mid-city-handyman",
        "bywater-handyman", "french-quarter-handyman", "garden-district-handyman",
    ]:
        r = requests.get(f"{BASE_URL}/{slug}", timeout=15)
        assert r.status_code == 200, f"/{slug} returned {r.status_code}"
