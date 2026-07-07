import { useEffect, useState, type ReactNode } from 'react';
import {
  Bath,
  BedDouble,
  Bus,
  CalendarDays,
  Camera,
  Car,
  CheckCircle2,
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
  const whatsappReady = hasValidWhatsapp(property.contact.whatsapp);
  const whatsappUrl = buildWhatsappUrl(property);
  const locationShort = formatLocationShort(property);
  const showAddress = property.location.showExactAddress && property.location.address.trim();

  const features = [
    property.bedrooms > 0 && { icon: <BedDouble size={18} />, label: `${property.bedrooms} recámara${property.bedrooms === 1 ? '' : 's'}` },
    property.bathrooms > 0 && { icon: <Bath size={18} />, label: `${property.bathrooms} baño${property.bathrooms === 1 ? '' : 's'}` },
    property.parkingSpaces > 0 && { icon: <Car size={18} />, label: `${property.parkingSpaces} estacionamiento${property.parkingSpaces === 1 ? '' : 's'}` },
    Boolean(property.areaM2) && { icon: <Ruler size={18} />, label: `${property.areaM2} m²` },
    property.furnished && { icon: <Sofa size={18} />, label: 'Amueblado' },
    property.petsAllowed && { icon: <PawPrint size={18} />, label: 'Acepta mascotas' },
    Boolean(property.availableFrom.trim()) && { icon: <CalendarDays size={18} />, label: `Disponible: ${property.availableFrom}` }
  ].filter(Boolean) as { icon: ReactNode; label: string }[];

  const conditions = [
    property.maintenanceIncluded && 'Mantenimiento incluido',
    property.depositText.trim(),
    property.minimumContractText.trim()
  ].filter(Boolean) as string[];

  return (
    <article className={`property-card ${isPreview ? 'is-preview' : ''}`} id={sectionId}>
      {(photos.length > 0 || isPreview) && (
      <section className={`hero-grid ${photos.length ? '' : 'empty-gallery'} ${secondaryPhotos.length ? '' : 'single-photo'}`}>
        {activePhoto ? (
          <figure className="hero-figure" key={activePhoto.id}>
            <img src={activePhoto.url} alt={activePhoto.alt || activePhoto.title || `Foto principal de ${property.title}`} className="hero-image" />
            {activePhoto.title && <figcaption className="photo-overlay">{activePhoto.title}</figcaption>}
          </figure>
        ) : (
          <div className="image-placeholder hero-image">
            <Camera size={34} />
            <strong>Aquí van tus fotos</strong>
            <span>Sube fotos en el editor y esta galería se arma sola.</span>
          </div>
        )}
        {secondaryPhotos.length > 0 && (
          <div className="gallery-column">
            {secondaryPhotos.slice(0, 4).map((photo) => (
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
            <div className="feature-grid">
              {features.map((feature) => (
                <Feature key={feature.label} icon={feature.icon} label={feature.label} />
              ))}
            </div>
          )}

          {property.amenities.length > 0 && (
            <section className="landing-block">
              <h2>Amenidades</h2>
              <ul className="pill-list">
                {property.amenities.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </section>
          )}

          {property.servicesIncluded.length > 0 && (
            <section className="landing-block">
              <h2>Servicios incluidos</h2>
              <ul className="pill-list">
                {property.servicesIncluded.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </section>
          )}

          {conditions.length > 0 && (
            <section className="landing-block">
              <h2>Condiciones de {property.operationType === 'venta' ? 'venta' : 'renta'}</h2>
              <ul className="check-list">
                {conditions.map((item) => (
                  <li key={item}><CheckCircle2 size={18} /> {item}</li>
                ))}
              </ul>
            </section>
          )}

          {property.requirements.length > 0 && (
            <section className="landing-block">
              <h2>Requisitos</h2>
              <ul className="check-list">
                {property.requirements.map((item) => (
                  <li key={item}><CheckCircle2 size={18} /> {item}</li>
                ))}
              </ul>
            </section>
          )}

          {(locationShort || showAddress || property.location.references || property.location.nearbyPlaces.length > 0) && (
            <section className="landing-block">
              <h2>Ubicación y alrededores</h2>
              <div className="location-card">
                {locationShort && (
                  <p className="location-line"><MapPin size={18} /> {locationShort}</p>
                )}
                {showAddress ? (
                  <p className="location-address">{property.location.address}</p>
                ) : (
                  locationShort && <p className="location-note">Zona aproximada. El domicilio exacto se comparte con interesados.</p>
                )}
                {property.location.references && (
                  <p className="location-references">{property.location.references}</p>
                )}
              </div>
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

        <aside className="contact-card">
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

function Feature({ icon, label }: { icon: ReactNode; label: string }) {
  return <div className="feature">{icon}<span>{label}</span></div>;
}
