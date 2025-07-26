import api from "./api";

// Dashboard Service
export const dashboardService = {
  // Get dashboard statistics
  async getDashboardStats() {
    const response = await api.get("/dashboard/stats");
    return response.data;
  },

  // Get survey statistics by status
  async getSurveyStatsByStatus() {
    const response = await api.get("/dashboard/surveys-by-status");
    return response.data;
  },

  // Get survey statistics by type
  async getSurveyStatsByType() {
    const response = await api.get("/dashboard/surveys-by-type");
    return response.data;
  },

  // Get recent activities
  async getRecentActivities(limit = 10) {
    const response = await api.get("/dashboard/recent-activities", {
      params: { limit },
    });
    return response.data;
  },

  // Get monthly survey trends
  async getMonthlySurveyTrends(months = 6) {
    const response = await api.get("/dashboard/monthly-trends", {
      params: { months },
    });
    return response.data;
  },

  // Get user performance statistics
  async getUserPerformanceStats() {
    const response = await api.get("/dashboard/user-performance");
    return response.data;
  },
};

export default dashboardService;
