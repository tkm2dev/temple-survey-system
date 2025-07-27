const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const { executeQuery } = require("../config/database");
const logger = require("../utils/logger");
const moment = require("moment");

// Apply authentication to all dashboard routes
router.use(authenticateToken);

// @route   GET /api/dashboard/stats
// @desc    Get comprehensive dashboard statistics
// @access  Private
router.get("/stats", async (req, res) => {
  try {
    console.log("🔍 [DASHBOARD] Starting to get stats...");

    // Get basic statistics first
    let totalSurveys, surveysByStatus, userStats, performanceMetrics;

    try {
      totalSurveys = await getTotalSurveys();
      console.log("✅ [DASHBOARD] Got total surveys:", totalSurveys);
    } catch (error) {
      console.error("❌ [DASHBOARD] Error in getTotalSurveys:", error.message);
      throw error;
    }

    try {
      surveysByStatus = await getSurveysByStatus();
      console.log("✅ [DASHBOARD] Got surveys by status:", surveysByStatus);
    } catch (error) {
      console.error(
        "❌ [DASHBOARD] Error in getSurveysByStatus:",
        error.message
      );
      throw error;
    }

    try {
      userStats = await getUserStatistics();
      console.log("✅ [DASHBOARD] Got user stats:", userStats);
    } catch (error) {
      console.error(
        "❌ [DASHBOARD] Error in getUserStatistics:",
        error.message
      );
      throw error;
    }

    try {
      performanceMetrics = await getPerformanceMetrics();
      console.log(
        "✅ [DASHBOARD] Got performance metrics:",
        performanceMetrics
      );
    } catch (error) {
      console.error(
        "❌ [DASHBOARD] Error in getPerformanceMetrics:",
        error.message
      );
      throw error;
    }

    res.json({
      success: true,
      data: {
        overview: {
          totalSurveys: totalSurveys.total,
          approvedSurveys: surveysByStatus.approved || 0,
          pendingSurveys: surveysByStatus.pending || 0,
          draftSurveys: surveysByStatus.draft || 0,
          rejectedSurveys: surveysByStatus.rejected || 0,
          totalUsers: userStats.total,
          activeUsers: userStats.active,
          todaySurveys: performanceMetrics.today,
          weekSurveys: performanceMetrics.week,
          monthSurveys: performanceMetrics.month,
          newSurveysThisMonth: performanceMetrics.newThisMonth,
          completionRate: performanceMetrics.completionRate,
        },
        charts: {
          statusDistribution: Object.entries(surveysByStatus).map(
            ([status, count]) => ({
              label: getStatusLabel(status),
              value: count,
              color: getStatusColor(status),
            })
          ),
          typeDistribution: [],
          monthlyTrends: [],
        },
        recentActivities: [],
        performance: performanceMetrics,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ [DASHBOARD] Error:", error);
    logger.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   GET /api/dashboard/recent-surveys
// @desc    Get recent surveys for dashboard
// @access  Private
router.get("/recent-surveys", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;

    const recentSurveys = await executeQuery(
      `
      SELECT 
        st.target_id,
        st.target_name,
        st.status,
        st.created_at,
        st.updated_at,
        st.province,
        stt.type_name,
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name
      FROM survey_targets st
      LEFT JOIN survey_target_types stt ON st.type_id = stt.type_id
      LEFT JOIN users u ON st.created_by = u.user_id
      ORDER BY st.updated_at DESC
      LIMIT ?
    `,
      [limit]
    );

    res.json({
      success: true,
      data: recentSurveys,
    });
  } catch (error) {
    logger.error("Recent surveys error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลการสำรวจล่าสุด",
    });
  }
});

// @route   GET /api/dashboard/monthly-trends
// @desc    Get monthly survey trends for charts
// @access  Private
router.get("/monthly-trends", async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 6;
    const trends = await getMonthlyTrends(months);

    res.json({
      success: true,
      data: trends,
    });
  } catch (error) {
    logger.error("Monthly trends error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลแนวโน้ม",
    });
  }
});

// @route   GET /api/dashboard/system-notifications
// @desc    Get system notifications for dashboard
// @access  Private
router.get("/system-notifications", async (req, res) => {
  try {
    const notifications = await getSystemNotifications();

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    logger.error("System notifications error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงการแจ้งเตือน",
    });
  }
});

