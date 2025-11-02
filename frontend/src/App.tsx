import { useEffect, useMemo } from "react";
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import CalendarPage from "./pages/CalendarPage";
import PhotoAlbumPage from "./pages/PhotoAlbumPage";
import ProjectsGalleryPage from "./pages/ProjectsGalleryPage";
import RemindersPage from "./pages/RemindersPage";
import LoginPage from "./pages/LoginPage";
import { useAuth } from "./modules/auth/AuthProvider";
import LoadingScreen from "./components/status/LoadingScreen";
import { useNavigate, useRouter } from "./modules/router/SimpleRouter";

const App = () => {
  const { token, loading } = useAuth();
  const { path } = useRouter();
  const navigate = useNavigate();

  const privateRoutes = useMemo<Record<string, JSX.Element>>(
    () => ({
      "/": <DashboardPage />,
      "/calendario": <CalendarPage />,
      "/album": <PhotoAlbumPage />,
      "/proyectos": <ProjectsGalleryPage />,
      "/recordatorios": <RemindersPage />,
    }),
    [],
  );

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!token && path !== "/login") {
      navigate("/login", { replace: true });
      return;
    }

    if (token && path === "/login") {
      navigate("/", { replace: true });
      return;
    }

    if (token && !privateRoutes[path]) {
      navigate("/", { replace: true });
    }
  }, [loading, navigate, path, privateRoutes, token]);

  if (loading) {
    return <LoadingScreen message="Cargando momentos especiales" />;
  }

  if (!token) {
    if (path !== "/login") {
      return <LoadingScreen message="Redirigiéndote al portal de amor" />;
    }
    return <LoginPage />;
  }

  const content = privateRoutes[path] ?? <DashboardPage />;

  return <AppLayout>{content}</AppLayout>;
};

export default App;
