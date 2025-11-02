import { FormEvent, useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';
import { createCalendarEvent, deleteCalendarEvent, fetchCalendarEvents } from '../api';
import type { CalendarEvent } from '../api/types';

dayjs.locale('es');

const Section = styled.section`
  display: grid;
  gap: 2rem;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: clamp(2rem, 3vw, 2.6rem);
  color: #b51763;
`;

const SectionDescription = styled.p`
  margin: 0;
  color: rgba(74, 22, 41, 0.8);
  max-width: 620px;
`;

const CalendarCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border-radius: 32px;
  padding: clamp(1.5rem, 3vw, 2.5rem);
  box-shadow: 0 18px 45px rgba(181, 23, 99, 0.12);
  display: grid;
  gap: 2rem;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const MonthLabel = styled.h3`
  margin: 0;
  font-size: clamp(1.6rem, 2.4vw, 2rem);
  color: #912943;
`;

const MonthNav = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const NavButton = styled.button`
  border-radius: 999px;
  padding: 0.5rem 1rem;
  border: none;
  background: rgba(255, 77, 109, 0.12);
  color: #ff4d6d;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.75rem;
`;

const WeekdayHeader = styled.div`
  text-align: center;
  font-weight: 600;
  color: rgba(74, 22, 41, 0.7);
  text-transform: uppercase;
  font-size: 0.8rem;
`;

const DayCell = styled.button<{ isCurrentMonth: boolean; isToday: boolean; isSelected: boolean }>`
  border: ${({ isSelected, isToday }) =>
    isSelected ? 'none' : isToday ? '2px solid rgba(255, 77, 109, 0.45)' : '1px solid transparent'};
  border-radius: 22px;
  min-height: 92px;
  padding: 0.9rem 0.6rem;
  background: ${({ isSelected }) => (isSelected ? 'linear-gradient(135deg, #ff758c, #ff4d6d)' : 'rgba(255, 255, 255, 0.95)')};
  color: ${({ isSelected, isCurrentMonth }) => (isSelected ? 'white' : isCurrentMonth ? '#63273b' : 'rgba(99, 39, 59, 0.45)')};
  box-shadow: ${({ isSelected }) => (isSelected ? '0 14px 32px rgba(255, 77, 109, 0.35)' : '0 10px 28px rgba(181, 23, 99, 0.1)')};
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 0.5rem;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-3px);
  }
`;

const DayNumber = styled.span`
  font-weight: 700;
  font-size: 1rem;
`;

const EventBadge = styled.span<{ highlight?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 600;
  background: ${({ highlight }) => (highlight ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 77, 109, 0.12)')};
  color: ${({ highlight }) => (highlight ? 'white' : '#ff4d6d')};
`;

const EventStack = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
`;

const AddEventForm = styled.form`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  background: rgba(255, 240, 246, 0.85);
  padding: 1.5rem;
  border-radius: 24px;
`;

const FormActions = styled.div`
  display: flex;
  gap: 0.8rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #ff4d6d, #ff85a1);
  color: white;
  border: none;
  border-radius: 14px;
  padding: 0.8rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(255, 77, 109, 0.25);
`;

const DeleteButton = styled.button`
  border: none;
  background: rgba(255, 255, 255, 0.8);
  color: #ff4d6d;
  font-weight: 600;
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  cursor: pointer;
`;

const SelectedDayPanel = styled.div`
  display: grid;
  gap: 1rem;
`;

const SelectedDayTitle = styled.h4`
  margin: 0;
  font-size: 1.2rem;
  color: #912943;
`;

const SelectedEventCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 18px;
  padding: 1rem 1.2rem;
  box-shadow: 0 12px 24px rgba(181, 23, 99, 0.12);
  display: grid;
  gap: 0.3rem;
`;

const EmptyState = styled.p`
  margin: 0;
  color: rgba(74, 22, 41, 0.6);
`;

type FormState = {
  title: string;
  eventDate: string;
  description: string;
};

type CalendarDay = {
  date: Dayjs;
  isCurrentMonth: boolean;
};

const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const buildCalendarDays = (currentMonth: Dayjs): CalendarDay[] => {
  const days: CalendarDay[] = [];
  const startOfMonth = currentMonth.startOf('month');
  const endOfMonth = currentMonth.endOf('month');
  const prevDays = (startOfMonth.day() + 6) % 7; // adjust to Monday as first day

  for (let i = prevDays; i > 0; i -= 1) {
    days.push({ date: startOfMonth.subtract(i, 'day'), isCurrentMonth: false });
  }

  for (let day = 0; day < currentMonth.daysInMonth(); day += 1) {
    days.push({ date: startOfMonth.add(day, 'day'), isCurrentMonth: true });
  }

  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i += 1) {
    days.push({ date: endOfMonth.add(i, 'day'), isCurrentMonth: false });
  }

  return days;
};

const CalendarSection = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'));
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [formState, setFormState] = useState<FormState>({
    title: '',
    eventDate: dayjs().format('YYYY-MM-DD'),
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchCalendarEvents();
        setEvents(data);
      } catch (err) {
        console.error(err);
        setError('No pudimos cargar el calendario, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const monthStart = currentMonth.startOf('month');
    if (!dayjs(selectedDate).isSame(monthStart, 'month')) {
      setSelectedDate(monthStart.format('YYYY-MM-DD'));
    }
  }, [currentMonth, selectedDate]);

  const days = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);
  const eventsByDay = useMemo(() => {
    return events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
      const key = dayjs(event.eventDate).format('YYYY-MM-DD');
      acc[key] = acc[key] ? [...acc[key], event] : [event];
      return acc;
    }, {});
  }, [events]);

  const selectedEvents = eventsByDay[selectedDate] || [];

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!formState.title.trim()) {
      setError('Ponle un nombre lleno de amor al evento.');
      return;
    }
    setSubmitting(true);
    try {
      const created = await createCalendarEvent({
        title: formState.title,
        eventDate: formState.eventDate,
        description: formState.description
      });
      setEvents((prev) => [...prev, created]);
      setFormState({ title: '', eventDate: formState.eventDate, description: '' });
      setSelectedDate(created.eventDate);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('No pudimos guardar el evento, pero puedes intentarlo otra vez.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCalendarEvent(id);
      setEvents((prev) => prev.filter((event) => event.id !== id));
    } catch (err) {
      console.error(err);
      setError('No pudimos borrar ese evento, intenta nuevamente.');
    }
  };

  const goToPreviousMonth = () => setCurrentMonth((month) => month.subtract(1, 'month'));
  const goToNextMonth = () => setCurrentMonth((month) => month.add(1, 'month'));

  return (
    <Section id="calendar-section">
      <div>
        <SectionTitle>Calendario de momentos inolvidables</SectionTitle>
        <SectionDescription>
          Planeen escapadas, celebraciones y cada pequeña sorpresa con un calendario pensado para el romance. Los corazones
          resaltan los días en los que el amor tiene planes especiales.
        </SectionDescription>
      </div>

      <CalendarCard>
        <CalendarHeader>
          <MonthLabel>{currentMonth.format('MMMM YYYY')}</MonthLabel>
          <MonthNav>
            <NavButton type="button" onClick={goToPreviousMonth}>
              ❮ Previo
            </NavButton>
            <NavButton type="button" onClick={goToNextMonth}>
              Siguiente ❯
            </NavButton>
          </MonthNav>
        </CalendarHeader>

        <CalendarGrid>
          {weekDays.map((day) => (
            <WeekdayHeader key={day}>{day}</WeekdayHeader>
          ))}

          {loading ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center' }}>Cargando momentos llenos de amor...</p>
          ) : (
            days.map(({ date, isCurrentMonth }) => {
              const key = date.format('YYYY-MM-DD');
              const dayEvents = eventsByDay[key] || [];
              const isSelected = key === selectedDate;
              const isToday = key === dayjs().format('YYYY-MM-DD');

              return (
                <DayCell
                  type="button"
                  key={key}
                  isCurrentMonth={isCurrentMonth}
                  isSelected={isSelected}
                  isToday={isToday}
                  onClick={() => {
                    setSelectedDate(key);
                    setFormState((prev) => ({ ...prev, eventDate: key }));
                  }}
                  disabled={!isCurrentMonth}
                  style={{ opacity: isCurrentMonth ? 1 : 0.45 }}
                >
                  <DayNumber>{date.date()}</DayNumber>
                  <EventStack>
                    {dayEvents.length > 0 ? (
                      dayEvents.map((event) => (
                        <EventBadge key={event.id} highlight={isSelected}>
                          💖 {event.title}
                        </EventBadge>
                      ))
                    ) : (
                      isToday && <EventBadge highlight={isSelected}>Hoy</EventBadge>
                    )}
                  </EventStack>
                </DayCell>
              );
            })
          )}
        </CalendarGrid>

        {error && <p style={{ color: '#d62839', margin: 0 }}>{error}</p>}

        <SelectedDayPanel>
          <SelectedDayTitle>
            {dayjs(selectedDate).format('dddd D [de] MMMM')} {selectedEvents.length === 0 ? '— aún sin planes' : ''}
          </SelectedDayTitle>
          {selectedEvents.length === 0 ? (
            <EmptyState>
              Este día espera por un recuerdo nuevo. Agrega una cita, una cena a la luz de las velas o un mensaje especial.
            </EmptyState>
          ) : (
            selectedEvents.map((event) => (
              <SelectedEventCard key={event.id}>
                <strong>{event.title}</strong>
                {event.description && <span>{event.description}</span>}
                <DeleteButton type="button" onClick={() => handleDelete(event.id)}>
                  Borrar plan
                </DeleteButton>
              </SelectedEventCard>
            ))
          )}
        </SelectedDayPanel>

        <AddEventForm onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '0.6rem' }}>
            <label htmlFor="eventTitle">Nombre del plan</label>
            <input
              id="eventTitle"
              name="eventTitle"
              placeholder="Cena bajo las estrellas"
              value={formState.title}
              onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
            />
          </div>
          <div style={{ display: 'grid', gap: '0.6rem' }}>
            <label htmlFor="eventDate">Fecha</label>
            <input
              id="eventDate"
              name="eventDate"
              type="date"
              value={formState.eventDate}
              onChange={(event) => setFormState((prev) => ({ ...prev, eventDate: event.target.value }))}
            />
          </div>
          <div style={{ display: 'grid', gap: '0.6rem', gridColumn: '1 / -1' }}>
            <label htmlFor="eventDescription">Detalle romántico</label>
            <textarea
              id="eventDescription"
              name="eventDescription"
              placeholder="Prometo preparar su postre favorito"
              rows={3}
              value={formState.description}
              onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
            />
          </div>
          <FormActions>
            <SubmitButton type="submit" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Guardar plan'}
            </SubmitButton>
            <span style={{ color: 'rgba(74, 22, 41, 0.6)', fontSize: '0.9rem' }}>
              Cada evento queda guardado para siempre en su calendario del amor.
            </span>
          </FormActions>
        </AddEventForm>
      </CalendarCard>
    </Section>
  );
};

export default CalendarSection;
