import { useState } from 'react';
import { ChevronDown, Layers, Rotate3D, Route, ScanEye } from 'lucide-react';

// Sección destacada del home para la feature futura "Recorrido inteligente".
// Solo teaser: la card se expande con el detalle de lo que incluirá.
export function SmartTourSpotlight() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="smart-tour-spotlight" id="recorrido-inteligente">
      <button
        type="button"
        className={`spotlight-card ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
      >
        <div className="spotlight-header">
          <div className="spotlight-icon"><Rotate3D size={26} /></div>
          <div className="spotlight-title">
            <div>
              <strong>Recorrido inteligente</strong>
              <span className="badge-soon">Próximamente</span>
            </div>
            <p>
              Muy pronto podrás subir fotos o video de tu propiedad para generar una experiencia
              inmersiva con vista 360, plano y recorrido visual.
            </p>
          </div>
          <ChevronDown size={22} className="spotlight-chevron" />
        </div>

        <div className="spotlight-detail" aria-hidden={!isOpen}>
          <div className="spotlight-feature">
            <ScanEye size={20} />
            <strong>Vista 360</strong>
            <span>Tus interesados recorren cada espacio como si estuvieran ahí.</span>
          </div>
          <div className="spotlight-feature">
            <Layers size={20} />
            <strong>Plano del espacio</strong>
            <span>Un plano generado a partir de tus fotos para entender la distribución.</span>
          </div>
          <div className="spotlight-feature">
            <Route size={20} />
            <strong>Recorrido visual</strong>
            <span>Una experiencia guiada foto a foto: entrada, sala, cocina, recámaras.</span>
          </div>
        </div>
      </button>
    </section>
  );
}
