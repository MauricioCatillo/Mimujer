import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import api, { setAuthToken } from "../../services/api";

interface AuthContextValue {
  token: string | null;
  email: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "mimujer.token";
const EMAIL_KEY = "mimujer.email";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedEmail = localStorage.getItem(EMAIL_KEY);

    setAuthToken(storedToken);

    if (storedToken) {
      setToken(storedToken);
    }

    if (storedEmail) {
      setEmail(storedEmail);
    }

    setLoading(false);
  }, []);

  const login = async (userEmail: string, password: string) => {
    const { data } = await api.post<{ token: string; email: string }>("/auth/login", {
      email: userEmail,
      password,
    });

    setToken(data.token);
    setEmail(data.email);
    setAuthToken(data.token);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(EMAIL_KEY, data.email);
  };

  const logout = () => {
    setToken(null);
    setEmail(null);
    setAuthToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
  };

  const value = useMemo(
    () => ({ token, email, login, logout, loading }),
    [token, email, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
