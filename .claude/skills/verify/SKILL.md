---
name: verify
description: Cómo verificar Entaltek Rentas end-to-end en un entorno headless.
---

# Verificar Entaltek Rentas

SPA React + Vite sin backend propio (por defecto persiste en localStorage del navegador).

## Levantar

```bash
npm install
npm run dev -- --port 5199 --strictPort   # en background
```

## Manejar con Playwright

Chromium preinstalado: `executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'`
(instalar el paquete `playwright` npm en un directorio scratch, no en el repo).

## Flujos que valen la pena

1. Home `/`: hero sin botón "Ver demo", sección `#ejemplo` con landing de muestra.
2. Editor `/crear`: llenar campos con `getByLabel(..., { exact: true })` (los placeholders se repiten entre campos, no usar getByPlaceholder). Ver `.completeness-label` subir.
3. Guardar → `.status-pill` = "Guardada". Publicar → "Publicada" + `.public-link-banner a` contiene el link `/r/:slug`.
4. Abrir el link público: datos reales, sin dummy. `showExactAddress=false` no debe mostrar el domicilio.
5. Probes: `/r/no-existe` → 404 elegante; Despublicar → el link muestra "Esta publicación no está activa"; publicar sin fotos → la landing pública NO muestra placeholder de galería (solo el preview del editor lo muestra).
6. Móvil (390px): `.whatsapp-sticky` visible en landing pública; en `/crear` el preview colapsa (`.preview-toggle`).

## Verificar con el backend FastAPI (opcional)

```bash
python3 -m venv /tmp/venv && /tmp/venv/bin/pip install -e "backend/[dev]"
# crear tablas sqlite: script con Base.metadata.create_all (alembic es para Postgres)
cd backend && DATABASE_URL="sqlite+aiosqlite:////tmp/dev.db" \
  CORS_ORIGINS='["http://localhost:5199"]' \
  STORAGE_LOCAL_DIR=/tmp/media STORAGE_BASE_URL=http://localhost:8001/media \
  /tmp/venv/bin/python -m uvicorn app.main:app --port 8001
# frontend apuntando al backend:
VITE_API_BASE_URL=http://localhost:8001 npm run dev -- --port 5199 --strictPort
```

Con backend, la landing pública funciona desde OTRO contexto de navegador
(la prueba clave: guardar y publicar en un contexto, abrir `/r/:slug` en otro).
Las fotos deben servirse desde `http://localhost:8001/media/properties/...`.

## Gotchas

- Imágenes Unsplash del ejemplo y Google Fonts fallan tras el proxy del sandbox (ERR_TUNNEL/RESET en consola): no es bug de la app.
- Cada contexto de navegador empieza con localStorage limpio; hay que crear/publicar la propiedad dentro del mismo contexto antes de visitar `/r/:slug`.
- El estado del editor persiste como borrador en localStorage (`entaltek-rentas:property-draft-v2`).
