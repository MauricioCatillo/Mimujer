import { FormEvent, useMemo, useState } from 'react';
import ProjectsShowcase from './components/projects/ProjectsShowcase';
import { useProjects } from './hooks/useProjects';
import './styles/app.css';

const initialFormState = {
  name: '',
  description: '',
  url: '',
  romanticPurpose: '',
  autoGenerateThumbnail: true,
  thumbnailFile: null as File | null
};

const DEFAULT_TOKEN = import.meta.env.VITE_FORM_TOKEN as string | undefined;

export default function App() {
  const [form, setForm] = useState(initialFormState);
  const [tokenInput, setTokenInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(!DEFAULT_TOKEN);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const tokenForHook = useMemo(() => (isUnlocked ? tokenInput || DEFAULT_TOKEN : undefined), [isUnlocked, tokenInput]);

  const { projects, loading, error, createProject, deleteProject } = useProjects(tokenForHook);

  const resetForm = () => {
    setForm(initialFormState);
    setFeedback('Proyecto cargado con amor.');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isUnlocked && DEFAULT_TOKEN) {
      setFeedback('Debes desbloquear el formulario con el token romántico.');
      return;
    }
    if (!form.name || !form.url) {
      setFeedback('Nombre y URL son obligatorios.');
      return;
    }

    setSubmitting(true);
    try {
      await createProject({
        name: form.name,
        description: form.description,
        url: form.url,
        romanticPurpose: form.romanticPurpose,
        autoGenerateThumbnail: form.autoGenerateThumbnail,
        thumbnailFile: form.thumbnailFile
      });
      resetForm();
    } catch (submissionError) {
      console.error(submissionError);
      setFeedback('No se pudo guardar el proyecto. Revisa el token y vuelve a intentarlo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnlock = () => {
    if (!tokenInput && DEFAULT_TOKEN) {
      setFeedback('Introduce el token romántico proporcionado.');
      return;
    }
    setIsUnlocked(true);
    setFeedback('Formulario desbloqueado. ¡Manos al corazón!');
    setTimeout(() => setFeedback(null), 2500);
  };

  return (
    <main className="app-shell">
      <header className="app-shell__hero">
        <h1>Mimujer — Showcase de proyectos dedicados al amor</h1>
        <p>
          Una colección viva de experiencias digitales creadas para cautivar. Gestiona las propuestas desde el formulario
          protegido y deja que la galería haga el resto.
        </p>
      </header>

      <section className="app-shell__form-section">
        <header>
          <h2>Cargar un nuevo proyecto</h2>
          <p>Necesitas un token romántico para mantener la magia a salvo.</p>
        </header>

        {!isUnlocked && DEFAULT_TOKEN && (
          <div className="app-shell__unlock">
            <label htmlFor="token">Token romántico</label>
            <div className="app-shell__unlock-inputs">
              <input
                id="token"
                type="password"
                value={tokenInput}
                onChange={(event) => setTokenInput(event.target.value)}
                placeholder="Introduce el secreto"
              />
              <button type="button" onClick={handleUnlock}>
                Desbloquear
              </button>
            </div>
          </div>
        )}

        <form className="app-shell__form" onSubmit={handleSubmit}>
          <div className="app-shell__form-grid">
            <label>
              Nombre del proyecto
              <input
                name="name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                required
                placeholder="Carta interactiva, playlist, sorpresa virtual…"
              />
            </label>

            <label>
              URL del proyecto
              <input
                name="url"
                type="url"
                value={form.url}
                onChange={(event) => setForm((prev) => ({ ...prev, url: event.target.value }))}
                required
                placeholder="https://"
              />
            </label>

            <label className="app-shell__textarea">
              Descripción
              <textarea
                name="description"
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Cuenta la historia detrás de esta dedicación."
                rows={3}
              />
            </label>

            <label className="app-shell__textarea">
              Propósito romántico
              <textarea
                name="romanticPurpose"
                value={form.romanticPurpose}
                onChange={(event) => setForm((prev) => ({ ...prev, romanticPurpose: event.target.value }))}
                placeholder="Por qué este proyecto hará latir su corazón."
                rows={2}
                required
              />
            </label>
          </div>

          <div className="app-shell__options">
            <label className="app-shell__checkbox">
              <input
                type="checkbox"
                checked={form.autoGenerateThumbnail}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    autoGenerateThumbnail: event.target.checked,
                    thumbnailFile: event.target.checked ? null : prev.thumbnailFile
                  }))
                }
              />
              Generar miniatura automáticamente
            </label>

            <label className={`app-shell__file ${form.autoGenerateThumbnail ? 'app-shell__file--disabled' : ''}`}>
              Subir miniatura manual
              <input
                type="file"
                accept="image/*"
                disabled={form.autoGenerateThumbnail}
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setForm((prev) => ({ ...prev, thumbnailFile: file }));
                }}
              />
            </label>
          </div>

          <button type="submit" disabled={submitting} className="app-shell__submit">
            {submitting ? 'Guardando…' : 'Registrar proyecto'}
          </button>
        </form>

        {feedback && <p className="app-shell__feedback">{feedback}</p>}
      </section>

      <ProjectsShowcase
        projects={projects}
        loading={loading}
        error={error}
        onDelete={isUnlocked ? deleteProject : undefined}
      />
    </main>
  );
}
