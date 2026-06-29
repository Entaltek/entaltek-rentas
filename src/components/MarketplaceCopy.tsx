import type { Property } from '../types/property';
import { generateMarketplaceCopy } from '../lib/marketplaceCopy';

interface Props {
  property: Property;
}

export function MarketplaceCopy({ property }: Props) {
  const copy = generateMarketplaceCopy(property);

  async function copyToClipboard() {
    await navigator.clipboard.writeText(copy);
  }

  return (
    <section className="copy-section" id="copy">
      <div>
        <p className="eyebrow">Texto listo para publicar</p>
        <h2>Copy para Facebook Marketplace</h2>
        <p>Úsalo en Marketplace, grupos de Facebook o WhatsApp. El link de la landing se agrega al final cuando la propiedad tenga URL pública.</p>
      </div>
      <textarea readOnly value={copy} />
      <button onClick={copyToClipboard} className="secondary-button">Copiar texto</button>
    </section>
  );
}
