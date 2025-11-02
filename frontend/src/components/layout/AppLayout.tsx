import { ReactNode } from "react";
import { NavLink } from "../../modules/router/SimpleRouter";
import "./AppLayout.css";

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: "/", label: "Inicio" },
  { path: "/calendario", label: "Calendario" },
  { path: "/album", label: "Álbum" },
  { path: "/proyectos", label: "Mini sitios" },
  { path: "/recordatorios", label: "Recordatorios" },
];

const AppLayout = ({ children }: AppLayoutProps) => (
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
        <p className="app-shell__user">Hecho con amor para ti 💖</p>
      </div>
    </aside>
    <main className="app-shell__content">{children}</main>
  </div>
);

export default AppLayout;
