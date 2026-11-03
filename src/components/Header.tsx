interface Props {
  variant?: 'app' | 'public';
}

export function Header({ variant = 'app' }: Props) {
  return (
    <header className="app-header">
      <a className="brand" href="/" aria-label="Umbral, ir al inicio">
        <span className="brand-icon" aria-hidden="true" />
        <strong>umbral</strong>
      </a>
      {variant === 'app' && (
        <nav aria-label="Secciones del sitio">
          <a href="/#como-funciona">Cómo funciona</a>
          <a href="/#ejemplo">Ver ficha</a>
          <a href="/crear" className="nav-cta">Crear una ficha</a>
        </nav>
      )}
      {variant === 'public' && <nav aria-label="Navegación"><a href="/">Inicio</a><a href="/crear" className="nav-cta">Crear una ficha</a></nav>}
    </header>
  );
}
