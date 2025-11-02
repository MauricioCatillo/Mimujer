import axios from "axios";

const normalizeBaseUrl = (input: string | undefined | null) => {
  if (!input) {
    return undefined;
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  if (/^https?:/i.test(trimmed)) {
    const url = new URL(trimmed);
    const sanitizedPath = url.pathname.replace(/\/+$/, "");
    if (!/\/api(\/$)?$/i.test(sanitizedPath)) {
      url.pathname = `${sanitizedPath === "" ? "/" : sanitizedPath}/api`;
    } else {
      url.pathname = sanitizedPath;
    }
    return url.toString().replace(/\/+$/, "");
  }

  let relative = trimmed.replace(/\/+$/, "");
  if (relative.length === 0) {
    return "/api";
  }

  if (!relative.startsWith("/")) {
    relative = `/${relative}`;
  }

  if (!/\/api(\/$)?$/i.test(relative)) {
    relative = `${relative}/api`;
  }

  return relative.replace(/\/+$/, "");
};

const configuredBaseUrl = normalizeBaseUrl(import.meta.env.VITE_API_URL);

const baseURL = configuredBaseUrl ?? "/api";

const assetBase = (() => {
  if (!baseURL.startsWith("http")) {
    return "";
  }

  const url = new URL(baseURL);
  const normalizedPath = url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
  const withoutApi = normalizedPath.replace(/api\/+$/i, "");
  url.pathname = withoutApi;
  return url.toString().replace(/\/$/, "");
})();

const api = axios.create({
  baseURL,
});

let authToken: string | null = null;

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const resolveAssetUrl = (path: string) => {
  if (assetBase) {
    return `${assetBase}${path}`;
  }

  return path;
};

export default api;
