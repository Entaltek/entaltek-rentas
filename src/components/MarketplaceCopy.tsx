import { useEffect, useRef, useState } from 'react';
import { Check, Copy, MessageCircle } from 'lucide-react';
import type { Property } from '../types/property';
import { generateMarketplaceCopy } from '../lib/marketplaceCopy';

interface Props {
  property: Property;
  sectionId?: string;
}

type CopyStatus = 'idle' | 'copied' | 'error';

export function MarketplaceCopy({ property, sectionId }: Props) {
  const copy = generateMarketplaceCopy(property);
  const [status, setStatus] = useState<CopyStatus>('idle');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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
        <h2>Copy para Facebook Marketplace</h2>
        <p className="section-note">
          Úsalo en Marketplace, grupos de Facebook o WhatsApp. El link de la landing se agrega al final cuando la propiedad tenga URL pública.
        </p>
      </div>
      <textarea ref={textareaRef} readOnly value={copy} aria-label="Texto generado para Marketplace" />
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
