export interface CalendarEvent {
  id: string;
  title: string;
  eventDate: string;
  description?: string;
}

export interface Reminder {
  id: string;
  title: string;
  note?: string;
  dueDate: string;
}

export interface PhotoItem {
  id: string;
  title?: string;
  description?: string;
  url: string;
  createdAt: string;
}

export interface WebExperience {
  id: string;
  title: string;
  description?: string;
  siteUrl: string;
  previewImageUrl: string | null;
}
