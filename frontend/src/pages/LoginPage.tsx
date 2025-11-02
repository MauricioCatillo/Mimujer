import axios from "axios";
import { FormEvent, useState } from "react";
import { useNavigate } from "../modules/router/SimpleRouter";
import { useAuth } from "../modules/auth/AuthProvider";
import "./LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("amor@mimujer.local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? "Credenciales inválidas");
      } else {
        const message = err instanceof Error ? err.message : "No pudimos entrar";
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-hero">
      <div className="login-hero__card romantic-card">
        <h1>Portal de amor</h1>
        <p>Ingresa tu clave secreta para revivir cada recuerdo.</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Correo romántico
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
            />
          </label>
          {error && <p className="login-form__error">{error}</p>}
          <button className="romantic-button" type="submit" disabled={loading}>
            {loading ? "Cargando..." : "Entrar"}
          </button>
        </form>
        <small>Tip: la contraseña inicial es "nuestrosecreto".</small>
      </div>
    </div>
  );
};

export default LoginPage;
