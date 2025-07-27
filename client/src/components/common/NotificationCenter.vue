<template>
  <div class="notification-center">
    <!-- Notification Bell Icon -->
    <div class="notification-bell" @click="toggleNotifications">
      <i
        class="fas fa-bell"
        :class="{ 'has-notifications': unreadCount > 0 }"
      ></i>
      <span v-if="unreadCount > 0" class="notification-badge">{{
        unreadCount > 99 ? "99+" : unreadCount
      }}</span>
    </div>

    <!-- Notification Dropdown -->
    <div v-if="showNotifications" class="notification-dropdown" @click.stop>
      <div class="notification-header">
        <h3>การแจ้งเตือน</h3>
        <div class="notification-actions">
          <button
            @click="markAllAsRead"
            :disabled="unreadCount === 0"
            class="btn-mark-all"
          >
            อ่านทั้งหมด
          </button>
          <button @click="closeNotifications" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <div class="notification-body">
        <div v-if="loading" class="notification-loading">
          <i class="fas fa-spinner fa-spin"></i>
          กำลังโหลด...
        </div>

        <div v-else-if="notifications.length === 0" class="no-notifications">
          <i class="fas fa-inbox"></i>
          <p>ไม่มีการแจ้งเตือน</p>
        </div>

        <div v-else class="notification-list">
          <div
            v-for="notification in notifications"
            :key="notification.notification_id"
            class="notification-item"
            :class="{
              unread: !notification.is_read,
              [`type-${notification.type}`]: true,
            }"
            @click="markAsRead(notification)"
          >
            <div class="notification-icon">
              <i :class="getNotificationIcon(notification.type)"></i>
            </div>

            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-time">
                {{ getTimeAgo(notification.created_at) }}
              </div>
            </div>

            <div v-if="!notification.is_read" class="unread-indicator"></div>
          </div>
        </div>
      </div>

      <div class="notification-footer">
        <router-link
          to="/notifications"
          @click="closeNotifications"
          class="view-all-link"
        >
          ดูการแจ้งเตือนทั้งหมด
        </router-link>
      </div>
    </div>

    <!-- Overlay -->
    <div
      v-if="showNotifications"
      class="notification-overlay"
      @click="closeNotifications"
    ></div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";
import { useToast } from "@/composables/useToast";
import { notificationService } from "@/services/notificationService";

