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
