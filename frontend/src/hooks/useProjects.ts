import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

export interface Project {
  id: string;
  name: string;
  description: string;
  url: string;
  romanticPurpose: string;
  thumbnailPath: string | null;
  createdAt: string;
  updatedAt: string;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '') ?? '';
const DEFAULT_FORM_TOKEN = import.meta.env.VITE_FORM_TOKEN as string | undefined;

function resolveEndpoint(path: string) {
  if (BACKEND_URL) {
    return `${BACKEND_URL}${path}`;
  }
  return `/api${path}`;
}

function withAbsoluteThumbnail(project: Project): Project {
  if (!project.thumbnailPath) {
    return { ...project, thumbnailPath: null };
  }

  const alreadyAbsolute = /^(https?:)?\/\//.test(project.thumbnailPath);
  let thumbnailPath = project.thumbnailPath;
  if (!alreadyAbsolute) {
    thumbnailPath = BACKEND_URL ? `${BACKEND_URL}${project.thumbnailPath}` : project.thumbnailPath;
  }
  return { ...project, thumbnailPath };
}

export function useProjects(formToken?: string) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const effectiveToken = formToken || DEFAULT_FORM_TOKEN;

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<Project[]>(resolveEndpoint('/projects'));
      setProjects(response.data.map(withAbsoluteThumbnail));
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los proyectos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = useCallback(
    async (input: {
      name: string;
      description: string;
      url: string;
      romanticPurpose: string;
      autoGenerateThumbnail: boolean;
      thumbnailFile?: File | null;
    }) => {
      const formData = new FormData();
      formData.append('name', input.name);
      formData.append('description', input.description);
      formData.append('url', input.url);
      formData.append('romanticPurpose', input.romanticPurpose);
      formData.append('autoGenerateThumbnail', String(input.autoGenerateThumbnail));
      if (input.thumbnailFile) {
        formData.append('thumbnail', input.thumbnailFile);
      }

      await axios.post(resolveEndpoint('/projects'), formData, {
        headers: {
          ...(effectiveToken ? { 'x-form-token': effectiveToken } : {})
        }
      });
      await fetchProjects();
    },
    [effectiveToken, fetchProjects]
  );

  const deleteProject = useCallback(
    async (projectId: string) => {
      await axios.delete(resolveEndpoint(`/projects/${projectId}`), {
        headers: {
          ...(effectiveToken ? { 'x-form-token': effectiveToken } : {})
        }
      });
      setProjects((prev) => prev.filter((project) => project.id !== projectId));
    },
    [effectiveToken]
  );

  return {
    projects,
    loading,
    error,
    refresh: fetchProjects,
    createProject,
    deleteProject
  };
}
