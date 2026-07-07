import { useState, type ChangeEvent } from 'react';
import { ArrowLeft, ArrowRight, Camera, ImagePlus, Loader2, Star, Trash2 } from 'lucide-react';
import type { PropertyPhoto } from '../types/property';
import { fileToOptimizedDataUrl, MAX_IMAGE_SIZE_BYTES, MAX_PHOTOS, PHOTO_TITLE_SUGGESTIONS } from '../lib/images';
import { normalizePhotoOrder } from '../lib/photos';
import { generateId } from '../lib/slug';

interface Props {
  photos: PropertyPhoto[];
  onChange: (photos: PropertyPhoto[]) => void;
}

export function PhotoManager({ photos, onChange }: Props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!selectedFiles.length) return;

    const remainingSlots = MAX_PHOTOS - photos.length;
    if (remainingSlots <= 0) {
      setMessage(`Máximo ${MAX_PHOTOS} fotos por propiedad.`);
      return;
    }

    const validFiles = selectedFiles
      .filter((file) => file.type.startsWith('image/'))
      .filter((file) => file.size <= MAX_IMAGE_SIZE_BYTES)
      .slice(0, remainingSlots);

    if (!validFiles.length) {
      setMessage('No se agregaron fotos. Usa imágenes JPG, PNG o WebP menores a 8 MB.');
      return;
    }

    setIsProcessing(true);
    setMessage('');

    try {
      const dataUrls = await Promise.all(validFiles.map(fileToOptimizedDataUrl));
      const newPhotos: PropertyPhoto[] = dataUrls.map((url, index) => ({
        id: generateId('photo'),
        url,
        title: '',
        alt: '',
        isCover: false,
        order: photos.length + index
      }));
      onChange(normalizePhotoOrder([...photos, ...newPhotos]));
      setMessage(`${newPhotos.length} foto${newPhotos.length === 1 ? '' : 's'} agregada${newPhotos.length === 1 ? '' : 's'}. Ponles título para que la galería se entienda mejor.`);
    } catch {
      setMessage('Hubo un problema al procesar las fotos. Intenta de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  }

  function updatePhoto(id: string, patch: Partial<PropertyPhoto>) {
    onChange(photos.map((photo) => (
      photo.id === id
        ? { ...photo, ...patch, alt: patch.title !== undefined ? patch.title : photo.alt }
        : photo
    )));
  }

  function setCover(id: string) {
    const selected = photos.find((photo) => photo.id === id);
    if (!selected) return;
    onChange(normalizePhotoOrder([selected, ...photos.filter((photo) => photo.id !== id)]));
  }

  function movePhoto(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= photos.length) return;

    const reordered = [...photos];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    onChange(normalizePhotoOrder(reordered));
  }

  function removePhoto(id: string) {
    onChange(normalizePhotoOrder(photos.filter((photo) => photo.id !== id)));
  }

  return (
    <div className="photo-manager">
      <label className={`upload-box ${isProcessing ? 'is-loading' : ''}`}>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          onChange={handleFiles}
          disabled={isProcessing}
        />
        {isProcessing ? <Loader2 className="spin" size={26} /> : <ImagePlus size={26} />}
        <span>{isProcessing ? 'Procesando fotos...' : 'Subir fotos'}</span>
        <small>JPG, PNG o WebP · hasta {MAX_PHOTOS} fotos · se optimizan automáticamente</small>
      </label>

      {message && <p className="form-note">{message}</p>}

      {photos.length === 0 && !isProcessing && (
        <div className="photos-empty">
          <Camera size={26} />
          <p>Aún no hay fotos. Una buena galería empieza con fachada, sala, cocina y recámaras.</p>
        </div>
      )}

      {photos.length > 0 && (
        <div className="image-editor-grid">
          {photos.map((photo, index) => (
            <div className={`image-editor-card ${photo.isCover ? 'is-cover' : ''}`} key={photo.id}>
              <div className="image-editor-preview">
                <img src={photo.url} alt={photo.alt || photo.title || `Foto ${index + 1}`} />
                {photo.isCover && <span className="cover-badge"><Star size={13} /> Portada</span>}
              </div>
              <input
                className="photo-title-input"
                value={photo.title}
                placeholder="Título, ej. Sala, Cocina..."
                list="photo-title-suggestions"
                onChange={(event) => updatePhoto(photo.id, { title: event.target.value })}
              />
              <div className="image-actions">
                <button type="button" onClick={() => setCover(photo.id)} disabled={photo.isCover} title="Marcar como portada">
                  <Star size={15} /> Portada
                </button>
                <button type="button" onClick={() => movePhoto(index, -1)} disabled={index === 0} aria-label="Mover foto a la izquierda">
                  <ArrowLeft size={15} />
                </button>
                <button type="button" onClick={() => movePhoto(index, 1)} disabled={index === photos.length - 1} aria-label="Mover foto a la derecha">
                  <ArrowRight size={15} />
                </button>
                <button type="button" className="danger" onClick={() => removePhoto(photo.id)} aria-label="Eliminar foto">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <datalist id="photo-title-suggestions">
        {PHOTO_TITLE_SUGGESTIONS.map((suggestion) => <option key={suggestion} value={suggestion} />)}
      </datalist>
    </div>
  );
}
