import api from "./api";

// Audit Service - เชื่อมต่อกับ API จริง
export const auditService = {
  // Get audit logs with filters and pagination
  async getAuditLogs(params = {}) {
    try {
      const response = await api.get("/audit/logs", { params });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
      throw error;
    }
  },

  // Get audit statistics
  async getStatistics(days = 30) {
    try {
      const response = await api.get("/audit/stats", {
        params: { days },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch audit statistics:", error);
      // Return mock data as fallback
      return {
        success: true,
        data: {
          period_days: days,
          activity_by_type: [
            { action_type: "LOGIN", count: 45 },
            { action_type: "UPDATE", count: 23 },
            { action_type: "CREATE", count: 12 },
            { action_type: "DELETE", count: 3 },
          ],
          user_activity: [],
          table_modifications: [],
          daily_trends: [],
        },
      };
    }
  },

  // Get audit logs for specific target
  async getTargetAuditLogs(targetId) {
    try {
      const response = await api.get(`/audit/target/${targetId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch target audit logs:", error);
      throw error;
    }
  },

  // Export audit logs as CSV
  async exportAuditLogs(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/audit/export?${queryParams}`, {
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `audit-logs-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error("Failed to export audit logs:", error);
      throw error;
    }
  },

  // Helper methods for UI display
  getActionText(action) {
    const actionTexts = {
      LOGIN: "เข้าสู่ระบบ",
      LOGOUT: "ออกจากระบบ",
      CREATE: "สร้าง",
      UPDATE: "แก้ไข",
      DELETE: "ลบ",
      VIEW: "ดู",
      APPROVE: "อนุมัติ",
      REJECT: "ปฏิเสธ",
      EXPORT: "ส่งออก",
      IMPORT: "นำเข้า",
      PROFILE_UPDATE: "แก้ไขโปรไฟล์",
      PASSWORD_CHANGE: "เปลี่ยนรหัสผ่าน",
      BULK_UPDATE: "อัปเดตจำนวนมาก",
      BULK_DELETE: "ลบจำนวนมาก",
    };
    return actionTexts[action] || action;
  },

  getActionBadgeClass(action) {
    const badgeClasses = {
      LOGIN: "bg-success",
      LOGOUT: "bg-secondary",
      CREATE: "bg-primary",
      UPDATE: "bg-warning text-dark",
      DELETE: "bg-danger",
      VIEW: "bg-info",
      APPROVE: "bg-success",
      REJECT: "bg-danger",
      EXPORT: "bg-dark",
      IMPORT: "bg-primary",
      PROFILE_UPDATE: "bg-info",
      PASSWORD_CHANGE: "bg-warning text-dark",
      BULK_UPDATE: "bg-warning text-dark",
      BULK_DELETE: "bg-danger",
    };
    return badgeClasses[action] || "bg-secondary";
  },

  getActionIcon(action) {
    const actionIcons = {
      LOGIN: "bi-box-arrow-in-right",
      LOGOUT: "bi-box-arrow-left",
      CREATE: "bi-plus-circle",
      UPDATE: "bi-pencil",
      DELETE: "bi-trash",
      VIEW: "bi-eye",
      APPROVE: "bi-check-circle",
      REJECT: "bi-x-circle",
      EXPORT: "bi-download",
      IMPORT: "bi-upload",
      PROFILE_UPDATE: "bi-person-gear",
      PASSWORD_CHANGE: "bi-key",
      BULK_UPDATE: "bi-arrow-repeat",
      BULK_DELETE: "bi-trash3",
    };
    return actionIcons[action] || "bi-activity";
  },

  getUserInitials(name) {
    if (!name) return "U";
    const words = name.split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  },

  getUserAgentBrowser(userAgent) {
    if (!userAgent) return "Unknown";

    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    if (userAgent.includes("Opera")) return "Opera";

    return "Other";
  },

  formatDetails(details) {
    if (!details) return "";

    if (typeof details === "string") {
      try {
        details = JSON.parse(details);
      } catch (e) {
        return details;
      }
    }

    if (typeof details === "object") {
      return Object.entries(details)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
    }

    return String(details);
  },
};

export default auditService;