// @route   POST /api/dashboard/export
// @desc    Export dashboard data
// @access  Private
router.post("/export", async (req, res) => {
  try {
    const { format = "json", includeCharts = false } = req.body;

    const dashboardData = await getCompleteDashboardData();

    if (format === "csv") {
      // Convert to CSV format
      const csv = convertToCSV(dashboardData);
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=dashboard-export.csv"
      );
      res.send("\uFEFF" + csv); // Add BOM for UTF-8
    } else {
      // JSON format
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=dashboard-export.json"
      );
      res.json({
        success: true,
        data: dashboardData,
        exportDate: new Date().toISOString(),
        exportedBy: req.user.user_id,
      });
    }
  } catch (error) {
    logger.error("Dashboard export error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการส่งออกข้อมูล",
    });
  }
});

// Helper functions
async function getTotalSurveys() {
  const result = await executeQuery(
    "SELECT COUNT(*) as total FROM survey_targets"
  );
  return result[0];
}

async function getSurveysByStatus() {
  const results = await executeQuery(`
    SELECT 
      status,
      COUNT(*) as count
    FROM survey_targets 
    GROUP BY status
  `);

  const statusMap = {
    draft: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  };

  results.forEach((row) => {
    const status = row.status.toLowerCase().replace(/\s+/g, "_");
    switch (status) {
      case "draft":
        statusMap.draft = row.count;
        break;
      case "pending_review":
        statusMap.pending = row.count;
        break;
      case "approved":
        statusMap.approved = row.count;
        break;
      case "needs_revision":
        statusMap.rejected = row.count;
        break;
    }
  });

  return statusMap;
}

async function getSurveysByType() {
  const results = await executeQuery(`
    SELECT 
      stt.type_name as label,
      COUNT(st.target_id) as value
    FROM survey_target_types stt
    LEFT JOIN survey_targets st ON stt.type_id = st.type_id
    GROUP BY stt.type_id, stt.type_name
    ORDER BY value DESC
  `);

  return results;
}

async function getRecentActivities() {
  const results = await executeQuery(`
    SELECT 
      al.log_id,
      al.action_type,
      al.target_table,
      al.target_id,
      al.timestamp,
      CONCAT(u.first_name, ' ', u.last_name) as user_name
    FROM activity_logs al
    LEFT JOIN users u ON al.user_id = u.user_id
    ORDER BY al.timestamp DESC
    LIMIT 10
  `);

  return results.map((activity) => ({
    id: activity.log_id,
    title: getActivityTitle(activity.action_type, activity.target_table),
    message: getActivityMessage(activity),
    user: activity.user_name,
    date: activity.timestamp,
    icon: getActivityIcon(activity.action),
    color: getActivityColor(activity.action),
  }));
}

async function getMonthlyTrends(months = 6) {
  const results = await executeQuery(
    `
    SELECT 
      DATE_FORMAT(created_at, '%Y-%m') as month,
      COUNT(*) as count
    FROM survey_targets
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    ORDER BY month ASC
  `,
    [months]
  );

  // Fill in missing months with 0 counts
  const trends = [];
  for (let i = months - 1; i >= 0; i--) {
    const month = moment().subtract(i, "months").format("YYYY-MM");
    const found = results.find((r) => r.month === month);
    trends.push({
      month: moment(month).format("MMM YYYY"),
      count: found ? found.count : 0,
    });
  }

  return trends;
}

async function getUserStatistics() {
  const [totalResult, activeResult] = await Promise.all([
    executeQuery("SELECT COUNT(*) as total FROM users WHERE is_active = 1"),
    executeQuery(`
      SELECT COUNT(DISTINCT user_id) as active 
      FROM activity_logs 
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `),
  ]);

  return {
    total: totalResult[0].total,
    active: activeResult[0].active,
  };
}

