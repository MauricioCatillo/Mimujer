# Mi Mujer - Espacio Romántico Integral

Un refugio digital creado para que una pareja enamorada tenga todo lo que necesita: un calendario con diseño romántico, recordatorios llenos de detalles, un álbum permanente de fotos y un showroom de experiencias web.

## Características principales

- **Calendario romántico** para planear fechas especiales, cenas, viajes y sorpresas.
- **Recordatorios** personalizados con fecha y hora para que nunca se pierda un detalle.
- **Álbum fotográfico** con almacenamiento en el servidor para que las imágenes no se pierdan al cerrar la página.
- **Galería de experiencias web** donde se pueden subir sitios (ZIP o HTML) y obtener una vista previa antes de abrirlos por completo.
- Interfaz totalmente **responsive** pensada para verse espectacular tanto en celulares como en computadoras.

## Requisitos

- Node.js 18+
- npm 9+

## Instalación

Instala las dependencias en los dos proyectos (backend y frontend):

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Ejecución del backend

```bash
cd backend
npm run start
```

El backend inicia en `http://localhost:4000`. Crea automáticamente la base de datos SQLite (`data/mimujer.db`) y carpetas para almacenar fotos y sitios web dentro de `uploads/`.

## Ejecución del frontend

```bash
cd frontend
npm run dev
```

El frontend utiliza Vite y React. Por defecto escucha en `http://localhost:5173`.

Puedes configurar una URL diferente para la API creando un archivo `.env.local` en `frontend/` con el contenido:

```
VITE_API_URL=http://localhost:4000
```

## Persistencia de archivos

Las fotos y los sitios web que se cargan se almacenan en el servidor (`backend/uploads`). El repositorio ignora esa carpeta para evitar subir archivos privados.

## Estructura del proyecto

```
backend/
  src/server.js       # API Express con almacenamiento en SQLite y subida de archivos
  uploads/            # Fotos y sitios web (generados en tiempo de ejecución)
  data/               # Base de datos SQLite
frontend/
  src/                # Aplicación React con diseño romántico responsivo
  public/             # Recursos estáticos (favicon de corazón)
```

Con mucho amor para mantener viva la magia entre dos personas.
