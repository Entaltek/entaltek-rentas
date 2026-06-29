import type { ChangeEvent } from 'react';
import type { Property } from '../types/property';
import { listFromText, safeNumber, textFromList } from '../lib/propertyDraft';

interface Props {
  property: Property;
  onChange: (property: Property) => void;
  onReset: () => void;
}

export function PropertyForm({ property, onChange, onReset }: Props) {
  function updateField<K extends keyof Property>(key: K, value: Property[K]) {
    onChange({ ...property, [key]: value });
  }

  function handleText(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, key: keyof Property) {
    updateField(key, event.target.value as never);
  }

  function handleNumber(event: ChangeEvent<HTMLInputElement>, key: keyof Property) {
    updateField(key, safeNumber(event.target.value) as never);
  }

  return (
    <section className="form-section" id="crear">
      <p className="eyebrow">Editor en vivo</p>
      <h2>Captura la propiedad y mira la landing actualizarse</h2>
      <p>Este flujo queda listo para conectarse al backend de Claude. Por ahora guarda el borrador en este navegador.</p>

      <form className="property-form">
        <label>
          Título de la propiedad
          <input value={property.title} onChange={(event) => handleText(event, 'title')} />
        </label>
        <label>
          Renta mensual
          <input value={property.price} inputMode="numeric" onChange={(event) => handleNumber(event, 'price')} />
        </label>
        <label>
          Zona / colonia
          <input value={property.zone} onChange={(event) => handleText(event, 'zone')} />
        </label>
        <label>
          Ciudad
          <input value={property.city} onChange={(event) => handleText(event, 'city')} />
        </label>
        <label>
          Recámaras
          <input value={property.bedrooms} inputMode="numeric" onChange={(event) => handleNumber(event, 'bedrooms')} />
        </label>
        <label>
          Baños
          <input value={property.bathrooms} inputMode="numeric" onChange={(event) => handleNumber(event, 'bathrooms')} />
        </label>
        <label>
          Estacionamientos
          <input value={property.parkingSpots} inputMode="numeric" onChange={(event) => handleNumber(event, 'parkingSpots')} />
        </label>
        <label>
          Metros cuadrados
          <input value={property.areaM2 ?? ''} inputMode="numeric" onChange={(event) => updateField('areaM2', safeNumber(event.target.value))} />
        </label>
        <label>
          Disponible desde
          <input value={property.availableFrom} onChange={(event) => handleText(event, 'availableFrom')} />
        </label>
        <label>
          WhatsApp de contacto
          <input value={property.whatsapp} onChange={(event) => handleText(event, 'whatsapp')} />
        </label>

        <div className="toggle-row full">
          <label className="toggle-label">
            <input type="checkbox" checked={property.furnished} onChange={(event) => updateField('furnished', event.target.checked)} />
            Amueblado
          </label>
          <label className="toggle-label">
            <input type="checkbox" checked={property.petsAllowed} onChange={(event) => updateField('petsAllowed', event.target.checked)} />
            Acepta mascotas
          </label>
          <label className="toggle-label">
            <input type="checkbox" checked={property.maintenanceIncluded} onChange={(event) => updateField('maintenanceIncluded', event.target.checked)} />
            Mantenimiento incluido
          </label>
        </div>

        <label className="full">
          Descripción
          <textarea value={property.description} onChange={(event) => handleText(event, 'description')} />
        </label>
        <label className="full">
          Amenidades, una por línea
          <textarea value={textFromList(property.amenities)} onChange={(event) => updateField('amenities', listFromText(event.target.value))} />
        </label>
        <label className="full">
          Requisitos, uno por línea
          <textarea value={textFromList(property.requirements)} onChange={(event) => updateField('requirements', listFromText(event.target.value))} />
        </label>

        <div className="form-actions full">
          <button type="button" className="primary-button" onClick={() => onChange(property)}>Guardar borrador local</button>
          <button type="button" className="secondary-button" onClick={onReset}>Restaurar demo</button>
        </div>
      </form>
    </section>
  );
}
