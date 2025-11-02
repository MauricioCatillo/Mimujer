# Mimujer

Aplicación de álbum romántico con backend en Node.js/Express y frontend en React.

## Requisitos

- Node.js >= 18

## Configuración

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run start
```

El backend expone:
- `POST /photos` para subir imágenes (`multipart/form-data` con campo `photo` y opcional `note`).
- `GET /photos` para listar imágenes almacenadas.
- `DELETE /photos/:id` para eliminar una imagen y su metadato.

Los archivos se guardan en `backend/uploads/` y los metadatos en una base SQLite.

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

El frontend usa React Query para solicitar las fotos al cargar y cachearlas. Incluye autenticación básica (usuario/contraseña) para proteger el álbum y un formulario de subida con vista previa y barra de progreso.
