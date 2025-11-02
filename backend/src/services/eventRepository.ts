import { randomUUID } from "crypto";
import { getDatabase } from "./database.js";
import { CalendarEvent, ReminderConfig } from "../types.js";

export interface EventInput {
  title: string;
  start: string;
  end: string;
  notes: string;
  tag: string;
  reminder?: ReminderConfig;
}

const toModel = (row: any): CalendarEvent => {
  const reminder =
    row.reminder_method && row.reminder_minutes
      ? {
          method: row.reminder_method,
          minutesBefore: row.reminder_minutes,
        }
      : undefined;

  return {
    id: row.id,
    title: row.title,
    start: row.start,
    end: row.end,
    notes: row.notes,
    tag: row.tag,
    reminder,
  };
};

export class EventRepository {
  static list(): CalendarEvent[] {
    const db = getDatabase();
    const rows = db
      .prepare(
        `SELECT id, title, start, end, notes, tag, reminder_method, reminder_minutes
         FROM events ORDER BY datetime(start) ASC`,
      )
      .all();

    return rows.map(toModel);
  }

  static find(id: string): CalendarEvent | undefined {
    const db = getDatabase();
    const row = db
      .prepare(
        `SELECT id, title, start, end, notes, tag, reminder_method, reminder_minutes
         FROM events WHERE id = ?`,
      )
      .get(id);

    return row ? toModel(row) : undefined;
  }

  static create(input: EventInput): CalendarEvent {
    const id = randomUUID();
    const now = new Date().toISOString();
    const db = getDatabase();

    db.prepare(
      `INSERT INTO events (
        id, title, start, end, notes, tag, reminder_method, reminder_minutes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      id,
      input.title,
      input.start,
      input.end,
      input.notes,
      input.tag,
      input.reminder?.method ?? null,
      input.reminder?.minutesBefore ?? null,
      now,
      now,
    );

    return this.find(id)!;
  }

  static update(id: string, input: EventInput): CalendarEvent {
    const db = getDatabase();
    const now = new Date().toISOString();

    db.prepare(
      `UPDATE events SET
        title = ?,
        start = ?,
        end = ?,
        notes = ?,
        tag = ?,
        reminder_method = ?,
        reminder_minutes = ?,
        updated_at = ?
      WHERE id = ?`,
    ).run(
      input.title,
      input.start,
      input.end,
      input.notes,
      input.tag,
      input.reminder?.method ?? null,
      input.reminder?.minutesBefore ?? null,
      now,
      id,
    );

    return this.find(id)!;
  }

  static delete(id: string): void {
    const db = getDatabase();
    db.prepare(`DELETE FROM events WHERE id = ?`).run(id);
  }
}
