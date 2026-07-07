import { useEffect, useState } from 'react';
import {
  createProperty,
  deletePropertyImage,
  publishProperty,
  toPropertyPayload,
  updateProperty,
  uploadPropertyImages
} from '../api/properties';
import { Header } from '../components/Header';
import { ListingQualityCard } from '../components/ListingQualityCard';
import { MarketplaceCopy } from '../components/MarketplaceCopy';
import { PropertyForm } from '../components/PropertyForm';
import { PropertyLanding } from '../components/PropertyLanding';
import { demoProperty } from '../data/demoProperty';
import { clearPropertyDraft, loadPropertyDraft, savePropertyDraft } from '../lib/propertyDraft';
import type { Property } from '../types/property';

type ApiStatus = 'idle' | 'saving' | 'publishing' | 'saved' | 'published' | 'error';

/** Una propiedad existe en backend cuando tiene un id real (UUID), no el id local del demo. */
function isSavedInBackend(property: Property): boolean {
  return Boolean(property.id) && !property.id.startsWith('demo-');
}

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
      const localImages = property.images.filter((image) => image.startsWith('data:image/'));
      const alreadySaved = isSavedInBackend(property);

      const savedProperty = alreadySaved
        ? await updateProperty(property.id, toPropertyPayload(property))
        : await createProperty(property);

      let imageRecords = savedProperty.imageRecords ?? [];

      if (localImages.length) {
        setApiMessage(`Propiedad guardada. Subiendo ${localImages.length} foto${localImages.length === 1 ? '' : 's'}...`);
        const uploadedImages = await uploadPropertyImages(savedProperty.id, localImages);
        imageRecords = [...imageRecords, ...uploadedImages];
      }

      setProperty({
        ...savedProperty,
        images: imageRecords.map((image) => image.url),
        imageRecords
      });
      setApiStatus('saved');
      setApiMessage(
        alreadySaved
          ? 'Propiedad actualizada en backend.'
          : 'Propiedad guardada en backend. Ya puedes publicarla para generar el link.'
      );
    } catch (error) {
      setApiStatus('error');
      setApiMessage(error instanceof Error ? error.message : 'No se pudo guardar la propiedad.');
    }
  }

  async function handlePublish() {
    if (!isSavedInBackend(property)) {
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

  async function handleRemoveImage(index: number) {
    const imageUrl = property.images[index];
    const record = property.imageRecords?.find((image) => image.url === imageUrl);

    if (record && isSavedInBackend(property)) {
      try {
        await deletePropertyImage(property.id, record.id);
      } catch (error) {
        setApiStatus('error');
        setApiMessage(error instanceof Error ? error.message : 'No se pudo eliminar la imagen en backend.');
        return;
      }
    }

    setProperty({
      ...property,
      images: property.images.filter((_, imageIndex) => imageIndex !== index),
      imageRecords: property.imageRecords?.filter((image) => image.id !== record?.id)
    });
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
          onRemoveImage={handleRemoveImage}
          apiStatus={apiStatus}
          apiMessage={apiMessage}
        />
        <ListingQualityCard property={property} />
        <PropertyLanding property={property} sectionId="demo" />
        <MarketplaceCopy property={property} sectionId="copy" />
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
