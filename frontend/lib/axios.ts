import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8000/api/",
});

// Add access token to headers
instance.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
