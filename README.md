
# Portal romántico "Mi Mujer"

Un espacio privado donde planificar citas, compartir fotografías, mantener una galería de mini sitios románticos y recibir recordatorios dulces. El proyecto está dividido en un backend Express + SQLite y un frontend React con React Router y React Query.

## Características

- **Calendario romántico** con edición en línea, etiquetas, recordatorios y validaciones avanzadas.
- **Álbum fotográfico persistente**, con subida de imágenes, metadatos y almacenamiento local en disco.
- **Galería de mini sitios** para registrar URLs especiales, miniaturas y accesos rápidos.
- **Historial de recordatorios** con envío por correo (vía SMTP configurable) y registros auditables.
- **Autenticación** mediante JWT, usuario inicial configurable y protección de todas las rutas privadas.
- **Persistencia** en una base de datos SQLite con migraciones automáticas.

## Requisitos previos

- Node.js 18+
- npm 9+
- Opcional: servidor SMTP para envío real de correos (para entornos locales se puede usar servicios como Mailtrap o Ethereal)

## Configuración inicial

Clona el repositorio y navega hasta el directorio del proyecto:

```bash
git clone <url-del-repo>
cd Mimujer
```

Instala las dependencias de backend y frontend:

```bash
cd backend
npm install
cd ../frontend
npm install
```

## Variables de entorno

El backend lee sus variables desde el entorno (puedes crear un archivo `.env` dentro de `backend/`). Los valores por defecto permiten iniciar el proyecto rápidamente en local.

| Variable | Descripción | Valor por defecto |
| --- | --- | --- |
| `PORT` | Puerto HTTP del backend | `4000` |
| `ROMANTIC_DB_PATH` | Ruta al archivo SQLite | `backend/data/romance.db` |
| `ROMANTIC_JWT_SECRET` | Clave secreta para firmar JWT | `super-romantic-secret` |
| `ROMANTIC_SESSION_MINUTES` | Duración de la sesión en minutos | `240` |
| `ROMANTIC_ADMIN_EMAIL` | Correo del usuario inicial | `amor@mimujer.local` |
| `ROMANTIC_ADMIN_PASSWORD` | Contraseña inicial | `nuestrosecreto` |
| `ROMANTIC_UPLOADS_DIR` | Carpeta donde se almacenan las fotos | `backend/uploads` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Configuración opcional de SMTP para enviar correos |

> ⚠️ Cambia la contraseña inicial en producción. Puedes generar un nuevo usuario eliminando la base de datos o sobrescribiendo las variables.

## Ejecutar el backend

```bash
cd backend
npm run dev
```

El servidor estará disponible en `http://localhost:4000`. Provee las rutas bajo `/api`, sirve los ficheros subidos desde `/uploads` y programa recordatorios cada minuto.

## Ejecutar el frontend

```bash
cd frontend
npm run start
```

Vite levantará la aplicación en `http://localhost:5173`. Inicia sesión con el usuario y contraseña configurados (por defecto `amor@mimujer.local` / `nuestrosecreto`).

## Scripts útiles

| Carpeta | Comando | Descripción |
| --- | --- | --- |
| `backend` | `npm run build` | Compila TypeScript a JavaScript |
| `backend` | `npm test` | Ejecuta las pruebas unitarias (Vitest) |
| `frontend` | `npm run build` | Genera la versión de producción |
| `frontend` | `npm test` | Ejecuta pruebas (Vitest) |

## Arquitectura

- **Backend**: Express, SQLite, mejor-sqlite3, nodemailer y node-cron para recordatorios. El middleware de autenticación protege todas las rutas privadas y el servicio de recordatorios registra cada intento en la tabla `reminder_log`.
- **Frontend**: React + Vite, React Router para la navegación, React Query para datos, diseño responsivo inspirado en un estilo romántico.

## Visión

El portal "Mi Mujer" está pensado como un santuario digital para parejas. El objetivo es preservar recuerdos, organizar citas y centralizar proyectos románticos con una estética cálida y cercana. ¡Disfruta construyéndolo y personalizándolo! 💖
