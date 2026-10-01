// In local development we use Vite's /api proxy. This avoids browser CORS
// problems when the backend does not allow the frontend origin.
// For a separately hosted frontend, set VITE_API_URL to the backend origin.
const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

// Backend base for resolving relative image paths like /images/products/...
export const BACKEND_ORIGIN = "https://graduationecommerce.runasp.net";

// Resolve an image URL — handles base64, absolute URLs, and relative paths
export const resolveImage = (img) => {
  if (!img) return null;
  if (img.startsWith("data:") || img.startsWith("http")) return img;
  return `${BACKEND_ORIGIN}${img.startsWith("/") ? "" : "/"}${img}`;
};

export const apiFetch = async (path, options = {}) => {
  const url = `${API_URL}${path}`;

  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    const message = error?.message || "Network request failed";
    throw new Error(
      `Could not connect to the API. ${message}. Check that the backend is online and that the Vite API proxy is running.`,
      { cause: error }
    );
  }

  const raw = await response.text();
  let data;

  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw;
  }

  if (!response.ok) {
    let message = "";

    if (data && typeof data === "object") {
      message = data.message || data.title || data.error || "";

      if (!message && data.errors && typeof data.errors === "object") {
        message = Object.values(data.errors).flat().join(" ");
      }
    } else if (typeof data === "string") {
      message = data;
    }

    throw new Error(message || `Request failed (${response.status})`);
  }

  return data;
};

export const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export { API_URL };
