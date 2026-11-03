import { useEffect } from 'react';
import { Header } from '../components/Header';
import { PropertyLanding } from '../components/PropertyLanding';
import { SiteFooter } from '../components/SiteFooter';
import { exampleProperty } from '../data/exampleProperty';
import { formatPrice } from '../lib/format';
import { sortPhotos } from '../lib/photos';

export function HomePage() {
  const cover = sortPhotos(exampleProperty.photos)[0];

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
        <section className="umbral-hero" aria-labelledby="home-title">
          <div className="umbral-panorama">
            {cover && <img src={cover.url} alt={cover.alt} />}
            <span className="umbral-photo-label">Fotografía de una ficha de ejemplo</span>
          </div>
          <div className="umbral-container">
            <div className="umbral-hero-card">
              <div className="umbral-hero-promise">
                <p className="umbral-eyebrow">Para quien publica un departamento</p>
                <h1 id="home-title">Tu propiedad, bien presentada.</h1>
                <p>Fotos, precio y condiciones en una ficha clara para compartir por enlace.</p>
                <a className="primary-button" href="/crear">Crear mi primera ficha</a>
              </div>
              <div className="umbral-demo-summary">
                <div>
                  <p className="umbral-eyebrow">Así puede verse tu publicación</p>
                  <h2>{exampleProperty.title}</h2>
                  <p>{exampleProperty.location.city}, {exampleProperty.location.state} · Ubicación aproximada</p>
                </div>
                <div className="umbral-demo-price">
                  <strong>{formatPrice(exampleProperty)} <small>MXN / mes</small></strong>
                  <span>Mantenimiento incluido</span>
                </div>
                <a className="secondary-button" href="#ejemplo">Ver ficha completa <span aria-hidden="true">↗</span></a>
              </div>
              <ul className="umbral-demo-facts" aria-label="Datos principales de la ficha de ejemplo">
                <li>{exampleProperty.areaM2} m²</li>
                <li>{exampleProperty.bedrooms} recámaras</li>
                <li>{exampleProperty.bathrooms} baño</li>
                <li>{exampleProperty.parkingSpaces} estacionamiento</li>
                <li>Condiciones y contacto</li>
              </ul>
            </div>
            <div className="umbral-process" id="como-funciona" aria-label="Cómo funciona">
              <span><strong>01</strong> Describe el espacio</span>
              <span><strong>02</strong> Añade fotos y condiciones</span>
              <span><strong>03</strong> Comparte el enlace</span>
            </div>
            <p className="umbral-demo-note">Ficha demostrativa: datos y fotografías de ejemplo. La disponibilidad del inmueble no está verificada.</p>
          </div>
        </section>

        <section className="umbral-example umbral-container" id="ejemplo" aria-labelledby="example-title">
          <div className="umbral-section-intro">
            <div>
              <p className="umbral-eyebrow">Una ficha para compartir</p>
              <h2 id="example-title">La información, en su lugar.</h2>
            </div>
            <p>Esta muestra enseña cómo se presentan fotografías, precio, características, ubicación aproximada y contacto. Los datos son ilustrativos.</p>
          </div>
          <PropertyLanding property={exampleProperty} variant="preview" />
        </section>

        <section className="umbral-questions umbral-container" id="preguntas" aria-labelledby="questions-title">
          <div className="umbral-section-intro">
            <div>
              <p className="umbral-eyebrow">Antes de empezar</p>
              <h2 id="questions-title">Preguntas frecuentes.</h2>
            </div>
          </div>
          <div className="umbral-question-grid">
            <details><summary>¿Reemplaza a Marketplace?</summary><p>No. Puedes compartir el enlace de tu ficha en Marketplace, grupos o mensajes para mostrar la información completa.</p></details>
            <details><summary>¿Puedo ocultar el domicilio?</summary><p>Sí. El editor permite mostrar la zona aproximada sin publicar la dirección exacta.</p></details>
            <details><summary>¿Necesito una cuenta?</summary><p>Puedes probar el editor directamente. Antes de publicar, revisa cuidadosamente los datos y fotografías.</p></details>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
