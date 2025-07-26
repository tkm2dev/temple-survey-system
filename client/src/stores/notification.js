import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/services/api";

export const useNotificationStore = defineStore("notification", () => {
  // State
  const notifications = ref([]);
  const unreadCount = ref(0);
  const loading = ref(false);

  // Actions
  const fetchNotifications = async (params = {}) => {
    loading.value = true;
    try {
      const response = await api.get("/notifications", { params });

      if (response.data.success) {
        notifications.value = response.data.data.notifications;
        unreadCount.value = response.data.data.unread_count;
      }

      return response.data;
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      return {
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลการแจ้งเตือน",
      };
    } finally {
      loading.value = false;
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);

      if (response.data.success) {
        // Update local state
        const notification = notifications.value.find(
          (n) => n.notification_id === notificationId
        );
        if (notification && !notification.is_read) {
          notification.is_read = true;
          unreadCount.value = Math.max(0, unreadCount.value - 1);
        }
      }

      return response.data;
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      return {
        success: false,
        message: "เกิดข้อผิดพลาดในการอัปเดตการแจ้งเตือน",
      };
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await api.put("/notifications/read-all");

      if (response.data.success) {
        // Update local state
        notifications.value.forEach((notification) => {
          notification.is_read = true;
        });
        unreadCount.value = 0;
      }

      return response.data;
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      return {
        success: false,
        message: "เกิดข้อผิดพลาดในการอัปเดตการแจ้งเตือน",
      };
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);

      if (response.data.success) {
        // Update local state
        const index = notifications.value.findIndex(
          (n) => n.notification_id === notificationId
        );
        if (index !== -1) {
          const notification = notifications.value[index];
          if (!notification.is_read) {
            unreadCount.value = Math.max(0, unreadCount.value - 1);
          }
          notifications.value.splice(index, 1);
        }
      }

      return response.data;
    } catch (error) {
      console.error("Failed to delete notification:", error);
      return { success: false, message: "เกิดข้อผิดพลาดในการลบการแจ้งเตือน" };
    }
  };

  const addNotification = (notification) => {
    notifications.value.unshift(notification);
    if (!notification.is_read) {
      unreadCount.value++;
    }
  };

  return {
    // State
    notifications,
    unreadCount,
    loading,

    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
  };
});
