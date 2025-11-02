import axios from "axios";

const configuredBaseUrl = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.trim().replace(/\/+$/, "")
  : undefined;

const ensureApiSuffix = (url: string) => {
  if (/\/api$/i.test(url)) {
    return url;
  }
  return `${url}/api`;
};

const baseURL = (() => {
  if (!configuredBaseUrl || configuredBaseUrl.length === 0) {
    return import.meta.env.DEV ? "http://localhost:4000/api" : "/api";
  }

  return ensureApiSuffix(configuredBaseUrl);
})();

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
