import { useEffect, useMemo } from "react";
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import CalendarPage from "./pages/CalendarPage";
import PhotoAlbumPage from "./pages/PhotoAlbumPage";
import ProjectsGalleryPage from "./pages/ProjectsGalleryPage";
import RemindersPage from "./pages/RemindersPage";
import { useNavigate, useRouter } from "./modules/router/SimpleRouter";

const App = () => {
  const { path } = useRouter();
  const navigate = useNavigate();

  const routes = useMemo<Record<string, JSX.Element>>(
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
    if (!routes[path]) {
      navigate("/", { replace: true });
    }
  }, [navigate, path, routes]);

  const content = routes[path] ?? <DashboardPage />;

  return <AppLayout>{content}</AppLayout>;
};

export default App;