async function getPerformanceMetrics() {
  const [todayResult, weekResult, monthResult, completionResult] =
    await Promise.all([
      executeQuery(`
        SELECT COUNT(*) as count 
        FROM survey_targets 
        WHERE DATE(created_at) = CURDATE()
      `),
      executeQuery(`
        SELECT COUNT(*) as count 
        FROM survey_targets 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      `),
      executeQuery(`
        SELECT COUNT(*) as count 
        FROM survey_targets 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `),
      executeQuery(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approved
        FROM survey_targets
      `),
    ]);

  const total = completionResult[0].total;
  const approved = completionResult[0].approved;

  return {
    today: todayResult[0].count,
    week: weekResult[0].count,
    month: monthResult[0].count,
    newThisMonth: monthResult[0].count,
    completionRate: total > 0 ? Math.round((approved / total) * 100) : 0,
  };
}

async function getSystemNotifications() {
  // This could be enhanced to pull from a notifications table
  // For now, return some system-generated notifications
  const notifications = [
    {
      id: 1,
      title: "ระบบได้รับการอัปเดต",
      message: "เพิ่มฟีเจอร์การส่งออกรายงานใหม่และปรับปรุง Dashboard",
      date: new Date(),
      icon: "bi bi-arrow-up-circle",
      color: "#28a745",
      type: "system",
    },
  ];

  // Add dynamic notifications based on data
  const pendingCount = await executeQuery(`
    SELECT COUNT(*) as count 
    FROM survey_targets 
    WHERE status = 'Pending Review'
  `);

  if (pendingCount[0].count > 0) {
    notifications.push({
      id: 2,
      title: "การสำรวจใหม่",
      message: `มีการสำรวจใหม่ ${pendingCount[0].count} รายการรอการตรวจสอบ`,
      date: new Date(Date.now() - 3600000),
      icon: "bi bi-clipboard-check",
      color: "#ffc107",
      type: "pending",
    });
  }

  return notifications;
}

async function getCompleteDashboardData() {
  const [stats, recentSurveys, trends] = await Promise.all([
    getTotalSurveys(),
    executeQuery(`
      SELECT st.*, stt.type_name 
      FROM survey_targets st 
      LEFT JOIN survey_target_types stt ON st.type_id = stt.type_id 
      ORDER BY st.updated_at DESC 
      LIMIT 50
    `),
    getMonthlyTrends(12),
  ]);

  return {
    overview: stats,
    recentSurveys,
    trends,
    exportMetadata: {
      totalRecords: recentSurveys.length,
      generatedAt: new Date().toISOString(),
    },
  };
}

function convertToCSV(data) {
  const surveys = data.recentSurveys;
  if (!surveys || surveys.length === 0) return "";

  const headers = [
    "รหัส",
    "ชื่อเป้าหมาย",
    "ประเภท",
    "จังหวัด",
    "สถานะ",
    "วันที่สร้าง",
    "วันที่อัปเดต",
  ];

  const rows = surveys.map((survey) => [
    survey.target_id,
    survey.target_name || "",
    survey.type_name || "",
    survey.province || "",
    survey.status || "",
    moment(survey.created_at).format("DD/MM/YYYY HH:mm"),
    moment(survey.updated_at).format("DD/MM/YYYY HH:mm"),
  ]);

  return [headers, ...rows].map((row) => row.join(",")).join("\n");
}

// Status and activity helper functions
function getStatusLabel(status) {
  const labels = {
    draft: "ร่าง",
    pending: "รอตรวจสอบ",
    approved: "อนุมัติแล้ว",
    rejected: "ต้องแก้ไข",
  };
  return labels[status] || status;
}

function getStatusColor(status) {
  const colors = {
    draft: "#6c757d",
    pending: "#ffc107",
    approved: "#28a745",
    rejected: "#dc3545",
  };
  return colors[status] || "#6c757d";
}

function getActivityTitle(action, tableName) {
  const actionMap = {
    CREATE: "สร้าง",
    UPDATE: "แก้ไข",
    DELETE: "ลบ",
    LOGIN: "เข้าสู่ระบบ",
    LOGOUT: "ออกจากระบบ",
  };

  const tableMap = {
    survey_targets: "ข้อมูลการสำรวจ",
    users: "ผู้ใช้งาน",
    survey_target_types: "ประเภทการสำรวจ",
  };

  return `${actionMap[action] || action} ${tableMap[tableName] || tableName}`;
}

function getActivityMessage(activity) {
  return `${activity.user_name} ได้ ${getActivityTitle(
    activity.action_type,
    activity.target_table
  )}`;
}

function getActivityIcon(action) {
  const icons = {
    CREATE: "bi bi-plus-circle",
    UPDATE: "bi bi-pencil-square",
    DELETE: "bi bi-trash",
    LOGIN: "bi bi-box-arrow-in-right",
    LOGOUT: "bi bi-box-arrow-right",
  };
  return icons[action] || "bi bi-activity";
}

function getActivityColor(action) {
  const colors = {
    CREATE: "#28a745",
    UPDATE: "#17a2b8",
    DELETE: "#dc3545",
    LOGIN: "#007bff",
    LOGOUT: "#6c757d",
  };
  return colors[action] || "#6c757d";
}

module.exports = router;
