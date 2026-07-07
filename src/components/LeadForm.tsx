import { useState, type FormEvent } from 'react';
import { ApiError } from '../api/client';
import { createLead } from '../api/leads';

interface Props {
  propertyId: string;
  propertyTitle: string;
}

type FormStatus = 'idle' | 'sending' | 'sent' | 'error';

export function LeadForm({ propertyId, propertyTitle }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [feedback, setFeedback] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || phone.trim().length < 7) {
      setStatus('error');
      setFeedback('Escribe tu nombre y un teléfono válido (mínimo 7 dígitos) para que podamos contactarte.');
      return;
    }

    setStatus('sending');
    setFeedback('Enviando tus datos...');

    try {
      await createLead({
        property_id: propertyId,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        move_in_date: moveInDate.trim() || undefined,
        message: message.trim() || undefined
      });
      setStatus('sent');
      setFeedback('¡Listo! Recibimos tu información. El anunciante te contactará pronto.');
    } catch (error) {
      setStatus('error');
      if (error instanceof ApiError && error.isNetworkError) {
        setFeedback('No pudimos conectar con el servidor. Intenta de nuevo en unos minutos o contacta por WhatsApp.');
      } else {
        setFeedback(error instanceof Error ? error.message : 'No se pudo enviar tu información. Intenta de nuevo.');
      }
    }
  }

  if (status === 'sent') {
    return (
      <section className="form-section lead-form">
        <p className="eyebrow">Me interesa</p>
        <h2>¡Gracias por tu interés!</h2>
        <p className="api-message success">{feedback}</p>
      </section>
    );
  }

  return (
    <section className="form-section lead-form">
      <p className="eyebrow">Me interesa</p>
      <h2>Solicita informes de esta propiedad</h2>
      <p>Deja tus datos y el anunciante de «{propertyTitle}» te contactará.</p>

      <form className="property-form" onSubmit={handleSubmit}>
        <label>
          Nombre *
          <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
        </label>
        <label>
          Teléfono / WhatsApp *
          <input value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" autoComplete="tel" required />
        </label>
        <label>
          Correo (opcional)
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" />
        </label>
        <label>
          ¿Cuándo te mudarías? (opcional)
          <input value={moveInDate} onChange={(event) => setMoveInDate(event.target.value)} placeholder="Ej. Agosto 2026" maxLength={20} />
        </label>
        <label className="full">
          Mensaje (opcional)
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={2000} placeholder="Cuéntale al anunciante lo que buscas." />
        </label>

        <div className="form-actions full">
          <button type="submit" className="primary-button" disabled={status === 'sending'}>
            {status === 'sending' ? 'Enviando...' : 'Enviar mis datos'}
          </button>
        </div>

        {feedback && status !== 'idle' && (
          <p className={`api-message full ${status === 'error' ? 'error' : 'success'}`}>{feedback}</p>
        )}
      </form>
    </section>
  );
}
