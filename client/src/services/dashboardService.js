import api from "./api";

// Dashboard Service
export const dashboardService = {
  // Get comprehensive dashboard statistics
  async getDashboardStats() {
    try {
      const response = await api.get("/dashboard/stats");
      return response.data;
    } catch (error) {
      console.error("Dashboard stats error:", error);
      throw error;
    }
  },

  // Get recent surveys for dashboard
  async getRecentSurveys(limit = 6) {
    try {
      const response = await api.get("/dashboard/recent-surveys", {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error("Recent surveys error:", error);
      throw error;
    }
  },

  // Get monthly survey trends for charts
  async getMonthlySurveyTrends(months = 6) {
    try {
      const response = await api.get("/dashboard/monthly-trends", {
        params: { months },
      });
      return response.data;
    } catch (error) {
      console.error("Monthly trends error:", error);
      throw error;
    }
  },

  // Get system notifications
  async getSystemNotifications() {
    try {
      const response = await api.get("/dashboard/system-notifications");
      return response.data;
    } catch (error) {
      console.error("System notifications error:", error);
      throw error;
    }
  },

  // Export dashboard data
  async exportDashboard(options = {}) {
    try {
      const { format = "json", includeCharts = false } = options;

      const response = await api.post(
        "/dashboard/export",
        {
          format,
          includeCharts,
        },
        {
          responseType: format === "csv" ? "blob" : "json",
        }
      );

      if (format === "csv") {
        // Handle CSV download
        const blob = new Blob([response.data], {
          type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `dashboard-export-${new Date().toISOString().split("T")[0]}.csv`
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return { success: true };
      }

      return response.data;
    } catch (error) {
      console.error("Dashboard export error:", error);
      throw error;
    }
  },

  // Utility functions for UI
  getStatusBadgeClass(status) {
    const classes = {
      Draft: "bg-secondary",
      "Pending Review": "bg-warning text-dark",
      Approved: "bg-success",
      "Needs Revision": "bg-danger",
    };
    return classes[status] || "bg-secondary";
  },

  getStatusIcon(status) {
    const icons = {
      Draft: "bi bi-file-earmark",
      "Pending Review": "bi bi-clock",
      Approved: "bi bi-check-circle",
      "Needs Revision": "bi bi-exclamation-triangle",
    };
    return icons[status] || "bi bi-file-earmark";
  },

  getStatusText(status) {
    const texts = {
      Draft: "ร่าง",
      "Pending Review": "รอตรวจสอบ",
      Approved: "อนุมัติแล้ว",
      "Needs Revision": "ต้องแก้ไข",
    };
    return texts[status] || status;
  },

  formatNumber(num) {
    return new Intl.NumberFormat("th-TH").format(num || 0);
  },

  getPercentage(part, total) {
    if (!total) return 0;
    return Math.round((part / total) * 100);
  },
};

export default dashboardService;
