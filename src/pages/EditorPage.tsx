import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  Link2,
  Loader2,
  Maximize2,
  Plus,
  Save,
  Send,
  X
} from 'lucide-react';
import { Header } from '../components/Header';
import { SiteFooter } from '../components/SiteFooter';
import { ListingQualityCard } from '../components/ListingQualityCard';
import { MarketplaceCopy } from '../components/MarketplaceCopy';
import { PropertyForm } from '../components/PropertyForm';
import { PropertyLanding } from '../components/PropertyLanding';
import { ToastStack, useToasts } from '../components/Toast';
import { calculateListingQuality } from '../lib/listingQuality';
import { clearPropertyDraft, loadPropertyDraft, savePropertyDraft } from '../lib/propertyDraft';
import { validateForPublish } from '../lib/validation';
import { publishProperty, saveProperty, unpublishProperty } from '../services/propertyService';
import type { Property } from '../types/property';
import { createEmptyProperty } from '../types/property';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'publishing' | 'error';

export function EditorPage() {
  const [property, setProperty] = useState<Property>(() => loadPropertyDraft());
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [publishErrors, setPublishErrors] = useState<string[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isFullscreenPreviewOpen, setIsFullscreenPreviewOpen] = useState(false);
  const { toasts, pushToast } = useToasts();

  useEffect(() => {
    savePropertyDraft(property);
  }, [property]);

  useEffect(() => {
    if (!isFullscreenPreviewOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsFullscreenPreviewOpen(false);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreenPreviewOpen]);

  const quality = useMemo(() => calculateListingQuality(property), [property]);
  const validation = useMemo(() => validateForPublish(property), [property]);
  const isBusy = saveStatus === 'saving' || saveStatus === 'publishing';
  const isPublished = property.status === 'published';
  const publicUrl = isPublished && property.slug ? `${window.location.origin}/r/${property.slug}` : '';

  function handleChange(next: Property) {
    setProperty(next);
    if (saveStatus === 'saved') setSaveStatus('idle');
  }

  function startNewProperty() {
    clearPropertyDraft();
    setProperty(createEmptyProperty());
    setSaveStatus('idle');
    setPublishErrors([]);
    pushToast('info', 'Empezaste una propiedad nueva.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSave(): Promise<Property | null> {
    setSaveStatus('saving');
    setPublishErrors([]);

    try {
      const saved = await saveProperty(property);
      setProperty(saved);
      setSaveStatus('saved');
      pushToast('success', 'Propiedad guardada.');
      return saved;
    } catch (error) {
      setSaveStatus('error');
      pushToast('error', error instanceof Error ? error.message : 'No se pudo guardar la propiedad.');
      return null;
    }
  }

  async function handlePublish() {
    if (!validation.canPublish) {
      setPublishErrors(validation.errors);
      pushToast('error', 'Faltan datos mínimos para publicar. Revisa la lista de pendientes.');
      return;
    }

    setSaveStatus('publishing');
    setPublishErrors([]);

    try {
      const saved = await saveProperty(property);
      const published = await publishProperty(saved.id);
      setProperty(published);
      setSaveStatus('saved');
      pushToast('success', 'Propiedad publicada. Tu link estará activo durante 30 días.');
      validation.warnings.forEach((warning) => pushToast('info', warning));
    } catch (error) {
      setSaveStatus('error');
      pushToast('error', error instanceof Error ? error.message : 'No se pudo publicar la propiedad.');
    }
  }

  async function handleUnpublish() {
    if (!property.id) return;
    setSaveStatus('saving');

    try {
      const unpublished = await unpublishProperty(property.id);
      setProperty(unpublished);
      setSaveStatus('saved');
      pushToast('info', 'La publicación quedó desactivada. El link mostrará "no activa".');
    } catch (error) {
      setSaveStatus('error');
      pushToast('error', error instanceof Error ? error.message : 'No se pudo despublicar la propiedad.');
    }
  }

  async function copyPublicLink() {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      pushToast('success', 'Link copiado al portapapeles.');
    } catch {
      pushToast('error', 'No se pudo copiar el link. Cópialo manualmente.');
    }
  }

  return (
    <>
      <Header />
      <main className="editor-page">
        <section className="editor-heading">
          <div>
            <p className="eyebrow">Editor de propiedad</p>
            <h1>{property.title.trim() || 'Nueva propiedad'}</h1>
            <div className="editor-status-row">
              <StatusPill status={property.status} saveStatus={saveStatus} />
              <div className="completeness">
                <div className="completeness-bar" role="progressbar" aria-valuenow={quality.score} aria-valuemin={0} aria-valuemax={100}>
                  <span style={{ width: `${quality.score}%` }} />
                </div>
                <span className="completeness-label">Tu publicación está al {quality.score}%</span>
              </div>
            </div>
          </div>
          <div className="editor-actions">
            <button type="button" className="secondary-button" onClick={startNewProperty} disabled={isBusy}>
              <Plus size={17} /> Nueva
            </button>
            <button type="button" className="secondary-button" onClick={handleSave} disabled={isBusy}>
              {saveStatus === 'saving' ? <Loader2 size={17} className="spin" /> : <Save size={17} />}
              {saveStatus === 'saving' ? 'Guardando...' : 'Guardar'}
            </button>
            {isPublished ? (
              <button type="button" className="secondary-button" onClick={handleUnpublish} disabled={isBusy}>
                <EyeOff size={17} /> Despublicar
              </button>
            ) : (
              <button type="button" className="primary-button" onClick={handlePublish} disabled={isBusy}>
                {saveStatus === 'publishing' ? <Loader2 size={17} className="spin" /> : <Send size={17} />}
                {saveStatus === 'publishing' ? 'Publicando...' : 'Publicar y generar link'}
              </button>
            )}
          </div>
        </section>

        {publishErrors.length > 0 && (
          <div className="publish-errors" role="alert">
            <p><AlertTriangle size={17} /> Para publicar necesitas completar:</p>
            <ul>
              {publishErrors.map((error) => <li key={error}>{error}</li>)}
            </ul>
          </div>
        )}

        {publicUrl && (
          <div className="public-link-banner">
            <p>
              <Globe size={17} /> Tu landing está publicada: <a href={publicUrl} target="_blank" rel="noreferrer">{publicUrl}</a>
              <small>Se elimina automáticamente después de 30 días.</small>
            </p>
            <button type="button" className="secondary-button" onClick={copyPublicLink}>
              <Link2 size={16} /> Copiar link
            </button>
          </div>
        )}

        <div className="editor-layout">
          <div className="editor-form-col">
            <PropertyForm
              property={property}
              onChange={handleChange}
              footer={
                <PublishFormFooter
                  isPublished={isPublished}
                  isBusy={isBusy}
                  saveStatus={saveStatus}
                  onPublish={handlePublish}
                  onUnpublish={handleUnpublish}
                  onOpenFullscreen={() => setIsFullscreenPreviewOpen(true)}
                />
              }
            />
            <ListingQualityCard property={property} />
            <MarketplaceCopy
              property={property}
              sectionId="copy"
              onCopied={() => pushToast('success', 'Texto copiado al portapapeles.')}
            />
          </div>

          <aside className={`editor-preview-col ${isPreviewOpen ? 'is-open' : ''}`}>
            <div className="preview-toolbar">
              <p><Eye size={16} /> Vista previa en vivo</p>
              <div className="preview-toolbar-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setIsFullscreenPreviewOpen(true)}
                >
                  <Maximize2 size={16} /> Pantalla completa
                </button>
                <button
                  type="button"
                  className="preview-toggle secondary-button"
                  onClick={() => setIsPreviewOpen((open) => !open)}
                  aria-expanded={isPreviewOpen}
                >
                  {isPreviewOpen ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>
            <div className="preview-frame">
              <PropertyLanding property={property} variant="preview" />
            </div>
          </aside>
        </div>
      </main>

      {isFullscreenPreviewOpen && (
        <div className="preview-modal" role="dialog" aria-modal="true" aria-label="Vista previa en pantalla completa">
          <div className="preview-modal-shell">
            <div className="preview-modal-toolbar">
              <p><Eye size={16} /> Vista previa en pantalla completa</p>
              <button type="button" className="secondary-button" onClick={() => setIsFullscreenPreviewOpen(false)}>
                <X size={17} /> Cerrar
              </button>
            </div>
            <div className="preview-modal-content">
              <PropertyLanding property={property} variant="preview" />
            </div>
          </div>
        </div>
      )}

      <ToastStack toasts={toasts} />
      <SiteFooter />
    </>
  );
}

function PublishFormFooter({
  isPublished,
  isBusy,
  saveStatus,
  onPublish,
  onUnpublish,
  onOpenFullscreen
}: {
  isPublished: boolean;
  isBusy: boolean;
  saveStatus: SaveStatus;
  onPublish: () => void;
  onUnpublish: () => void;
  onOpenFullscreen: () => void;
}) {
  return (
    <section className="form-publish-card" aria-label="Publicar propiedad">
      <div>
        <p className="eyebrow">Último paso</p>
        <h2>{isPublished ? 'Tu link ya está activo' : 'Publica y genera el link'}</h2>
        <p>
          La publicación queda disponible por 30 días y después se elimina automáticamente.
          Puedes revisar la vista completa antes de compartirla.
        </p>
      </div>
      <div className="form-publish-actions">
        <button type="button" className="secondary-button" onClick={onOpenFullscreen}>
          <Maximize2 size={17} /> Ver publicación completa
        </button>
        {isPublished ? (
          <button type="button" className="secondary-button" onClick={onUnpublish} disabled={isBusy}>
            <EyeOff size={17} /> Despublicar
          </button>
        ) : (
          <button type="button" className="primary-button" onClick={onPublish} disabled={isBusy}>
            {saveStatus === 'publishing' ? <Loader2 size={17} className="spin" /> : <Send size={17} />}
            {saveStatus === 'publishing' ? 'Publicando...' : 'Publicar y generar link'}
          </button>
        )}
      </div>
    </section>
  );
}

function StatusPill({ status, saveStatus }: { status: Property['status']; saveStatus: SaveStatus }) {
  if (saveStatus === 'saving') {
    return <span className="status-pill neutral"><Loader2 size={14} className="spin" /> Guardando...</span>;
  }
  if (saveStatus === 'publishing') {
    return <span className="status-pill neutral"><Loader2 size={14} className="spin" /> Publicando...</span>;
  }
  if (saveStatus === 'error') {
    return <span className="status-pill error"><AlertTriangle size={14} /> Error al guardar</span>;
  }
  if (status === 'published') {
    return <span className="status-pill success"><CheckCircle2 size={14} /> Publicada</span>;
  }
  if (status === 'unpublished') {
    return <span className="status-pill warning"><EyeOff size={14} /> Despublicada</span>;
  }
  if (saveStatus === 'saved') {
    return <span className="status-pill success"><CheckCircle2 size={14} /> Guardada</span>;
  }
  return <span className="status-pill neutral">Borrador</span>;
}
