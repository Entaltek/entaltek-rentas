import { useState } from 'react';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import type { NearbyPlace, NearbyPlaceType } from '../types/property';
import { NEARBY_PLACE_TYPE_LABELS } from '../types/property';
import { generateId } from '../lib/slug';

interface Props {
  places: NearbyPlace[];
  onChange: (places: NearbyPlace[]) => void;
}

const TYPE_OPTIONS = Object.entries(NEARBY_PLACE_TYPE_LABELS) as [NearbyPlaceType, string][];

// Alta manual de lugares cercanos. Cuando exista integración con Google
// Places / Mapbox / Nominatim, este componente puede autocompletar nombre,
// tipo y distancia a partir de lat/lng sin cambiar el modelo de datos.
export function NearbyPlacesEditor({ places, onChange }: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState<NearbyPlaceType>('tienda');
  const [distanceText, setDistanceText] = useState('');

  function addPlace() {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    onChange([
      ...places,
      {
        id: generateId('place'),
        name: trimmedName,
        type,
        distanceText: distanceText.trim() || undefined
      }
    ]);
    setName('');
    setDistanceText('');
  }

  function removePlace(id: string) {
    onChange(places.filter((place) => place.id !== id));
  }

  return (
    <div className="nearby-editor">
      <p className="field-title">Lugares cercanos</p>
      <p className="field-help">
        Ejemplos: “Oxxo a 2 min”, “Paradero de camión a 1 cuadra”, “Universidad cercana”. Dan mucha
        confianza a quien busca en la zona.
      </p>

      <div className="nearby-editor-form">
        <input
          value={name}
          placeholder="Nombre, ej. Oxxo"
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addPlace();
            }
          }}
        />
        <select value={type} onChange={(event) => setType(event.target.value as NearbyPlaceType)} aria-label="Tipo de lugar">
          {TYPE_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <input
          value={distanceText}
          placeholder="Distancia, ej. a 5 min"
          onChange={(event) => setDistanceText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addPlace();
            }
          }}
        />
        <button type="button" className="secondary-button" onClick={addPlace} disabled={!name.trim()}>
          <Plus size={16} /> Agregar
        </button>
      </div>

      {places.length > 0 && (
        <ul className="nearby-editor-list">
          {places.map((place) => (
            <li key={place.id}>
              <MapPin size={15} />
              <span>
                <strong>{place.name}</strong> · {NEARBY_PLACE_TYPE_LABELS[place.type]}
                {place.distanceText ? ` · ${place.distanceText}` : ''}
              </span>
              <button type="button" onClick={() => removePlace(place.id)} aria-label={`Quitar ${place.name}`}>
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
