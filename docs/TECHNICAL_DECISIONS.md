# Decisiones técnicas iniciales

## Decisión 1: No construir marketplace completo al inicio

Se prioriza una herramienta que aproveche el tráfico de Facebook Marketplace, WhatsApp y redes sociales. El marketplace puede surgir después si hay inventario suficiente.

## Decisión 2: Frontend primero

El MVP inicial puede funcionar con datos demo y formularios locales para validar presentación y propuesta comercial antes de invertir en backend.

## Decisión 3: Evitar IA engañosa

No se debe prometer render 3D ni mejorar imágenes de forma que altere la realidad del inmueble. La confianza es parte central del producto.

## Decisión 4: URLs públicas por propiedad

Cada propiedad deberá tener un slug público. Ejemplo:

```text
/r/departamento-centro-12000
```

## Decisión 5: Arquitectura futura

Frontend React/Vite o Next.js.
Backend FastAPI o Node.js.
Base de datos: Supabase/Postgres si se requiere velocidad de MVP.
Almacenamiento de imágenes: Supabase Storage, Cloudflare R2 o S3 compatible.
