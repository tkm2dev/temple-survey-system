import api from "./api";

// Audit Service
export const auditService = {
  // Get audit logs
  async getAuditLogs(params = {}) {
    const response = await api.get("/audit/logs", { params });
    return response.data;
  },

  // Get audit log details
  async getAuditLog(id) {
    const response = await api.get(`/audit/logs/${id}`);
    return response.data;
  },

  // Get audit log by ID
  async getAuditLogById(id) {
    const response = await api.get(`/audit/logs/${id}`);
    return response.data;
  },

  // Get audit statistics
  async getAuditStatistics(params = {}) {
    const response = await api.get("/audit/statistics", { params });
    return response.data;
  },

  // Get statistics (alias for compatibility)
  async getStatistics() {
    const response = await api.get("/audit/statistics");
    return response.data;
  },

  // Get available tables
  async getTables() {
    const response = await api.get("/audit/tables");
    return response.data;
  },

  // Get available users
  async getUsers() {
    const response = await api.get("/audit/users");
    return response.data;
  },

  // Export audit logs
  async exportAuditLogs(params = {}) {
    const response = await api.get("/audit/export", {
      params,
      responseType: "blob",
    });
    return response;
  },

  // Export logs (alias for compatibility)
  async exportLogs(params = {}) {
    const response = await api.get("/audit/export", {
      params,
      responseType: "blob",
    });
    return response.data;
  },

  // Create audit log (for manual logging)
  async createAuditLog(data) {
    const response = await api.post("/audit/logs", data);
    return response.data;
  },

  // Get audit logs by table
  async getLogsByTable(tableName, params = {}) {
    const response = await api.get(`/audit/logs/table/${tableName}`, {
      params,
    });
    return response.data;
  },

  // Get audit logs by user
  async getLogsByUser(userId, params = {}) {
    const response = await api.get(`/audit/logs/user/${userId}`, { params });
    return response.data;
  },

  // Get audit logs by record
  async getLogsByRecord(tableName, recordId, params = {}) {
    const response = await api.get(
      `/audit/logs/record/${tableName}/${recordId}`,
      { params }
    );
    return response.data;
  },

  // Get recent activity
  async getRecentActivity(limit = 10) {
    const response = await api.get("/audit/recent", {
      params: { limit },
    });
    return response.data;
  },

  // Get activity by date range
  async getActivityByDateRange(startDate, endDate) {
    const response = await api.get("/audit/activity", {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
    });
    return response.data;
  },

  // Get user activity summary
  async getUserActivitySummary(userId, params = {}) {
    const response = await api.get(`/audit/users/${userId}/activity`, {
      params,
    });
    return response.data;
  },

  // Search audit logs
  async searchLogs(query, params = {}) {
    const response = await api.get("/audit/search", {
      params: { q: query, ...params },
    });
    return response.data;
  },
};

export default auditService;
