const express = require("express");
const { executeQuery } = require("../config/database");
const { authenticateToken } = require("../middleware/auth");
const logger = require("../utils/logger");

const router = express.Router();

// Apply authentication to all notification routes
router.use(authenticateToken);

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 20, unread_only = "false" } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        n.*,
        st.target_name
      FROM notifications n
      LEFT JOIN survey_targets st ON n.related_target_id = st.target_id
      WHERE n.user_id = ?
    `;

    const params = [req.user.user_id];

    // Filter for unread only
    if (unread_only === "true") {
      query += ` AND n.is_read = FALSE`;
    }

    // Add pagination
    query += ` ORDER BY n.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    // Get notifications
    const notifications = await executeQuery(query, params);

    // Get unread count
    const unreadCount = await executeQuery(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE",
      [req.user.user_id]
    );

    res.json({
      success: true,
      data: {
        notifications,
        unread_count: unreadCount[0].count,
      },
    });
  } catch (error) {
    logger.error("Get notifications error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลการแจ้งเตือน",
    });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put("/:id/read", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if notification belongs to user
    const notifications = await executeQuery(
      "SELECT notification_id FROM notifications WHERE notification_id = ? AND user_id = ?",
      [id, req.user.user_id]
    );

    if (notifications.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบการแจ้งเตือนที่ระบุ",
      });
    }

    // Mark as read
    await executeQuery(
      "UPDATE notifications SET is_read = TRUE WHERE notification_id = ?",
      [id]
    );

    res.json({
      success: true,
      message: "อัปเดตสถานะการแจ้งเตือนสำเร็จ",
    });
  } catch (error) {
    logger.error("Mark notification read error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัปเดตการแจ้งเตือน",
    });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put("/read-all", async (req, res) => {
  try {
    await executeQuery(
      "UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE",
      [req.user.user_id]
    );

    res.json({
      success: true,
      message: "อ่านการแจ้งเตือนทั้งหมดแล้ว",
    });
  } catch (error) {
    logger.error("Mark all notifications read error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัปเดตการแจ้งเตือน",
    });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if notification belongs to user
    const notifications = await executeQuery(
      "SELECT notification_id FROM notifications WHERE notification_id = ? AND user_id = ?",
      [id, req.user.user_id]
    );

    if (notifications.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบการแจ้งเตือนที่ระบุ",
      });
    }

    // Delete notification
    await executeQuery("DELETE FROM notifications WHERE notification_id = ?", [
      id,
    ]);

    res.json({
      success: true,
      message: "ลบการแจ้งเตือนสำเร็จ",
    });
  } catch (error) {
    logger.error("Delete notification error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการลบการแจ้งเตือน",
    });
  }
});

// @route   POST /api/notifications/send
// @desc    Send notification to user (Admin only)
// @access  Private/Admin
router.post("/send", async (req, res) => {
  try {
    // This would need admin authorization middleware
    const {
      user_id,
      title,
      message,
      type = "info",
      related_target_id,
    } = req.body;

    if (!user_id || !title || !message) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน",
      });
    }

    await executeQuery(
      `
      INSERT INTO notifications (user_id, title, message, type, related_target_id)
      VALUES (?, ?, ?, ?, ?)
    `,
      [user_id, title, message, type, related_target_id]
    );

    res.status(201).json({
      success: true,
      message: "ส่งการแจ้งเตือนสำเร็จ",
    });
  } catch (error) {
    logger.error("Send notification error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการส่งการแจ้งเตือน",
    });
  }
});

module.exports = router;
