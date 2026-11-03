export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-shell">
        <div>
          <a className="brand footer-wordmark" href="/" aria-label="Umbral, ir al inicio">
            <span className="brand-icon" aria-hidden="true" />
            <strong>umbral</strong>
          </a>
          <p>Una ficha clara para presentar y compartir tu propiedad.</p>
        </div>
        <nav aria-label="Enlaces del sitio">
          <a href="/crear">Crear una ficha</a>
          <a href="/#ejemplo">Ver ejemplo</a>
          <a href="/#preguntas">Preguntas frecuentes</a>
        </nav>
        <p className="footer-warning">La información de cada propiedad la proporciona su anunciante. Verifica el inmueble y las condiciones antes de realizar cualquier pago.</p>
      </div>
    </footer>
  );
}
