import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../modules/auth/AuthProvider";
import "./AppLayout.css";

const navItems = [
  { path: "/", label: "Inicio" },
  { path: "/calendario", label: "Calendario" },
  { path: "/album", label: "Álbum" },
  { path: "/proyectos", label: "Mini sitios" },
  { path: "/recordatorios", label: "Recordatorios" },
];

const AppLayout = () => {
  const { email, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="app-shell__sidebar">
        <div className="app-shell__brand">
          <span className="app-shell__brand-heart">❤</span>
          <div>
            <h1>Mi Mujer</h1>
            <p>Recuerdos eternos</p>
          </div>
        </div>
        <nav className="app-shell__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                isActive ? "app-shell__nav-link is-active" : "app-shell__nav-link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="app-shell__footer">
          <p className="app-shell__user">{email}</p>
          <button className="romantic-button" onClick={logout} type="button">
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="app-shell__content">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
