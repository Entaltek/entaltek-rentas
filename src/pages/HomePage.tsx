import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { MarketplaceCopy } from '../components/MarketplaceCopy';
import { PropertyForm } from '../components/PropertyForm';
import { PropertyLanding } from '../components/PropertyLanding';
import { demoProperty } from '../data/demoProperty';
import { clearPropertyDraft, loadPropertyDraft, savePropertyDraft } from '../lib/propertyDraft';
import type { Property } from '../types/property';

export function HomePage() {
  const [property, setProperty] = useState<Property>(() => loadPropertyDraft(demoProperty));

  useEffect(() => {
    savePropertyDraft(property);
  }, [property]);

  function resetDraft() {
    clearPropertyDraft();
    setProperty(demoProperty);
  }

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

        <PropertyForm property={property} onChange={setProperty} onReset={resetDraft} />
        <PropertyLanding property={property} />
        <MarketplaceCopy property={property} />
      </main>
    </>
  );
}
