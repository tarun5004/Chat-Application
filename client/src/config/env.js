export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
};

if (!env.apiBaseUrl) {
  throw new Error("Missing VITE_API_BASE_URL");
}