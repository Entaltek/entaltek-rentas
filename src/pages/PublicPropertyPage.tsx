import { useEffect, useState } from 'react';
import { getPropertyBySlug } from '../api/properties';
import { Header } from '../components/Header';
import { MarketplaceCopy } from '../components/MarketplaceCopy';
import { PropertyLanding } from '../components/PropertyLanding';
import type { Property } from '../types/property';

interface Props {
  slug: string;
}

export function PublicPropertyPage({ slug }: Props) {
  const [property, setProperty] = useState<Property | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
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

        {status === 'error' && (
          <section className="form-section public-state">
            <p className="eyebrow">Landing pública</p>
            <h1>No encontramos esta propiedad</h1>
            <p>{message}</p>
            <a href="/" className="primary-button">Volver al editor</a>
          </section>
        )}

        {property && status === 'success' && (
          <>
            <section className="public-banner">
              <p className="eyebrow">Landing pública</p>
              <h1>{property.title}</h1>
              <p>Esta información viene desde el backend usando el slug público.</p>
            </section>
            <PropertyLanding property={property} />
            <MarketplaceCopy property={property} />
          </>
        )}
      </main>
    </>
  );
}
