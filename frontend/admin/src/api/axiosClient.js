import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const apiClient = axios.create({ baseURL });

// Attach the stored JWT (if any) to every outgoing request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Registered by AuthContext on mount, so a 401 anywhere automatically logs
// the admin out and sends them back to the login page.
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

// Pulls a clean, human-readable message out of any API error shape this
// backend returns (validation errors array, plain message, or a network failure).
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

export default apiClient;
