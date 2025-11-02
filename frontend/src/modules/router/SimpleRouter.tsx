import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";

interface NavigateOptions {
  replace?: boolean;
}

interface RouterContextValue {
  path: string;
  navigate: (to: string, options?: NavigateOptions) => void;
}

const RouterContext = createContext<RouterContextValue | undefined>(undefined);

const normalizePath = (to: string) => {
  if (!to) {
    return "/";
  }
  return to.startsWith("/") ? to : `/${to}`;
};

export const BrowserRouter = ({ children }: { children: ReactNode }) => {
  const [path, setPath] = useState<string>(() => {
    if (typeof window === "undefined") {
      return "/";
    }
    return window.location.pathname || "/";
  });

  const navigate = useCallback((to: string, options?: NavigateOptions) => {
    const target = normalizePath(to);

    if (typeof window === "undefined") {
      setPath(target);
      return;
    }

    if (options?.replace) {
      window.history.replaceState(null, "", target);
    } else {
      window.history.pushState(null, "", target);
    }
    setPath(target);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return () => {};
    }

    const handler = () => {
      setPath(window.location.pathname || "/");
    };

    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  const value = useMemo(() => ({ path, navigate }), [path, navigate]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
};

const useRouterContext = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error("useRouterContext debe usarse dentro de BrowserRouter");
  }
  return context;
};

export const useRouter = () => useRouterContext();

export const useNavigate = () => useRouterContext().navigate;

export const useLocation = () => {
  const { path } = useRouterContext();
  return { pathname: path };
};

interface NavLinkProps {
  to: string;
  children: ReactNode;
  end?: boolean;
  className?: string | ((params: { isActive: boolean }) => string | undefined);
}

export const NavLink = ({ to, children, end = false, className }: NavLinkProps) => {
  const { path, navigate } = useRouterContext();
  const target = normalizePath(to);

  const isActive = useMemo(() => {
    if (end) {
      return path === target;
    }
    if (target === "/") {
      return path === "/";
    }
    return path === target || path.startsWith(`${target}/`);
  }, [end, path, target]);

  const computedClassName = typeof className === "function" ? className({ isActive }) : className;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    navigate(target);
  };

  return (
    <a href={target} className={computedClassName} onClick={handleClick} aria-current={isActive ? "page" : undefined}>
      {children}
    </a>
  );
};

export const Navigate = ({ to, replace = false }: { to: string; replace?: boolean }) => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(to, { replace });
  }, [navigate, replace, to]);

  return null;
};
