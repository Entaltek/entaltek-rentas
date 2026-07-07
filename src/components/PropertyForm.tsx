import type { ChangeEvent, ReactNode } from 'react';
import { Contact2, Home, ImageIcon, ListChecks, MapPin, Wallet } from 'lucide-react';
import type {
  OperationType,
  PricePeriod,
  Property,
  PropertyLocation,
  PropertyType
} from '../types/property';
import { OPERATION_TYPE_LABELS, PROPERTY_TYPE_LABELS } from '../types/property';
import { listFromText, safeNumber, textFromList } from '../lib/propertyDraft';
import { NearbyPlacesEditor } from './NearbyPlacesEditor';
import { PhotoManager } from './PhotoManager';
import { SmartTourTeaser } from './SmartTourTeaser';

interface Props {
  property: Property;
  onChange: (property: Property) => void;
}

const PROPERTY_TYPE_OPTIONS = Object.entries(PROPERTY_TYPE_LABELS) as [PropertyType, string][];
const OPERATION_TYPE_OPTIONS = Object.entries(OPERATION_TYPE_LABELS) as [OperationType, string][];
const PRICE_PERIOD_OPTIONS: { value: PricePeriod; label: string }[] = [
  { value: 'monthly', label: 'Mensual' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'daily', label: 'Diaria' }
];

