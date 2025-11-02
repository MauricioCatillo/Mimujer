import React, { useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPhotos, uploadPhoto, deletePhoto } from '../../api/photos';
import type { Photo } from '../../types';
import '../../styles/romantic-album.css';

const RomanticAlbum: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: photos = [], isLoading, isError, error } = useQuery<Photo[]>({
    queryKey: ['photos'],
    queryFn: fetchPhotos,
    refetchOnWindowFocus: false,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) {
      return;
    }
    const file = acceptedFiles[0];
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(file);
    setNote('');
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    multiple: false,
    onDrop,
  });

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const uploadMutation = useMutation<Photo, Error, { file: File; note?: string }>({
    mutationFn: ({ file, note: uploadNote }) =>
      uploadPhoto({
        file,
        note: uploadNote,
        onProgress: (value) => setUploadProgress(value),
      }),
    onSuccess: () => {
      setStatusMessage('¡Tu recuerdo se ha guardado con amor!');
      setSelectedFile(null);
      setNote('');
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      setUploadProgress(null);
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      setTimeout(() => setStatusMessage(null), 4000);
    },
    onError: () => {
      setStatusMessage('No pudimos guardar la foto. Intenta nuevamente.');
      setUploadProgress(null);
      setTimeout(() => setStatusMessage(null), 5000);
    },
  });

  const deleteMutation = useMutation<void, Error, number>({
    mutationFn: (id) => deletePhoto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
    },
  });

  const handleUpload = () => {
    if (!selectedFile) {
      setStatusMessage('Selecciona una foto para subir.');
      return;
    }
    uploadMutation.mutate({ file: selectedFile, note });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('¿Seguro que quieres borrar este recuerdo?')) {
      deleteMutation.mutate(id);
    }
  };

  const sortedPhotos = useMemo(() => {
    return [...photos].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [photos]);

  const goToPrevious = () => {
    if (activeIndex === null) return;
    setActiveIndex((prev) => {
      if (prev === null) return prev;
      return prev === 0 ? sortedPhotos.length - 1 : prev - 1;
    });
  };

  const goToNext = () => {
    if (activeIndex === null) return;
    setActiveIndex((prev) => {
      if (prev === null) return prev;
      return prev === sortedPhotos.length - 1 ? 0 : prev + 1;
    });
  };

  return (
    <div className="album-container">
      <header className="album-header">
        <h1>Nuestro Álbum Romántico</h1>
        <p>Cada fotografía cuenta una historia compartida. Añade nuevas memorias y revive las que ya están aquí.</p>
      </header>

      <section className="uploader">
        <div className={`dropzone ${isDragActive ? 'dropzone-active' : ''}`} {...getRootProps()}>
          <input {...getInputProps()} />
          {isDragActive ? <p>Suelta tu foto para subirla</p> : <p>Arrastra y suelta una foto, o haz clic para seleccionar</p>}
        </div>
        {previewUrl && (
          <div className="preview-card">
            <img src={previewUrl} alt="Previsualización" />
            <textarea
              placeholder="Escribe una nota o dedicación especial"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
            <button className="upload-button" onClick={handleUpload} disabled={uploadMutation.isPending}>
              {uploadMutation.isPending ? 'Guardando recuerdo...' : 'Guardar en el álbum'}
            </button>
            {uploadProgress !== null && (
              <div className="progress">
                <div className="progress-bar" style={{ width: `${uploadProgress}%` }} />
                <span>{uploadProgress}%</span>
              </div>
            )}
          </div>
        )}
        {statusMessage && <p className="status-message">{statusMessage}</p>}
      </section>

      <section className="gallery">
        <h2>Recuerdos Compartidos</h2>
        {isLoading && <p>Cargando tus fotos con cariño...</p>}
        {isError && <p className="error">No pudimos cargar el álbum: {(error as Error)?.message}</p>}
        {!isLoading && !sortedPhotos.length && <p>Todavía no hay fotos. ¡Suban la primera juntos!</p>}
        <div className="photo-grid">
          {sortedPhotos.map((photo, index) => (
            <article className="photo-card" key={photo.id}>
              <button className="open-button" onClick={() => setActiveIndex(index)}>
                <img src={photo.url} alt={photo.originalname} loading="lazy" />
              </button>
              <div className="photo-details">
                <h3>{new Date(photo.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                {photo.note ? <p>{photo.note}</p> : <p className="placeholder">Sin nota, pero lleno de amor.</p>}
                <button className="delete-button" onClick={() => handleDelete(photo.id)} disabled={deleteMutation.isPending}>
                  Borrar recuerdo
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {activeIndex !== null && sortedPhotos[activeIndex] && (
        <div className="lightbox" role="dialog" aria-modal="true">
          <div className="lightbox-content">
            <button className="close" onClick={() => setActiveIndex(null)} aria-label="Cerrar">
              ×
            </button>
            <button className="nav prev" onClick={goToPrevious} aria-label="Foto anterior">
              ‹
            </button>
            <figure>
              <img src={sortedPhotos[activeIndex].url} alt={sortedPhotos[activeIndex].originalname} />
              <figcaption>
                <h3>{new Date(sortedPhotos[activeIndex].created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                <p>{sortedPhotos[activeIndex].note || 'Un momento sin palabras, pero inolvidable.'}</p>
              </figcaption>
            </figure>
            <button className="nav next" onClick={goToNext} aria-label="Foto siguiente">
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RomanticAlbum;
