# Análisis de estructura y dirección de marca de Rentas

**Estado:** documento de análisis y propuesta, 2 de noviembre de 2026. La dirección de marca no está aprobada ni implementada. La revisión de código corresponde a `main` en `943d521`; el comportamiento del entorno publicado debe verificarse por separado.

## Qué hace el producto hoy

La aplicación permite capturar datos y fotos de una propiedad, generar una ficha pública con enlace compartible y preparar texto para difundirla. Sus rutas principales son portada (`/`), editor (`/crear`) y ficha pública (`/r/:slug`). El sitio no contiene todavía un catálogo público de búsqueda y comparación. La estrategia inicial propuesta se centra en **departamentos en renta en León, Guanajuato**; el modelo de datos admite otros tipos y operaciones, pero esa amplitud técnica no obliga a comunicarlos como parte del primer producto.

## Mapa técnico

```text
React + TypeScript + Vite
├─ pages: portada, editor y ficha pública
├─ components: formulario, fotos, ficha, calidad, copy y estados
├─ lib/types: validación, formato, modelo de propiedad y utilidades
└─ services/propertyService
   ├─ API REST FastAPI → SQLAlchemy + PostgreSQL + fotos locales
   ├─ Supabase → registro de propiedad en JSONB
   └─ localStorage → demostración/desarrollo
```

`propertyService` selecciona un adaptador según las variables de configuración del frontend: API REST, después Supabase, después almacenamiento local. El backend REST organiza propiedades, imágenes y contactos de interesados en tablas separadas; usa Alembic para migraciones. La representación Supabase guarda el objeto completo de propiedad en JSONB. Los contratos de frontend y REST no cubren exactamente los mismos campos, por lo que conviene unificarlos antes de cambiar de adaptador o ampliar flujos.

## Preguntas de arquitectura para la siguiente revisión

1. ¿Cuál será la fuente de verdad de fichas y fotos en el producto publicado?
2. ¿Qué campos son obligatorios y cuáles opcionales para un departamento de renta en León?
3. ¿Cómo se recupera y edita una ficha guardada, y cuál es el ciclo de vida de borrador, publicación, despublicación y vencimiento?
4. ¿Qué controles de acceso y privacidad requieren los anunciantes y los interesados?
5. ¿Cómo se comprobarán respaldo, restauración y funcionamiento completo antes de ampliar el uso?

Estas preguntas son requisitos por resolver, no afirmaciones sobre el estado actual del servidor. Una revisión de seguridad detallada debe mantenerse en un canal privado.

## Dirección de marca propia

El producto necesita una identidad comercial independiente de Entaltek. “Entaltek Rentas” puede seguir como nombre del repositorio mientras se decide nombre público. Entaltek podría aparecer discretamente como creador, sin imponer logotipo, colores ni tipografía al producto.

**Posicionamiento propuesto:** fichas de departamentos que presentan de forma clara el precio, la ubicación aproximada, las características y las condiciones antes de iniciar una conversación. Para el anunciante, información mejor ordenada; para quien busca, una lectura más fácil. No prometer verificación, rapidez de renta ni precisión de precios sin evidencia.

**Personalidad visual propuesta:** editorial, serena y precisa. Fotografías reales del inmueble, espacios amplios, datos agrupados, buen contraste y una acción principal visible. Explorar una paleta cálida de marfil, grafito verdoso y verde bosque con un acento pequeño de arcilla o amarillo piedra; definir colores y tipografía finales después de comparar rutas gráficas. Evitar iconos inmobiliarios genéricos y cualquier parecido forzado con la identidad de Entaltek.

### Aplicación inicial

- **Portada:** una promesa breve, ficha de ejemplo claramente identificada, CTA para crear y explicación corta del proceso.
- **Editor:** conservar el flujo guiado y dar más claridad a progreso, guardado, errores y vista previa.
- **Ficha pública:** priorizar fotos y renta mensual; mostrar mantenimiento por separado, ubicación aproximada, superficie, recámaras, baños, estacionamiento, condiciones y contacto. Mostrar como faltante cualquier dato no declarado.
- **Móvil:** ordenar la lectura para que precio, características y contacto sean fáciles de encontrar.

La nueva marca requiere nombre y logotipo originales. Cualquier nombre usado en un mockup es provisional hasta revisar disponibilidad comercial y dominio. Las referencias visuales aportadas por Carlos son inspiración para jerarquía, fotografía y composición móvil; no se reutilizan sus activos, marcas o afirmaciones.

## Alcance de esta propuesta

Este documento no modifica la aplicación, no valida el comportamiento de producción y no constituye una revisión de seguridad. Sirve como base común para el análisis técnico y para producir wireframes, prototipo y propuesta gráfica antes de implementar cambios.
