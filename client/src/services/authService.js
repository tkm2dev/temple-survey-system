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

  // Change password
  async changePassword(passwordData) {
    const response = await api.post("/auth/change-password", passwordData);
    return response.data;
  },

  // Logout
  async logout() {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  // Register new user (Admin only)
  async register(userData) {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },
};

export default authService;
