import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import CalendarPage from "./pages/CalendarPage";
import PhotoAlbumPage from "./pages/PhotoAlbumPage";
import ProjectsGalleryPage from "./pages/ProjectsGalleryPage";
import RemindersPage from "./pages/RemindersPage";
import LoginPage from "./pages/LoginPage";
import { useAuth } from "./modules/auth/AuthProvider";
import LoadingScreen from "./components/status/LoadingScreen";

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Preparando tus recuerdos" />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const RedirectIfAuthenticated = ({ children }: { children: JSX.Element }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Abriendo el portal" />;
  }

  if (token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => (
  <Routes>
    <Route
      path="/login"
      element={
        <RedirectIfAuthenticated>
          <LoginPage />
        </RedirectIfAuthenticated>
      }
    />
    <Route
      path="/"
      element={
        <RequireAuth>
          <AppLayout />
        </RequireAuth>
      }
    >
      <Route index element={<DashboardPage />} />
      <Route path="calendario" element={<CalendarPage />} />
      <Route path="album" element={<PhotoAlbumPage />} />
      <Route path="proyectos" element={<ProjectsGalleryPage />} />
      <Route path="recordatorios" element={<RemindersPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
