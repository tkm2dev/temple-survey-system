import api from "./api";

// Notification Service
export const notificationService = {
  // Get all notifications for current user
  async getNotifications(params = {}) {
    const response = await api.get("/notifications", { params });
    return response.data;
  },

  // Mark notification as read
  async markAsRead(id) {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  // Mark all notifications as read
  async markAllAsRead() {
    const response = await api.patch("/notifications/mark-all-read");
    return response.data;
  },

  // Delete notification
  async deleteNotification(id) {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  // Get unread count
  async getUnreadCount() {
    const response = await api.get("/notifications/unread-count");
    return response.data;
  },
};

export default notificationService;
