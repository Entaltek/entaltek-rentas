import { useEffect, useState } from 'react';
import { createProperty, publishProperty } from '../api/properties';
import { Header } from '../components/Header';
import { ListingQualityCard } from '../components/ListingQualityCard';
import { MarketplaceCopy } from '../components/MarketplaceCopy';
import { PropertyForm } from '../components/PropertyForm';
import { PropertyLanding } from '../components/PropertyLanding';
import { demoProperty } from '../data/demoProperty';
import { clearPropertyDraft, loadPropertyDraft, savePropertyDraft } from '../lib/propertyDraft';
import type { Property } from '../types/property';

type ApiStatus = 'idle' | 'saving' | 'publishing' | 'saved' | 'published' | 'error';

export function HomePage() {
  const [property, setProperty] = useState<Property>(() => loadPropertyDraft(demoProperty));
  const [apiStatus, setApiStatus] = useState<ApiStatus>('idle');
  const [apiMessage, setApiMessage] = useState('');

  useEffect(() => {
    savePropertyDraft(property);
  }, [property]);

  function resetDraft() {
    clearPropertyDraft();
    setProperty(demoProperty);
    setApiStatus('idle');
    setApiMessage('');
  }

  async function handleSaveToBackend() {
    setApiStatus('saving');
    setApiMessage('Guardando propiedad en backend...');

    try {
      const savedProperty = await createProperty(property);
      setProperty(savedProperty);
      setApiStatus('saved');
      setApiMessage('Propiedad guardada en backend. Ya puedes publicarla para generar el link.');
    } catch (error) {
      setApiStatus('error');
      setApiMessage(error instanceof Error ? error.message : 'No se pudo guardar la propiedad.');
    }
  }

  async function handlePublish() {
    if (!property.id || property.id.startsWith('demo-')) {
      setApiStatus('error');
      setApiMessage('Primero guarda la propiedad en backend antes de publicarla.');
      return;
    }

    setApiStatus('publishing');
    setApiMessage('Publicando propiedad y generando link...');

    try {
      const publishedProperty = await publishProperty(property.id);
      setProperty(publishedProperty);
      setApiStatus('published');
      setApiMessage(`Link generado: /r/${publishedProperty.slug}`);
    } catch (error) {
      setApiStatus('error');
      setApiMessage(error instanceof Error ? error.message : 'No se pudo publicar la propiedad.');
    }
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

        <PropertyForm
          property={property}
          onChange={setProperty}
          onReset={resetDraft}
          onSaveToBackend={handleSaveToBackend}
          onPublish={handlePublish}
          apiStatus={apiStatus}
          apiMessage={apiMessage}
        />
        <ListingQualityCard property={property} />
        <PropertyLanding property={property} />
        <MarketplaceCopy property={property} />
      </main>
    </>
  );
}
