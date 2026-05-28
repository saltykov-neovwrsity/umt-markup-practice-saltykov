import axios from "axios";

const isStaticMode = import.meta.env.VITE_API_MODE === "static";

function resolveApiBaseURL() {
  const raw = import.meta.env.VITE_API_BASE_URL ?? "api";
  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }
  const segment = raw.replace(/^\/+|\/+$/g, "");
  const siteBase = new URL(import.meta.env.BASE_URL, "http://vite.local");
  return new URL(segment, siteBase).pathname;
}

export const apiClient = axios.create({
  baseURL: resolveApiBaseURL(),
  timeout: 15_000,
});

if (isStaticMode) {
  // GitHub Pages fallback: rewrite URLs to static JSON files
  apiClient.interceptors.request.use((config) => {
    if (typeof config.url !== "string" || config.url.length === 0) {
      return config;
    }

    // Remove leading slash to let Axios combine it properly with baseURL
    let relativeUrl = config.url.startsWith("/") ? config.url.substring(1) : config.url;

    const [pathPart, queryPart] = relativeUrl.split("?", 2);
    if (!pathPart || /\.[a-z0-9]+$/i.test(pathPart)) {
      return config;
    }
    
    config.url = queryPart ? `${pathPart}.json?${queryPart}` : `${pathPart}.json`;
    return config;
  });
}
