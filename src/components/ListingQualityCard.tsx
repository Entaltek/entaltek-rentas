import { CheckCircle2, CircleAlert, Sparkles } from 'lucide-react';
import { calculateListingQuality } from '../lib/listingQuality';
import type { Property } from '../types/property';

interface Props {
  property: Property;
}

export function ListingQualityCard({ property }: Props) {
  const quality = calculateListingQuality(property);
  const pendingChecks = quality.checks.filter((check) => !check.passed);

  return (
    <section className="quality-card" aria-label="Calidad de publicación">
      <div className="quality-header">
        <div>
          <p className="eyebrow">Diagnóstico de publicación</p>
          <h2>Tu publicación está al {quality.score}%</h2>
          <p>{quality.summary}</p>
        </div>
        <div className="score-badge" aria-label={`Score ${quality.score} por ciento`}>
          <Sparkles size={22} />
          <strong>{quality.score}%</strong>
          <span>{quality.level}</span>
        </div>
      </div>

      <div className="score-bar" aria-hidden="true">
        <span style={{ width: `${quality.score}%` }} />
      </div>

      <div className="quality-grid">
        <div>
          <h3>Lo que ya está bien</h3>
          <ul className="quality-list good">
            {quality.checks.filter((check) => check.passed).map((check) => (
              <li key={check.id}><CheckCircle2 size={18} /> {check.label}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Mejoras recomendadas</h3>
          <ul className="quality-list pending">
            {pendingChecks.length ? pendingChecks.map((check) => (
              <li key={check.id}>
                <CircleAlert size={18} />
                <span><strong>{check.label}:</strong> {check.recommendation}</span>
              </li>
            )) : (
              <li><CheckCircle2 size={18} /> No hay pendientes críticos. Está lista para compartirse.</li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
