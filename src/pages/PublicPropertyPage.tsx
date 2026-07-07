import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { EyeOff, RefreshCw, SearchX } from 'lucide-react';
import { Header } from '../components/Header';
import { LandingSkeleton } from '../components/LandingSkeleton';
import { PropertyLanding } from '../components/PropertyLanding';
import { SiteFooter } from '../components/SiteFooter';
import { getPropertyBySlug } from '../services/propertyService';
import type { Property } from '../types/property';

interface Props {
  slug: string;
}

type PageStatus = 'loading' | 'success' | 'not-found' | 'unpublished' | 'error';

export function PublicPropertyPage({ slug }: Props) {
  const [property, setProperty] = useState<Property | null>(null);
  const [status, setStatus] = useState<PageStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const loadProperty = useCallback(async () => {
    setStatus('loading');

    try {
      const publicProperty = await getPropertyBySlug(slug);

      if (!publicProperty) {
        setStatus('not-found');
        return;
      }

      if (publicProperty.status !== 'published') {
        setStatus('unpublished');
        return;
      }

      setProperty(publicProperty);
      setStatus('success');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo cargar la propiedad.');
      setStatus('error');
    }
  }, [slug]);

  useEffect(() => {
    loadProperty();
  }, [loadProperty]);

  return (
    <>
      <Header variant="public" />
      <main className="public-page">
        {status === 'loading' && <LandingSkeleton />}

        {status === 'not-found' && (
          <EmptyState
            icon={<SearchX size={34} />}
            title="Esta propiedad no está disponible"
            text="El link puede estar incompleto o la publicación ya no existe."
          />
        )}

        {status === 'unpublished' && (
          <EmptyState
            icon={<EyeOff size={34} />}
            title="Esta publicación no está activa"
            text="El anunciante pausó esta publicación. Si te compartieron el link, pregúntale si sigue disponible."
          />
        )}

        {status === 'error' && (
          <EmptyState
            icon={<RefreshCw size={34} />}
            title="No pudimos cargar la propiedad"
            text={errorMessage}
            action={
              <button type="button" className="primary-button" onClick={loadProperty}>
                <RefreshCw size={17} /> Intentar de nuevo
              </button>
            }
          />
        )}

        {status === 'success' && property && (
          <PropertyLanding property={property} variant="public" />
        )}
      </main>
      <SiteFooter />
    </>
  );
}

function EmptyState({
  icon,
  title,
  text,
  action
}: {
  icon: ReactNode;
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <section className="public-state">
      <div className="public-state-icon">{icon}</div>
      <h1>{title}</h1>
      <p>{text}</p>
      <div className="public-state-actions">
        {action}
        <a href="/" className="secondary-button">Ir al inicio</a>
      </div>
    </section>
  );
}
