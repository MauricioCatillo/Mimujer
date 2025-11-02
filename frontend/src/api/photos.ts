import client from './client';
import { Photo } from '../types';

type UploadInput = {
  file: File;
  note?: string;
  onProgress?: (progress: number | null) => void;
};

export const fetchPhotos = async (): Promise<Photo[]> => {
  const response = await client.get<Photo[]>('/photos');
  return response.data.map((photo) => ({
    ...photo,
    url: photo.url.startsWith('http')
      ? photo.url
      : `${client.defaults.baseURL?.replace(/\/$/, '')}${photo.url.startsWith('/') ? '' : '/'}${photo.url}`,
  }));
};

export const uploadPhoto = async ({ file, note, onProgress }: UploadInput): Promise<Photo> => {
  const formData = new FormData();
  formData.append('photo', file);
  if (note) {
    formData.append('note', note);
  }

  const response = await client.post<Photo>('/photos', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (event) => {
      if (!onProgress) return;
      if (!event.total) {
        onProgress(null);
        return;
      }
      const percent = Math.round((event.loaded / event.total) * 100);
      onProgress(percent);
    },
  });

  const photo = response.data;
  return {
    ...photo,
    url: photo.url.startsWith('http')
      ? photo.url
      : `${client.defaults.baseURL?.replace(/\/$/, '')}${photo.url.startsWith('/') ? '' : '/'}${photo.url}`,
  };
};

export const deletePhoto = async (id: number): Promise<void> => {
  await client.delete(`/photos/${id}`);
};

export const validateAuth = async (username: string, password: string) => {
  const encoded = btoa(`${username}:${password}`);
  await client.get('/health', {
    headers: {
      Authorization: `Basic ${encoded}`,
    },
  });
};
