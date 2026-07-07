from app.core.slugify import build_slug


def test_basic_slug() -> None:
    assert build_slug("Casa Bonita", "Polanco", 15000) == "casa-bonita-polanco-15000"


def test_slug_removes_accents() -> None:
    slug = build_slug("Departamento céntrico", "Condésa", 12500)
    assert slug == "departamento-centrico-condesa-12500"


def test_slug_handles_special_chars() -> None:
    slug = build_slug("Casa & Jardín #1", "Roma Norte", 8000)
    assert "jardın" not in slug
    assert "8000" in slug


def test_slug_decimal_price() -> None:
    slug = build_slug("Estudio", "Satélite", 9500.99)
    assert slug.endswith("-9500")
