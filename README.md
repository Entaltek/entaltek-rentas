# Entaltek Rentas

MVP para generar mini landings profesionales de propiedades en renta y usarlas como enlace complementario en publicaciones de Facebook Marketplace, grupos, WhatsApp, Instagram o anuncios.

## Propuesta

Facebook Marketplace da visibilidad, pero limita la presentación. Este producto permite crear una página clara, bonita y confiable para cada propiedad, con fotos ordenadas, requisitos, amenidades, contacto directo y texto listo para publicar.

## MVP incluido

- Landing pública de ejemplo para una propiedad.
- Formulario completo con vista previa en vivo de la landing.
- Borrador guardado automáticamente en el navegador (localStorage).
- Generador de texto para Marketplace, con copiado y compartir por WhatsApp.
- Diseño responsive con identidad visual inspirada en Entaltek.
- Documentación inicial de producto, roadmap y decisiones.

## Stack

- Frontend: React + TypeScript + Vite + CSS nativo
- Backend: FastAPI + PostgreSQL (carpeta `backend/`)

## Scripts

```bash
npm install
npm run dev
npm run build
```

## Conectar el frontend al backend

El frontend consume la API FastAPI a través de la capa `src/api/`
(`client.ts`, `properties.ts`, `leads.ts`). La URL del backend se configura
con la variable `VITE_API_URL`; si no está definida se usa
`http://localhost:8000` como fallback de desarrollo.

### Desarrollo local

1. Levanta el backend (ver `backend/README.md`):

   ```bash
   cd backend
   docker compose up -d          # PostgreSQL + API en http://localhost:8000
   ```

2. Configura y levanta el frontend:

   ```bash
   cp .env.example .env          # VITE_API_URL=http://localhost:8000
   npm install
   npm run dev                   # http://localhost:5173
   ```

3. Flujo completo: captura la propiedad en el editor → **Guardar en backend**
   (crea o actualiza vía `POST/PATCH /api/v1/properties`) → **Publicar y
   generar link** (`POST /api/v1/properties/{id}/publish`) → abre la landing
   pública en `/r/{slug}` (lee `GET /api/v1/properties/{slug}`). El formulario
   "Me interesa" de la landing pública envía leads a `POST /api/v1/leads`.

### Producción

Compila con las variables de `.env.production.example`:

```bash
cp .env.production.example .env.production
npm run build
```

- `VITE_API_URL=https://api-rentas.entaltek.com`
- `VITE_PUBLIC_BASE_URL=https://rentas.entaltek.com`

El backend debe permitir el dominio del frontend en CORS
(`CORS_ORIGINS` en `backend/.env`).

## Estructura

```text
src/
  api/            Capa de acceso a la API FastAPI
  components/     Componentes reutilizables
  data/           Datos demo
  lib/            Funciones auxiliares
  pages/          Pantallas principales
  types/          Tipos TypeScript
backend/          API FastAPI + PostgreSQL
docs/             Documentación de producto y técnica
```

## Flujo recomendado de Git

```text
feature/* -> develop -> qa -> main
```

## Advertencia de producto

El sistema debe evitar representar propiedades de forma engañosa. Las imágenes y la información son responsabilidad del anunciante. La plataforma debe ayudar a presentar mejor, no a falsear el estado real del inmueble.
