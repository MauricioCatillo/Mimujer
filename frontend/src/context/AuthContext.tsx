import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setAuthCredentials } from '../api/client';

type Credentials = {
  username: string;
  password: string;
};

type AuthContextValue = {
  credentials: Credentials | null;
  login: (username: string, password: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = 'romantic-album-auth';

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [credentials, setCredentials] = useState<Credentials | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Credentials;
        setCredentials(parsed);
        setAuthCredentials(parsed.username, parsed.password);
      } catch (error) {
        console.error('Failed to parse stored credentials', error);
      }
    }
  }, []);

  const login = useCallback((username: string, password: string) => {
    const creds = { username, password };
    setCredentials(creds);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(creds));
    setAuthCredentials(username, password);
  }, []);

  const logout = useCallback(() => {
    setCredentials(null);
    localStorage.removeItem(STORAGE_KEY);
    setAuthCredentials();
  }, []);

  const value = useMemo(() => ({ credentials, login, logout }), [credentials, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
