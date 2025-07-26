import api from "./api";

// User Service
export const userService = {
  // Get all users
  async getUsers(params = {}) {
    const response = await api.get("/users", { params });
    return response.data;
  },

  // Get users with pagination
  async getUsersPaginated(params = {}) {
    const response = await api.get("/users/paginated", { params });
    return response.data;
  },

  // Get user statistics
  async getStatistics() {
    const response = await api.get("/users/statistics");
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
  async updateUserStatus(id, statusData) {
    const response = await api.patch(`/users/${id}/status`, statusData);
    return response.data;
  },

  // Update user approval status
  async updateUserApproval(id, data) {
    const response = await api.patch(`/users/${id}/approval`, data);
    return response.data;
  },

  // Bulk operations
  async bulkUpdateStatus(userIds, status) {
    const response = await api.patch("/users/bulk/status", {
      userIds,
      is_active: status,
    });
    return response.data;
  },

  async bulkApprove(userIds) {
    const response = await api.patch("/users/bulk/approve", {
      userIds,
    });
    return response.data;
  },

  async bulkReject(userIds) {
    const response = await api.patch("/users/bulk/reject", {
      userIds,
    });
    return response.data;
  },

  async bulkUpdateApproval(userIds, approvalStatus) {
    const response = await api.patch("/users/bulk/approval", {
      userIds,
      approval_status: approvalStatus,
    });
    return response.data;
  },

  async bulkDelete(userIds) {
    const response = await api.delete("/users/bulk", {
      data: { userIds },
    });
    return response.data;
  },

  async bulkDeleteUsers(userIds) {
    const response = await api.delete("/users/bulk", {
      data: { userIds },
    });
    return response.data;
  },

  // Export operations
  async bulkExport(userIds) {
    const response = await api.post(
      "/users/export",
      { userIds },
      { responseType: "blob" }
    );
    return response.data;
  },

  async exportAll() {
    const response = await api.get("/users/export/all", {
      responseType: "blob",
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
