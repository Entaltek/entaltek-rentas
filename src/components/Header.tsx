import { Building2 } from 'lucide-react';

export function Header() {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-icon"><Building2 size={22} /></div>
        <div>
          <strong>Entaltek Rentas</strong>
          <span>Mini landings para publicar mejor</span>
        </div>
      </div>
      <nav>
        <a href="#demo">Demo</a>
        <a href="#copy">Copy</a>
        <a href="#crear">Crear propiedad</a>
      </nav>
    </header>
  );
}
