const express = require("express");
const { executeQuery } = require("../config/database");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const logger = require("../utils/logger");

const router = express.Router();

// Apply authentication to all audit routes
router.use(authenticateToken);

// @route   GET /api/audit/logs
// @desc    Get audit logs
// @access  Private/Admin
router.get("/logs", authorizeRoles("Admin"), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      user_id = "",
      action_type = "",
      target_table = "",
      date_from = "",
      date_to = "",
    } = req.query;

    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        al.*,
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
        u.username
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.user_id
      WHERE 1=1
    `;

    let countQuery = `
      SELECT COUNT(*) as total 
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.user_id
      WHERE 1=1
    `;

    const params = [];
    const countParams = [];

    // Add filters
    if (user_id) {
      query += ` AND al.user_id = ?`;
      countQuery += ` AND al.user_id = ?`;
      params.push(user_id);
      countParams.push(user_id);
    }

    if (action_type) {
      query += ` AND al.action_type = ?`;
      countQuery += ` AND al.action_type = ?`;
      params.push(action_type);
      countParams.push(action_type);
    }

    if (target_table) {
      query += ` AND al.target_table = ?`;
      countQuery += ` AND al.target_table = ?`;
      params.push(target_table);
      countParams.push(target_table);
    }

    if (date_from) {
      query += ` AND DATE(al.timestamp) >= ?`;
      countQuery += ` AND DATE(al.timestamp) >= ?`;
      params.push(date_from);
      countParams.push(date_from);
    }

    if (date_to) {
      query += ` AND DATE(al.timestamp) <= ?`;
      countQuery += ` AND DATE(al.timestamp) <= ?`;
      params.push(date_to);
      countParams.push(date_to);
    }

    // Add pagination
    query += ` ORDER BY al.timestamp DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    // Execute queries
    const [logs, totalResult] = await Promise.all([
      executeQuery(query, params),
      executeQuery(countQuery, countParams),
    ]);

    const total = totalResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // Parse JSON details for better display
    const processedLogs = logs.map((log) => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null,
    }));

    res.json({
      success: true,
      data: {
        logs: processedLogs,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalRecords: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    logger.error("Get audit logs error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล Audit Logs",
    });
  }
});

// @route   GET /api/audit/stats
// @desc    Get audit statistics
// @access  Private/Admin
router.get("/stats", authorizeRoles("Admin"), async (req, res) => {
  try {
    const { days = 30 } = req.query;

    // Get activity stats for the last N days
    const activityStats = await executeQuery(
      `
      SELECT 
        action_type,
        COUNT(*) as count
      FROM activity_logs 
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY action_type
      ORDER BY count DESC
    `,
      [days]
    );

    // Get user activity stats
    const userStats = await executeQuery(
      `
      SELECT 
        u.username,
        CONCAT(u.first_name, ' ', u.last_name) as full_name,
        COUNT(al.log_id) as activity_count
      FROM users u
      LEFT JOIN activity_logs al ON u.user_id = al.user_id 
        AND al.timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY u.user_id, u.username, u.first_name, u.last_name
      ORDER BY activity_count DESC
      LIMIT 10
    `,
      [days]
    );

    // Get table modification stats
    const tableStats = await executeQuery(
      `
      SELECT 
        target_table,
        COUNT(*) as modification_count
      FROM activity_logs 
      WHERE target_table IS NOT NULL 
        AND timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
        AND action_type IN ('CREATE', 'UPDATE', 'DELETE')
      GROUP BY target_table
      ORDER BY modification_count DESC
    `,
      [days]
    );

    // Get daily activity trends
    const dailyTrends = await executeQuery(
      `
      SELECT 
        DATE(timestamp) as date,
        COUNT(*) as total_activities,
        COUNT(DISTINCT user_id) as active_users
      FROM activity_logs 
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
    `,
      [days]
    );

    res.json({
      success: true,
      data: {
        period_days: parseInt(days),
        activity_by_type: activityStats,
        user_activity: userStats,
        table_modifications: tableStats,
        daily_trends: dailyTrends,
      },
    });
  } catch (error) {
    logger.error("Get audit stats error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงสถิติ Audit",
    });
  }
});

// @route   GET /api/audit/target/:targetId
// @desc    Get audit logs for specific target
// @access  Private/Admin
router.get("/target/:targetId", authorizeRoles("Admin"), async (req, res) => {
  try {
    const { targetId } = req.params;

    const logs = await executeQuery(
      `
      SELECT 
        al.*,
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
        u.username
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.user_id
      WHERE al.target_table = 'survey_targets' AND al.target_id = ?
         OR (al.target_table IN ('temple_details', 'personnel', 'bank_accounts', 'attachments') 
             AND al.details LIKE ?)
      ORDER BY al.timestamp DESC
    `,
      [targetId, `%"target_id":${targetId}%`]
    );

    // Parse JSON details
    const processedLogs = logs.map((log) => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null,
    }));

    res.json({
      success: true,
      data: processedLogs,
    });
  } catch (error) {
    logger.error("Get target audit logs error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงประวัติการแก้ไข",
    });
  }
});

module.exports = router;
