import { FormEvent, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api, { resolveAssetUrl } from "../services/api";
import "./PhotoAlbumPage.css";

interface Photo {
  id: string;
  title: string;
  description?: string;
  takenAt?: string;
  fileName: string;
  createdAt: string;
}

const usePhotos = () =>
  useQuery({
    queryKey: ["photos"],
    queryFn: async () => {
      const { data } = await api.get<Photo[]>("/photos");
      return data;
    },
  });

const PhotoAlbumPage = () => {
  const queryClient = useQueryClient();
  const { data: photos = [], isLoading } = usePhotos();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [takenAt, setTakenAt] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!fileInputRef.current?.files?.[0]) {
        throw new Error("Selecciona una imagen para subir");
      }

      const formData = new FormData();
      formData.append("file", fileInputRef.current.files[0]);
      formData.append("title", title);
      formData.append("description", description);
      if (takenAt) {
        formData.append("takenAt", takenAt);
      }

      await api.post("/photos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photos"] });
      setTitle("");
      setDescription("");
      setTakenAt("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/photos/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["photos"] }),
  });

  const handleDelete = (id: string) => {
    if (window.confirm("¿Seguro que quieres eliminar esta fotografía?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="album-wrapper">
      <section className="album-form romantic-card">
        <h2 className="romantic-section-title">Añadir fotografía</h2>
        <form onSubmit={(event) => uploadMutation.mutate(event)} className="album-form__fields">
          <label>
            Título
            <input value={title} onChange={(event) => setTitle(event.target.value)} required />
          </label>
          <label>
            Descripción
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe el momento"
            />
          </label>
          <label>
            Fecha de captura
            <input type="date" value={takenAt} onChange={(event) => setTakenAt(event.target.value)} />
          </label>
          <label className="album-form__file">
            Imagen romántica
            <input ref={fileInputRef} type="file" accept="image/*" required />
          </label>
          {uploadMutation.isError && (
            <p className="album-form__error">{(uploadMutation.error as Error).message}</p>
          )}
          <button className="romantic-button" type="submit" disabled={uploadMutation.isPending}>
            {uploadMutation.isPending ? "Subiendo…" : "Guardar en el álbum"}
          </button>
        </form>
      </section>

      <section className="album-gallery">
        <header>
          <h2 className="romantic-section-title">Recuerdos preservados</h2>
          <p>{isLoading ? "Cargando…" : `${photos.length} recuerdos atesorados`}</p>
        </header>
        <div className="album-grid">
          {photos.map((photo) => (
            <figure key={photo.id} className="album-photo romantic-card">
              <img src={resolveAssetUrl(`/uploads/photos/${photo.fileName}`)} alt={photo.title} />
              <figcaption>
                <h3>{photo.title}</h3>
                {photo.description && <p>{photo.description}</p>}
                <footer>
                  <span>{photo.takenAt ? new Date(photo.takenAt).toLocaleDateString("es-ES") : "Fecha secreta"}</span>
                  <button
                    className="album-photo__delete"
                    type="button"
                    onClick={() => handleDelete(photo.id)}
                    disabled={deleteMutation.isPending}
                  >
                    Eliminar
                  </button>
                </footer>
              </figcaption>
            </figure>
          ))}
          {photos.length === 0 && !isLoading && (
            <p className="album-empty">Aún no hay fotos. ¡Sube la primera historia!</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default PhotoAlbumPage;
