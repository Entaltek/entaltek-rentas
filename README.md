# Entaltek Rentas

MVP para generar mini landings profesionales de propiedades en renta y usarlas como enlace complementario en publicaciones de Facebook Marketplace, grupos, WhatsApp, Instagram o anuncios.

## Propuesta

Facebook Marketplace da visibilidad, pero limita la presentación. Este producto permite crear una página clara, bonita y confiable para cada propiedad, con fotos ordenadas, requisitos, amenidades, contacto directo y texto listo para publicar.

## MVP incluido

- Landing pública de ejemplo para una propiedad.
- Formulario base para capturar datos de una propiedad.
- Generador de texto para Marketplace.
- Diseño responsive con identidad visual inspirada en Entaltek.
- Documentación inicial de producto, roadmap y decisiones.

## Stack

- React
- TypeScript
- Vite
- CSS nativo

## Scripts

```bash
npm install
npm run dev
npm run build
```

## Estructura

```text
src/
  components/     Componentes reutilizables
  data/           Datos demo
  lib/            Funciones auxiliares
  pages/          Pantallas principales
  types/          Tipos TypeScript
docs/             Documentación de producto y técnica
```

## Flujo recomendado de Git

```text
feature/* -> develop -> qa -> main
```

## Advertencia de producto

El sistema debe evitar representar propiedades de forma engañosa. Las imágenes y la información son responsabilidad del anunciante. La plataforma debe ayudar a presentar mejor, no a falsear el estado real del inmueble.
