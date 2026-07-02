import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Copy, MessageCircle } from 'lucide-react';
import type { Property } from '../types/property';
import { generateMarketplaceCopy } from '../lib/marketplaceCopy';

interface Props {
  property: Property;
  sectionId?: string;
}

type CopyStatus = 'idle' | 'copied' | 'error';

export function MarketplaceCopy({ property, sectionId }: Props) {
  const [status, setStatus] = useState<CopyStatus>('idle');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const publicUrl = useMemo(() => {
    if (!property.slug) return '';
    return `${window.location.origin}/r/${property.slug}`;
  }, [property.slug]);
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
    } catch {
      textareaRef.current?.select();
      setStatus('error');
    }
  }

  return (
    <section className="copy-section" id={sectionId}>
      <div>
        <p className="eyebrow">Texto listo para publicar</p>
        <h2>Copy para Marketplace y grupos</h2>
        <p className="section-note">
          Publica este texto en Facebook Marketplace, grupos de renta o WhatsApp. Cuando la propiedad ya tenga slug, agregamos el link completo automáticamente.
        </p>
        {publicUrl && (
          <a href={publicUrl} target="_blank" rel="noreferrer" className="public-link-pill">
            Abrir landing pública
          </a>
        )}
      </div>
      <textarea ref={textareaRef} readOnly value={copy} aria-label="Copy para publicación" />
      <div className="copy-actions">
        <button onClick={copyToClipboard} className="secondary-button" type="button">
          {status === 'copied' ? <Check size={18} /> : <Copy size={18} />}
          {status === 'copied' ? 'Copiado' : 'Copiar texto'}
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
