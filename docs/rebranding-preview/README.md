# Vista previa de rebranding — Umbral (nombre provisional)

Abrir `index.html` en un navegador para recorrer portada, editor, ficha pública y estados. Es HTML/CSS/JS autónomo como **propuesta gráfica**; no sustituye la aplicación React, no guarda ni publica propiedades, y no envía mensajes.

La rama `codex/umbral-rebranding-preview` también aplica esta dirección al frontend React real. La portada usa la primera variante aprobada con ficha protagonista; encabezado, pie, editor, ficha pública y estados comparten tipografía, colores y componentes de Umbral. La lógica de guardado y publicación no se reemplazó. El nombre «Umbral» continúa provisional y esta rama no está desplegada.

Se reutilizan las tres URL de fotografías de `src/data/exampleProperty.ts`, por lo que las imágenes requieren conexión. Los datos y fotos pertenecen al ejemplo demostrativo existente y no acreditan disponibilidad de un inmueble real. No se añadieron recursos externos al repositorio aparte de las tipografías cargadas desde Google Fonts.

Portada en evaluación: primera variante, «escena panorámica y panel centrado», adaptada para dar más peso a la ficha de ejemplo. El panel muestra inmueble, zona, precio, atributos y acceso a la ficha completa justo debajo de la promesa; en móvil deja de superponerse a la fotografía para mantener la lectura. Esta iteración sustituye temporalmente a la tercera variante en la vista previa y no representa una decisión final de marca. La identidad propia usa tinta, mineral y piedra; «Umbral» sigue siendo un nombre provisional. La maqueta cubre las rutas existentes (`/`, `/crear`, `/r/:slug`) como pantallas conceptuales y añade una vista de estados para evaluar lenguaje y componentes. Las acciones de esta vista previa son locales y simuladas.

Referencias consultadas para esta portada: RV88 (escena inmersiva a todo el ancho; se adaptó solo la escala de la imagen, no su ilustración, marca ni composición lateral) y RV37 (interior como contexto con información subordinada; se evitó copiar su mosaico, cifras y activos). La fotografía usada procede del ejemplo existente del repositorio.

Pendiente antes de implementación: elegir nombre comercial, resolver fuente de verdad y permisos de datos, alinear contratos frontend/backend, revisar fotografías autorizadas, definir persistencia/edición de borradores y validar accesibilidad/responsive con código de producto.
