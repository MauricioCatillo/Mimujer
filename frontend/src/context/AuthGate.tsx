import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { validateAuth } from '../api/photos';
import '../styles/auth.css';

const AuthGate: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { credentials, login, logout } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validationMutation = useMutation({
    mutationFn: ({ username: user, password: pass }: { username: string; password: string }) =>
      validateAuth(user, pass),
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!username || !password) {
      setError('Por favor ingresa usuario y contraseña.');
      return;
    }
    setError(null);
    validationMutation.mutate(
      { username, password },
      {
        onSuccess: () => {
          login(username, password);
          setUsername('');
          setPassword('');
        },
        onError: () => {
          setError('Credenciales incorrectas. Inténtalo de nuevo con la clave secreta de la pareja.');
        },
      }
    );
  };

  if (credentials) {
    return (
      <div className="auth-wrapper">
        <button className="logout" onClick={logout}>
          Cerrar sesión
        </button>
        {children}
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Bienvenid@s a Nuestro Álbum</h1>
        <p>Protegemos este espacio para que sólo ustedes disfruten los recuerdos.</p>
        <label htmlFor="username">Usuario</label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={validationMutation.isPending}>
          {validationMutation.isPending ? 'Verificando...' : 'Entrar al álbum'}
        </button>
      </form>
    </div>
  );
};

export default AuthGate;
