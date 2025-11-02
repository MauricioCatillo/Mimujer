import { ReactNode, useEffect, useState } from "react";
import { NavLink, useLocation } from "../../modules/router/SimpleRouter";
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

const AppLayout = ({ children }: AppLayoutProps) => {
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const toggleMenu = () => setIsMenuOpen((current) => !current);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="app-shell">
      <aside className={`app-shell__sidebar${isMenuOpen ? " is-open" : ""}`}>
        <div className="app-shell__brand">
          <span className="app-shell__brand-heart" aria-hidden="true">
            ❤
          </span>
          <div>
            <h1>Mi Mujer</h1>
            <p>Recuerdos eternos</p>
          </div>
          <button
            type="button"
            className="app-shell__menu-toggle"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-controls="app-shell-navigation"
          >
            {isMenuOpen ? "Cerrar" : "Menú"}
          </button>
        </div>
        <nav
          id="app-shell-navigation"
          className={`app-shell__nav${isMenuOpen ? " is-open" : ""}`}
          aria-label="Navegación principal"
        >
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
      <div
        className={`app-shell__backdrop${isMenuOpen ? " is-visible" : ""}`}
        role="presentation"
        onClick={closeMenu}
      />
    </div>
  );
};

export default AppLayout;
