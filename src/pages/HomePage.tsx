import { Header } from '../components/Header';
import { MarketplaceCopy } from '../components/MarketplaceCopy';
import { PropertyForm } from '../components/PropertyForm';
import { PropertyLanding } from '../components/PropertyLanding';
import { demoProperty } from '../data/demoProperty';

export function HomePage() {
  return (
    <>
      <Header />
      <main>
        <section className="intro">
          <div>
            <p className="eyebrow">MVP inmobiliario</p>
            <h1>Publica en Marketplace, pero presenta tu propiedad como profesional.</h1>
            <p>
              Crea una mini landing para cada renta con fotos, requisitos, amenidades, precio claro y contacto directo por WhatsApp.
            </p>
            <div className="hero-actions">
              <a href="#demo" className="primary-button">Ver demo</a>
              <a href="#crear" className="secondary-button">Crear propiedad</a>
            </div>
          </div>
          <div className="intro-card">
            <strong>Idea central</strong>
            <p>Facebook Marketplace trae el tráfico. Entaltek Rentas agrega la capa profesional de presentación y conversión.</p>
          </div>
        </section>

        <PropertyLanding property={demoProperty} sectionId="demo" />
        <MarketplaceCopy property={demoProperty} sectionId="copy" />
        <PropertyForm />
      </main>
      <footer className="site-footer">
        <p><strong>Entaltek Rentas</strong> · Mini landings para rentar más rápido.</p>
        <p>
          La información de cada propiedad es responsabilidad del anunciante. Verifica el inmueble en persona
          antes de entregar depósitos o firmar contratos.
        </p>
      </footer>
    </>
  );
}
