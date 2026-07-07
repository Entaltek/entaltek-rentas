import { Rotate3D } from 'lucide-react';

export function SmartTourTeaser() {
  return (
    <div className="smart-tour-card" aria-label="Recorrido inteligente, próximamente">
      <div className="smart-tour-icon"><Rotate3D size={22} /></div>
      <div>
        <div className="smart-tour-title">
          <strong>Recorrido inteligente</strong>
          <span className="badge-soon">Próximamente</span>
        </div>
        <p>
          Sube varias fotos del espacio y genera una experiencia inmersiva con vista 360, plano y
          recorrido visual para tus interesados.
        </p>
      </div>
    </div>
  );
}
