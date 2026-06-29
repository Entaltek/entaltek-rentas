import { useMemo, useState } from 'react';
import type { Property } from '../types/property';
import { generateMarketplaceCopy } from '../lib/marketplaceCopy';

interface Props {
  property: Property;
}

export function MarketplaceCopy({ property }: Props) {
  const [copied, setCopied] = useState(false);
  const publicUrl = useMemo(() => {
    if (!property.slug) return '';
    return `${window.location.origin}/r/${property.slug}`;
  }, [property.slug]);
  const copy = generateMarketplaceCopy(property, { publicUrl });

  async function copyToClipboard() {
    await navigator.clipboard.writeText(copy);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section className="copy-section" id="copy">
      <div>
        <p className="eyebrow">Texto listo para publicar</p>
        <h2>Copy para Marketplace y grupos</h2>
        <p>
          Publica este texto en Facebook Marketplace o grupos de renta. Cuando la propiedad ya tenga slug, agregamos el link completo automáticamente.
        </p>
        {publicUrl && (
          <a href={publicUrl} target="_blank" rel="noreferrer" className="public-link-pill">
            Abrir landing pública
          </a>
        )}
      </div>
      <textarea readOnly value={copy} aria-label="Copy para publicación" />
      <button onClick={copyToClipboard} className="secondary-button">
        {copied ? 'Copiado' : 'Copiar texto'}
      </button>
    </section>
  );
}
