import { useEffect } from 'react';
import { Header } from '../components/Header';
import { PropertyLanding } from '../components/PropertyLanding';
import { SiteFooter } from '../components/SiteFooter';
import { exampleProperty } from '../data/exampleProperty';
import { formatPrice } from '../lib/format';
import { sortPhotos } from '../lib/photos';

export function HomePage() {
  const photos = sortPhotos(exampleProperty.photos);
  const cover = photos[0];
  const kitchen = photos[1] ?? cover;

  useEffect(() => {
    const targetId = window.location.hash.slice(1);
    if (!targetId) return;
    const frame = window.requestAnimationFrame(() => document.getElementById(targetId)?.scrollIntoView());
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <>
      <Header />
      <main className="umbral-home">
        <section className="umbral-new-hero" id="inicio" aria-labelledby="home-title" style={cover ? { backgroundImage: `linear-gradient(90deg, rgba(18,42,30,.74), rgba(18,42,30,.36) 55%, rgba(18,42,30,.2)), url(${cover.url})` } : undefined}>
          <div className="umbral-container umbral-new-hero-inner">
            <div className="umbral-new-hero-message">
              <p className="umbral-eyebrow">Una ficha clara para compartir</p>
              <h1 id="home-title">Tu propiedad se entiende desde el primer vistazo.</h1>
              <p>Reúne fotos, precio, ubicación aproximada y condiciones en una sola página. Después comparte el enlace donde quieras.</p>
              <div className="umbral-new-hero-actions">
                <a className="primary-button" href="/crear">Crear mi ficha</a>
                <a className="umbral-hero-text-link" href="#como-funciona">Cómo funciona</a>
              </div>
            </div>
            <article className="umbral-mini-listing" aria-label="Resumen de ficha de ejemplo">
              <div className="umbral-mini-top"><span>FICHA DE EJEMPLO</span><span>Renta · León, Gto.</span></div>
              {kitchen && <img className="umbral-mini-photo" src={kitchen.url} alt={kitchen.alt} />}
              <div className="umbral-mini-body">
                <h2>{exampleProperty.title}</h2>
                <p>{exampleProperty.location.city}, {exampleProperty.location.state} · ubicación aproximada</p>
                <div className="umbral-mini-price">{formatPrice(exampleProperty)} <span>MXN / mes · mantenimiento incluido</span></div>
                <ul className="umbral-mini-facts" aria-label="Datos principales de la ficha de ejemplo"><li>{exampleProperty.areaM2} m²</li><li>{exampleProperty.bedrooms} recámaras</li><li>{exampleProperty.bathrooms} baño</li><li>{exampleProperty.parkingSpaces} estacionamiento</li></ul>
                <div className="umbral-mini-bottom"><small>También muestra condiciones y contacto.</small><a href="#ejemplo">Ver ficha ↗</a></div>
              </div>
            </article>
          </div>
          <span className="umbral-hero-credit">Fotografía de una ficha demostrativa</span>
        </section>
        <div className="umbral-container umbral-hero-under"><p><strong>La idea:</strong> ordenar lo esencial antes de compartir tu publicación en Marketplace, grupos o mensajes.</p><p>Ficha de ejemplo. Los datos y la disponibilidad del inmueble no están verificados.</p></div>

        <section className="umbral-journey" id="como-funciona" aria-labelledby="how-title">
          <div className="umbral-container">
            <div className="umbral-section-intro"><div><p className="umbral-eyebrow">Cómo funciona</p><h2 id="how-title">De tu información a una ficha publicada.</h2></div><p>Tres momentos para presentar lo importante. El editor te deja revisar el resultado antes de generar el enlace.</p></div>
            <div className="umbral-journey-grid">
              <article className="umbral-journey-card"><div className="umbral-journey-visual umbral-form-visual" aria-hidden="true"><div className="umbral-fake-form"><div className="umbral-fake-top">● ● ● <strong>Crear ficha</strong></div><small>Título de la propiedad</small><div className="umbral-fake-input">Departamento en zona norte</div><div className="umbral-fake-pair"><span>Precio<b>$12,000</b></span><span>Operación<b>Renta</b></span></div><div className="umbral-fake-thumbs">{photos.map(photo => <img key={photo.id} src={photo.url} alt="" />)}</div></div></div><div className="umbral-journey-copy"><span>01</span><h3>Sube tu información</h3><p>Escribe los datos del inmueble, precio, condiciones y añade fotos.</p></div></article>
              <article className="umbral-journey-card"><div className="umbral-journey-visual umbral-review-visual" aria-hidden="true"><div className="umbral-fake-listing">{cover && <img src={cover.url} alt="" />}<div><strong>Departamento amueblado</strong><small>León · Zona norte</small><b>{formatPrice(exampleProperty)} <em>MXN / mes</em></b><span>78 m² &nbsp; 2 recámaras &nbsp; 1 baño</span></div></div></div><div className="umbral-journey-copy"><span>02</span><h3>Revisa tu ficha</h3><p>Comprueba cómo verán la propiedad antes de compartirla.</p></div></article>
              <article className="umbral-journey-card"><div className="umbral-journey-visual umbral-share-visual" aria-hidden="true"><div className="umbral-share-sheet"><span className="umbral-share-check">✓</span><strong>Tu ficha está publicada</strong><small>Un enlace para mostrar los detalles completos.</small><div>rentas.entaltek.com/r/tu-ficha</div><span className="umbral-share-button">Copiar enlace</span></div></div><div className="umbral-journey-copy"><span>03</span><h3>Publica y comparte</h3><p>Genera el enlace y envíalo en Marketplace, grupos o mensajes.</p></div></article>
            </div>
            <div className="umbral-journey-footer"><p>Representaciones conceptuales. Los datos y fotografías son de ejemplo.</p><a className="secondary-button" href="#ejemplo">Ver una ficha de ejemplo</a></div>
          </div>
        </section>

        <section className="umbral-example umbral-container" id="ejemplo" aria-labelledby="example-title">
          <div className="umbral-section-intro"><div><p className="umbral-eyebrow">Una ficha para compartir</p><h2 id="example-title">La información, en su lugar.</h2></div><p>Esta muestra enseña cómo se presentan fotografías, precio, características, ubicación aproximada y contacto. Los datos son ilustrativos.</p></div>
          <PropertyLanding property={exampleProperty} variant="preview" />
        </section>
        <section className="umbral-questions umbral-container" id="preguntas" aria-labelledby="questions-title"><div className="umbral-section-intro"><div><p className="umbral-eyebrow">Antes de empezar</p><h2 id="questions-title">Preguntas frecuentes.</h2></div></div><div className="umbral-question-grid"><details><summary>¿Reemplaza a Marketplace?</summary><p>No. Puedes compartir el enlace de tu ficha en Marketplace, grupos o mensajes para mostrar la información completa.</p></details><details><summary>¿Puedo ocultar el domicilio?</summary><p>Sí. El editor permite mostrar la zona aproximada sin publicar la dirección exacta.</p></details><details><summary>¿Necesito una cuenta?</summary><p>Puedes probar el editor directamente. Antes de publicar, revisa cuidadosamente los datos y fotografías.</p></details></div></section>
      </main>
      <SiteFooter />
    </>
  );
}
