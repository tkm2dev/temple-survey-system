import api from "./api";

// User Service
export const userService = {
  // Get all users
  async getUsers(params = {}) {
    const response = await api.get("/users", { params });
    return response.data;
  },

  // Get single user
  async getUser(id) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Create user
  async createUser(userData) {
    const response = await api.post("/users", userData);
    return response.data;
  },

  // Update user
  async updateUser(id, userData) {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user
  async deleteUser(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Update user status
  async updateUserStatus(id, isActive) {
    const response = await api.patch(`/users/${id}/status`, {
      is_active: isActive,
    });
    return response.data;
  },

  // Update user approval status
  async updateUserApprovalStatus(id, approvalStatus) {
    const response = await api.patch(`/users/${id}/approval`, {
      approval_status: approvalStatus,
    });
    return response.data;
  },

  // Change password
  async changePassword(id, passwordData) {
    const response = await api.patch(`/users/${id}/password`, passwordData);
    return response.data;
  },

  // Get user profile
  async getProfile() {
    const response = await api.get("/users/profile");
    return response.data;
  },

  // Update profile
  async updateProfile(profileData) {
    const response = await api.put("/users/profile", profileData);
    return response.data;
  },
};

export default userService;
