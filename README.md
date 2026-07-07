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
- Persistencia: repositorio local en `localStorage` por defecto; si se define `VITE_API_BASE_URL`, se usa un backend REST (ver `.env.example` para el contrato de endpoints).

## Scripts

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Estructura

```text
src/
  components/     Componentes de UI (landing, formulario, fotos, toasts...)
  data/           Datos de EJEMPLO (solo para la demo del home)
  lib/            Helpers puros (slug, formato, validación, calidad, copy)
  pages/          Home (/), Editor (/crear), Landing pública (/r/:slug)
  services/       Capa service/repository (local + API remota)
  types/          Modelo Property
docs/             Documentación de producto y técnica
```

## Flujo de datos

`pages` → `services/propertyService` → (`localPropertyRepository` | `remotePropertyApi`).
Los datos demo (`src/data/exampleProperty.ts`) nunca se mezclan con propiedades guardadas.

## Advertencia de producto

El sistema debe evitar representar propiedades de forma engañosa. Las imágenes y la información son responsabilidad del anunciante. La plataforma debe ayudar a presentar mejor, no a falsear el estado real del inmueble.
