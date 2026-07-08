const WHATSAPP_NUMBER = '524641591640';
const WHATSAPP_MESSAGE = encodeURIComponent('Hola, quiero información sobre Entaltek Rentas.');

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-shell">
        <section className="footer-brand">
          <p><strong>Entaltek Rentas</strong></p>
          <p>
            Publicaciones profesionales para propiedades en renta: fotos, precio, ubicación, requisitos y
            contacto directo en un solo link.
          </p>
          <a href="https://entaltek.com" target="_blank" rel="noreferrer">Visitar entaltek.com</a>
        </section>

        <section>
          <h2>Uso del sitio</h2>
          <ol>
            <li>Carga los datos reales de tu propiedad.</li>
            <li>Revisa la vista previa antes de publicar.</li>
            <li>Comparte el link en Marketplace, WhatsApp o redes.</li>
          </ol>
        </section>

        <section>
          <h2>Preguntas frecuentes</h2>
          <ul>
            <li>¿Necesito cuenta? Puedes probar el editor directamente.</li>
            <li>¿Puedo ocultar mi domicilio? Sí, decides si se muestra exacto o aproximado.</li>
            <li>¿Cada propiedad tiene link propio? Sí, cada publicación genera una URL única.</li>
          </ul>
        </section>

        <section>
          <h2>Contacto</h2>
          <p>¿Quieres publicar o mejorar una renta?</p>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`} target="_blank" rel="noreferrer">
            Ponte en contacto con nosotros vía WhatsApp
          </a>
          <p className="footer-warning">
            La información de cada propiedad es responsabilidad del anunciante. Verifica el inmueble antes de
            entregar depósitos o firmar contratos.
          </p>
        </section>
      </div>
    </footer>
  );
}
