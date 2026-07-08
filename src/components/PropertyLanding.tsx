import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Bath,
  BedDouble,
  Bus,
  CalendarDays,
  Camera,
  Car,
  CheckCircle2,
  ExternalLink,
  FileText,
  GraduationCap,
  Hospital,
  MapPin,
  MessageCircle,
  PawPrint,
  Ruler,
  ShoppingCart,
  Sofa,
  Store,
  Trees,
  UtensilsCrossed
} from 'lucide-react';
import type { NearbyPlaceType, Property } from '../types/property';
import { NEARBY_PLACE_TYPE_LABELS, OPERATION_TYPE_LABELS, PROPERTY_TYPE_LABELS } from '../types/property';
import { buildWhatsappUrl, formatLocationShort, formatPrice, formatPricePeriod, hasValidWhatsapp } from '../lib/format';
import { sortPhotos } from '../lib/photos';

interface Props {
  property: Property;
  variant?: 'preview' | 'public';
  sectionId?: string;
}

const NEARBY_ICONS: Record<NearbyPlaceType, typeof Store> = {
  supermercado: ShoppingCart,
  escuela: GraduationCap,
  hospital: Hospital,
  parque: Trees,
  transporte: Bus,
  restaurante: UtensilsCrossed,
  tienda: Store,
  otro: MapPin
};

