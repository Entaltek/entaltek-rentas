export function PropertyForm() {
  return (
    <section className="form-section" id="crear">
      <p className="eyebrow">Siguiente paso del MVP</p>
      <h2>Formulario de captura</h2>
      <p>Esta primera base deja preparado el flujo. El siguiente desarrollo conecta este formulario con persistencia real y generación de slugs públicos.</p>
      <form className="property-form">
        <label>
          Título de la propiedad
          <input placeholder="Departamento amueblado en zona norte" />
        </label>
        <label>
          Renta mensual
          <input placeholder="12000" inputMode="numeric" />
        </label>
        <label>
          Zona / colonia
          <input placeholder="Zona norte" />
        </label>
        <label>
          WhatsApp de contacto
          <input placeholder="524771234567" />
        </label>
        <label className="full">
          Descripción
          <textarea placeholder="Describe la propiedad, ventajas, reglas y disponibilidad." />
        </label>
        <button type="button" className="primary-button">Guardar borrador local</button>
      </form>
    </section>
  );
}
