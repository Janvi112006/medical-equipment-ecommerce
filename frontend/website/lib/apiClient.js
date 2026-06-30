import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

// Used inside client components ("use client" files) for all interactive
// data fetching (product lists, cart, checkout, auth, orders, etc.)
const apiClient = axios.create({ baseURL });

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("customer_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

let unauthorizedHandler = () => {};
export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      unauthorizedHandler();
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (error) => {
  const data = error?.response?.data;
  if (data?.errors?.length) {
    return data.errors.map((e) => e.message).join(", ");
  }
  if (data?.message) {
    return data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
};

// Used inside server components (generateMetadata, etc.) where axios'
// browser-oriented interceptors above aren't needed — a plain fetch with a
// short timeout is simpler and avoids bundling axios into server-only paths
// unnecessarily. Falls back gracefully (returns null) on any failure so a
// metadata lookup failure never breaks page rendering.
export const fetchServerSide = async (path) => {
  try {
    const res = await fetch(`${baseURL}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
};

export default apiClient;
