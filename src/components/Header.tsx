import { Building2 } from 'lucide-react';

interface Props {
  variant?: 'app' | 'public';
}

export function Header({ variant = 'app' }: Props) {
  return (
    <header className="app-header">
      <a className="brand" href="/">
        <div className="brand-icon"><Building2 size={22} /></div>
        <div>
          <strong>Entaltek Rentas</strong>
          <span>Publica mejor. Renta más rápido.</span>
        </div>
      </a>
      {variant === 'app' && (
        <nav aria-label="Secciones del sitio">
          <a href="/#uso">Cómo se usa</a>
          <a href="/#ejemplo">Publicación demo</a>
          <a href="/#faq">FAQ</a>
          <a href="/crear" className="nav-cta">Generar landing</a>
        </nav>
      )}
    </header>
  );
}
