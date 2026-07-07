import { useState, type ChangeEvent } from 'react';
import type { Property, PropertyType } from '../types/property';
import { listFromText, safeNumber, textFromList } from '../lib/propertyDraft';

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'departamento', label: 'Departamento' },
  { value: 'casa', label: 'Casa' },
  { value: 'cuarto', label: 'Cuarto' },
  { value: 'local', label: 'Local comercial' },
  { value: 'oficina', label: 'Oficina' }
];

const MAX_LOCAL_IMAGES = 8;
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

type ApiStatus = 'idle' | 'saving' | 'publishing' | 'saved' | 'published' | 'error';

interface Props {
  property: Property;
  onChange: (property: Property) => void;
  onReset: () => void;
  onSaveToBackend: () => void;
  onPublish: () => void;
  onRemoveImage: (index: number) => void;
  apiStatus: ApiStatus;
  apiMessage: string;
}

export function PropertyForm({ property, onChange, onReset, onSaveToBackend, onPublish, onRemoveImage, apiStatus, apiMessage }: Props) {
  const [imageMessage, setImageMessage] = useState<string>('');

  function updateField<K extends keyof Property>(key: K, value: Property[K]) {
    onChange({ ...property, [key]: value });
  }

  function handleText(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, key: keyof Property) {
    updateField(key, event.target.value as never);
  }

  function handleNumber(event: ChangeEvent<HTMLInputElement>, key: keyof Property) {
    updateField(key, safeNumber(event.target.value) as never);
  }

  async function handleImages(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = '';

    if (!selectedFiles.length) return;

    const remainingSlots = MAX_LOCAL_IMAGES - property.images.length;
    if (remainingSlots <= 0) {
      setImageMessage(`Solo puedes tener ${MAX_LOCAL_IMAGES} fotos en el borrador local.`);
      return;
    }

    const validFiles = selectedFiles
      .filter((file) => file.type.startsWith('image/'))
      .filter((file) => file.size <= MAX_IMAGE_SIZE_BYTES)
      .slice(0, remainingSlots);

    if (!validFiles.length) {
      setImageMessage('No se agregaron fotos. Usa imágenes JPG, PNG o WebP menores a 2 MB.');
      return;
    }

    const dataUrls = await Promise.all(validFiles.map(readFileAsDataUrl));
    updateField('images', [...property.images, ...dataUrls]);
    setImageMessage(`${validFiles.length} foto${validFiles.length === 1 ? '' : 's'} agregada${validFiles.length === 1 ? '' : 's'} al borrador.`);
  }

  function setCoverImage(index: number) {
    const images = [...property.images];
    const [selected] = images.splice(index, 1);
    updateField('images', [selected, ...images]);
  }

  function moveImage(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= property.images.length) return;

    const images = [...property.images];
    [images[index], images[targetIndex]] = [images[targetIndex], images[index]];
    updateField('images', images);
  }

  const isBusy = apiStatus === 'saving' || apiStatus === 'publishing';
  const publicBaseUrl = (import.meta.env.VITE_PUBLIC_BASE_URL ?? window.location.origin).replace(/\/+$/, '');
  const publicLink = property.slug && property.status === 'published' ? `${publicBaseUrl}/r/${property.slug}` : '';

  return (
    <section className="form-section" id="crear">
      <p className="eyebrow">Editor en vivo</p>
      <h2>Captura la propiedad y mira la landing actualizarse</h2>
      <p>Guarda la propiedad en backend, publícala y genera un link público para compartir en Marketplace.</p>

      <form className="property-form">
        <label>
          Título de la propiedad
          <input value={property.title} onChange={(event) => handleText(event, 'title')} />
        </label>
        <label>
          Tipo
          <select value={property.type} onChange={(event) => updateField('type', event.target.value as PropertyType)}>
            {PROPERTY_TYPES.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
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
          Meses de depósito
          <input value={property.depositMonths} inputMode="numeric" onChange={(event) => handleNumber(event, 'depositMonths')} />
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

        <div className="image-uploader full">
          <div>
            <p className="field-title">Fotos de la propiedad</p>
            <p className="field-help">Agrega hasta {MAX_LOCAL_IMAGES} fotos. La primera imagen será la portada de la landing.</p>
          </div>
          <label className="upload-box">
            <input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={handleImages} />
            <span>Subir fotos</span>
            <small>JPG, PNG o WebP · máximo 2 MB por imagen</small>
          </label>
          {imageMessage && <p className="form-note">{imageMessage}</p>}
          <div className="image-editor-grid">
            {property.images.map((image, index) => (
              <div className="image-editor-card" key={`${image}-${index}`}>
                <img src={image} alt={`Foto ${index + 1} de la propiedad`} />
                <span>{index === 0 ? 'Portada' : `Foto ${index + 1}`}</span>
                <div className="image-actions">
                  <button type="button" onClick={() => setCoverImage(index)} disabled={index === 0}>Portada</button>
                  <button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0}>←</button>
                  <button type="button" onClick={() => moveImage(index, 1)} disabled={index === property.images.length - 1}>→</button>
                  <button type="button" onClick={() => onRemoveImage(index)}>Quitar</button>
                </div>
              </div>
            ))}
          </div>
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
          <button type="button" className="primary-button" onClick={onSaveToBackend} disabled={isBusy}>
            {apiStatus === 'saving' ? 'Guardando...' : 'Guardar en backend'}
          </button>
          <button type="button" className="primary-button" onClick={onPublish} disabled={isBusy}>
            {apiStatus === 'publishing' ? 'Publicando...' : 'Publicar y generar link'}
          </button>
          <button type="button" className="secondary-button" onClick={onReset} disabled={isBusy}>Restaurar demo</button>
        </div>

        {apiMessage && <p className={`api-message full ${apiStatus === 'error' ? 'error' : 'success'}`}>{apiMessage}</p>}
        {publicLink && (
          <p className="api-message full success">
            Link público: <a href={publicLink} target="_blank" rel="noreferrer"><strong>{publicLink}</strong></a>
          </p>
        )}
      </form>
    </section>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
