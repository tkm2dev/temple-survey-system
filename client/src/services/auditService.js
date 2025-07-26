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

  // Get audit statistics
  async getAuditStatistics(params = {}) {
    const response = await api.get("/audit/statistics", { params });
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
};

export default auditService;
