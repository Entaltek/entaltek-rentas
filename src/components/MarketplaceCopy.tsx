import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Copy, ExternalLink, Link2, MessageCircle } from 'lucide-react';
import type { Property } from '../types/property';
import { generateMarketplaceCopy } from '../lib/marketplaceCopy';

interface Props {
  property: Property;
  sectionId?: string;
  onCopied?: () => void;
}

type CopyStatus = 'idle' | 'copied' | 'error';

export function MarketplaceCopy({ property, sectionId, onCopied }: Props) {
  const [status, setStatus] = useState<CopyStatus>('idle');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const publicUrl = useMemo(() => {
    if (!property.slug || property.status !== 'published') return '';
    return `${window.location.origin}/r/${property.slug}`;
  }, [property.slug, property.status]);
  const copy = generateMarketplaceCopy(property, { publicUrl });
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(copy)}`;

  useEffect(() => {
    if (status === 'idle') return;
    const timer = setTimeout(() => setStatus('idle'), 2500);
    return () => clearTimeout(timer);
  }, [status]);

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(copy);
      setStatus('copied');
      onCopied?.();
    } catch {
      textareaRef.current?.select();
      setStatus('error');
    }
  }

  return (
    <section className="copy-section copy-product-card" id={sectionId}>
      <div className="copy-product-header">
        <div>
          <p className="eyebrow">Producto final para compartir</p>
          <h2>Link de tu propiedad + texto para Marketplace</h2>
          <p className="section-note">
            Esta es la parte que debes usar al final: copia el texto para pegarlo en Facebook Marketplace,
            grupos de renta o WhatsApp. El link de la propiedad se agrega automáticamente cuando publiques.
          </p>
        </div>
        <div className="copy-product-badges" aria-label="Elementos finales de publicación">
          <span><Link2 size={15} /> Link de la propiedad</span>
          <span><Copy size={15} /> Copy para Marketplace</span>
        </div>
      </div>

      {publicUrl ? (
        <a href={publicUrl} target="_blank" rel="noreferrer" className="public-link-pill copy-public-link">
          <ExternalLink size={15} /> Abrir link público de la propiedad
        </a>
      ) : (
        <div className="copy-public-link is-disabled">
          <Link2 size={15} /> El link aparecerá aquí cuando publiques la propiedad.
        </div>
      )}

      <textarea ref={textareaRef} readOnly value={copy} aria-label="Copy para publicación" />
      <div className="copy-actions">
        <button onClick={copyToClipboard} className="primary-button copy-main-button" type="button">
          {status === 'copied' ? <Check size={18} /> : <Copy size={18} />}
          {status === 'copied' ? 'Texto copiado' : 'Copiar texto para Marketplace'}
        </button>
        <a href={whatsappShareUrl} target="_blank" rel="noreferrer" className="secondary-button">
          <MessageCircle size={18} /> Compartir por WhatsApp
        </a>
        <span role="status" className="copy-status">
          {status === 'error' ? 'No se pudo copiar automáticamente; el texto quedó seleccionado.' : ''}
        </span>
      </div>
    </section>
  );
}
