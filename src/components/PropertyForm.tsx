import { useEffect, useMemo, useState } from 'react';
import type { PropertyDraft } from '../lib/draft';
import { clearDraft, draftToProperty, emptyDraft, isDraftPresentable, loadDraft, saveDraft } from '../lib/draft';
import type { PropertyType } from '../types/property';
import { MarketplaceCopy } from './MarketplaceCopy';
import { PropertyLanding } from './PropertyLanding';

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'departamento', label: 'Departamento' },
  { value: 'casa', label: 'Casa' },
  { value: 'cuarto', label: 'Cuarto' },
  { value: 'local', label: 'Local comercial' },
  { value: 'oficina', label: 'Oficina' }
];

export function PropertyForm() {
  const [draft, setDraft] = useState<PropertyDraft>(() => loadDraft() ?? emptyDraft);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    saveDraft(draft);
  }, [draft]);

  const presentable = isDraftPresentable(draft);
  const previewProperty = useMemo(
    () => (presentable ? draftToProperty(draft) : null),
    [draft, presentable]
  );

  function set<K extends keyof PropertyDraft>(key: K, value: PropertyDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleClear() {
    clearDraft();
    setDraft(emptyDraft);
    setShowPreview(false);
  }

  return (
    <>
      <section className="form-section" id="crear">
        <p className="eyebrow">Crea tu propiedad</p>
        <h2>Captura los datos y mira la landing al instante</h2>
        <p className="section-note">
          El borrador se guarda automáticamente en este navegador. Llena título y renta mensual para activar la vista previa.
        </p>
        <form className="property-form" onSubmit={(event) => event.preventDefault()}>
          <label>
            Título de la propiedad
            <input
              value={draft.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Departamento amueblado en zona norte"
            />
          </label>
          <label>
            Tipo
            <select value={draft.type} onChange={(e) => set('type', e.target.value as PropertyType)}>
              {PROPERTY_TYPES.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label>
            Renta mensual (MXN)
            <input
              value={draft.price}
              onChange={(e) => set('price', e.target.value)}
              placeholder="12000"
              inputMode="numeric"
            />
          </label>
          <label>
            WhatsApp de contacto
            <input
              value={draft.whatsapp}
              onChange={(e) => set('whatsapp', e.target.value)}
              placeholder="524771234567"
              inputMode="tel"
            />
          </label>
          <label>
            Zona / colonia
            <input value={draft.zone} onChange={(e) => set('zone', e.target.value)} placeholder="Zona norte" />
          </label>
          <label>
            Ciudad
            <input value={draft.city} onChange={(e) => set('city', e.target.value)} placeholder="León, Guanajuato" />
          </label>
          <label>
            Recámaras
            <input value={draft.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} inputMode="numeric" />
          </label>
          <label>
            Baños
            <input value={draft.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} inputMode="numeric" />
          </label>
          <label>
            Estacionamientos
            <input value={draft.parkingSpots} onChange={(e) => set('parkingSpots', e.target.value)} inputMode="numeric" />
          </label>
          <label>
            Superficie (m², opcional)
            <input value={draft.areaM2} onChange={(e) => set('areaM2', e.target.value)} inputMode="numeric" placeholder="78" />
          </label>
          <label>
            Meses de depósito
            <input value={draft.depositMonths} onChange={(e) => set('depositMonths', e.target.value)} inputMode="numeric" />
          </label>
          <label>
            Disponible desde
            <input value={draft.availableFrom} onChange={(e) => set('availableFrom', e.target.value)} placeholder="Inmediata" />
          </label>
          <fieldset className="full option-row">
            <legend>Condiciones</legend>
            <label className="option">
              <input type="checkbox" checked={draft.furnished} onChange={(e) => set('furnished', e.target.checked)} />
              Amueblado
            </label>
            <label className="option">
              <input type="checkbox" checked={draft.petsAllowed} onChange={(e) => set('petsAllowed', e.target.checked)} />
              Acepta mascotas
            </label>
            <label className="option">
              <input
                type="checkbox"
                checked={draft.maintenanceIncluded}
                onChange={(e) => set('maintenanceIncluded', e.target.checked)}
              />
              Mantenimiento incluido
            </label>
          </fieldset>
          <label className="full">
            Descripción
            <textarea
              value={draft.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Describe la propiedad, ventajas, reglas y disponibilidad."
            />
          </label>
          <label>
            Requisitos (uno por línea)
            <textarea
              value={draft.requirements}
              onChange={(e) => set('requirements', e.target.value)}
              placeholder={'Identificación oficial\nComprobante de ingresos'}
            />
          </label>
          <label>
            Amenidades (una por línea)
            <textarea
              value={draft.amenities}
              onChange={(e) => set('amenities', e.target.value)}
              placeholder={'Cocina equipada\nCloset\nZona tranquila'}
            />
          </label>
          <label className="full">
            Fotos (URLs, una por línea)
            <textarea
              value={draft.imageUrls}
              onChange={(e) => set('imageUrls', e.target.value)}
              placeholder="https://…"
            />
          </label>
          <div className="full form-actions">
            <button
              type="button"
              className="primary-button"
              disabled={!presentable}
              onClick={() => setShowPreview(true)}
            >
              {showPreview ? 'Vista previa activa' : 'Ver vista previa'}
            </button>
            <button type="button" className="secondary-button" onClick={handleClear}>
              Limpiar borrador
            </button>
            {!presentable && <span className="form-hint">Falta título o renta mensual válida.</span>}
          </div>
        </form>
      </section>

      {showPreview && previewProperty && (
        <section className="preview-block" aria-label="Vista previa de tu landing">
          <p className="eyebrow">Vista previa</p>
          <h2>Así se verá tu landing</h2>
          <PropertyLanding property={previewProperty} />
          <MarketplaceCopy property={previewProperty} />
        </section>
      )}
    </>
  );
}
