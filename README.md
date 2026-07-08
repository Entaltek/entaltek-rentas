# Entaltek Rentas

Plataforma para crear publicaciones profesionales de propiedades en renta y compartirlas con un link en Facebook Marketplace, grupos, WhatsApp o redes.

## Propuesta

Facebook Marketplace da visibilidad, pero limita la presentación. Entaltek Rentas genera una landing clara, bonita y confiable para cada propiedad, con galería con títulos por foto, precio y condiciones, ubicación y alrededores, requisitos y contacto directo por WhatsApp.

## Qué incluye

- Home de producto con ejemplo en vivo de la landing generada.
- Editor en `/crear` con secciones guiadas, vista previa en vivo y checklist de completitud.
- Fotos con título, portada, reordenamiento y optimización automática de tamaño.
- Ubicación con colonia/zona, domicilio opcionalmente público (`showExactAddress`) y lugares cercanos.
- Publicar / despublicar con link público `/r/:slug` que consume solo datos reales (sin dummy data).
- Estados de carga (skeleton), 404 elegante, publicación no activa y reintento de error.
- Generador de copy para Marketplace con link automático al publicar.
- Toasts, validación mínima para publicar y borrador autoguardado en el navegador.
- Teaser de feature futura: “Recorrido inteligente” (vista 360 / plano).

## Stack

- React + TypeScript + Vite
- CSS nativo (sin frameworks)
- Persistencia:
  - `localStorage` por defecto para demo/desarrollo sin infraestructura.
  - Supabase si se definen `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`.
  - Backend REST si se define `VITE_API_BASE_URL` (tiene prioridad sobre Supabase).

## Scripts

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Configuración Supabase

1. En Supabase, abre `SQL Editor` y ejecuta el archivo:

```text
supabase/schema.sql
```

2. Copia `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

3. En `.env.local`, configura:

```env
VITE_SUPABASE_URL=https://begtjpyyifvxfarqwcic.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu_publishable_key_de_supabase
```

4. Reinicia Vite:

```bash
npm run dev
```

Con esas variables, el editor `/crear` guardará propiedades en Supabase y la landing pública `/r/:slug` leerá desde Supabase.

### Fotos

Para el MVP actual, el objeto `Property` se guarda completo en JSONB, incluyendo las fotos que ya maneja la app. El siguiente paso recomendado es crear un bucket público llamado:

```text
property-images
```

y mover las fotos a Supabase Storage para guardar solo URLs en la base de datos.

### Seguridad MVP

El archivo `supabase/schema.sql` incluye políticas públicas de escritura para validar rápido el producto sin login. Eso sirve para MVP, pero no debe quedarse así en producción abierta. El siguiente paso serio es agregar Supabase Auth, `owner_id` y políticas por usuario propietario.

## Estructura

```text
src/
  components/     Componentes de UI (landing, formulario, fotos, toasts...)
  data/           Datos de EJEMPLO (solo para la demo del home)
  lib/            Helpers puros (slug, formato, validación, calidad, copy, Supabase)
  pages/          Home (/), Editor (/crear), Landing pública (/r/:slug)
  services/       Capa service/repository (local + Supabase + API remota)
  types/          Modelo Property
docs/             Documentación de producto y técnica
supabase/         SQL para tablas y políticas de Supabase
```

## Flujo de datos

`pages` → `services/propertyService` → (`remotePropertyApi` | `supabasePropertyRepository` | `localPropertyRepository`).

Los datos demo (`src/data/exampleProperty.ts`) nunca se mezclan con propiedades guardadas.

## Advertencia de producto

El sistema debe evitar representar propiedades de forma engañosa. Las imágenes y la información son responsabilidad del anunciante. La plataforma debe ayudar a presentar mejor, no a falsear el estado real del inmueble.
