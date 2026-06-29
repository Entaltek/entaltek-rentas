import { CalendarDays, Car, CheckCircle2, Home, MapPin, MessageCircle, PawPrint, Ruler } from 'lucide-react';
import type { Property } from '../types/property';
import { formatCurrency } from '../lib/format';

interface Props {
  property: Property;
}

export function PropertyLanding({ property }: Props) {
  const whatsappUrl = `https://wa.me/${property.whatsapp}?text=${encodeURIComponent(`Hola, vi la propiedad: ${property.title}. ¿Sigue disponible?`)}`;

  return (
    <article className="property-card" id="demo">
      <section className="hero-grid">
        <img src={property.images[0]} alt={property.title} className="hero-image" />
        <div className="gallery-column">
          {property.images.slice(1, 3).map((image) => (
            <img key={image} src={image} alt="Foto de la propiedad" />
          ))}
        </div>
      </section>

      <section className="property-content">
        <div className="property-main">
          <p className="eyebrow">{property.type} en renta</p>
          <h1>{property.title}</h1>
          <p className="location"><MapPin size={18} /> {property.zone}, {property.city}</p>
          <p className="description">{property.description}</p>

          <div className="feature-grid">
            <Feature icon={<Home size={18} />} label={`${property.bedrooms} recámaras`} />
            <Feature icon={<Ruler size={18} />} label={property.areaM2 ? `${property.areaM2} m²` : 'Área por confirmar'} />
            <Feature icon={<Car size={18} />} label={`${property.parkingSpots} estacionamiento`} />
            <Feature icon={<PawPrint size={18} />} label={property.petsAllowed ? 'Acepta mascotas' : 'No mascotas'} />
            <Feature icon={<CalendarDays size={18} />} label={`Disponible: ${property.availableFrom}`} />
          </div>

          <h2>Amenidades</h2>
          <ul className="pill-list">
            {property.amenities.map((item) => <li key={item}>{item}</li>)}
          </ul>

          <h2>Requisitos</h2>
          <ul className="check-list">
            {property.requirements.map((item) => (
              <li key={item}><CheckCircle2 size={18} /> {item}</li>
            ))}
          </ul>
        </div>

        <aside className="contact-card">
          <span>Renta mensual</span>
          <strong>{formatCurrency(property.price)}</strong>
          <p>{property.maintenanceIncluded ? 'Mantenimiento incluido' : 'Mantenimiento no incluido'}</p>
          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="primary-button">
            <MessageCircle size={18} /> Contactar por WhatsApp
          </a>
          <small>Información proporcionada por el anunciante. Verifica la propiedad antes de realizar cualquier pago.</small>
        </aside>
      </section>
    </article>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return <div className="feature">{icon}<span>{label}</span></div>;
}
