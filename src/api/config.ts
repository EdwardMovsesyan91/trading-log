function normalizeBase(url: string) {
  if (/^https?:\/\//i.test(url) === false) url = `https://${url}`;
  return url.replace(/\/+$/, "");
}

const raw =
  (import.meta.env?.VITE_API_BASE_URL as string | undefined) ??
  "http://localhost:4000";

export const API_BASE_URL = normalizeBase(raw);
