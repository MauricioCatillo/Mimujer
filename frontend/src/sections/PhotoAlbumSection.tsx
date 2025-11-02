import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { deletePhoto, fetchPhotos, uploadPhoto } from '../api';
import type { PhotoItem } from '../api/types';
import { API_BASE_URL } from '../api/client';

dayjs.locale('es');

const Section = styled.section`
  display: grid;
  gap: 2rem;
`;

const SectionHeader = styled.div`
  display: grid;
  gap: 1rem;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: clamp(2rem, 3vw, 2.5rem);
  color: #971b46;
`;

const SectionDescription = styled.p`
  margin: 0;
  color: rgba(74, 22, 41, 0.75);
  max-width: 640px;
`;

const AlbumCard = styled.div`
  background: rgba(255, 255, 255, 0.92);
  border-radius: 32px;
  padding: clamp(1.5rem, 3vw, 2.4rem);
  box-shadow: 0 16px 46px rgba(151, 27, 70, 0.12);
  display: grid;
  gap: 2rem;
`;

const UploadArea = styled.div`
  border: 2px dashed rgba(255, 77, 109, 0.35);
  border-radius: 28px;
  padding: 1.5rem;
  display: grid;
  gap: 1rem;
  background: rgba(255, 240, 246, 0.6);
`;

const UploadLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  justify-self: start;
  background: linear-gradient(135deg, #ff4d6d, #ff85a1);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
`;

const PhotoGrid = styled.div`
  display: grid;
  gap: 1.2rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
`;

const PhotoCard = styled.div`
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 14px 36px rgba(151, 27, 70, 0.16);
`;

const PhotoImage = styled.img`
  width: 100%;
  height: 260px;
  object-fit: cover;
  display: block;
`;

const PhotoOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.15) 40%, rgba(0, 0, 0, 0.75) 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1.2rem;
  color: white;
  gap: 0.4rem;
`;

const DeleteButton = styled.button`
  align-self: flex-start;
  border: none;
  background: rgba(255, 255, 255, 0.85);
  color: #ff4d6d;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
`;

const EmptyState = styled.p`
  margin: 0;
  color: rgba(74, 22, 41, 0.6);
`;

type UploadState = {
  title: string;
  description: string;
  file: File | null;
};

const PhotoAlbumSection = () => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [uploadState, setUploadState] = useState<UploadState>({ title: '', description: '', file: null });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchPhotos();
        setPhotos(data);
      } catch (err) {
        console.error(err);
        setError('No pudimos recuperar el álbum. Tu amor sigue a salvo, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const orderedPhotos = useMemo(
    () => [...photos].sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()),
    [photos]
  );

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setUploadState((prev) => ({ ...prev, file }));
  };

  const handleUpload = async (event: FormEvent) => {
    event.preventDefault();
    if (!uploadState.file) {
      setError('Selecciona una foto que capture su historia.');
      return;
    }
    setUploading(true);
    try {
      const created = await uploadPhoto({
        title: uploadState.title,
        description: uploadState.description,
        file: uploadState.file
      });
      setPhotos((prev) => [created, ...prev]);
      setUploadState({ title: '', description: '', file: null });
      (document.getElementById('photoUploadInput') as HTMLInputElement | null)?.value = '';
      setError(null);
    } catch (err) {
      console.error(err);
      setError('No logramos subir la foto, pero puedes intentarlo nuevamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePhoto(id);
      setPhotos((prev) => prev.filter((photo) => photo.id !== id));
    } catch (err) {
      console.error(err);
      setError('No se pudo eliminar la foto, pero sigue guardada en su corazón.');
    }
  };

  const resolvePhotoUrl = (photo: PhotoItem) => {
    if (photo.url.startsWith('http')) return photo.url;
    return `${API_BASE_URL}${photo.url}`;
  };

  return (
    <Section id="album-section">
      <SectionHeader>
        <SectionTitle>Album eterno de recuerdos</SectionTitle>
        <SectionDescription>
          Suban fotos que cuenten su historia. Este álbum está protegido para que ninguna imagen se pierda aunque cierren la
          página. Cada recuerdo se guarda con ternura en el servidor.
        </SectionDescription>
      </SectionHeader>

      <AlbumCard>
        <form onSubmit={handleUpload} style={{ display: 'grid', gap: '1.4rem' }}>
          <UploadArea>
            <div style={{ display: 'grid', gap: '0.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <label htmlFor="photoTitle">Titulo</label>
                <input
                  id="photoTitle"
                  placeholder="Un beso en la playa"
                  value={uploadState.title}
                  onChange={(event) => setUploadState((prev) => ({ ...prev, title: event.target.value }))}
                />
              </div>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <label htmlFor="photoDescription">Mensaje</label>
                <textarea
                  id="photoDescription"
                  rows={3}
                  placeholder="El viento, el mar y nosotros dos"
                  value={uploadState.description}
                  onChange={(event) => setUploadState((prev) => ({ ...prev, description: event.target.value }))}
                />
              </div>
            </div>
            <UploadLabel htmlFor="photoUploadInput">
              <span role="img" aria-label="camera">📷</span>
              Elegir foto
              <input id="photoUploadInput" type="file" accept="image/*" hidden onChange={handleFileChange} />
            </UploadLabel>
            <span style={{ fontSize: '0.85rem', color: 'rgba(74, 22, 41, 0.6)' }}>
              Se aceptan imágenes en formato JPG, PNG o GIF. Quedarán guardadas con seguridad.
            </span>
          </UploadArea>
          <button className="primary" type="submit" disabled={uploading}>
            {uploading ? 'Guardando recuerdo...' : 'Guardar en el album'}
          </button>
          {error && <p style={{ margin: 0, color: '#d62839' }}>{error}</p>}
        </form>

        {loading ? (
          <p>Cargando recuerdos...</p>
        ) : orderedPhotos.length === 0 ? (
          <EmptyState>Aún no hay fotos. Empiecen subiendo su momento favorito.</EmptyState>
        ) : (
          <PhotoGrid>
            {orderedPhotos.map((photo) => (
              <PhotoCard key={photo.id}>
                <PhotoImage src={resolvePhotoUrl(photo)} alt={photo.title || 'Recuerdo de ustedes dos'} />
                <PhotoOverlay>
                  <strong>{photo.title || 'Recuerdo sin título'}</strong>
                  {photo.description && <span>{photo.description}</span>}
                  <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>
                    Guardado el {dayjs(photo.createdAt).format('D [de] MMMM YYYY [a las] HH:mm')}
                  </span>
                  <DeleteButton type="button" onClick={() => handleDelete(photo.id)}>
                    Borrar
                  </DeleteButton>
                </PhotoOverlay>
              </PhotoCard>
            ))}
          </PhotoGrid>
        )}
      </AlbumCard>
    </Section>
  );
};

export default PhotoAlbumSection;
