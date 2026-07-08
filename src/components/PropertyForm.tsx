import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Contact2, Home, ImageIcon, ListChecks, MapPin, Wallet } from 'lucide-react';
import type {
  BathroomType,
  ContractUnit,
  OperationType,
  ParkingType,
  ParkingVehicleSize,
  PricePeriod,
  Property,
  PropertyLocation,
  PropertyType,
  RoomType
} from '../types/property';
import {
  BATHROOM_TYPE_LABELS,
  CONTRACT_UNIT_LABELS,
  OPERATION_TYPE_LABELS,
  PARKING_TYPE_LABELS,
  PARKING_VEHICLE_SIZE_LABELS,
  PROPERTY_TYPE_LABELS,
  ROOM_TYPE_LABELS
} from '../types/property';
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
const CONTRACT_UNITS = Object.entries(CONTRACT_UNIT_LABELS) as [ContractUnit, string][];
const PARKING_OPTIONS = Object.entries(PARKING_TYPE_LABELS) as [ParkingType, string][];
const PARKING_SIZE_OPTIONS = Object.entries(PARKING_VEHICLE_SIZE_LABELS) as [ParkingVehicleSize, string][];
const BATHROOM_OPTIONS = Object.entries(BATHROOM_TYPE_LABELS) as [BathroomType, string][];
const ROOM_OPTIONS = Object.entries(ROOM_TYPE_LABELS) as [RoomType, string][];

const STATE_CITY_OPTIONS: Record<string, string[]> = {
  'Guanajuato': ['León', 'Irapuato', 'Celaya', 'Salamanca', 'Guanajuato', 'Silao'],
  'Querétaro': ['Santiago de Querétaro', 'El Marqués', 'Corregidora', 'San Juan del Río'],
  'Jalisco': ['Guadalajara', 'Zapopan', 'Tlaquepaque', 'Tonalá', 'Puerto Vallarta'],
  'Ciudad de México': ['Benito Juárez', 'Cuauhtémoc', 'Miguel Hidalgo', 'Coyoacán', 'Álvaro Obregón'],
  'Nuevo León': ['Monterrey', 'San Pedro Garza García', 'San Nicolás de los Garza', 'Guadalupe']
};

