import type { ReactNode } from 'react';
import {
  Bath,
  BedDouble,
  Camera,
  ImageIcon,
  Link2,
  MapPin,
  MessageCircle,
  PencilLine,
  Rotate3D,
  Send,
  Share2,
  Sofa,
  Wallet
} from 'lucide-react';
import { Header } from '../components/Header';
import { PropertyLanding } from '../components/PropertyLanding';
import { SiteFooter } from '../components/SiteFooter';
import { SmartTourSpotlight } from '../components/SmartTourSpotlight';
import { exampleProperty } from '../data/exampleProperty';
import { formatPrice } from '../lib/format';
import { sortPhotos } from '../lib/photos';

export function HomePage() {
  return (
    <>
      <Header />
      <main className="home-page">
        <section className="intro">
          <div className="intro-copy">
            <p className="eyebrow">Entaltek Rentas</p>
            <h1>Crea una publicación profesional para rentar tu propiedad</h1>
            <p>
              Marketplace trae interesados, pero limita cómo presentas tu propiedad. Con Entaltek
              Rentas subes fotos, agregas precio, ubicación, mapa, requisitos y contacto directo
              por WhatsApp para generar una landing lista para compartir en minutos.
            </p>
            <div className="hero-actions">
              <a href="/crear" className="primary-button large">Crear propiedad</a>
              <a href="#ejemplo" className="secondary-button large">Explorar ejemplo</a>
            </div>
            <ul className="hero-points">
              <li><Camera size={16} /> Galería profesional</li>
              <li><MapPin size={16} /> Ubicación y mapa</li>
              <li><MessageCircle size={16} /> Contacto directo por WhatsApp</li>
              <li><Link2 size={16} /> Link compartible al instante</li>
            </ul>
          </div>
          <HeroPreview />
        </section>

        <SmartTourSpotlight />

        <section className="example-section" id="ejemplo">
          <div className="section-heading">
            <p className="eyebrow">Ejemplo en vivo</p>
            <h2>Así se verá tu propiedad cuando la publiques</h2>
            <p className="section-note">
              Esta es una propiedad de ejemplo. La tuya se genera con tus datos reales: edítala en
              el editor y compártela con un solo link.
            </p>
          </div>
          <div className="example-frame">
            <div className="example-frame-bar" aria-hidden="true">
              <span className="dot" /><span className="dot" /><span className="dot" />
              <span className="example-url"><Link2 size={13} /> entaltek.mx/r/tu-propiedad</span>
              <span className="example-ready"><Send size={13} /> Link listo para compartir</span>
            </div>
            <PropertyLanding property={exampleProperty} variant="preview" />
          </div>
        </section>

        <section className="how-section">
          <div className="section-heading">
            <p className="eyebrow">Cómo funciona</p>
            <h2>De tus fotos a un link compartible en 3 pasos</h2>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <span className="step-number">1</span>
              <PencilLine size={22} />
              <h3>Captura tu propiedad</h3>
              <p>Título, precio, condiciones y características en un editor guiado por pantallas.</p>
            </div>
            <div className="step-card">
              <span className="step-number">2</span>
              <Camera size={22} />
              <h3>Sube fotos y ubicación</h3>
              <p>Galería con títulos por foto, zona aproximada o domicilio exacto, mapa y lugares cercanos.</p>
            </div>
            <div className="step-card">
              <span className="step-number">3</span>
              <Share2 size={22} />
              <h3>Publica y comparte tu link</h3>
              <p>Genera la landing pública y compártela en Marketplace, grupos o WhatsApp con copy listo.</p>
            </div>
          </div>
        </section>

        <section className="includes-section">
          <div className="section-heading">
            <p className="eyebrow">Qué incluye</p>
            <h2>Todo lo que una publicación normal no te deja mostrar</h2>
          </div>
          <div className="includes-grid">
            <IncludeCard icon={<ImageIcon size={20} />} title="Galería profesional" text="Fotos grandes, ordenadas y con título: sala, cocina, recámaras." />
            <IncludeCard icon={<Wallet size={20} />} title="Precio y condiciones claras" text="Renta, depósito, contrato y servicios incluidos sin letras chiquitas." />
            <IncludeCard icon={<MapPin size={20} />} title="Ubicación, mapa y alrededores" text="Zona, referencias y lugares cercanos. Tú decides si mostrar el domicilio exacto." />
            <IncludeCard icon={<MessageCircle size={20} />} title="Contacto por WhatsApp" text="Botón directo con mensaje prellenado para no perder interesados." />
            <IncludeCard icon={<Link2 size={20} />} title="Link para Marketplace" text="Un solo link con toda la información, listo para pegar en tu publicación." />
            <IncludeCard
              icon={<Rotate3D size={20} />}
              title="Recorrido inteligente"
              text="Muy pronto: sube fotos o video y genera una experiencia inmersiva con vista 360 y plano."
              soon
            />
          </div>
        </section>

        <section className="final-cta">
          <h2>Publica mejor. Renta más rápido.</h2>
          <p>Convierte tus fotos en una publicación profesional en minutos.</p>
          <a href="/crear" className="primary-button large">Crear mi propiedad</a>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

// Mockup compacto de la landing generada, para la columna derecha del hero.
function HeroPreview() {
  const photos = sortPhotos(exampleProperty.photos);
  const [cover, ...rest] = photos;

  return (
    <div className="hero-preview" aria-label="Vista previa de una publicación generada">
      <div className="hero-preview-bar" aria-hidden="true">
        <span className="dot" /><span className="dot" /><span className="dot" />
        <span className="hero-preview-url"><Link2 size={12} /> entaltek.mx/r/tu-propiedad</span>
      </div>
      <div className="hero-preview-media">
        <img src={cover.url} alt={cover.alt} />
        {cover.title && <span className="photo-overlay">{cover.title}</span>}
        <span className="hero-preview-price">{formatPrice(exampleProperty)} <small>/ mes</small></span>
      </div>
      <div className="hero-preview-thumbs" aria-hidden="true">
        {rest.slice(0, 2).map((photo) => (
          <img key={photo.id} src={photo.url} alt="" loading="lazy" />
        ))}
        <span className="hero-preview-more"><Camera size={15} /> +4 fotos</span>
      </div>
      <div className="hero-preview-info">
        <strong>{exampleProperty.title}</strong>
        <span className="hero-preview-location">
          <MapPin size={14} /> {exampleProperty.location.neighborhood}, {exampleProperty.location.city}
        </span>
        <div className="hero-preview-chips">
          <span><BedDouble size={14} /> 2 recámaras</span>
          <span><Bath size={14} /> 1 baño</span>
          <span><Sofa size={14} /> Amueblado</span>
        </div>
        <span className="hero-preview-whatsapp"><MessageCircle size={16} /> Contactar por WhatsApp</span>
      </div>
      <span className="hero-preview-ready"><Send size={13} /> Link listo para compartir</span>
    </div>
  );
}

function IncludeCard({ icon, title, text, soon }: { icon: ReactNode; title: string; text: string; soon?: boolean }) {
  return (
    <div className={`include-card ${soon ? 'is-soon' : ''}`}>
      <div className="include-icon">{icon}</div>
      <h3>
        {title}
        {soon && <span className="badge-soon">Próximamente</span>}
      </h3>
      <p>{text}</p>
    </div>
  );
}
