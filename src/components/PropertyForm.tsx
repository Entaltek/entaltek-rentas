import { useEffect, useState, type ChangeEvent, type ReactNode } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Contact2, Home, ImageIcon, ListChecks, MapPin, Wallet } from 'lucide-react';
import type {
  OperationType,
  PricePeriod,
  Property,
  PropertyLocation,
  PropertyType
} from '../types/property';
import { OPERATION_TYPE_LABELS, PROPERTY_TYPE_LABELS } from '../types/property';
import { hasValidWhatsapp } from '../lib/format';
import { listFromText, safeNumber, textFromList } from '../lib/propertyDraft';
import { NearbyPlacesEditor } from './NearbyPlacesEditor';
import { PhotoManager } from './PhotoManager';
import { SmartTourTeaser } from './SmartTourTeaser';

interface Props {
  property: Property;
  onChange: (property: Property) => void;
  footer?: ReactNode;
}

const PROPERTY_TYPE_OPTIONS = Object.entries(PROPERTY_TYPE_LABELS) as [PropertyType, string][];
const OPERATION_TYPE_OPTIONS = Object.entries(OPERATION_TYPE_LABELS) as [OperationType, string][];
const PRICE_PERIOD_OPTIONS: { value: PricePeriod; label: string }[] = [
  { value: 'monthly', label: 'Mensual' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'daily', label: 'Diaria' }
];