export function PropertyLanding({ property, variant = 'public', sectionId }: Props) {
  const isPreview = variant === 'preview';
  const photos = sortPhotos(property.photos);
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);

  useEffect(() => {
    setActivePhotoId(null);
  }, [property.id]);

  const activePhoto = photos.find((photo) => photo.id === activePhotoId) ?? photos[0];
  const secondaryPhotos = photos.filter((photo) => photo.id !== activePhoto?.id);
  const visibleSecondaryPhotos = secondaryPhotos.slice(0, 2);
  const showPhotoReel = photos.length > 3;
  const whatsappReady = hasValidWhatsapp(property.contact.whatsapp);
  const whatsappUrl = buildWhatsappUrl(property);
  const locationShort = formatLocationShort(property);
  const showAddress = property.location.showExactAddress && property.location.address.trim();
  const hasLocationDetails = locationShort || showAddress || property.location.references || property.location.nearbyPlaces.length > 0 || isPreview;
  const featureTags = property.featureTags ?? [];
  const amenities = property.amenities ?? [];
  const servicesIncluded = property.servicesIncluded ?? [];
  const requirements = property.requirements ?? [];
  const requiredDocuments = property.requiredDocuments ?? [];
  const expirationLabel = formatExpirationDate(property.expiresAt);

  const features = [
    property.bedrooms > 0 && { icon: <BedDouble size={18} />, label: `${property.bedrooms} recámara${property.bedrooms === 1 ? '' : 's'}` },
    property.bathrooms > 0 && { icon: <Bath size={18} />, label: `${property.bathrooms} baño${property.bathrooms === 1 ? '' : 's'}` },
    property.parkingSpaces > 0 && { icon: <Car size={18} />, label: `${property.parkingSpaces} estacionamiento${property.parkingSpaces === 1 ? '' : 's'}` },
    Boolean(property.areaM2) && { icon: <Ruler size={18} />, label: `${property.areaM2} m²` },
    property.furnished && { icon: <Sofa size={18} />, label: 'Amueblado' },
    property.petsAllowed && { icon: <PawPrint size={18} />, label: 'Acepta mascotas' },
    Boolean(property.availableFrom.trim()) && { icon: <CalendarDays size={18} />, label: `Disponible: ${property.availableFrom}` },
    ...featureTags.map((tag) => ({ icon: <CheckCircle2 size={18} />, label: tag }))
  ].filter(Boolean) as { icon: ReactNode; label: string }[];

  const conditions = [
    property.maintenanceIncluded && 'Mantenimiento incluido',
    property.depositText.trim(),
    property.minimumContractText.trim()
  ].filter(Boolean) as string[];

  return (
    <article className={`property-card ${isPreview ? 'is-preview' : ''}`} id={sectionId}>
      {(photos.length > 0 || isPreview) && (
        <>
          <section className={`hero-grid ${photos.length ? '' : 'empty-gallery'} ${visibleSecondaryPhotos.length ? '' : 'single-photo'} ${showPhotoReel ? 'has-reel' : ''}`}>
            {activePhoto ? (
              <figure className="hero-figure" key={activePhoto.id}>
                <img src={activePhoto.url} alt={activePhoto.alt || activePhoto.title || `Foto principal de ${property.title}`} className="hero-image" />
                {activePhoto.title && <figcaption className="photo-overlay main-photo-label">{activePhoto.title}</figcaption>}
              </figure>
            ) : (
              <div className="image-placeholder hero-image">
                <Camera size={34} />
                <strong>Aquí van tus fotos</strong>
                <span>Sube fotos en el editor y esta galería se arma sola.</span>
              </div>
            )}
            {visibleSecondaryPhotos.length > 0 && (
              <div className="gallery-column">
                {visibleSecondaryPhotos.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    className="gallery-thumb"
                    onClick={() => setActivePhotoId(photo.id)}
                    aria-label={`Ver foto: ${photo.title || 'de la propiedad'}`}
                  >
                    <img src={photo.url} alt={photo.alt || photo.title || `Foto de ${property.title}`} loading="lazy" />
                    {photo.title && <span className="photo-overlay">{photo.title}</span>}
                  </button>
                ))}
              </div>
            )}
          </section>

          {showPhotoReel && (
            <div className="photo-reel" aria-label="Más fotos de la propiedad">
              {photos.map((photo, index) => (
                <button
                  key={photo.id}
                  type="button"
                  className={`photo-reel-item ${photo.id === activePhoto?.id ? 'is-active' : ''}`}
                  onClick={() => setActivePhotoId(photo.id)}
                  aria-label={`Ver foto ${index + 1}: ${photo.title || 'de la propiedad'}`}
                >
                  <img src={photo.url} alt="" loading="lazy" />
                  <span>{photo.title || `Foto ${index + 1}`}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {photos.length > 1 && (
        <div className="mobile-carousel" aria-label="Galería de fotos">
          {photos.map((photo) => (
            <figure key={photo.id}>
              <img src={photo.url} alt={photo.alt || photo.title || `Foto de ${property.title}`} loading="lazy" />
              {photo.title && <figcaption>{photo.title}</figcaption>}
            </figure>
          ))}
        </div>
      )}

      <section className="property-content">
        <div className="property-main">
          <div className="property-title-card">
            <p className="eyebrow">
              {PROPERTY_TYPE_LABELS[property.propertyType]} · {OPERATION_TYPE_LABELS[property.operationType]}
            </p>
            <h1>{property.title || (isPreview ? 'Título de tu propiedad' : 'Propiedad')}</h1>
            {(locationShort || isPreview) && (
              <p className="location">
                <MapPin size={18} /> {locationShort || 'Colonia, ciudad y estado'}
              </p>
            )}
            {(property.description || isPreview) && (
              <p className="description">
                {property.description || 'La descripción de tu propiedad aparecerá aquí: estado del inmueble, beneficios y para quién es ideal.'}
              </p>
            )}
          </div>

          {features.length > 0 && (
            <section className="landing-block landing-block-compact">
              <h2>Características principales</h2>
              <div className="feature-grid">
                {features.map((feature, index) => (
                  <Feature key={`${feature.label}-${index}`} icon={feature.icon} label={feature.label} />
                ))}
              </div>
            </section>
          )}

          {hasLocationDetails && (
            <section className="landing-block">
              <h2>Ubicación y alrededores</h2>
              <div className="location-card">
                {(locationShort || isPreview) && (
                  <p className="location-line"><MapPin size={18} /> {locationShort || 'Zona de la propiedad'}</p>
                )}
                {showAddress ? (
                  <p className="location-address">{property.location.address}</p>
                ) : (
                  (locationShort || isPreview) && <p className="location-note">Zona aproximada. El domicilio exacto se comparte con interesados.</p>
                )}
                {(property.location.references || isPreview) && (
                  <p className="location-references">{property.location.references || 'Referencias útiles para entender la zona aparecerán aquí.'}</p>
                )}
              </div>
              <PropertyMap property={property} isPreview={isPreview} />
              {property.location.nearbyPlaces.length > 0 && (
                <div className="nearby-grid">
                  {property.location.nearbyPlaces.map((place) => {
                    const Icon = NEARBY_ICONS[place.type];
                    return (
                      <div className="nearby-card" key={place.id}>
                        <div className="nearby-icon"><Icon size={18} /></div>
                        <div>
                          <strong>{place.name}</strong>
                          <span>
                            {NEARBY_PLACE_TYPE_LABELS[place.type]}
                            {place.distanceText ? ` · ${place.distanceText}` : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>

        <aside className="property-side" aria-label="Contacto y detalles de renta">
          <div className="contact-card">
            <span>{formatPricePeriod(property)}</span>
            <strong>{property.price > 0 ? formatPrice(property) : isPreview ? '$ —' : 'Precio a tratar'}</strong>
            {conditions.length > 0 && (
              <ul className="contact-terms">
                {conditions.map((item) => <li key={item}>{item}</li>)}
              </ul>
            )}
            {whatsappReady ? (
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="primary-button whatsapp-button">
                <MessageCircle size={18} /> Contactar por WhatsApp
              </a>
            ) : (
              isPreview && <p className="contact-missing">Agrega un WhatsApp de contacto para activar el botón.</p>
            )}
            {property.contact.name && <p className="contact-name">Te atiende: {property.contact.name}</p>}
            <small>Información proporcionada por el anunciante. Verifica la propiedad antes de realizar cualquier pago.</small>
            <small className="expiry-note">
              Esta publicación se elimina automáticamente después de 30 días{expirationLabel ? ` (vence el ${expirationLabel})` : ''}.
            </small>
          </div>

          <div className="side-details-grid">
            <SideDetailGroup
              title={`Condiciones de ${property.operationType === 'venta' ? 'venta' : 'renta'}`}
              items={conditions}
              icon={<CheckCircle2 size={16} />}
              variant="check"
            />
            <SideDetailGroup title="Amenidades" items={amenities} variant="pills" />
            <SideDetailGroup title="Servicios incluidos" items={servicesIncluded} variant="pills" />
            <SideDetailGroup title="Documentos requeridos" items={requiredDocuments} icon={<FileText size={16} />} variant="check" />
            <SideDetailGroup title="Requisitos" items={requirements} icon={<CheckCircle2 size={16} />} variant="check" />
          </div>
        </aside>
      </section>

      {!isPreview && whatsappReady && (
        <div className="whatsapp-sticky">
          <div>
            <strong>{property.price > 0 ? formatPrice(property) : 'Precio a tratar'}</strong>
            <span>{formatPricePeriod(property)}</span>
          </div>
          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="primary-button whatsapp-button">
            <MessageCircle size={18} /> WhatsApp
          </a>
        </div>
      )}
    </article>
  );
}

function SideDetailGroup({
  title,
  items,
  icon,
  variant
}: {
  title: string;
  items: string[];
  icon?: ReactNode;
  variant: 'check' | 'pills';
}) {
  if (!items.length) return null;

  return (
    <section className="side-detail-card">
      <h2>{title}</h2>
      <ul className={variant === 'pills' ? 'side-pill-list' : 'side-check-list'}>
        {items.map((item) => (
          <li key={item}>
            {variant === 'check' && (icon ?? <CheckCircle2 size={16} />)}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PropertyMap({ property, isPreview }: { property: Property; isPreview: boolean }) {
  const hasCoordinates = typeof property.location.lat === 'number' && typeof property.location.lng === 'number';
  const canShowExactMap = hasCoordinates && property.location.showExactAddress;
  const googleMapsUrl = property.location.googleMapsUrl?.trim() ?? '';
  const addressLabel = property.location.address.trim();
  const locationLabel = formatLocationShort(property) || addressLabel || 'Ubicación de la propiedad';
  const publicLocationText = property.location.showExactAddress && addressLabel ? addressLabel : locationLabel;

  const mapUrl = useMemo(() => {
    if (!canShowExactMap || typeof property.location.lat !== 'number' || typeof property.location.lng !== 'number') return '';

    const { lat, lng } = property.location;
    const delta = 0.01;
    const bbox = `${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
  }, [canShowExactMap, property.location.lat, property.location.lng]);

  if (canShowExactMap && mapUrl) {
    return (
      <div className="property-map">
        <iframe title={`Mapa de ${locationLabel}`} src={mapUrl} loading="lazy" />
        {googleMapsUrl && (
          <a className="map-link" href={googleMapsUrl} target="_blank" rel="noreferrer">
            <ExternalLink size={16} /> Abrir en Google Maps
          </a>
        )}
      </div>
    );
  }

  if (!hasCoordinates && !googleMapsUrl && !isPreview && !locationLabel.trim()) return null;

  return (
    <div className="property-map property-map-placeholder" aria-label="Mapa aproximado de la propiedad">
      <div className="map-grid-bg" aria-hidden="true" />
      <span className="map-pin"><MapPin size={22} /></span>
      <div className="map-copy">
        <strong>{property.location.showExactAddress && addressLabel ? 'Domicilio cargado' : 'Zona de la propiedad'}</strong>
        <span>{publicLocationText}</span>
        <small>{property.location.showExactAddress && addressLabel ? 'Este es el domicilio proporcionado por el anunciante.' : 'El domicilio exacto no está publicado.'}</small>
        {googleMapsUrl && (
          <a className="map-link" href={googleMapsUrl} target="_blank" rel="noreferrer">
            <ExternalLink size={16} /> Abrir ubicación en Google Maps
          </a>
        )}
      </div>
    </div>
  );
}

function formatExpirationDate(expiresAt?: string): string {
  if (!expiresAt) return '';
  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

function Feature({ icon, label }: { icon: ReactNode; label: string }) {
  return <div className="feature">{icon}<span>{label}</span></div>;
}
