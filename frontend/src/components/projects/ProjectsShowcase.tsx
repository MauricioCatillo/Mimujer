import { useEffect, useMemo, useState } from 'react';
import { Project } from '../../hooks/useProjects';
import './ProjectsShowcase.css';

type ProjectsShowcaseProps = {
  projects: Project[];
  loading: boolean;
  error: string | null;
  onDelete?: (projectId: string) => void;
};

type ModalState = {
  project: Project;
  isOpen: boolean;
};

const imagePlaceholder =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="#ff8fb1"/><stop offset="100%" stop-color="#6044ff"/></linearGradient></defs><rect width="320" height="200" fill="url(#g)"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Inter, sans-serif" font-size="20">Sin miniatura</text></svg>`);

const sanitizeUrl = (value: string) => {
  try {
    const url = new URL(value);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url.toString();
    }
  } catch {
    // ignore parsing errors
  }

  return '';
};

export default function ProjectsShowcase({ projects, loading, error, onDelete }: ProjectsShowcaseProps) {
  const [modal, setModal] = useState<ModalState | null>(null);
  const previewUrl = modal ? sanitizeUrl(modal.project.url) : '';
  const encodedPreviewUrl = previewUrl ? encodeURI(previewUrl) : '#';
  const previewLink = previewUrl
    ? `<a href=\\"${encodedPreviewUrl}\\" target=\\"_blank\\" rel=\\"noopener\\">abre el proyecto</a>`
    : '<span>Revisa la URL para abrir el sitio.</span>';

  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [projects]
  );

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setModal(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const openModal = (project: Project) => {
    setModal({ project, isOpen: true });
  };

  const closeModal = () => setModal(null);

  return (
    <section className="projects-showcase">
      <header className="projects-showcase__header">
        <div>
          <h2>Galería de proyectos románticos</h2>
          <p>Explora cada obra con una previsualización segura antes de abrirla en una nueva pestaña.</p>
        </div>
        <span className="projects-showcase__count">{sortedProjects.length} proyectos</span>
      </header>

      {loading && <p className="projects-showcase__status">Cargando proyectos…</p>}
      {error && <p className="projects-showcase__status projects-showcase__status--error">{error}</p>}

      <div className="projects-showcase__grid">
        {sortedProjects.map((project) => {
          const safeUrl = sanitizeUrl(project.url);
          return (
            <article
              key={project.id}
              className="projects-showcase__card"
              onClick={() => (safeUrl ? openModal(project) : undefined)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  if (safeUrl) {
                    openModal(project);
                  }
                }
              }}
            >
              <div className="projects-showcase__thumbnail">
                <img src={project.thumbnailPath || imagePlaceholder} alt={`Miniatura de ${project.name}`} loading="lazy" />
                <div className="projects-showcase__thumbnail-overlay">
                  <span>Ver vista previa</span>
                </div>
              </div>
              <div className="projects-showcase__content">
                <h3>{project.name}</h3>
                {project.description && <p className="projects-showcase__description">{project.description}</p>}
                {project.romanticPurpose && (
                  <p className="projects-showcase__romance" aria-label="Propósito romántico">
                    ❤️ {project.romanticPurpose}
                  </p>
                )}
              </div>
              <footer className="projects-showcase__footer" onClick={(event) => event.stopPropagation()}>
                <a
                  className="projects-showcase__action"
                  href={safeUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir en nueva pestaña
                </a>
                {onDelete && (
                  <button
                    type="button"
                    className="projects-showcase__delete"
                    onClick={() => onDelete(project.id)}
                  >
                    Eliminar
                  </button>
                )}
              </footer>
            </article>
          );
        })}
      </div>

      {modal?.isOpen && (
        <div className="projects-showcase__modal" role="dialog" aria-modal="true">
          <div className="projects-showcase__modal-backdrop" onClick={closeModal} />
          <div className="projects-showcase__modal-content">
            <header className="projects-showcase__modal-header">
              <div>
                <h3>{modal.project.name}</h3>
                {modal.project.romanticPurpose && <small>❤️ {modal.project.romanticPurpose}</small>}
              </div>
              <button className="projects-showcase__close" type="button" onClick={closeModal}>
                Cerrar
              </button>
            </header>
            <div className="projects-showcase__modal-body">
              <iframe
                title={`Vista previa de ${modal.project.name}`}
                src={previewUrl || 'about:blank'}
                srcDoc={`<!DOCTYPE html><html lang=\"es\"><head><meta charset=\"utf-8\"/><style>body{margin:0;font-family:Inter,system-ui;background:#0b0b0f;color:#fefefe;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center;padding:1rem;}a{color:#ff8fb1;text-decoration:none;font-weight:600;}span{color:#ffb8d4;font-weight:600;}</style></head><body><main><h2>Preparando vista previa…</h2><p>Si no carga automáticamente, ${previewLink}.</p></main></body></html>`}
                sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            </div>
            <footer className="projects-showcase__modal-footer">
              <a href={previewUrl || '#'} target="_blank" rel="noopener noreferrer">
                Ir al sitio definitivo
              </a>
            </footer>
          </div>
        </div>
      )}
    </section>
  );
}
