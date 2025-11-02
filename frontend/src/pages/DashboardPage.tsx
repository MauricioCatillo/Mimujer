import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import "./DashboardPage.css";

interface DashboardCounts {
  events: number;
  photos: number;
  projects: number;
  upcoming: string | null;
}

const fetchDashboard = async (): Promise<DashboardCounts> => {
  const [eventsRes, photosRes, projectsRes] = await Promise.all([
    api.get("events"),
    api.get("photos"),
    api.get("projects"),
  ]);

  const events = eventsRes.data as Array<{ title: string; start: string }>;
  const upcoming = events
    .filter((event) => new Date(event.start) > new Date())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0];

  return {
    events: events.length,
    photos: (photosRes.data as any[]).length,
    projects: (projectsRes.data as any[]).length,
    upcoming: upcoming ? `${upcoming.title} · ${new Date(upcoming.start).toLocaleString("es-ES")}` : null,
  };
};

const DashboardPage = () => {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: fetchDashboard });

  return (
    <div className="dashboard-grid">
      <section className="dashboard-card romantic-card">
        <h2 className="romantic-section-title">Bienvenida al refugio</h2>
        <p>
          Aquí guardamos cada cita, sorpresa y proyecto que construimos juntxs. Explora el calendario,
          revive fotografías o visita los mini sitios que celebran nuestra historia.
        </p>
      </section>
      <section className="dashboard-stats romantic-card">
        <h3>Resumen</h3>
        <div className="dashboard-stats__items">
          <article>
            <span>{isLoading ? "…" : data?.events ?? 0}</span>
            <p>Eventos agendados</p>
          </article>
          <article>
            <span>{isLoading ? "…" : data?.photos ?? 0}</span>
            <p>Fotografías eternas</p>
          </article>
          <article>
            <span>{isLoading ? "…" : data?.projects ?? 0}</span>
            <p>Mini sitios románticos</p>
          </article>
        </div>
        <div className="dashboard-stats__upcoming">
          <h4>Próximo evento</h4>
          <p>{data?.upcoming ?? "Aún no hay nuevas sorpresas"}</p>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
