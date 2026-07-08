import { useState } from 'react';
import { ChevronDown, Layers, Megaphone, Rotate3D, Route, ScanEye } from 'lucide-react';

// Anuncio destacado del home para la feature futura "Recorrido inteligente".
// Solo comunica que vendrá pronto; la captura/publicación actual no depende de esto.
export function SmartTourSpotlight() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="smart-tour-spotlight" id="recorrido-inteligente" aria-label="Anuncio de capacidad próxima">
      <button
        type="button"
        className={`spotlight-card spotlight-announcement ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
      >
        <div className="spotlight-header">
          <div className="spotlight-icon"><Megaphone size={26} /></div>
          <div className="spotlight-title">
            <div>
              <span className="badge-soon">Próximamente</span>
              <strong>Recorrido inteligente para propiedades</strong>
            </div>
            <p>
              Estamos preparando una función para transformar fotos o video en una experiencia visual más
              completa. Hoy puedes publicar tu landing; pronto podrás enriquecerla con recorrido, vista 360 y
              apoyo visual para entender mejor cada espacio.
            </p>
          </div>
          <ChevronDown size={22} className="spotlight-chevron" />
        </div>

        <div className="spotlight-detail" aria-hidden={!isOpen}>
          <div className="spotlight-feature">
            <ScanEye size={20} />
            <strong>Vista 360</strong>
            <span>Una forma más inmersiva de mostrar sala, cocina, recámaras y detalles importantes.</span>
          </div>
          <div className="spotlight-feature">
            <Layers size={20} />
            <strong>Plano orientativo</strong>
            <span>Apoyo visual para que el interesado entienda mejor la distribución del inmueble.</span>
          </div>
          <div className="spotlight-feature">
            <Route size={20} />
            <strong>Recorrido guiado</strong>
            <span>Una narrativa visual del inmueble: entrada, áreas comunes, recámaras y servicios.</span>
          </div>
        </div>
        <span className="announcement-watermark"><Rotate3D size={72} /></span>
      </button>
    </section>
  );
}
