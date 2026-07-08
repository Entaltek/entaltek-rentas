import type { ReactNode } from 'react';
import {
  Bath,
  BedDouble,
  Camera,
  FileText,
  ImageIcon,
  Link2,
  MapPin,
  MessageCircle,
  PencilLine,
  Send,
  Share2,
  ShieldCheck,
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
            <h1>Crea una publicación profesional para rentar tu propiedad</h1>
            <p>
              Convierte la información de tu inmueble en una página clara, visual y lista para compartir.
              Sube fotos, agrega precio, condiciones, ubicación desde Google Maps, requisitos y contacto por
              WhatsApp para que cada interesado vea todo en un solo link.
            </p>
            <div className="hero-actions">
              <a href="/crear" className="primary-button large">Generar página de mi propiedad</a>
              <a href="#ejemplo" className="secondary-button large">Ver publicación demo</a>
            </div>
            <ul className="hero-points">
              <li><Camera size={16} /> Galería profesional</li>
              <li><MapPin size={16} /> Ubicación y mapa</li>
              <li><MessageCircle size={16} /> Contacto directo por WhatsApp</li>
              <li><Link2 size={16} /> Link de la propiedad</li>
            </ul>
            <SmartTourSpotlight compact />
          </div>
          <HeroPreview />
        </section>

        <section className="how-section" id="como-funciona">
          <div className="section-heading">
            <p className="eyebrow">Cómo funciona</p>
            <h2>Captura, revisa y comparte tu página de renta</h2>
            <p className="section-note">
              El flujo está pensado como una secuencia: primero completas la información, luego revisas la vista
              previa y al final obtienes el link para compartir.
            </p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <span className="step-number">1</span>
              <PencilLine size={22} />
              <h3>Captura la información</h3>
              <p>Título, precio, condiciones, características, requisitos y contacto en un editor guiado.</p>
            </div>
            <div className="step-card">
              <span className="step-number">2</span>
              <Camera size={22} />
              <h3>Agrega fotos y ubicación</h3>
              <p>Sube la galería, pega tu ubicación de Google Maps y decide si mostrar el domicilio exacto.</p>
            </div>
            <div className="step-card">
              <span className="step-number">3</span>
              <Share2 size={22} />
              <h3>Publica y comparte</h3>
              <p>Genera tu página pública y comparte el link en Marketplace, grupos, WhatsApp o redes.</p>
            </div>
          </div>
        </section>

        <section className="example-section" id="ejemplo">
          <div className="section-heading example-heading">
            <div>
              <p className="eyebrow">Publicación demo</p>
              <h2>Así se verá tu propiedad cuando la publiques</h2>
            </div>
            <p className="section-note">
              Esta es una muestra visual. Cuando captures tu inmueble, la página se arma con tus fotos,
              precio, ubicación, requisitos y contacto real para compartirla con un solo link.
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

        <section className="includes-section" id="incluye">
          <div className="section-heading">
            <p className="eyebrow">Qué incluye</p>
            <h2>Información ordenada</h2>
          </div>
          <div className="includes-list">
            <IncludeRow icon={<ImageIcon size={20} />} title="Galería profesional" text="Fotos grandes, ordenadas y con título: sala, cocina, recámaras y detalles importantes." />
            <IncludeRow icon={<Wallet size={20} />} title="Precio y condiciones claras" text="Renta, depósito, contrato, disponibilidad y servicios incluidos en una lectura fácil." />
            <IncludeRow icon={<MapPin size={20} />} title="Ubicación y alrededores" text="Zona, domicilio opcional, referencias y lugares cercanos para dar contexto sin saturar la publicación." />
            <IncludeRow icon={<MessageCircle size={20} />} title="Contacto por WhatsApp" text="Botón directo con mensaje prellenado para reducir fricción y no perder interesados." />
            <IncludeRow icon={<Link2 size={20} />} title="Link para Marketplace" text="Un solo link con toda la información, listo para pegar en Facebook, WhatsApp o Instagram." />
            <IncludeRow icon={<ShieldCheck size={20} />} title="Publicación más confiable" text="Presentación más completa, ordenada y revisable antes de que el interesado te escriba." />
          </div>
        </section>

        <section className="faq-section" id="faq">
          <div className="section-heading">
            <p className="eyebrow">Preguntas frecuentes</p>
            <h2>Dudas rápidas antes de publicar</h2>
          </div>
          <div className="faq-grid">
            <FAQItem question="¿Esta página reemplaza Marketplace?" answer="No. La idea es usar Marketplace para atraer interesados y pegar tu link para mostrar la información completa." />
            <FAQItem question="¿Cada propiedad tiene su propio link?" answer="Sí. Al publicar se genera una URL propia para compartirla en redes, grupos o WhatsApp." />
            <FAQItem question="¿Puedo mostrar u ocultar el domicilio exacto?" answer="Sí. Puedes guardar la dirección y decidir si se muestra públicamente o solo como zona aproximada." />
            <FAQItem question="¿Necesito saber programar?" answer="No. El editor te guía para cargar fotos, precio, ubicación, requisitos y contacto." />
            <FAQItem question="¿Qué pasa con el recorrido inteligente?" answer="Es una capacidad en desarrollo. Primero puedes publicar páginas profesionales; después agregaremos experiencias visuales más avanzadas." />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

// Mockup compacto de la publicación generada, para la columna derecha del hero.
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

function IncludeRow({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="include-row">
      <div className="include-icon">{icon}</div>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="faq-item">
      <summary>
        <FileText size={18} />
        <span>{question}</span>
      </summary>
      <div className="faq-answer"><p>{answer}</p></div>
    </details>
  );
}
