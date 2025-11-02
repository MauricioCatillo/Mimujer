import './App.css';

const sections = [
  { id: 'calendar', title: 'Calendario', description: 'Organiza citas, aniversarios y momentos importantes.' },
  { id: 'reminders', title: 'Recordatorios', description: 'Nunca olvides un detalle especial con alertas personalizadas.' },
  { id: 'album', title: 'Álbum', description: 'Guarda fotografías, cartas y recuerdos compartidos.' },
  { id: 'projects', title: 'Galería de Proyectos', description: 'Documenta ideas y sorpresas para el futuro.' }
];

function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <h1 className="brand">Mi Mujer</h1>
        <nav>
          <ul>
            {sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.title}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="sidebar-footer">
          <p>Un espacio creado con amor.</p>
        </div>
      </aside>
      <main className="content">
        <header className="hero">
          <div>
            <p className="subtitle">Planificador romántico</p>
            <h2>Diseñado para celebrar cada detalle</h2>
            <p>
              Este espacio combina un ambiente cálido con herramientas prácticas para planificar y revivir
              los momentos más especiales.
            </p>
          </div>
        </header>
        <section className="grid">
          {sections.map((section) => (
            <article key={section.id} id={section.id} className="card">
              <h3>{section.title}</h3>
              <p>{section.description}</p>
              <button type="button">Ver más</button>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

export default App;
