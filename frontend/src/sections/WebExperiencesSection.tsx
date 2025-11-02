import { FormEvent, useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { deleteWebExperience, fetchWebExperiences, uploadWebExperience } from '../api';
import type { WebExperience } from '../api/types';
import { API_BASE_URL } from '../api/client';

const Section = styled.section`
  display: grid;
  gap: 2rem;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: clamp(2rem, 3vw, 2.5rem);
  color: #8f1d3e;
`;

const SectionDescription = styled.p`
  margin: 0;
  color: rgba(74, 22, 41, 0.75);
  max-width: 720px;
`;

const GalleryCard = styled.div`
  background: rgba(255, 255, 255, 0.92);
  border-radius: 32px;
  padding: clamp(1.5rem, 3vw, 2.4rem);
  box-shadow: 0 16px 46px rgba(143, 29, 62, 0.13);
  display: grid;
  gap: 2rem;
`;

const UploadForm = styled.form`
  display: grid;
  gap: 1.4rem;
  background: rgba(255, 240, 246, 0.65);
  padding: 1.6rem;
  border-radius: 28px;
`;

const InputGrid = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
`;

const UploadButton = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: linear-gradient(135deg, #ff4d6d, #ff85a1);
  color: white;
  padding: 0.75rem 1.4rem;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
  justify-self: start;
`;

const ExperienceGrid = styled.div`
  display: grid;
  gap: 1.4rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
`;

const ExperienceCard = styled.div`
  background: rgba(255, 255, 255, 0.96);
  border-radius: 26px;
  overflow: hidden;
  box-shadow: 0 18px 45px rgba(143, 29, 62, 0.15);
  display: grid;
  grid-template-rows: 220px auto;
`;

const ExperiencePreview = styled.div`
  position: relative;
  background: #ffe5ec;
`; 

const PreviewFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  background: white;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ExperienceInfo = styled.div`
  padding: 1.4rem;
  display: grid;
  gap: 0.6rem;
`;

const ExperienceTitle = styled.h3`
  margin: 0;
  color: #8f1d3e;
`;

const ExperienceDescription = styled.p`
  margin: 0;
  color: rgba(74, 22, 41, 0.7);
  font-size: 0.95rem;
`;

const CardActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

const PreviewLink = styled.a`
  color: #ff4d6d;
  font-weight: 600;
  text-decoration: none;
`;

const DeleteButton = styled.button`
  border: none;
  background: rgba(255, 255, 255, 0.85);
  color: #ff4d6d;
  border-radius: 999px;
  padding: 0.4rem 0.9rem;
  font-weight: 600;
  cursor: pointer;
`;

const InfoNote = styled.span`
  font-size: 0.85rem;
  color: rgba(74, 22, 41, 0.6);
`;

type UploadState = {
  title: string;
  description: string;
  archive: File | null;
  previewImage: File | null;
};

const WebExperiencesSection = () => {
  const [experiences, setExperiences] = useState<WebExperience[]>([]);
  const [uploadState, setUploadState] = useState<UploadState>({
    title: '',
    description: '',
    archive: null,
    previewImage: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchWebExperiences();
        setExperiences(data);
      } catch (err) {
        console.error(err);
        setError('No logramos cargar la galería de experiencias.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const sortedExperiences = useMemo(
    () => [...experiences].sort((a, b) => a.title.localeCompare(b.title, 'es')), 
    [experiences]
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!uploadState.archive) {
      setError('Sube un archivo .zip o .html con tu detalle digital.');
      return;
    }
    setUploading(true);
    try {
      const created = await uploadWebExperience({
        title: uploadState.title,
        description: uploadState.description,
        archive: uploadState.archive,
        previewImage: uploadState.previewImage || undefined
      });
      setExperiences((prev) => [created, ...prev]);
      setUploadState({ title: '', description: '', archive: null, previewImage: null });
      (document.getElementById('experienceArchiveInput') as HTMLInputElement | null)?.value = '';
      (document.getElementById('experiencePreviewInput') as HTMLInputElement | null)?.value = '';
      setError(null);
    } catch (err) {
      console.error(err);
      setError('No se pudo guardar la experiencia, intenta de nuevo con mucho amor.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWebExperience(id);
      setExperiences((prev) => prev.filter((experience) => experience.id !== id));
    } catch (err) {
      console.error(err);
      setError('No pudimos eliminar esa sorpresa digital.');
    }
  };

  const buildAssetUrl = (path: string) => {
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path}`;
  };

  return (
    <Section id="experiences-section">
      <div>
        <SectionTitle>Showroom de sorpresas digitales</SectionTitle>
        <SectionDescription>
          Comparte las páginas especiales que diseñes para tu prometida. Podrá ver un adelanto romántico antes de abrir cada
          experiencia en pantalla completa.
        </SectionDescription>
      </div>

      <GalleryCard>
        <UploadForm onSubmit={handleSubmit}>
          <InputGrid>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <label htmlFor="experienceTitle">Titulo</label>
              <input
                id="experienceTitle"
                placeholder="Un portal de amor"
                value={uploadState.title}
                onChange={(event) => setUploadState((prev) => ({ ...prev, title: event.target.value }))}
              />
            </div>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <label htmlFor="experienceDescription">Mensaje</label>
              <textarea
                id="experienceDescription"
                rows={3}
                placeholder="Un paseo interactivo por nuestra historia"
                value={uploadState.description}
                onChange={(event) => setUploadState((prev) => ({ ...prev, description: event.target.value }))}
              />
            </div>
          </InputGrid>

          <UploadButton htmlFor="experienceArchiveInput">
            <span role="img" aria-label="sparkles">🌟</span>
            Subir sitio (.zip o .html)
            <input
              id="experienceArchiveInput"
              type="file"
              accept=".zip,.html,.htm"
              hidden
              onChange={(event) => setUploadState((prev) => ({ ...prev, archive: event.target.files?.[0] ?? null }))}
            />
          </UploadButton>

          <UploadButton htmlFor="experiencePreviewInput" style={{ background: 'rgba(255, 255, 255, 0.85)', color: '#ff4d6d' }}>
            <span role="img" aria-label="art">🎨</span>
            Imagen opcional de portada
            <input
              id="experiencePreviewInput"
              type="file"
              accept="image/*"
              hidden
              onChange={(event) => setUploadState((prev) => ({ ...prev, previewImage: event.target.files?.[0] ?? null }))}
            />
          </UploadButton>

          <button className="primary" type="submit" disabled={uploading}>
            {uploading ? 'Guardando sorpresa...' : 'Guardar experiencia'}
          </button>
          <InfoNote>Los archivos permanecen seguros para que ella pueda verlos siempre que vuelva.</InfoNote>
          {error && <p style={{ margin: 0, color: '#d62839' }}>{error}</p>}
        </UploadForm>

        {loading ? (
          <p>Cargando experiencias llenas de magia...</p>
        ) : sortedExperiences.length === 0 ? (
          <p style={{ margin: 0, color: 'rgba(74, 22, 41, 0.6)' }}>
            Aún no hay sorpresas. Sube tu primera página romántica y deja que la curiosidad la conquiste.
          </p>
        ) : (
          <ExperienceGrid>
            {sortedExperiences.map((experience) => {
              const previewUrl = experience.previewImageUrl ? buildAssetUrl(experience.previewImageUrl) : null;
              const siteUrl = buildAssetUrl(experience.siteUrl);
              return (
                <ExperienceCard key={experience.id}>
                  <ExperiencePreview>
                    {previewUrl ? (
                      <PreviewImage src={previewUrl} alt={`Vista previa de ${experience.title}`} />
                    ) : (
                      <PreviewFrame src={siteUrl} title={experience.title} sandbox="allow-same-origin allow-scripts" />
                    )}
                  </ExperiencePreview>
                  <ExperienceInfo>
                    <ExperienceTitle>{experience.title}</ExperienceTitle>
                    {experience.description && <ExperienceDescription>{experience.description}</ExperienceDescription>}
                    <CardActions>
                      <PreviewLink href={siteUrl} target="_blank" rel="noreferrer">
                        Ver a pantalla completa ↗
                      </PreviewLink>
                      <DeleteButton type="button" onClick={() => handleDelete(experience.id)}>
                        Borrar
                      </DeleteButton>
                    </CardActions>
                  </ExperienceInfo>
                </ExperienceCard>
              );
            })}
          </ExperienceGrid>
        )}
      </GalleryCard>
    </Section>
  );
};

export default WebExperiencesSection;
