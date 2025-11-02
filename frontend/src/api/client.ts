import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
  withCredentials: true,
});

export const setAuthCredentials = (username?: string, password?: string) => {
  if (username && password) {
    const encoded = btoa(`${username}:${password}`);
    client.defaults.headers.common.Authorization = `Basic ${encoded}`;
  } else {
    delete client.defaults.headers.common.Authorization;
  }
};

export default client;
