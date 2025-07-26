import axios from "axios";
import router from "@/router";

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add timestamp to prevent caching
    config.params = {
      ...config.params,
      _t: Date.now(),
    };

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/auth/login");
      return Promise.reject(new Error("กรุณาเข้าสู่ระบบใหม่"));
    }

    // Handle authorization errors
    if (error.response?.status === 403) {
      router.push("/unauthorized");
      return Promise.reject(new Error("ไม่มีสิทธิ์เข้าถึงข้อมูลนี้"));
    }

    // Handle server errors
    if (error.response?.status >= 500) {
      return Promise.reject(
        new Error("เกิดข้อผิดพลาดของเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง")
      );
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject(new Error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้"));
    }

    return Promise.reject(error);
  }
);

export default api;