export function PropertyForm({ property, onChange, footer }: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const featureTags = property.featureTags ?? [];
  const servicesIncluded = property.servicesIncluded ?? [];
  const amenities = property.amenities ?? [];
  const requirements = property.requirements ?? [];
  const requiredDocuments = property.requiredDocuments ?? [];

  function updateField<K extends keyof Property>(key: K, value: Property[K]) {
    onChange({ ...property, [key]: value });
  }

  function updateLocation<K extends keyof PropertyLocation>(key: K, value: PropertyLocation[K]) {
    onChange({ ...property, location: { ...property.location, [key]: value } });
  }

  function updateGoogleMapsUrl(value: string) {
    const coordinates = extractGoogleMapsCoordinates(value);
    onChange({
      ...property,
      location: {
        ...property.location,
        googleMapsUrl: value,
        ...(coordinates ? { lat: coordinates.lat, lng: coordinates.lng } : {})
      }
    });
  }

  function updateContact(key: 'name' | 'whatsapp', value: string) {
    onChange({ ...property, contact: { ...property.contact, [key]: value } });
  }

  function handleText(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, key: keyof Property) {
    updateField(key, event.target.value as never);
  }

  function scrollToPublishSection() {
    document.getElementById('publish-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Marca visual de campo completo: palomita verde dentro del input.
  const ok = (valid: boolean) => (valid ? 'is-valid' : '');

  const steps = [
    {
      id: 'principal',
      icon: <Home size={18} />,
      title: 'Información principal',
      subtitle: 'Lo primero que verá un interesado.',
      isComplete: property.title.trim().length >= 5 && property.description.trim().length >= 30,
      content: (
        <>
          <label className={`full ${ok(property.title.trim().length >= 5)}`}>
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
          <label className={`full ${ok(property.description.trim().length >= 30)}`}>
            Descripción
            <textarea
              value={property.description}
              placeholder="Estado del inmueble, beneficios, para quién es ideal, detalles prácticos..."
              onChange={(event) => handleText(event, 'description')}
            />
          </label>
        </>
      )
    },
    {
      id: 'precio',
      icon: <Wallet size={18} />,
      title: 'Precio y condiciones',
      subtitle: 'Un precio claro filtra mejor a los interesados.',
      isComplete: property.price > 0 && property.depositText.trim().length > 0 && property.minimumContractText.trim().length > 0,
      content: (
        <>
          <label className={ok(property.price > 0)}>
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
          <label className={ok(property.availableFrom.trim().length > 0)}>
            Disponible desde
            <input value={property.availableFrom} placeholder="Inmediata, 1 de agosto..." onChange={(event) => handleText(event, 'availableFrom')} />
          </label>
          <label className={ok(property.depositText.trim().length > 0)}>
            Depósito
            <input value={property.depositText} placeholder="Ej. 1 mes de depósito" onChange={(event) => handleText(event, 'depositText')} />
          </label>
          <label className={ok(property.minimumContractText.trim().length > 0)}>
            Contrato mínimo
            <input value={property.minimumContractText} placeholder="Ej. Contrato mínimo de 12 meses" onChange={(event) => handleText(event, 'minimumContractText')} />
          </label>
          <div className="toggle-row full">
            <label className="toggle-label">
              <input type="checkbox" checked={property.maintenanceIncluded} onChange={(event) => updateField('maintenanceIncluded', event.target.checked)} />
              Mantenimiento incluido
            </label>
          </div>
          <TagTextarea
            label="Servicios incluidos"
            value={servicesIncluded}
            placeholder="Agua, internet, mantenimiento"
            help="Separa por comas o saltos de línea. Cada elemento se convierte en una etiqueta."
            valid={servicesIncluded.length > 0}
            onChange={(items) => updateField('servicesIncluded', items)}
          />
        </>
      )
    },
    {
      id: 'ubicacion',
      icon: <MapPin size={18} />,
      title: 'Ubicación y mapa',
      subtitle: 'Pega tu ubicación de Google Maps y decide qué mostrar públicamente.',
      isComplete: property.location.city.trim().length > 0 && property.location.state.trim().length > 0 && property.location.neighborhood.trim().length > 0,
      content: (
        <>
          <label className={ok(property.location.city.trim().length > 0)}>
            Ciudad
            <input value={property.location.city} placeholder="León" onChange={(event) => updateLocation('city', event.target.value)} />
          </label>
          <label className={ok(property.location.state.trim().length > 0)}>
            Estado
            <input value={property.location.state} placeholder="Guanajuato" onChange={(event) => updateLocation('state', event.target.value)} />
          </label>
          <label className={ok(property.location.neighborhood.trim().length > 0)}>
            Colonia / zona
            <input value={property.location.neighborhood} placeholder="Zona norte" onChange={(event) => updateLocation('neighborhood', event.target.value)} />
          </label>
          <label className={ok(property.location.address.trim().length > 0)}>
            Domicilio exacto
            <input value={property.location.address} placeholder="Calle, número, colonia" onChange={(event) => updateLocation('address', event.target.value)} />
          </label>
          <label className={`full ${ok(Boolean(property.location.googleMapsUrl?.trim()))}`}>
            Link de Google Maps
            <input
              value={property.location.googleMapsUrl ?? ''}
              placeholder="Pega aquí la ubicación copiada desde Google Maps"
              onChange={(event) => updateGoogleMapsUrl(event.target.value)}
            />
            <small className="field-help">Puedes copiar el link desde Google Maps. Si el link trae coordenadas, las guardamos automáticamente sin mostrar campos técnicos.</small>
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
          <p className="form-note full">
            La landing mostrará el domicilio cargado si activas esta opción. Si no, se mostrará solo la zona para cuidar la privacidad.
          </p>
          <label className={`full ${ok(property.location.references.trim().length > 0)}`}>
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
        </>
      )
    },
    {
      id: 'caracteristicas',
      icon: <ListChecks size={18} />,
      title: 'Características y requisitos',
      subtitle: 'Datos duros, etiquetas, documentos y requisitos.',
      isComplete: property.bedrooms > 0 && property.bathrooms > 0 && amenities.length > 0 && requirements.length > 0 && requiredDocuments.length > 0,
      content: (
        <>
          <label className={ok(property.bedrooms > 0)}>
            Recámaras
            <input value={property.bedrooms || ''} inputMode="numeric" placeholder="2" onChange={(event) => updateField('bedrooms', safeNumber(event.target.value))} />
          </label>
          <label className={ok(property.bathrooms > 0)}>
            Baños
            <input value={property.bathrooms || ''} inputMode="numeric" placeholder="1" onChange={(event) => updateField('bathrooms', safeNumber(event.target.value))} />
          </label>
          <label className={ok(property.parkingSpaces > 0)}>
            Estacionamientos
            <input value={property.parkingSpaces || ''} inputMode="numeric" placeholder="1" onChange={(event) => updateField('parkingSpaces', safeNumber(event.target.value))} />
          </label>
          <label className={ok(Boolean(property.areaM2 && property.areaM2 > 0))}>
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
          <TagTextarea
            label="Características adicionales"
            value={featureTags}
            placeholder="Vigilancia 24/7, roof garden, elevador, vista panorámica"
            help="Úsalas para datos que no están en los botones anteriores."
            valid={featureTags.length > 0}
            onChange={(items) => updateField('featureTags', items)}
          />
          <TagTextarea
            label="Amenidades"
            value={amenities}
            placeholder="Cocina equipada, clóset, balcón, zona tranquila"
            help="Con una amenidad basta para completar el punto de calidad."
            valid={amenities.length > 0}
            onChange={(items) => updateField('amenities', items)}
          />
          <TagTextarea
            label="Documentos requeridos"
            value={requiredDocuments}
            placeholder="INE, comprobante de ingresos, referencias"
            help="Se valida por separado para que el interesado sepa qué preparar."
            valid={requiredDocuments.length > 0}
            onChange={(items) => updateField('requiredDocuments', items)}
          />
          <TagTextarea
            label="Requisitos de renta o venta"
            value={requirements}
            placeholder="Un mes de depósito, contrato mínimo de 12 meses, aval"
            help="Separa por comas. No necesitas llenar una lista larga."
            valid={requirements.length > 0}
            onChange={(items) => updateField('requirements', items)}
          />
        </>
      )
    },
    {
      id: 'fotos',
      icon: <ImageIcon size={18} />,
      title: 'Fotos',
      subtitle: 'La primera foto o la marcada como portada abre la landing.',
      isComplete: property.photos.length > 0,
      content: (
        <>
          <div className="full">
            <PhotoManager photos={property.photos} onChange={(photos) => updateField('photos', photos)} />
          </div>
          <div className="full">
            <SmartTourTeaser />
          </div>
        </>
      )
    },
    {
      id: 'contacto',
      icon: <Contact2 size={18} />,
      title: 'Contacto',
      subtitle: 'A dónde llegan los interesados.',
      isComplete: property.contact.name.trim().length > 0 && hasValidWhatsapp(property.contact.whatsapp),
      content: (
        <>
          <label className={ok(property.contact.name.trim().length > 0)}>
            Nombre de contacto
            <input value={property.contact.name} placeholder="Tu nombre o el de tu inmobiliaria" onChange={(event) => updateContact('name', event.target.value)} />
          </label>
          <label className={ok(hasValidWhatsapp(property.contact.whatsapp))}>
            WhatsApp (con lada, ej. 5247...)
            <input value={property.contact.whatsapp} inputMode="tel" placeholder="524771234567" onChange={(event) => updateContact('whatsapp', event.target.value)} />
          </label>
        </>
      )
    }
  ];

  const currentStep = steps[activeStep];
  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === steps.length - 1;

  return (
    <form className="property-form" onSubmit={(event) => event.preventDefault()}>
      <div className="form-wizard">
        <div className="form-wizard-steps" aria-label="Secciones del formulario">
          {steps.map((step, index) => (
            <button
              key={step.id}
              type="button"
              className={`wizard-step ${index === activeStep ? 'is-active' : ''} ${step.isComplete ? 'is-complete' : ''}`}
              onClick={() => setActiveStep(index)}
            >
              <span className="wizard-step-index">{step.isComplete ? <CheckCircle2 size={15} /> : index + 1}</span>
              <span>{step.title}</span>
            </button>
          ))}
        </div>

        <FormSection icon={currentStep.icon} title={currentStep.title} subtitle={currentStep.subtitle}>
          {currentStep.content}
        </FormSection>

        <div className="form-wizard-actions">
          <button type="button" className="secondary-button" onClick={() => setActiveStep((step) => Math.max(0, step - 1))} disabled={isFirstStep}>
            <ChevronLeft size={17} /> Anterior
          </button>
          <span>Paso {activeStep + 1} de {steps.length}</span>
          {isLastStep ? (
            <button type="button" className="primary-button" onClick={scrollToPublishSection}>
              Revisar y publicar <ChevronRight size={17} />
            </button>
          ) : (
            <button type="button" className="primary-button" onClick={() => setActiveStep((step) => Math.min(steps.length - 1, step + 1))}>
              Siguiente <ChevronRight size={17} />
            </button>
          )}
        </div>

        {footer && <div id="publish-section" className="form-wizard-footer">{footer}</div>}
      </div>
    </form>
  );
}

function extractGoogleMapsCoordinates(value: string): { lat: number; lng: number } | null {
  const atMatch = value.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (atMatch) return { lat: Number(atMatch[1]), lng: Number(atMatch[2]) };

  const bangMatch = value.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (bangMatch) return { lat: Number(bangMatch[1]), lng: Number(bangMatch[2]) };

  const queryMatch = value.match(/[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (queryMatch) return { lat: Number(queryMatch[1]), lng: Number(queryMatch[2]) };

  return null;
}

function TagTextarea({
  label,
  value,
  placeholder,
  help,
  valid,
  onChange
}: {
  label: string;
  value: string[];
  placeholder: string;
  help: string;
  valid: boolean;
  onChange: (items: string[]) => void;
}) {
  const [draft, setDraft] = useState(() => textFromList(value));

  useEffect(() => {
    const draftTags = listFromText(draft).join('|');
    const valueTags = value.join('|');

    if (draftTags !== valueTags) {
      setDraft(textFromList(value));
    }
  }, [draft, value]);

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const next = event.target.value;
    setDraft(next);
    onChange(listFromText(next));
  }

  return (
    <label className={`full ${valid ? 'is-valid' : ''}`}>
      {label}
      <textarea value={draft} placeholder={placeholder} onChange={handleChange} />
      <small className="field-help">{help}</small>
      {value.length > 0 && (
        <ul className="inline-tag-list" aria-label={`${label} agregados`}>
          {value.map((item) => <li key={item}>{item}</li>)}
        </ul>
      )}
    </label>
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
