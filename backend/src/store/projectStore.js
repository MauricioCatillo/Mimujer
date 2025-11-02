import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.resolve(__dirname, '../../data/projects.json');

async function ensureFile() {
  try {
    await fs.access(dataPath);
  } catch (error) {
    await fs.mkdir(path.dirname(dataPath), { recursive: true });
    await fs.writeFile(dataPath, JSON.stringify([], null, 2), 'utf-8');
  }
}

export async function listProjects() {
  await ensureFile();
  const data = await fs.readFile(dataPath, 'utf-8');
  return JSON.parse(data);
}

export async function saveProjects(projects) {
  await ensureFile();
  await fs.writeFile(dataPath, JSON.stringify(projects, null, 2), 'utf-8');
}

export async function addProject(project) {
  const projects = await listProjects();
  projects.push(project);
  await saveProjects(projects);
  return project;
}

export async function removeProject(projectId) {
  const projects = await listProjects();
  const index = projects.findIndex((p) => p.id === projectId);
  if (index === -1) {
    return null;
  }
  const [removed] = projects.splice(index, 1);
  await saveProjects(projects);
  return removed;
}
