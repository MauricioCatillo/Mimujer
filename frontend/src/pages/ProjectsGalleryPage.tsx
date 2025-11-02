import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";
import "./ProjectsGalleryPage.css";

interface Project {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
}

const ProjectsGalleryPage = () => {
  const queryClient = useQueryClient();
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await api.get<Project[]>("projects");
      return data;
    },
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const createMutation = useMutation({
    mutationFn: async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      await api.post("projects", {
        title,
        description,
        url,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setTitle("");
      setDescription("");
      setUrl("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`projects/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });

  return (
    <div className="projects-layout">
      <section className="projects-form romantic-card">
        <h2 className="romantic-section-title">Nuevo mini sitio</h2>
        <form className="projects-form__fields" onSubmit={(event) => createMutation.mutate(event)}>
          <label>
            Título
            <input value={title} onChange={(event) => setTitle(event.target.value)} required />
          </label>
          <label>
            Descripción
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="¿Qué historia cuenta este proyecto?"
            />
          </label>
          <label>
            URL del mini sitio
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              required
              type="url"
              placeholder="https://"
            />
          </label>
          {createMutation.isError && (
            <p className="projects-form__error">{(createMutation.error as Error).message}</p>
          )}
          <button className="romantic-button" type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Guardando…" : "Añadir a la galería"}
          </button>
        </form>
      </section>

      <section className="projects-gallery">
        <header>
          <h2 className="romantic-section-title">Galería de mini sitios</h2>
          <p>{projects.length === 0 ? "Aún no hay proyectos" : `${projects.length} proyectos compartidos`}</p>
        </header>
        <div className="projects-grid">
          {projects.map((project) => (
            <article key={project.id} className="projects-card romantic-card">
              <div className="projects-card__preview">
                {project.thumbnailUrl ? (
                  <img src={project.thumbnailUrl} alt={project.title} />
                ) : (
                  <iframe title={project.title} src={project.url} sandbox="allow-same-origin allow-scripts" />
                )}
              </div>
              <div className="projects-card__body">
                <h3>{project.title}</h3>
                {project.description && <p>{project.description}</p>}
                <a href={project.url} target="_blank" rel="noreferrer" className="projects-card__link">
                  Visitar sitio
                </a>
                <button
                  type="button"
                  className="projects-card__delete"
                  onClick={() => deleteMutation.mutate(project.id)}
                  disabled={deleteMutation.isPending}
                >
                  Eliminar
                </button>
              </div>
            </article>
          ))}
          {projects.length === 0 && <p className="projects-empty">Cuando publiques el primero aparecerá aquí.</p>}
        </div>
      </section>
    </div>
  );
};

export default ProjectsGalleryPage;
