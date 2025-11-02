# Mimujer

Un entorno de trabajo dividido en frontend y backend para construir una experiencia romántica con agenda, recordatorios y galerías de recuerdos.

## Requisitos previos

- Node.js 18 o superior
- npm 9 o superior

## Frontend (`frontend/`)

Aplicación construida con Vite + React + TypeScript.

### Scripts principales

```bash
cd frontend
npm install
npm run dev       # inicia el servidor de desarrollo en http://localhost:5173
npm run build     # genera la compilación de producción
npm run preview   # sirve la compilación generada
```

El tema global utiliza tipografías elegantes (Playfair Display y Quicksand) y una paleta romántica con rosas y dorados. El layout principal incluye navegación lateral y secciones para Calendario, Recordatorios, Álbum y Galería de Proyectos, con un diseño responsive adaptado a móviles (≤480px), tabletas (768px) y escritorio (≥1024px).

## Backend (`backend/`)

API REST construida con Express y TypeScript, preparada para integrarse con Prisma y una base de datos PostgreSQL (puedes cambiar el proveedor en `backend/prisma/schema.prisma`).

### Variables de entorno

Crea un archivo `.env` en `backend/` con los valores necesarios:

```
PORT=4000
DATABASE_URL="postgresql://usuario:password@localhost:5432/mimujer?schema=public"
```

### Scripts principales

```bash
cd backend
npm install
npm run prisma:generate  # genera el cliente de Prisma
npm run dev              # inicia la API en modo desarrollo (http://localhost:4000)
```

Para compilar a JavaScript:

```bash
npm run build
npm start
```

Los endpoints disponibles se agrupan bajo `/api`:

- `GET /api/events` y `POST /api/events`
- `GET /api/reminders` y `POST /api/reminders`
- `GET /api/photos` y `POST /api/photos`
- `GET /api/projects` y `POST /api/projects`
- `GET /health` para verificación rápida del estado del servicio

Antes de utilizar Prisma por primera vez, ejecuta las migraciones:

```bash
npm run prisma:migrate
```

Ajusta el archivo `schema.prisma` según tus necesidades y define valores seguros en tus variables de entorno. Evita commitear archivos `.env` o credenciales sensibles.

## Desarrollo simultáneo

Puedes ejecutar ambos servicios en paralelo abriendo dos terminales:

```bash
# Terminal 1
cd frontend
npm run dev

# Terminal 2
cd backend
npm run dev
```

Con esto tendrás el frontend disponible en `http://localhost:5173` y la API en `http://localhost:4000`.
