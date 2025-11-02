export type ReminderMethod = "email" | "push";

export interface ReminderConfig {
  method: ReminderMethod;
  minutesBefore: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  notes: string;
  tag: string;
  reminder?: ReminderConfig;
}

export interface Photo {
  id: string;
  title: string;
  description?: string;
  takenAt?: string;
  fileName: string;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderLog {
  id: number;
  eventId: string;
  channel: ReminderMethod;
  sentAt: string;
  status: "sent" | "skipped" | "failed";
  details?: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
}
