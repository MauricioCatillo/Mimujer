# Mimujer

Plataforma full-stack para exhibir proyectos románticos con miniaturas automatizadas o cargadas manualmente.

## Estructura

- `backend/`: API REST en Express que gestiona proyectos y almacenamiento de miniaturas.
- `frontend/`: interfaz React + Vite para listar proyectos, previsualizarlos en modales seguros y cargar nuevos elementos.

## Backend

### Scripts

```bash
cd backend
npm install
npm run start # producción
npm run dev   # requiere nodemon instalado globalmente
```

### Variables de entorno

Crear un archivo `.env` basado en `.env.example`:

- `PORT`: puerto de escucha (por defecto `4000`).
- `FORM_TOKEN`: token necesario para crear o eliminar proyectos.
- `SCREENSHOT_STRATEGY`: actualmente soporta `puppeteer` para generar miniaturas.

### Endpoints principales

- `POST /projects`: acepta `multipart/form-data` con campos `name`, `description`, `url`, `romanticPurpose`, `autoGenerateThumbnail` y un archivo opcional `thumbnail`. Si se indica auto-generación y Puppeteer está disponible, se captura una miniatura automática del sitio.
- `GET /projects`: devuelve el listado de proyectos guardados con rutas públicas de miniaturas.
- `DELETE /projects/:id`: elimina el proyecto y limpia la miniatura asociada.

Las miniaturas se guardan en `backend/uploads/` y se exponen desde `http://<host>/uploads/...`.

## Frontend

### Scripts

```bash
cd frontend
npm install
npm run dev      # entorno de desarrollo en http://localhost:5173
npm run build    # compilación de producción
npm run preview  # previsualización de la build
```

### Variables de entorno

Crear `.env` desde `.env.example`:

- `VITE_BACKEND_URL`: URL base del backend (por defecto `http://localhost:4000`).
- `VITE_FORM_TOKEN`: token que desbloquea el formulario protegido.

### Funcionalidades

- Galería responsiva de tarjetas con efecto hover y miniaturas.
- Modal de previsualización con `iframe` protegido usando `sandbox` y `srcDoc`.
- Botón dedicado para abrir el proyecto en una nueva pestaña.
- Formulario protegido para crear proyectos, con soporte para subida manual de miniaturas o generación automática.
- Eliminación de proyectos disponible solo tras desbloquear el formulario.

## Generación automática de miniaturas

La API intenta cargar dinámicamente `puppeteer`. Si no está instalado o disponible en el entorno, la generación automática fallará de forma controlada y los proyectos quedarán sin miniatura. Para habilitarla:

```bash
cd backend
npm install puppeteer
```

El proceso se ejecuta en modo *headless* con parámetros seguros (`--no-sandbox`, `--disable-setuid-sandbox`).

## Datos persistentes

Los proyectos se guardan en `backend/data/projects.json`. Puedes respaldarlo o limpiar la galería editando este archivo.