export function PropertyForm({ property, onChange, footer }: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const featureTags = property.featureTags ?? [];
  const servicesIncluded = property.servicesIncluded ?? [];
  const amenities = property.amenities ?? [];
  const requirements = property.requirements ?? [];
  const requiredDocuments = property.requiredDocuments ?? [];
  const parkingTypes = property.parkingTypes ?? [];
  const bathroomTypes = property.bathroomTypes ?? [];
  const roomTypes = property.roomTypes ?? [];
  const cityOptions = STATE_CITY_OPTIONS[property.location.state] ?? [];

  function updateField<K extends keyof Property>(key: K, value: Property[K]) {
    onChange({ ...property, [key]: value });
  }

  function updateLocation<K extends keyof PropertyLocation>(key: K, value: PropertyLocation[K]) {
    onChange({ ...property, location: { ...property.location, [key]: value } });
  }

  function updateState(value: string) {
    const cities = STATE_CITY_OPTIONS[value] ?? [];
    onChange({
      ...property,
      location: {
        ...property.location,
        state: value,
        city: cities.includes(property.location.city) ? property.location.city : ''
      }
    });
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

  function updateDeposit(months: number) {
    updateField('depositMonths', months || undefined);
    updateField('depositText', months ? `${months} ${months === 1 ? 'mes' : 'meses'} de depósito` : '');
  }

  function updateContract(quantity: number, unit: ContractUnit = property.minimumContractUnit ?? 'mes') {
    const label = CONTRACT_UNIT_LABELS[unit];
    updateField('minimumContractQuantity', quantity || undefined);
    updateField('minimumContractUnit', unit);
    updateField('minimumContractText', quantity ? `Contrato mínimo de ${quantity} ${label}${quantity === 1 ? '' : 's'}` : '');
  }

  function handleText(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, key: keyof Property) {
    updateField(key, event.target.value as never);
  }

  function scrollToPublishSection() {
    document.getElementById('publish-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Marca visual de campo completo: palomita verde dentro del input.
  const ok = (valid: boolean) => (valid ? 'is-valid' : '');

  const steps = useMemo(() => [
    {
      id: 'principal',
      icon: <Home size={18} />,
      title: 'Información principal',
      subtitle: 'Lo primero que verá un interesado.',
      isComplete: property.title.trim().length >= 5 && property.description.trim().length >= 30,
      recommendations: [
        property.title.trim().length < 5 && 'Escribe un título claro con tipo de propiedad y zona.',
        property.description.trim().length < 30 && 'Agrega una descripción corta: estado del inmueble, beneficios y para quién es ideal.'
      ].filter(Boolean) as string[],
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
      isComplete: property.price > 0 && property.depositText.trim().length > 0 && property.minimumContractText.trim().length > 0 && property.availableFrom.trim().length > 0,
      recommendations: [
        !(property.price > 0) && 'Indica un precio claro para evitar preguntas repetidas.',
        !property.availableFrom.trim() && 'Selecciona la fecha de disponibilidad.',
        !property.depositText.trim() && 'Elige cuántos meses de depósito se solicitan.',
        !property.minimumContractText.trim() && 'Define el contrato mínimo con cantidad y unidad.'
      ].filter(Boolean) as string[],
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
            Fecha de disponibilidad
            <input type="date" value={property.availableFrom} onChange={(event) => updateField('availableFrom', event.target.value)} />
          </label>
          <label className={ok(property.depositText.trim().length > 0)}>
            Depósito
            <select value={property.depositMonths ?? ''} onChange={(event) => updateDeposit(safeNumber(event.target.value))}>
              <option value="">Selecciona depósito</option>
              {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                <option key={month} value={month}>{month} {month === 1 ? 'mes' : 'meses'}</option>
              ))}
            </select>
          </label>
          <div className="contract-field full">
            <label className={ok(Boolean(property.minimumContractQuantity))}>
              Contrato mínimo
              <input
                value={property.minimumContractQuantity ?? ''}
                inputMode="numeric"
                placeholder="Ej. 1"
                onChange={(event) => updateContract(safeNumber(event.target.value), property.minimumContractUnit ?? 'mes')}
              />
            </label>
            <label>
              Unidad
              <select value={property.minimumContractUnit ?? 'mes'} onChange={(event) => updateContract(property.minimumContractQuantity ?? 1, event.target.value as ContractUnit)}>
                {CONTRACT_UNITS.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
          </div>
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
      isComplete: property.location.state.trim().length > 0 && property.location.city.trim().length > 0 && property.location.neighborhood.trim().length > 0,
      recommendations: [
        !property.location.state.trim() && 'Selecciona o escribe el estado.',
        !property.location.city.trim() && 'Selecciona o escribe la ciudad.',
        !property.location.neighborhood.trim() && 'Agrega la colonia o zona.',
        !property.location.googleMapsUrl?.trim() && 'Pega un link de Google Maps para ayudar a ubicar mejor la propiedad.'
      ].filter(Boolean) as string[],
      content: (
        <>
          <label className={ok(property.location.state.trim().length > 0)}>
            Estado
            <input list="state-options" value={property.location.state} placeholder="Guanajuato" onChange={(event) => updateState(event.target.value)} />
            <datalist id="state-options">
              {Object.keys(STATE_CITY_OPTIONS).map((state) => <option key={state} value={state} />)}
            </datalist>
          </label>
          <label className={ok(property.location.city.trim().length > 0)}>
            Ciudad
            {cityOptions.length > 0 ? (
              <select value={property.location.city} onChange={(event) => updateLocation('city', event.target.value)}>
                <option value="">Selecciona ciudad</option>
                {cityOptions.map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
            ) : (
              <input value={property.location.city} placeholder="León" onChange={(event) => updateLocation('city', event.target.value)} />
            )}
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
            <small className="field-help">Puedes copiar el link desde Google Maps. Si el link trae coordenadas, las guardamos automáticamente.</small>
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
            Tu propiedad mostrará el domicilio cargado si activas esta opción. Si no, se mostrará solo la zona para cuidar la privacidad.
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
      isComplete: Boolean(property.areaM2 || property.bedrooms > 0 || property.bathrooms > 0 || featureTags.length > 0 || amenities.length > 0),
      recommendations: [
        !property.areaM2 && 'Agrega metros cuadrados si los conoces.',
        !featureTags.length && 'Agrega etiquetas dinámicas como amueblado, acepta mascotas, roof garden o vigilancia.',
        !amenities.length && 'Agrega al menos una amenidad o beneficio.'
      ].filter(Boolean) as string[],
      content: (
        <>
          <label className={ok(property.bedrooms > 0)}>
            Recámaras
            <input value={property.bedrooms || ''} inputMode="numeric" placeholder="2" onChange={(event) => updateField('bedrooms', safeNumber(event.target.value))} />
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
          <CheckboxGroup
            label="Tipo de recámara"
            options={ROOM_OPTIONS}
            values={roomTypes}
            onChange={(next) => updateField('roomTypes', next)}
          />
          <div className="contract-field full">
            <label>
              Personas por recámara
              <input value={property.peoplePerRoom ?? ''} inputMode="numeric" placeholder="1" onChange={(event) => updateField('peoplePerRoom', event.target.value ? safeNumber(event.target.value) : undefined)} />
            </label>
            <label>
              Cuartos compartidos
              <input value={property.sharedRooms ?? ''} inputMode="numeric" placeholder="0" onChange={(event) => updateField('sharedRooms', event.target.value ? safeNumber(event.target.value) : undefined)} />
            </label>
          </div>
          <div className="toggle-row full">
            <label className="toggle-label">
              <input type="checkbox" checked={Boolean(property.isSharedProperty)} onChange={(event) => updateField('isSharedProperty', event.target.checked)} />
              ¿La propiedad es compartida?
            </label>
          </div>
          {property.isSharedProperty && (
            <label>
              ¿Con cuántas personas se comparte?
              <input value={property.sharedPeopleCount ?? ''} inputMode="numeric" placeholder="2" onChange={(event) => updateField('sharedPeopleCount', event.target.value ? safeNumber(event.target.value) : undefined)} />
            </label>
          )}
          <CheckboxGroup
            label="Baños"
            options={BATHROOM_OPTIONS}
            values={bathroomTypes}
            onChange={(next) => updateField('bathroomTypes', next)}
          />
          <label className={ok(property.bathrooms > 0)}>
            Número de baños
            <input value={property.bathrooms || ''} inputMode="numeric" placeholder="1" onChange={(event) => updateField('bathrooms', safeNumber(event.target.value))} />
          </label>
          <CheckboxGroup
            label="Estacionamiento"
            options={PARKING_OPTIONS}
            values={parkingTypes}
            onChange={(next) => updateField('parkingTypes', next)}
          />
          <label className={ok(property.parkingSpaces > 0)}>
            Lugares de estacionamiento
            <input value={property.parkingSpaces || ''} inputMode="numeric" placeholder="1" onChange={(event) => updateField('parkingSpaces', safeNumber(event.target.value))} />
          </label>
          <div className="full vehicle-size-picker">
            <p className="field-title">Tamaño aproximado del estacionamiento</p>
            <div className="vehicle-size-grid">
              {PARKING_SIZE_OPTIONS.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`vehicle-size-card ${property.parkingVehicleSize === value ? 'is-selected' : ''}`}
                  onClick={() => updateField('parkingVehicleSize', value)}
                >
                  <span aria-hidden="true">{vehicleIcon(value)}</span>
                  <strong>{label}</strong>
                </button>
              ))}
            </div>
          </div>
          <TagTextarea
            label="Características adicionales"
            value={featureTags}
            placeholder="Amueblado, acepta mascotas, vigilancia 24/7, roof garden, elevador"
            help="Agrega aquí etiquetas dinámicas. Úsalas para amenidades o reglas que no estén en los botones anteriores."
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
      subtitle: 'La primera foto o la marcada como portada abre la publicación.',
      isComplete: property.photos.length > 0,
      recommendations: [
        property.photos.length === 0 && 'Agrega fotos reales de sala, cocina, recámaras, baño y fachada.',
        property.photos.length > 0 && property.photos.length < 4 && 'Agrega más fotos para que la propiedad se entienda mejor.'
      ].filter(Boolean) as string[],
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
      recommendations: [
        !property.contact.name.trim() && 'Agrega el nombre de contacto.',
        !hasValidWhatsapp(property.contact.whatsapp) && 'Agrega un WhatsApp válido con lada.'
      ].filter(Boolean) as string[],
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
  ], [property, featureTags, servicesIncluded, amenities, requirements, requiredDocuments, parkingTypes, bathroomTypes, roomTypes, cityOptions]);

  const currentStep = steps[activeStep];
  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === steps.length - 1;
  const isFormComplete = steps.every((step) => step.isComplete);

  function canGoToStep(index: number) {
    if (index <= activeStep) return true;
    return steps.slice(0, index).every((step) => step.isComplete);
  }

  return (
    <form className="property-form" onSubmit={(event) => event.preventDefault()}>
      <div className="form-wizard">
        <div className="form-wizard-steps" aria-label="Secciones del formulario">
          {steps.map((step, index) => (
            <button
              key={step.id}
              type="button"
              className={`wizard-step ${index === activeStep ? 'is-active' : ''} ${step.isComplete ? 'is-complete' : 'is-missing'}`}
              onClick={() => canGoToStep(index) && setActiveStep(index)}
              disabled={!canGoToStep(index)}
            >
              <span className="wizard-step-index">{step.isComplete ? <CheckCircle2 size={15} /> : index + 1}</span>
              <span>{step.title}</span>
            </button>
          ))}
        </div>

        <StepRecommendations recommendations={currentStep.recommendations} isComplete={currentStep.isComplete} />

        <div className="form-step-toolbar">
          <span className="step-counter">Paso {activeStep + 1} de {steps.length}</span>
          <div className="form-step-actions">
            <button type="button" className="secondary-button" onClick={() => setActiveStep((step) => Math.max(0, step - 1))} disabled={isFirstStep}>
              <ChevronLeft size={17} /> Anterior
            </button>
            {isLastStep ? (
              <button type="button" className="primary-button" onClick={scrollToPublishSection} disabled={!isFormComplete}>
                Revisar y publicar <ChevronRight size={17} />
              </button>
            ) : (
              <button type="button" className="primary-button" onClick={() => setActiveStep((step) => Math.min(steps.length - 1, step + 1))} disabled={!currentStep.isComplete}>
                Siguiente <ChevronRight size={17} />
              </button>
            )}
          </div>
        </div>

        <div className="form-step-transition" key={currentStep.id}>
          <FormSection icon={currentStep.icon} title={currentStep.title} subtitle={currentStep.subtitle}>
            {currentStep.content}
          </FormSection>
        </div>

        {footer && isFormComplete && <div id="publish-section" className="form-wizard-footer">{footer}</div>}
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

function vehicleIcon(value: ParkingVehicleSize): string {
  const icons: Record<ParkingVehicleSize, string> = {
    compact: '🚗',
    sedan: '🚘',
    suv: '🚙',
    pickup: '🛻',
    van: '🚐'
  };
  return icons[value];
}

function CheckboxGroup<T extends string>({
  label,
  options,
  values,
  onChange
}: {
  label: string;
  options: [T, string][];
  values: T[];
  onChange: (values: T[]) => void;
}) {
  return (
    <fieldset className="checkbox-card-group full">
      <legend>{label}</legend>
      <div>
        {options.map(([value, optionLabel]) => (
          <label key={value} className="toggle-label">
            <input type="checkbox" checked={values.includes(value)} onChange={() => onChange(values.includes(value) ? values.filter((item) => item !== value) : [...values, value])} />
            {optionLabel}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function StepRecommendations({ recommendations, isComplete }: { recommendations: string[]; isComplete: boolean }) {
  if (isComplete) {
    return (
      <div className="step-recommendations is-complete">
        <CheckCircle2 size={18} />
        <span>Esta sección está completa. Puedes avanzar al siguiente paso.</span>
      </div>
    );
  }

  if (!recommendations.length) return null;

  return (
    <div className="step-recommendations">
      <strong>Mejoras recomendadas para esta sección</strong>
      <ul>
        {recommendations.map((recommendation) => <li key={recommendation}>{recommendation}</li>)}
      </ul>
    </div>
  );
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
