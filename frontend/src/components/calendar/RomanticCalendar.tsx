import { type CSSProperties, type FormEvent, useMemo, useState } from "react";
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

const romanticPalette = {
  background: "linear-gradient(135deg, rgba(255,204,213,0.85), rgba(255,236,179,0.9))",
  primary: "#d6336c",
  secondary: "#f783ac",
  accent: "#ffb3c1",
  text: "#5f021f",
};

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

const api = axios.create({
  baseURL: "/api",
});

const toCalendarEvent = (event: RomanticEvent): RBCEvent => ({
  title: `${event.title}${event.tag ? ` · ${event.tag}` : ""}`,
  start: new Date(event.start),
  end: new Date(event.end),
  allDay: false,
  resource: event,
});

const romanticEventStyleGetter = () => ({
  style: {
    background: romanticPalette.accent,
    color: romanticPalette.text,
    borderRadius: "12px",
    border: `2px solid ${romanticPalette.primary}`,
    boxShadow: "0 4px 12px rgba(214, 51, 108, 0.25)",
    padding: "4px 8px",
  },
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
      start: romantic.start.slice(0, 16),
      end: romantic.end.slice(0, 16),
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
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "24px",
        padding: "24px",
        background: romanticPalette.background,
        minHeight: "100vh",
        fontFamily: "'Quicksand', 'Poppins', sans-serif",
        color: romanticPalette.text,
      }}
    >
      <section style={{
        background: "rgba(255, 255, 255, 0.7)",
        borderRadius: "24px",
        boxShadow: "0 12px 30px rgba(214, 51, 108, 0.15)",
        padding: "16px",
        border: `1px solid ${romanticPalette.accent}`,
      }}>
        <header style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <span role="img" aria-label="corazón" style={{ fontSize: "2rem" }}>
            💞
          </span>
          <div>
            <h1 style={{ margin: 0 }}>Calendario Romántico</h1>
            <p style={{ margin: 0 }}>Organiza citas, aniversarios y momentos memorables.</p>
          </div>
        </header>
        <Calendar
          selectable
          culture="es"
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "70vh" }}
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <button
                  type="button"
                  onClick={() => toolbarProps.onNavigate("PREV")}
                  style={toolbarButtonStyle}
                >
                  ⏮️
                </button>
                <div>
                  <h2 style={{ margin: 0 }}>{toolbarProps.label}</h2>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button type="button" onClick={() => toolbarProps.onView("month")} style={toolbarButtonStyle}>
                    Mes
                  </button>
                  <button type="button" onClick={() => toolbarProps.onView("week")} style={toolbarButtonStyle}>
                    Semana
                  </button>
                  <button type="button" onClick={() => toolbarProps.onView("day")} style={toolbarButtonStyle}>
                    Día
                  </button>
                  <button type="button" onClick={() => toolbarProps.onNavigate("NEXT")} style={toolbarButtonStyle}>
                    ⏭️
                  </button>
                </div>
              </div>
            ),
          }}
        />
      </section>
      <section
        style={{
          background: "rgba(255, 255, 255, 0.9)",
          borderRadius: "24px",
          boxShadow: "0 10px 24px rgba(247, 131, 172, 0.25)",
          padding: "24px",
          border: `1px solid ${romanticPalette.secondary}`,
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <h2 style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
          <span role="img" aria-label="notas de amor">
            💌
          </span>
          {formData.id ? "Editar recuerdo" : "Nuevo recuerdo"}
        </h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <label style={labelStyle}>
            Título del momento
            <input
              required
              type="text"
              value={formData.title}
              onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
              style={inputStyle}
              placeholder="Cena bajo las estrellas"
            />
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <label style={labelStyle}>
              Inicio
              <input
                required
                type="datetime-local"
                value={formData.start}
                onChange={(event) => setFormData((current) => ({ ...current, start: event.target.value }))}
                style={inputStyle}
              />
            </label>
            <label style={labelStyle}>
              Fin
              <input
                required
                type="datetime-local"
                value={formData.end}
                onChange={(event) => setFormData((current) => ({ ...current, end: event.target.value }))}
                style={inputStyle}
              />
            </label>
          </div>
          <label style={labelStyle}>
            Notas cariñosas
            <textarea
              required
              value={formData.notes}
              onChange={(event) => setFormData((current) => ({ ...current, notes: event.target.value }))}
              style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
              placeholder="No olvidar flores y playlist favorita"
            />
          </label>
          <label style={labelStyle}>
            Etiqueta especial
            <select
              value={formData.tag}
              onChange={(event) => setFormData((current) => ({ ...current, tag: event.target.value }))}
              style={inputStyle}
            >
              {tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </label>
          <fieldset
            style={{
              border: `1px dashed ${romanticPalette.secondary}`,
              borderRadius: "16px",
              padding: "16px",
              background: "rgba(255, 179, 193, 0.15)",
            }}
          >
            <legend style={{ padding: "0 12px", color: romanticPalette.primary, fontWeight: 600 }}>
              Recordatorios amorosos 💡
            </legend>
            <label style={{ ...labelStyle, flexDirection: "row", alignItems: "center", gap: "12px" }}>
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <label style={labelStyle}>
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
                    style={inputStyle}
                  />
                </label>
                <label style={labelStyle}>
                  Método
                  <select
                    value={formData.reminderMethod}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, reminderMethod: event.target.value as ReminderMethod }))
                    }
                    style={inputStyle}
                  >
                    <option value="email">Correo romántico</option>
                    <option value="push">Notificación dulce</option>
                  </select>
                </label>
              </div>
            )}
          </fieldset>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="submit"
              style={{
                ...actionButtonStyle,
                background: romanticPalette.primary,
                color: "white",
              }}
              disabled={createEventMutation.isPending || updateEventMutation.isPending || isLoading}
            >
              {formData.id ? "Guardar cambios" : "Guardar recuerdo"}
            </button>
            {formData.id && (
              <button
                type="button"
                onClick={handleDelete}
                style={{
                  ...actionButtonStyle,
                  background: "white",
                  color: romanticPalette.primary,
                  border: `2px solid ${romanticPalette.primary}`,
                }}
                disabled={deleteEventMutation.isPending}
              >
                Borrar recuerdo
              </button>
            )}
            <button
              type="button"
              onClick={() => setFormData(defaultForm)}
              style={{
                ...actionButtonStyle,
                background: "white",
                color: romanticPalette.secondary,
                border: `2px solid ${romanticPalette.secondary}`,
              }}
            >
              Limpiar
            </button>
          </div>
        </form>
        {(message || error) && (
          <div
            role="alert"
            style={{
              borderRadius: "16px",
              padding: "12px 16px",
              background: error ? "rgba(214, 51, 108, 0.2)" : "rgba(121, 217, 182, 0.25)",
              color: error ? romanticPalette.primary : "#1a3d2f",
              border: `1px solid ${error ? romanticPalette.primary : "#7dd3a7"}`,
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span aria-hidden> {error ? "💔" : "💖"} </span>
            <span>{error ?? message}</span>
          </div>
        )}
      </section>
    </div>
  );
};

const toolbarButtonStyle: CSSProperties = {
  background: "white",
  color: romanticPalette.primary,
  border: `1px solid ${romanticPalette.primary}`,
  borderRadius: "999px",
  padding: "6px 12px",
  cursor: "pointer",
  fontWeight: 600,
  boxShadow: "0 4px 8px rgba(214, 51, 108, 0.15)",
};

const labelStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  fontWeight: 600,
};

const inputStyle: CSSProperties = {
  padding: "10px 14px",
  borderRadius: "12px",
  border: "1px solid rgba(214, 51, 108, 0.3)",
  background: "rgba(255, 255, 255, 0.9)",
  boxShadow: "inset 0 2px 4px rgba(214, 51, 108, 0.08)",
  color: romanticPalette.text,
};

const actionButtonStyle: CSSProperties = {
  padding: "12px 18px",
  borderRadius: "999px",
  border: "none",
  fontWeight: 700,
  cursor: "pointer",
  transition: "transform 0.2s ease",
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
