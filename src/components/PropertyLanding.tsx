import type { ReactNode } from 'react';
import { Bath, BedDouble, CalendarDays, Camera, Car, CheckCircle2, MapPin, MessageCircle, PawPrint, Ruler, Sofa } from 'lucide-react';
import type { Property } from '../types/property';
import { formatCurrency } from '../lib/format';

interface Props {
  property: Property;
  sectionId?: string;
}

export function PropertyLanding({ property, sectionId }: Props) {
  const whatsappUrl = `https://wa.me/${property.whatsapp}?text=${encodeURIComponent(`Hola, vi la propiedad: ${property.title}. ¿Sigue disponible?`)}`;
  const hasWhatsapp = property.whatsapp.length >= 10;
  const [coverImage, ...galleryImages] = property.images.filter(Boolean);

  return (
    <article className="property-card" id={sectionId}>
      <section className={`hero-grid ${coverImage ? '' : 'empty-gallery'}`}>
        {coverImage ? (
          <img src={coverImage} alt={`Foto principal: ${property.title}`} className="hero-image" />
        ) : (
          <div className="image-placeholder hero-image">
            <Camera size={34} />
            <strong>Fotos pendientes</strong>
            <span>Cuando se suban imágenes al backend, aparecerán aquí.</span>
          </div>
        )}
        <div className="gallery-column">
          {galleryImages.slice(0, 2).map((image, index) => (
            <img key={image} src={image} alt={`Foto ${index + 2} de ${property.title}`} loading="lazy" />
          ))}
          {!galleryImages.length && coverImage && (
            <div className="image-placeholder compact">
              <Camera size={24} />
              <span>Agrega más fotos para completar la galería.</span>
            </div>
          )}
        </div>
      </section>

      <section className="property-content">
        <div className="property-main">
          <div className="property-title-card">
            <p className="eyebrow">{property.type} en renta</p>
            <h1>{property.title}</h1>
            <p className="location"><MapPin size={18} /> {property.zone}, {property.city}</p>
            <p className="description">{property.description}</p>
          </div>

          <div className="feature-grid">
            <Feature icon={<BedDouble size={18} />} label={`${property.bedrooms} recámara${property.bedrooms === 1 ? '' : 's'}`} />
            <Feature icon={<Bath size={18} />} label={`${property.bathrooms} baño${property.bathrooms === 1 ? '' : 's'}`} />
            <Feature icon={<Ruler size={18} />} label={property.areaM2 ? `${property.areaM2} m²` : 'Área por confirmar'} />
            <Feature icon={<Car size={18} />} label={`${property.parkingSpots} estacionamiento${property.parkingSpots === 1 ? '' : 's'}`} />
            <Feature icon={<Sofa size={18} />} label={property.furnished ? 'Amueblado' : 'Sin amueblar'} />
            <Feature icon={<PawPrint size={18} />} label={property.petsAllowed ? 'Acepta mascotas' : 'No mascotas'} />
            <Feature icon={<CalendarDays size={18} />} label={`Disponible: ${property.availableFrom}`} />
          </div>

          {property.amenities.length > 0 && (
            <>
              <h2>Amenidades</h2>
              <ul className="pill-list">
                {property.amenities.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </>
          )}

          {property.requirements.length > 0 && (
            <>
              <h2>Requisitos</h2>
              <ul className="check-list">
                {property.requirements.map((item) => (
                  <li key={item}><CheckCircle2 size={18} /> {item}</li>
                ))}
              </ul>
            </>
          )}
        </div>

        <aside className="contact-card">
          <span>Renta mensual</span>
          <strong>{formatCurrency(property.price)}</strong>
          <ul className="contact-terms">
            <li>{property.maintenanceIncluded ? 'Mantenimiento incluido' : 'Mantenimiento no incluido'}</li>
            <li>{property.depositMonths} mes{property.depositMonths === 1 ? '' : 'es'} de depósito</li>
            {property.minimumStayMonths && <li>Contrato mínimo de {property.minimumStayMonths} meses</li>}
          </ul>
          {hasWhatsapp ? (
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="primary-button">
              <MessageCircle size={18} /> Contactar por WhatsApp
            </a>
          ) : (
            <p className="contact-missing">Agrega un WhatsApp de contacto para activar el botón.</p>
          )}
          <small>Información proporcionada por el anunciante. Verifica la propiedad antes de realizar cualquier pago.</small>
        </aside>
      </section>
    </article>
  );
}

function Feature({ icon, label }: { icon: ReactNode; label: string }) {
  return <div className="feature">{icon}<span>{label}</span></div>;
}
