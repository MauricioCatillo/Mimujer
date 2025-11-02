import { FormEvent, useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';
import { createReminder, deleteReminder, fetchReminders } from '../api';
import type { Reminder } from '../api/types';

dayjs.locale('es');
dayjs.extend(relativeTime);

const Section = styled.section`
  display: grid;
  gap: 2rem;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: clamp(2rem, 3vw, 2.5rem);
  color: #a41358;
`;

const SectionDescription = styled.p`
  margin: 0;
  color: rgba(74, 22, 41, 0.75);
  max-width: 620px;
`;

const ReminderLayout = styled.div`
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
`;

const ReminderCard = styled.div`
  background: rgba(255, 255, 255, 0.92);
  border-radius: 28px;
  padding: 1.8rem;
  box-shadow: 0 16px 42px rgba(164, 19, 88, 0.14);
  display: grid;
  gap: 1.2rem;
`;

const ReminderForm = styled.form`
  display: grid;
  gap: 1rem;
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #ff758c, #ff4d6d);
  color: white;
  border: none;
  border-radius: 16px;
  padding: 0.8rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 12px 26px rgba(255, 77, 109, 0.28);
`;

const ReminderList = styled.div`
  display: grid;
  gap: 1rem;
`;

const ReminderItem = styled.div`
  background: rgba(255, 248, 251, 0.95);
  border-radius: 22px;
  padding: 1.2rem 1.4rem;
  box-shadow: 0 12px 28px rgba(164, 19, 88, 0.1);
  display: grid;
  gap: 0.4rem;
`;

const ReminderTime = styled.span`
  font-size: 0.9rem;
  color: rgba(74, 22, 41, 0.65);
`;

const DeleteButton = styled.button`
  justify-self: start;
  border: none;
  background: rgba(255, 255, 255, 0.86);
  color: #ff4d6d;
  border-radius: 999px;
  padding: 0.4rem 0.9rem;
  font-weight: 600;
  cursor: pointer;
`;

const EmptyState = styled.p`
  margin: 0;
  color: rgba(74, 22, 41, 0.6);
`;

type FormState = {
  title: string;
  note: string;
  dueDate: string;
};

const RemindersSection = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [formState, setFormState] = useState<FormState>({
    title: '',
    note: '',
    dueDate: dayjs().format('YYYY-MM-DDTHH:mm')
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchReminders();
        setReminders(data);
      } catch (err) {
        console.error(err);
        setError('No logramos traer los recordatorios. Vuelve a intentarlo en un momento.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const sortedReminders = useMemo(
    () =>
      [...reminders].sort((a, b) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf()),
    [reminders]
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!formState.title.trim()) {
      setError('Escribe un mensaje dulce para recordar.');
      return;
    }
    setSubmitting(true);
    try {
      const created = await createReminder(formState);
      setReminders((prev) => [...prev, created]);
      setFormState({ title: '', note: '', dueDate: formState.dueDate });
      setError(null);
    } catch (err) {
      console.error(err);
      setError('El recordatorio no se pudo guardar. Intentemos otra vez.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReminder(id);
      setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
    } catch (err) {
      console.error(err);
      setError('No pudimos eliminar el recordatorio.');
    }
  };

  return (
    <Section id="reminders-section">
      <div>
        <SectionTitle>Recordatorios de promesas y detalles</SectionTitle>
        <SectionDescription>
          Nunca olvidarán un aniversario, un mensaje de buenos días ni la hora exacta de la sorpresa. Dejen que este asistente
          del amor les susurre los pendientes más especiales.
        </SectionDescription>
      </div>

      <ReminderLayout>
        <ReminderCard>
          <h3 style={{ margin: 0, color: '#912943' }}>Crear un recordatorio</h3>
          <ReminderForm onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <label htmlFor="reminderTitle">Mensaje</label>
              <input
                id="reminderTitle"
                value={formState.title}
                placeholder="Decirle que la amas"
                onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
              />
            </div>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <label htmlFor="reminderDate">Fecha y hora</label>
              <input
                id="reminderDate"
                type="datetime-local"
                value={formState.dueDate}
                onChange={(event) => setFormState((prev) => ({ ...prev, dueDate: event.target.value }))}
              />
            </div>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <label htmlFor="reminderNote">Nota especial</label>
              <textarea
                id="reminderNote"
                rows={3}
                value={formState.note}
                placeholder="Sorprenderla con su chocolate favorito"
                onChange={(event) => setFormState((prev) => ({ ...prev, note: event.target.value }))}
              />
            </div>
            <SubmitButton type="submit" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Guardar recordatorio'}
            </SubmitButton>
            {error && <p style={{ margin: 0, color: '#d62839' }}>{error}</p>}
          </ReminderForm>
        </ReminderCard>

        <ReminderCard>
          <h3 style={{ margin: 0, color: '#912943' }}>Agenda de caricias pendientes</h3>
          {loading ? (
            <p>Cargando promesas...</p>
          ) : sortedReminders.length === 0 ? (
            <EmptyState>Aún no hay recordatorios. Es el momento perfecto para crear uno.</EmptyState>
          ) : (
            <ReminderList>
              {sortedReminders.map((reminder) => (
                <ReminderItem key={reminder.id}>
                  <strong>{reminder.title}</strong>
                  {reminder.note && <span>{reminder.note}</span>}
                  <ReminderTime>
                    {dayjs(reminder.dueDate).format('D [de] MMMM, HH:mm')} • {dayjs(reminder.dueDate).fromNow()}
                  </ReminderTime>
                  <DeleteButton type="button" onClick={() => handleDelete(reminder.id)}>
                    Borrar
                  </DeleteButton>
                </ReminderItem>
              ))}
            </ReminderList>
          )}
        </ReminderCard>
      </ReminderLayout>
    </Section>
  );
};

export default RemindersSection;