export default {
  name: "NotificationCenter",
  setup() {
    const { showToast } = useToast();

    const showNotifications = ref(false);
    const notifications = ref([]);
    const unreadCount = ref(0);
    const loading = ref(false);

    let pollInterval = null;

    // ฟังก์ชันโหลดการแจ้งเตือน
    const loadNotifications = async () => {
      try {
        loading.value = true;
        const response = await notificationService.getRecent();

        if (response.data.success) {
          notifications.value = response.data.data.notifications;
        }
      } catch (error) {
        console.error("Failed to load notifications:", error);
      } finally {
        loading.value = false;
      }
    };

    // ฟังก์ชันโหลดจำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน
    const loadUnreadCount = async () => {
      try {
        const response = await notificationService.getUnreadCount();

        if (response.data.success) {
          unreadCount.value = response.data.data.unread_count;
        }
      } catch (error) {
        console.error("Failed to load unread count:", error);
      }
    };

    // เปิด/ปิด dropdown การแจ้งเตือน
    const toggleNotifications = async () => {
      showNotifications.value = !showNotifications.value;

      if (showNotifications.value) {
        await loadNotifications();
      }
    };

    // ปิด dropdown การแจ้งเตือน
    const closeNotifications = () => {
      showNotifications.value = false;
    };

    // ทำเครื่องหมายการแจ้งเตือนเป็นอ่านแล้ว
    const markAsRead = async (notification) => {
      if (notification.is_read) return;

      try {
        await notificationService.markAsRead(notification.notification_id);

        // อัปเดต local state
        notification.is_read = true;
        unreadCount.value = Math.max(0, unreadCount.value - 1);
      } catch (error) {
        showToast("เกิดข้อผิดพลาดในการอัปเดตการแจ้งเตือน", "error");
      }
    };

    // ทำเครื่องหมายทั้งหมดเป็นอ่านแล้ว
    const markAllAsRead = async () => {
      try {
        await notificationService.markAllAsRead();

        // อัปเดต local state
        notifications.value.forEach((notif) => {
          notif.is_read = true;
        });
        unreadCount.value = 0;

        showToast("อ่านการแจ้งเตือนทั้งหมดแล้ว", "success");
      } catch (error) {
        showToast("เกิดข้อผิดพลาดในการอัปเดตการแจ้งเตือน", "error");
      }
    };

    // ได้ไอคอนตามประเภทการแจ้งเตือน
    const getNotificationIcon = (type) => {
      const icons = {
        info: "fas fa-info-circle text-blue-500",
        success: "fas fa-check-circle text-green-500",
        warning: "fas fa-exclamation-triangle text-yellow-500",
        error: "fas fa-times-circle text-red-500",
      };
      return icons[type] || icons.info;
    };

    // คำนวณเวลาที่ผ่านมา
    const getTimeAgo = (dateString) => {
      const now = new Date();
      const notificationDate = new Date(dateString);
      const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));

      if (diffInMinutes < 1) return "เมื่อสักครู่";
      if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`;

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours} ชั่วโมงที่แล้ว`;

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays} วันที่แล้ว`;

      return notificationDate.toLocaleDateString("th-TH");
    };

    // เริ่ม polling การแจ้งเตือน
    const startPolling = () => {
      loadUnreadCount(); // โหลดครั้งแรก

      pollInterval = setInterval(() => {
        loadUnreadCount();
      }, 30000); // ทุก 30 วินาที
    };

    // หยุด polling
    const stopPolling = () => {
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    };

    onMounted(() => {
      startPolling();
    });

    onUnmounted(() => {
      stopPolling();
    });

    return {
      showNotifications,
      notifications,
      unreadCount,
      loading,
      toggleNotifications,
      closeNotifications,
      markAsRead,
      markAllAsRead,
      getNotificationIcon,
      getTimeAgo,
    };
  },
};
</script>

<style scoped>
.notification-center {
  position: relative;
}

.notification-bell {
  position: relative;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.notification-bell:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.notification-bell i {
  font-size: 20px;
  color: #6b7280;
  transition: color 0.2s;
}

.notification-bell i.has-notifications {
  color: #f59e0b;
  animation: bell-shake 2s infinite;
}

.notification-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background-color: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 380px;
  max-height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.notification-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.notification-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-mark-all {
  font-size: 12px;
  padding: 4px 8px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-mark-all:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-mark-all:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.btn-close {
  background: none;
  border: none;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
}

.btn-close:hover {
  color: #374151;
}

.notification-body {
  max-height: 350px;
  overflow-y: auto;
}

.notification-loading,
.no-notifications {
  padding: 40px 20px;
  text-align: center;
  color: #6b7280;
}

.no-notifications i {
  font-size: 32px;
  margin-bottom: 12px;
  color: #d1d5db;
}

.notification-list {
  padding: 0;
}

.notification-item {
  display: flex;
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.notification-item:hover {
  background-color: #f9fafb;
}

.notification-item.unread {
  background-color: #fef3cd;
}

.notification-item.unread:hover {
  background-color: #fde68a;
}

.notification-icon {
  flex-shrink: 0;
  margin-right: 12px;
  margin-top: 2px;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
  font-size: 14px;
}

.notification-message {
  color: #6b7280;
  font-size: 13px;
  line-height: 1.4;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-time {
  font-size: 11px;
  color: #9ca3af;
}

.unread-indicator {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background-color: #3b82f6;
  border-radius: 50%;
}

.notification-footer {
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
  text-align: center;
}

.view-all-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
}

.view-all-link:hover {
  color: #2563eb;
  text-decoration: underline;
}

.notification-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

/* Animations */
@keyframes bell-shake {
  0%,
  50%,
  100% {
    transform: rotate(0deg);
  }
  10%,
  30% {
    transform: rotate(-10deg);
  }
  20%,
  40% {
    transform: rotate(10deg);
  }
}

/* Type-specific styling */
.type-success .notification-icon {
  color: #10b981;
}

.type-warning .notification-icon {
  color: #f59e0b;
}

.type-error .notification-icon {
  color: #ef4444;
}

.type-info .notification-icon {
  color: #3b82f6;
}

/* Responsive */
@media (max-width: 640px) {
  .notification-dropdown {
    width: 320px;
    right: -10px;
  }
}

@media (max-width: 480px) {
  .notification-dropdown {
    width: 300px;
    right: -20px;
  }
}
</style>
