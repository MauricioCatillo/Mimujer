import cron from "node-cron";
import nodemailer from "nodemailer";
import { getDatabase } from "./database.js";
import { env } from "../config/env.js";
import { CalendarEvent, ReminderLog, ReminderMethod } from "../types.js";

const reminderTask = "*/1 * * * *"; // every minute

type DispatchResult = {
  status: "sent" | "skipped" | "failed";
  details?: string;
};

class EmailDispatcher {
  private transporter?: nodemailer.Transporter;

  constructor() {
    if (env.smtp.host && env.smtp.user && env.smtp.pass) {
      this.transporter = nodemailer.createTransport({
        host: env.smtp.host,
        port: env.smtp.port ?? 587,
        secure: env.smtp.secure,
        auth: {
          user: env.smtp.user,
          pass: env.smtp.pass,
        },
      });
    }
  }

  async send(to: string, subject: string, html: string): Promise<DispatchResult> {
    if (!this.transporter) {
      return {
        status: "skipped",
        details: "SMTP no configurado",
      };
    }

    try {
      await this.transporter.sendMail({
        from: env.smtp.from,
        to,
        subject,
        html,
      });
      return { status: "sent" };
    } catch (error) {
      return {
        status: "failed",
        details: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }
}

const emailDispatcher = new EmailDispatcher();

const getReminderCandidates = (): CalendarEvent[] => {
  const db = getDatabase();
  const now = new Date();
  const windowStart = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
  const windowEnd = new Date(now.getTime() + 65 * 1000).toISOString();

  const rows = db
    .prepare(
      `SELECT id, title, start, end, notes, tag, reminder_method, reminder_minutes
       FROM events
       WHERE reminder_method IS NOT NULL
         AND reminder_minutes IS NOT NULL
         AND datetime(start) BETWEEN datetime(?) AND datetime(?)`,
    )
    .all(windowStart, windowEnd);

  return rows.map((row: any) => ({
    id: row.id,
    title: row.title,
    start: row.start,
    end: row.end,
    notes: row.notes,
    tag: row.tag,
    reminder: {
      method: row.reminder_method,
      minutesBefore: row.reminder_minutes,
    },
  }));
};

const alreadyDispatched = (eventId: string, channel: ReminderMethod): boolean => {
  const db = getDatabase();
  const row = db
    .prepare(
      `SELECT 1 FROM reminder_log
       WHERE event_id = ? AND channel = ? AND sent_at >= datetime('now', '-1 day')
       LIMIT 1`,
    )
    .get(eventId, channel);

  return Boolean(row);
};

const persistLog = (eventId: string, channel: ReminderMethod, result: DispatchResult) => {
  const db = getDatabase();
  db.prepare(
    `INSERT INTO reminder_log (event_id, channel, sent_at, status, details)
     VALUES (?, ?, ?, ?, ?)`,
  ).run(eventId, channel, new Date().toISOString(), result.status, result.details ?? null);
};

const shouldTriggerReminder = (event: CalendarEvent): boolean => {
  if (!event.reminder) return false;

  const eventStart = new Date(event.start).getTime();
  const reminderTime = eventStart - event.reminder.minutesBefore * 60 * 1000;
  const now = Date.now();
  return now >= reminderTime && now <= eventStart;
};

const dispatchReminder = async (event: CalendarEvent): Promise<void> => {
  if (!event.reminder) return;
  if (alreadyDispatched(event.id, event.reminder.method)) {
    return;
  }

  let result: DispatchResult = { status: "skipped", details: "Canal no soportado" };

  if (event.reminder.method === "email") {
    const subject = `Recordatorio romántico: ${event.title}`;
    const html = `
      <h2>${event.title}</h2>
      <p>${event.notes}</p>
      <p><strong>Etiqueta:</strong> ${event.tag}</p>
      <p>Empieza el ${new Date(event.start).toLocaleString("es-ES")}</p>
    `;
    result = await emailDispatcher.send(env.initialUserEmail, subject, html);
  } else if (event.reminder.method === "push") {
    result = {
      status: "skipped",
      details: "Integración de notificaciones push pendiente",
    };
  }

  persistLog(event.id, event.reminder.method, result);
};

export class ReminderService {
  static start() {
    cron.schedule(reminderTask, async () => {
      const events = getReminderCandidates();
      for (const event of events) {
        if (shouldTriggerReminder(event)) {
          await dispatchReminder(event);
        }
      }
    });
  }

  static getLog(): ReminderLog[] {
    const db = getDatabase();
    const rows = db
      .prepare(
        `SELECT id, event_id, channel, sent_at, status, details
         FROM reminder_log ORDER BY datetime(sent_at) DESC LIMIT 100`,
      )
      .all();

    return rows.map((row: any) => ({
      id: row.id,
      eventId: row.event_id,
      channel: row.channel,
      sentAt: row.sent_at,
      status: row.status,
      details: row.details ?? undefined,
    }));
  }
}
