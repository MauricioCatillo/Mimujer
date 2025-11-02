import { type FormEvent, useMemo, useState } from "react";
import {
  Calendar,
  dateFnsLocalizer,
  Event as RBCEvent,
  stringOrDate,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import esLocale from "date-fns/locale/es";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import "react-big-calendar/lib/css/react-big-calendar.css";
import api from "../../services/api";
import "./RomanticCalendar.css";

type ReminderMethod = "email" | "push";

type RomanticEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  notes: string;
  tag: string;
  reminder?: {
    method: ReminderMethod;
    minutesBefore: number;
  };
};

type RomanticEventForm = {
  id?: string;
  title: string;
  start: string;
  end: string;
  notes: string;
  tag: string;
  reminderEnabled: boolean;
  reminderMethod: ReminderMethod;
  reminderMinutesBefore: number;
};

const locales = {
  es: esLocale,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const tags = ["Cita", "Aniversario", "Sorpresa", "Tiempo de calidad", "Otro"];

const defaultForm: RomanticEventForm = {
  title: "",
  start: "",
  end: "",
  notes: "",
  tag: tags[0],
  reminderEnabled: false,
  reminderMethod: "email",
  reminderMinutesBefore: 60,
};

const toCalendarEvent = (event: RomanticEvent): RBCEvent => ({
  title: `${event.title}${event.tag ? ` · ${event.tag}` : ""}`,
  start: new Date(event.start),
  end: new Date(event.end),
  allDay: false,
  resource: event,
});

const romanticEventStyleGetter = () => ({
  className: "calendar-event",
});

const RomanticCalendar = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<RomanticEventForm>(defaultForm);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: unknown) => {
    if (axios.isAxiosError(err)) {
      setError(err.response?.data?.message ?? "Ocurrió un error inesperado");
    } else if (err instanceof Error) {
      setError(err.message);
    } else {
      setError("No pudimos completar tu solicitud. Inténtalo nuevamente.");
    }
    setMessage(null);
  };

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data } = await api.get<RomanticEvent[]>("/events");
      return data;
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (payload: RomanticEventForm) => {
      const response = await api.post<RomanticEvent>("/events", serializeForm(payload));
      return response.data;
    },
    onSuccess: () => {
      setMessage("Evento romántico creado con éxito. ¡Que viva el amor!");
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setFormData(defaultForm);
    },
    onError: (err: unknown) => handleError(err),
  });

  const updateEventMutation = useMutation({
    mutationFn: async (payload: RomanticEventForm) => {
      if (!payload.id) throw new Error("El evento seleccionado no es válido");
      const response = await api.put<RomanticEvent>(`/events/${payload.id}`, serializeForm(payload));
      return response.data;
    },
    onSuccess: () => {
      setMessage("Evento romántico actualizado. Los recuerdos quedan aún más dulces.");
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setFormData(defaultForm);
    },
    onError: (err: unknown) => handleError(err),
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/events/${id}`);
    },
    onSuccess: () => {
      setMessage("Evento eliminado. ¡Hora de escribir una nueva historia!");
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setFormData(defaultForm);
    },
    onError: (err: unknown) => handleError(err),
  });

  const calendarEvents = useMemo(() => events.map(toCalendarEvent), [events]);

  const handleSelectEvent = (event: RBCEvent) => {
    const romantic = event.resource as RomanticEvent;
    setFormData({
      id: romantic.id,
      title: romantic.title,
      start: formatInputDate(romantic.start),
      end: formatInputDate(romantic.end),
      notes: romantic.notes,
      tag: romantic.tag,
      reminderEnabled: Boolean(romantic.reminder),
      reminderMethod: romantic.reminder?.method ?? "email",
      reminderMinutesBefore: romantic.reminder?.minutesBefore ?? 60,
    });
    setMessage("Editando un recuerdo especial…");
    setError(null);
  };

  const handleSelectSlot = ({ start, end }: { start: stringOrDate; end: stringOrDate }) => {
    setFormData({
      ...defaultForm,
      start: formatInputDate(start),
      end: formatInputDate(end),
    });
    setMessage("Creando un nuevo momento mágico…");
    setError(null);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (formData.id) {
      updateEventMutation.mutate(formData);
    } else {
      createEventMutation.mutate(formData);
    }
  };

  const handleDelete = () => {
    if (formData.id) {
      deleteEventMutation.mutate(formData.id);
    }
  };

  return (
    <div className="calendar-screen">
      <section className="calendar-board romantic-card">
        <header className="calendar-header">
          <span role="img" aria-label="corazón">
            💞
          </span>
          <div>
            <h1>Calendario Romántico</h1>
            <p>Organiza citas, aniversarios y momentos memorables.</p>
          </div>
        </header>
        <Calendar
          selectable
          culture="es"
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          className="calendar-widget"
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          eventPropGetter={romanticEventStyleGetter}
          messages={{
            next: "Siguiente",
            previous: "Anterior",
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día",
            agenda: "Agenda",
          }}
          components={{
            toolbar: (toolbarProps) => (
              <div className="calendar-toolbar">
                <button type="button" onClick={() => toolbarProps.onNavigate("PREV")} className="calendar-toolbar__button">
                  ⏮️
                </button>
                <div className="calendar-toolbar__label">
                  <h2>{toolbarProps.label}</h2>
                </div>
                <div className="calendar-toolbar__controls">
                  <button type="button" onClick={() => toolbarProps.onView("month")} className="calendar-toolbar__button">
                    Mes
                  </button>
                  <button type="button" onClick={() => toolbarProps.onView("week")} className="calendar-toolbar__button">
                    Semana
                  </button>
                  <button type="button" onClick={() => toolbarProps.onView("day")} className="calendar-toolbar__button">
                    Día
                  </button>
                  <button type="button" onClick={() => toolbarProps.onNavigate("NEXT")} className="calendar-toolbar__button">
                    ⏭️
                  </button>
                </div>
              </div>
            ),
          }}
        />
      </section>
      <section className="calendar-form romantic-card">
        <h2 className="calendar-form__title">
          <span role="img" aria-label="notas de amor">
            💌
          </span>
          {formData.id ? "Editar recuerdo" : "Nuevo recuerdo"}
        </h2>
        <form className="calendar-form__fields" onSubmit={handleSubmit}>
          <label>
            Título del momento
            <input
              required
              type="text"
              value={formData.title}
              onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
              placeholder="Cena bajo las estrellas"
            />
          </label>
          <div className="calendar-form__grid">
            <label>
              Inicio
              <input
                required
                type="datetime-local"
                value={formData.start}
                onChange={(event) => setFormData((current) => ({ ...current, start: event.target.value }))}
              />
            </label>
            <label>
              Fin
              <input
                required
                type="datetime-local"
                value={formData.end}
                onChange={(event) => setFormData((current) => ({ ...current, end: event.target.value }))}
              />
            </label>
          </div>
          <label>
            Notas cariñosas
            <textarea
              required
              value={formData.notes}
              onChange={(event) => setFormData((current) => ({ ...current, notes: event.target.value }))}
              placeholder="No olvidar flores y playlist favorita"
            />
          </label>
          <label>
            Etiqueta especial
            <select
              value={formData.tag}
              onChange={(event) => setFormData((current) => ({ ...current, tag: event.target.value }))}
            >
              {tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="calendar-form__reminder">
            <legend>Recordatorios amorosos 💡</legend>
            <label className="calendar-form__switch">
              <input
                type="checkbox"
                checked={formData.reminderEnabled}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, reminderEnabled: event.target.checked }))
                }
              />
              Activar recordatorio
            </label>
            {formData.reminderEnabled && (
              <div className="calendar-form__grid">
                <label>
                  Anticipación (minutos)
                  <input
                    type="number"
                    min={5}
                    step={5}
                    value={formData.reminderMinutesBefore}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        reminderMinutesBefore: Number(event.target.value),
                      }))
                    }
                  />
                </label>
                <label>
                  Método
                  <select
                    value={formData.reminderMethod}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, reminderMethod: event.target.value as ReminderMethod }))
                    }
                  >
                    <option value="email">Correo romántico</option>
                    <option value="push">Notificación dulce</option>
                  </select>
                </label>
              </div>
            )}
          </fieldset>
          <div className="calendar-form__actions">
            <button
              className="romantic-button"
              type="submit"
              disabled={createEventMutation.isPending || updateEventMutation.isPending || isLoading}
            >
              {formData.id ? "Guardar cambios" : "Guardar recuerdo"}
            </button>
            {formData.id && (
              <button
                className="calendar-form__secondary"
                type="button"
                onClick={handleDelete}
                disabled={deleteEventMutation.isPending}
              >
                Borrar recuerdo
              </button>
            )}
            <button className="calendar-form__secondary" type="button" onClick={() => setFormData(defaultForm)}>
              Limpiar
            </button>
          </div>
        </form>
        {(message || error) && (
          <div className={`calendar-form__alert ${error ? "is-error" : "is-success"}`} role="alert">
            <span aria-hidden>{error ? "💔" : "💖"}</span>
            <span>{error ?? message}</span>
          </div>
        )}
      </section>
    </div>
  );
};

const formatInputDate = (value: stringOrDate) =>
  format(typeof value === "string" ? new Date(value) : value, "yyyy-MM-dd'T'HH:mm");

const serializeForm = (payload: RomanticEventForm) => ({
  title: payload.title,
  start: new Date(payload.start).toISOString(),
  end: new Date(payload.end).toISOString(),
  notes: payload.notes,
  tag: payload.tag,
  reminder: payload.reminderEnabled
    ? {
        method: payload.reminderMethod,
        minutesBefore: payload.reminderMinutesBefore,
      }
    : undefined,
});

export type { RomanticEvent };
export default RomanticCalendar;
