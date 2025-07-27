import api from "./api";

// Notification Service
export const notificationService = {
  /**
   * ดึงรายการการแจ้งเตือนของผู้ใช้
   * @param {Object} params - พารามิเตอร์การค้นหา
   * @param {number} params.page - หน้าที่ต้องการ
   * @param {number} params.limit - จำนวนรายการต่อหน้า
   * @param {boolean} params.unread_only - แสดงเฉพาะที่ยังไม่ได้อ่าน
   * @returns {Promise} ข้อมูลการแจ้งเตือน
   */
  async getNotifications(params = {}) {
    const { page = 1, limit = 20, unread_only = false } = params;

    const response = await api.get("/notifications", {
      params: {
        page,
        limit,
        unread_only: unread_only.toString(),
      },
    });

    return response;
  },

  /**
   * ดึงการแจ้งเตือนล่าสุด (10 รายการ)
   * @returns {Promise} การแจ้งเตือนล่าสุด
   */
  async getRecent() {
    const response = await api.get("/notifications/recent");
    return response;
  },

  /**
   * ดึงจำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน
   * @returns {Promise} จำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน
   */
  async getUnreadCount() {
    const response = await api.get("/notifications/count");
    return response;
  },

  /**
   * ทำเครื่องหมายการแจ้งเตือนเป็นอ่านแล้ว
   * @param {number} notificationId - รหัสการแจ้งเตือน
   * @returns {Promise} ผลการอัปเดต
   */
  async markAsRead(notificationId) {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response;
  },

  /**
   * ทำเครื่องหมายการแจ้งเตือนทั้งหมดเป็นอ่านแล้ว
   * @returns {Promise} ผลการอัปเดต
   */
  async markAllAsRead() {
    const response = await api.put("/notifications/read-all");
    return response;
  },

  /**
   * ลบการแจ้งเตือน
   * @param {number} notificationId - รหัสการแจ้งเตือน
   * @returns {Promise} ผลการลบ
   */
  async deleteNotification(notificationId) {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response;
  },

  /**
   * ส่งการแจ้งเตือนทดสอบ (เฉพาะ Admin)
   * @param {Object} data - ข้อมูลการแจ้งเตือน
   * @param {number} data.target_user_id - รหัสผู้ใช้ที่จะส่งให้
   * @param {string} data.message - ข้อความการแจ้งเตือน
   * @returns {Promise} ผลการส่ง
   */
  async sendTestNotification(data) {
    const response = await api.post("/notifications/test", data);
    return response;
  },

  /**
   * ส่งการแจ้งเตือนให้ผู้ใช้ (เฉพาะ Admin)
   * @param {Object} data - ข้อมูลการแจ้งเตือน
   * @param {number} data.user_id - รหัสผู้ใช้ที่จะส่งให้
   * @param {string} data.title - หัวข้อการแจ้งเตือน
   * @param {string} data.message - ข้อความการแจ้งเตือน
   * @param {string} data.type - ประเภทการแจ้งเตือน (info, success, warning, error)
   * @param {number} data.related_target_id - รหัสเป้าหมายที่เกี่ยวข้อง
   * @returns {Promise} ผลการส่ง
   */
  async sendNotification(data) {
    const response = await api.post("/notifications/send", data);
    return response;
  },

  /**
   * ได้รับข้อความแจ้งเตือนตามประเภท
   * @param {string} type - ประเภทการแจ้งเตือน
   * @returns {Object} ข้อมูลสำหรับแสดงผล
   */
  getNotificationTypeInfo(type) {
    const typeInfo = {
      info: {
        icon: "fas fa-info-circle",
        color: "text-blue-500",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
      },
      success: {
        icon: "fas fa-check-circle",
        color: "text-green-500",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      },
      warning: {
        icon: "fas fa-exclamation-triangle",
        color: "text-yellow-500",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
      },
      error: {
        icon: "fas fa-times-circle",
        color: "text-red-500",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
      },
    };

    return typeInfo[type] || typeInfo.info;
  },

  /**
   * จัดรูปแบบเวลาสำหรับการแจ้งเตือน
   * @param {string} dateString - วันที่ในรูปแบบ string
   * @returns {string} เวลาที่จัดรูปแบบแล้ว
   */
  formatNotificationTime(dateString) {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInMs = now - notificationDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInMinutes < 1) {
      return "เมื่อสักครู่";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} นาทีที่แล้ว`;
    } else if (diffInMinutes < 1440) {
      // 24 hours
      const diffInHours = Math.floor(diffInMinutes / 60);
      return `${diffInHours} ชั่วโมงที่แล้ว`;
    } else if (diffInMinutes < 10080) {
      // 7 days
      const diffInDays = Math.floor(diffInMinutes / 1440);
      return `${diffInDays} วันที่แล้ว`;
    } else {
      // แสดงวันที่จริง
      return notificationDate.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  },
};

export default notificationService;
