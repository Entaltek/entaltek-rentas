# Entaltek Rentas — Backend API

API REST para la generación de mini-landings públicas de propiedades en renta.

> **Aviso de privacidad:** La información de las propiedades publicadas es proporcionada
> directamente por el anunciante (propietario o asesor). Entaltek Rentas no verifica ni
> valida la exactitud de los datos. Los interesados deben realizar su propia diligencia.

---

## Stack

| Componente | Versión |
|---|---|
| Python | 3.11+ |
| FastAPI | 0.111+ |
| SQLAlchemy | 2.x (async) |
| Alembic | 1.13+ |
| PostgreSQL | 16 |
| Pydantic | v2 |

---

## Instalación local (sin Docker)

### 1. Requisitos previos

- Python 3.11+
- PostgreSQL 14+ corriendo localmente

### 2. Clonar e instalar dependencias

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -e ".[dev]"
```

### 3. Variables de entorno

```bash
cp .env.example .env
# Edita .env con tus credenciales de BD
```

### 4. Crear la base de datos y aplicar migraciones

```bash
createdb entaltek_rentas            # o usa psql
alembic upgrade head
```

### 5. Levantar el servidor

```bash
uvicorn app.main:app --reload --port 8000
```

La API queda disponible en `http://localhost:8000`.
Documentación interactiva (solo en `DEBUG=true`): `http://localhost:8000/docs`

---

## Docker Compose

```bash
cd backend
docker compose up --build
```

Esto levanta:
- **PostgreSQL** en el puerto 5432
- **API** en el puerto 8000 (con hot-reload)
- Aplica migraciones automáticamente al iniciar

---

## Tests

```bash
cd backend
pytest -v
```

Los tests usan SQLite en memoria — no requieren PostgreSQL.

```bash
# Lint
ruff check .

# Type check
mypy app/
```

---

## Variables de entorno

| Variable | Default | Descripción |
|---|---|---|
| `APP_ENV` | `development` | Entorno de la aplicación |
| `DEBUG` | `false` | Habilita `/docs` y logs SQL |
| `DATABASE_URL` | `postgresql+asyncpg://...` | URL async de PostgreSQL |
| `CORS_ORIGINS` | `["http://localhost:5173"]` | Orígenes permitidos (JSON array) |
| `STORAGE_BACKEND` | `local` | `local` \| `s3` \| `r2` \| `supabase` |
| `STORAGE_LOCAL_DIR` | `media` | Directorio para almacenamiento local |
| `STORAGE_BASE_URL` | `http://localhost:8000/media` | URL pública del storage |
| `STORAGE_BUCKET` | *(vacío)* | Bucket para cloud storage |
| `STORAGE_ACCESS_KEY` | *(vacío)* | Access key cloud |
| `STORAGE_SECRET_KEY` | *(vacío)* | Secret key cloud |
| `STORAGE_ENDPOINT_URL` | *(vacío)* | Endpoint para R2/custom S3 |
| `IMAGE_MAX_SIZE_BYTES` | `10485760` (10 MB) | Tamaño máximo por imagen |
| `IMAGES_PER_PROPERTY_MAX` | `20` | Máximo de imágenes por propiedad |

---

## Endpoints

### Health
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Estado de la API |

### Propiedades
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/v1/properties` | Crear propiedad (estado draft) |
| GET | `/api/v1/properties/{slug}` | Obtener propiedad pública por slug |
| PATCH | `/api/v1/properties/{property_id}` | Actualizar propiedad |
| POST | `/api/v1/properties/{property_id}/publish` | Publicar y generar slug |
| POST | `/api/v1/properties/{property_id}/archive` | Archivar propiedad |
| POST | `/api/v1/properties/{property_id}/images` | Subir imágenes (multipart) |
| DELETE | `/api/v1/properties/{property_id}/images/{image_id}` | Eliminar imagen |

### Leads
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/v1/leads` | Crear lead desde landing pública |
| GET | `/api/v1/properties/{property_id}/leads` | Listar leads de una propiedad |
| PATCH | `/api/v1/leads/{lead_id}/status` | Actualizar estado de lead |

---

## Arquitectura

```
backend/
├── app/
│   ├── main.py              # Entrada FastAPI, CORS, rutas
│   ├── api/routes/          # Handlers HTTP
│   ├── core/
│   │   ├── config.py        # Settings via pydantic-settings
│   │   ├── exceptions.py    # Errores de dominio
│   │   └── slugify.py       # Generación de slugs
│   ├── db/
│   │   ├── base.py          # DeclarativeBase
│   │   └── session.py       # Engine async + get_db dependency
│   ├── models/              # SQLAlchemy ORM
│   ├── schemas/             # Pydantic v2 (request/response)
│   └── services/            # Lógica de negocio
├── alembic/                 # Migraciones
├── tests/                   # pytest + httpx AsyncClient
├── Dockerfile
├── docker-compose.yml
└── pyproject.toml
```

---

## TODOs pendientes (próximas iteraciones)

- [ ] **Auth:** agregar `owner_id UUID FK` en `Property`; proteger endpoints de escritura con JWT/OAuth2
- [ ] **Marketplace:** listar propiedades con filtros y paginación
- [ ] **Storage cloud:** implementar `S3StorageBackend`, `R2StorageBackend`, `SupabaseStorageBackend` en `app/services/storage.py`
- [ ] **Rate limiting:** agregar `slowapi` para endpoints públicos (leads, slug)
- [ ] **Pagos:** integración con Stripe/Conekta
- [ ] **IA:** generación de descripciones, scoring de leads
