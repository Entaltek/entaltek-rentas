import re
import unicodedata


def _normalize(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")


def build_slug(title: str, zone: str, price: float | int) -> str:
    """Build a URL-safe slug: <title>-<zone>-<price>."""
    parts = [_normalize(title), _normalize(zone), str(int(price))]
    return "-".join(p for p in parts if p)
