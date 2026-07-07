import { useEffect, useState } from 'react';
import { ApiError } from '../api/client';
import { getPropertyBySlug } from '../api/properties';
import { Header } from '../components/Header';
import { LeadForm } from '../components/LeadForm';
import { MarketplaceCopy } from '../components/MarketplaceCopy';
import { PropertyLanding } from '../components/PropertyLanding';
import { demoProperty } from '../data/demoProperty';
import type { Property } from '../types/property';

interface Props {
  slug: string;
}

type PageStatus = 'loading' | 'success' | 'not-found' | 'error' | 'demo-fallback';

export function PublicPropertyPage({ slug }: Props) {
  const [property, setProperty] = useState<Property | null>(null);
  const [status, setStatus] = useState<PageStatus>('loading');
  const [message, setMessage] = useState('Cargando propiedad...');

  useEffect(() => {
    let isMounted = true;

    async function loadProperty() {
      setStatus('loading');
      setMessage('Cargando propiedad...');

      try {
        const publicProperty = await getPropertyBySlug(slug);
        if (!isMounted) return;
        setProperty(publicProperty);
        setStatus('success');
        setMessage('');
      } catch (error) {
        if (!isMounted) return;

        if (error instanceof ApiError && error.isNotFound) {
          setStatus('not-found');
          setMessage('El link puede estar mal escrito o la propiedad ya no está publicada.');
          return;
        }

        // Fallback demo explícito: solo para el slug del demo y solo si el backend
        // no respondió (error de red). Errores reales del servidor sí se muestran.
        if (error instanceof ApiError && error.isNetworkError && slug === demoProperty.slug) {
          setProperty(demoProperty);
          setStatus('demo-fallback');
          setMessage('Mostrando datos de demostración porque el backend no está disponible.');
          return;
        }

        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'No se pudo cargar la propiedad.');
      }
    }

    loadProperty();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  return (
    <>
      <Header />
      <main>
        {status === 'loading' && (
          <section className="form-section public-state">
            <p className="eyebrow">Landing pública</p>
            <h1>Cargando propiedad</h1>
            <p>{message}</p>
          </section>
        )}

        {status === 'not-found' && (
          <section className="form-section public-state">
            <p className="eyebrow">Landing pública</p>
            <h1>No encontramos esta propiedad</h1>
            <p>{message}</p>
            <a href="/" className="primary-button">Volver al editor</a>
          </section>
        )}

        {status === 'error' && (
          <section className="form-section public-state">
            <p className="eyebrow">Landing pública</p>
            <h1>No se pudo cargar la propiedad</h1>
            <p>{message}</p>
            <a href="/" className="primary-button">Volver al editor</a>
          </section>
        )}

        {property && (status === 'success' || status === 'demo-fallback') && (
          <>
            <section className="public-banner">
              <p className="eyebrow">Landing pública</p>
              <h1>{property.title}</h1>
              <p>
                {status === 'demo-fallback'
                  ? message
                  : 'Esta información viene desde el backend usando el slug público.'}
              </p>
            </section>
            <PropertyLanding property={property} />
            {status === 'success' && <LeadForm propertyId={property.id} propertyTitle={property.title} />}
            <MarketplaceCopy property={property} />
          </>
        )}
      </main>
    </>
  );
}
