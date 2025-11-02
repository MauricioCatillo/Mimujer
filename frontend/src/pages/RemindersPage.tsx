import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import "./RemindersPage.css";

interface ReminderLog {
  id: number;
  eventId: string;
  channel: "email" | "push";
  sentAt: string;
  status: "sent" | "skipped" | "failed";
  details?: string;
}

const RemindersPage = () => {
  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ["reminders", "log"],
    queryFn: async () => {
      const { data } = await api.get<ReminderLog[]>("reminders/log");
      return data;
    },
    refetchInterval: 60_000,
  });

  return (
    <section className="reminders romantic-card">
      <header>
        <h2 className="romantic-section-title">Historial de recordatorios</h2>
        <p>
          {isLoading
            ? "Revisando campanitas de amor…"
            : `Últimos ${reminders.length} recordatorios enviados o pendientes`}
        </p>
      </header>
      <div className="reminders-table-wrapper">
        <table className="reminders-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Canal</th>
              <th>Estado</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {reminders.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.sentAt).toLocaleString("es-ES")}</td>
                <td>{log.channel === "email" ? "Correo" : "Push"}</td>
                <td>
                  <span className={`reminders-pill reminders-pill--${log.status}`}>
                    {log.status === "sent" && "Enviado"}
                    {log.status === "skipped" && "Omitido"}
                    {log.status === "failed" && "Fallido"}
                  </span>
                </td>
                <td>{log.details ?? "—"}</td>
              </tr>
            ))}
            {reminders.length === 0 && !isLoading && (
              <tr>
                <td colSpan={4} className="reminders-empty">
                  Aún no se registran recordatorios. Programa uno desde el calendario.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default RemindersPage;
