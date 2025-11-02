import apiClient, { uploadClient } from './client';
import type { CalendarEvent, Reminder, PhotoItem, WebExperience } from './types';

export const fetchCalendarEvents = async (): Promise<CalendarEvent[]> => {
  const { data } = await apiClient.get<CalendarEvent[]>('/api/calendar');
  return data;
};

export const createCalendarEvent = async (payload: {
  title: string;
  eventDate: string;
  description?: string;
}): Promise<CalendarEvent> => {
  const { data } = await apiClient.post<CalendarEvent>('/api/calendar', payload);
  return data;
};

export const deleteCalendarEvent = async (id: string) => {
  await apiClient.delete(`/api/calendar/${id}`);
};

export const fetchReminders = async (): Promise<Reminder[]> => {
  const { data } = await apiClient.get<Reminder[]>('/api/reminders');
  return data;
};

export const createReminder = async (payload: {
  title: string;
  note?: string;
  dueDate: string;
}): Promise<Reminder> => {
  const { data } = await apiClient.post<Reminder>('/api/reminders', payload);
  return data;
};

export const deleteReminder = async (id: string) => {
  await apiClient.delete(`/api/reminders/${id}`);
};

export const fetchPhotos = async (): Promise<PhotoItem[]> => {
  const { data } = await apiClient.get<PhotoItem[]>('/api/photos');
  return data;
};

export const uploadPhoto = async (payload: {
  title?: string;
  description?: string;
  file: File;
}): Promise<PhotoItem> => {
  const form = new FormData();
  form.append('photo', payload.file);
  if (payload.title) form.append('title', payload.title);
  if (payload.description) form.append('description', payload.description);
  const { data } = await uploadClient.post<PhotoItem>('/api/photos', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

export const deletePhoto = async (id: string) => {
  await apiClient.delete(`/api/photos/${id}`);
};

export const fetchWebExperiences = async (): Promise<WebExperience[]> => {
  const { data } = await apiClient.get<WebExperience[]>('/api/websites');
  return data;
};

export const uploadWebExperience = async (payload: {
  title: string;
  description?: string;
  archive: File;
  previewImage?: File;
}): Promise<WebExperience> => {
  const form = new FormData();
  form.append('title', payload.title);
  if (payload.description) form.append('description', payload.description);
  form.append('siteArchive', payload.archive);
  if (payload.previewImage) form.append('previewImage', payload.previewImage);
  const { data } = await uploadClient.post<WebExperience>('/api/websites', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

export const deleteWebExperience = async (id: string) => {
  await apiClient.delete(`/api/websites/${id}`);
};
