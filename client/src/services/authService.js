import api from "./api";

// Auth Service
export const authService = {
  // Login
  async login(credentials) {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  // Get current user
  async getCurrentUser() {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // Refresh token
  async refreshToken() {
    const response = await api.post("/auth/refresh");
    return response.data;
  },

  // Logout
  async logout() {
    await api.post("/auth/logout");
  },
};

export default authService;
