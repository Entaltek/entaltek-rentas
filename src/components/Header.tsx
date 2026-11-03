import { useEffect, useState } from 'react';

interface Props { variant?: 'app' | 'public'; }
type Surface = 'base' | 'hero' | 'journey' | 'editor';

export function Header({ variant = 'app' }: Props) {
  const [surface, setSurface] = useState<Surface>('base');
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 8);
      if (window.location.pathname.startsWith('/crear')) { setSurface('editor'); return; }
      if (window.location.pathname !== '/') { setSurface('base'); return; }
      const anchor = 82;
      const hero = document.getElementById('inicio')?.getBoundingClientRect();
      const journey = document.getElementById('como-funciona')?.getBoundingClientRect();
      const example = document.getElementById('ejemplo')?.getBoundingClientRect();
      if (hero && hero.top <= anchor && hero.bottom > anchor) setSurface('hero');
      else if (journey && journey.top <= anchor && journey.bottom > anchor) setSurface('journey');
      else if (example && example.top <= anchor && example.bottom > anchor) setSurface('base');
      else setSurface('base');
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => { window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); if (frame) window.cancelAnimationFrame(frame); };
  }, []);
  return (
    <header className={`app-header ${scrolled ? 'is-scrolled' : ''}`} data-surface={surface}>
      <a className="brand" href="/" aria-label="Umbral, ir al inicio"><span className="brand-icon" aria-hidden="true" /><strong>umbral</strong></a>
      {variant === 'app' ? <nav aria-label="Secciones del sitio"><a href="/#como-funciona">Cómo funciona</a><a href="/#ejemplo">Ver ficha</a><a href="/crear" className="nav-cta">Crear una ficha</a></nav> : <nav aria-label="Navegación"><a href="/">Inicio</a><a href="/crear" className="nav-cta">Crear una ficha</a></nav>}
    </header>
  );
}