export function PropertyForm({ property, onChange }: Props) {
  function updateField<K extends keyof Property>(key: K, value: Property[K]) {
    onChange({ ...property, [key]: value });
  }

  function updateLocation<K extends keyof PropertyLocation>(key: K, value: PropertyLocation[K]) {
    onChange({ ...property, location: { ...property.location, [key]: value } });
  }

  function updateContact(key: 'name' | 'whatsapp', value: string) {
    onChange({ ...property, contact: { ...property.contact, [key]: value } });
  }

  function handleText(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, key: keyof Property) {
    updateField(key, event.target.value as never);
  }

  return (
    <form className="property-form" onSubmit={(event) => event.preventDefault()}>
      <FormSection icon={<Home size={18} />} title="Información principal" subtitle="Lo primero que verá un interesado.">
        <label className="full">
          Título de la propiedad
          <input
            value={property.title}
            placeholder="Ej. Departamento amueblado en zona norte"
            onChange={(event) => handleText(event, 'title')}
          />
        </label>
        <label>
          Tipo de propiedad
          <select value={property.propertyType} onChange={(event) => updateField('propertyType', event.target.value as PropertyType)}>
            {PROPERTY_TYPE_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label>
          Operación
          <select value={property.operationType} onChange={(event) => updateField('operationType', event.target.value as OperationType)}>
            {OPERATION_TYPE_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="full">
          Descripción
          <textarea
            value={property.description}
            placeholder="Estado del inmueble, beneficios, para quién es ideal, detalles prácticos..."
            onChange={(event) => handleText(event, 'description')}
          />
        </label>
      </FormSection>

      <FormSection icon={<Wallet size={18} />} title="Precio y condiciones" subtitle="Un precio claro filtra mejor a los interesados.">
        <label>
          Precio
          <input
            value={property.price || ''}
            inputMode="numeric"
            placeholder="12000"
            onChange={(event) => updateField('price', safeNumber(event.target.value))}
          />
        </label>
        <label>
          Moneda
          <select value={property.currency} onChange={(event) => updateField('currency', event.target.value as 'MXN' | 'USD')}>
            <option value="MXN">MXN</option>
            <option value="USD">USD</option>
          </select>
        </label>
        <label>
          Periodicidad
          <select value={property.pricePeriod} onChange={(event) => updateField('pricePeriod', event.target.value as PricePeriod)}>
            {PRICE_PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label>
          Disponible desde
          <input value={property.availableFrom} placeholder="Inmediata, 1 de agosto..." onChange={(event) => handleText(event, 'availableFrom')} />
        </label>
        <label>
          Depósito
          <input value={property.depositText} placeholder="Ej. 1 mes de depósito" onChange={(event) => handleText(event, 'depositText')} />
        </label>
        <label>
          Contrato mínimo
          <input value={property.minimumContractText} placeholder="Ej. Contrato mínimo de 12 meses" onChange={(event) => handleText(event, 'minimumContractText')} />
        </label>
        <div className="toggle-row full">
          <label className="toggle-label">
            <input type="checkbox" checked={property.maintenanceIncluded} onChange={(event) => updateField('maintenanceIncluded', event.target.checked)} />
            Mantenimiento incluido
          </label>
        </div>
        <label className="full">
          Servicios incluidos, uno por línea
          <textarea
            value={textFromList(property.servicesIncluded)}
            placeholder={'Agua\nInternet\nGas'}
            onChange={(event) => updateField('servicesIncluded', listFromText(event.target.value))}
          />
        </label>
      </FormSection>

      <FormSection icon={<MapPin size={18} />} title="Ubicación" subtitle="Tú decides cuánto detalle mostrar públicamente.">
        <label>
          Ciudad
          <input value={property.location.city} placeholder="León" onChange={(event) => updateLocation('city', event.target.value)} />
        </label>
        <label>
          Estado
          <input value={property.location.state} placeholder="Guanajuato" onChange={(event) => updateLocation('state', event.target.value)} />
        </label>
        <label>
          Colonia / zona
          <input value={property.location.neighborhood} placeholder="Zona norte" onChange={(event) => updateLocation('neighborhood', event.target.value)} />
        </label>
        <label>
          Domicilio exacto
          <input value={property.location.address} placeholder="Calle, número, colonia" onChange={(event) => updateLocation('address', event.target.value)} />
        </label>
        <div className="toggle-row full">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={property.location.showExactAddress}
              onChange={(event) => updateLocation('showExactAddress', event.target.checked)}
            />
            Mostrar domicilio exacto públicamente
          </label>
        </div>
        <label className="full">
          Referencias de ubicación
          <textarea
            value={property.location.references}
            placeholder="Ej. A dos cuadras del blvd. Campestre, frente al parque..."
            onChange={(event) => updateLocation('references', event.target.value)}
          />
        </label>
        <div className="full">
          <NearbyPlacesEditor
            places={property.location.nearbyPlaces}
            onChange={(nearbyPlaces) => updateLocation('nearbyPlaces', nearbyPlaces)}
          />
        </div>
      </FormSection>

      <FormSection icon={<ListChecks size={18} />} title="Características" subtitle="Los datos duros del inmueble.">
        <label>
          Recámaras
          <input value={property.bedrooms || ''} inputMode="numeric" placeholder="2" onChange={(event) => updateField('bedrooms', safeNumber(event.target.value))} />
        </label>
        <label>
          Baños
          <input value={property.bathrooms || ''} inputMode="numeric" placeholder="1" onChange={(event) => updateField('bathrooms', safeNumber(event.target.value))} />
        </label>
        <label>
          Estacionamientos
          <input value={property.parkingSpaces || ''} inputMode="numeric" placeholder="1" onChange={(event) => updateField('parkingSpaces', safeNumber(event.target.value))} />
        </label>
        <label>
          Metros cuadrados
          <input
            value={property.areaM2 ?? ''}
            inputMode="numeric"
            placeholder="78"
            onChange={(event) => updateField('areaM2', event.target.value ? safeNumber(event.target.value) : undefined)}
          />
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
        </div>
        <label className="full">
          Amenidades, una por línea
          <textarea
            value={textFromList(property.amenities)}
            placeholder={'Cocina equipada\nClóset\nZona tranquila'}
            onChange={(event) => updateField('amenities', listFromText(event.target.value))}
          />
        </label>
        <label className="full">
          Requisitos, uno por línea
          <textarea
            value={textFromList(property.requirements)}
            placeholder={'Identificación oficial\nComprobante de ingresos\nUn mes de depósito'}
            onChange={(event) => updateField('requirements', listFromText(event.target.value))}
          />
        </label>
      </FormSection>

      <FormSection icon={<ImageIcon size={18} />} title="Fotos" subtitle="La primera foto o la marcada como portada abre la landing.">
        <div className="full">
          <PhotoManager photos={property.photos} onChange={(photos) => updateField('photos', photos)} />
        </div>
        <div className="full">
          <SmartTourTeaser />
        </div>
      </FormSection>

      <FormSection icon={<Contact2 size={18} />} title="Contacto" subtitle="A dónde llegan los interesados.">
        <label>
          Nombre de contacto
          <input value={property.contact.name} placeholder="Tu nombre o el de tu inmobiliaria" onChange={(event) => updateContact('name', event.target.value)} />
        </label>
        <label>
          WhatsApp (con lada, ej. 5247...)
          <input value={property.contact.whatsapp} inputMode="tel" placeholder="524771234567" onChange={(event) => updateContact('whatsapp', event.target.value)} />
        </label>
      </FormSection>
    </form>
  );
}

function FormSection({ icon, title, subtitle, children }: { icon: ReactNode; title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="form-group" aria-label={title}>
      <header className="form-group-header">
        <span className="form-group-icon">{icon}</span>
        <span>
          <strong>{title}</strong>
          <small>{subtitle}</small>
        </span>
      </header>
      <div className="form-group-fields">{children}</div>
    </section>
  );
}
