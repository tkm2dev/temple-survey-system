const express = require("express");
const router = express.Router();
const db = require("../config/database");
const auth = require("../middleware/auth");

// Get audit logs with pagination and filters
router.get("/logs", auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      action = "",
      table_name = "",
      user_id = "",
      ip_address = "",
      record_id = "",
      date_from = "",
      date_to = "",
      sort = "created_at",
      order = "DESC",
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let params = [];

    // Build WHERE conditions
    if (search) {
      whereConditions.push(`(
        al.action LIKE ? OR 
        al.table_name LIKE ? OR 
        al.old_values LIKE ? OR 
        al.new_values LIKE ? OR
        u.name LIKE ? OR
        u.email LIKE ?
      )`);
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (action) {
      whereConditions.push("al.action = ?");
      params.push(action);
    }

    if (table_name) {
      whereConditions.push("al.table_name = ?");
      params.push(table_name);
    }

    if (user_id) {
      whereConditions.push("al.user_id = ?");
      params.push(user_id);
    }

    if (ip_address) {
      whereConditions.push("al.ip_address LIKE ?");
      params.push(`%${ip_address}%`);
    }

    if (record_id) {
      whereConditions.push("al.record_id = ?");
      params.push(record_id);
    }

    if (date_from) {
      whereConditions.push("DATE(al.created_at) >= ?");
      params.push(date_from);
    }

    if (date_to) {
      whereConditions.push("DATE(al.created_at) <= ?");
      params.push(date_to);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(" AND ")}` 
      : "";

    // Count total records
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ${whereClause}
    `;
    const countResult = await db.query(countQuery, params);
    const total = countResult[0].total;

    // Get audit logs with user information
    const auditQuery = `
      SELECT 
        al.*,
        u.name as user_name,
        u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ${whereClause}
      ORDER BY al.${sort} ${order}
      LIMIT ? OFFSET ?
    `;
    const auditLogs = await db.query(auditQuery, [...params, parseInt(limit), offset]);

    res.json({
      success: true,
      data: auditLogs,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ message: "Failed to fetch audit logs" });
  }
});

// Get audit log by ID
router.get("/logs/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const auditLog = await db.query(`
      SELECT 
        al.*,
        u.name as user_name,
        u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.id = ?
    `, [id]);

    if (auditLog.length === 0) {
      return res.status(404).json({ message: "Audit log not found" });
    }

    res.json(auditLog[0]);
  } catch (error) {
    console.error("Error fetching audit log:", error);
    res.status(500).json({ message: "Failed to fetch audit log" });
  }
});

// Get audit statistics
router.get("/statistics", auth, async (req, res) => {
  try {
    const statistics = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN action = 'CREATE' THEN 1 ELSE 0 END) as creates,
        SUM(CASE WHEN action = 'UPDATE' THEN 1 ELSE 0 END) as updates,
        SUM(CASE WHEN action = 'DELETE' THEN 1 ELSE 0 END) as deletes,
        SUM(CASE WHEN action LIKE 'BULK_%' THEN 1 ELSE 0 END) as bulk_operations
      FROM audit_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    res.json(statistics[0]);
  } catch (error) {
    console.error("Error fetching audit statistics:", error);
    res.status(500).json({ message: "Failed to fetch audit statistics" });
  }
});

// Get available tables
router.get("/tables", auth, async (req, res) => {
  try {
    const tables = await db.query(`
      SELECT DISTINCT table_name 
      FROM audit_logs 
      WHERE table_name IS NOT NULL 
      ORDER BY table_name
    `);

    res.json(tables.map(row => row.table_name));
  } catch (error) {
    console.error("Error fetching tables:", error);
    res.status(500).json({ message: "Failed to fetch tables" });
  }
});

// Get available users
router.get("/users", auth, async (req, res) => {
  try {
    const users = await db.query(`
      SELECT DISTINCT u.id, u.name, u.email
      FROM users u
      INNER JOIN audit_logs al ON u.id = al.user_id
      ORDER BY u.name
    `);

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Get audit logs by table
router.get("/logs/table/:tableName", auth, async (req, res) => {
  try {
    const { tableName } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const auditLogs = await db.query(`
      SELECT 
        al.*,
        u.name as user_name,
        u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.table_name = ?
      ORDER BY al.created_at DESC
      LIMIT ? OFFSET ?
    `, [tableName, parseInt(limit), offset]);

    const countResult = await db.query(
      "SELECT COUNT(*) as total FROM audit_logs WHERE table_name = ?",
      [tableName]
    );

    res.json({
      data: auditLogs,
      total: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("Error fetching audit logs by table:", error);
    res.status(500).json({ message: "Failed to fetch audit logs" });
  }
});

// Get audit logs by user
router.get("/logs/user/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const auditLogs = await db.query(`
      SELECT 
        al.*,
        u.name as user_name,
        u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.user_id = ?
      ORDER BY al.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, parseInt(limit), offset]);

    const countResult = await db.query(
      "SELECT COUNT(*) as total FROM audit_logs WHERE user_id = ?",
      [userId]
    );

    res.json({
      data: auditLogs,
      total: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("Error fetching audit logs by user:", error);
    res.status(500).json({ message: "Failed to fetch audit logs" });
  }
});

// Get audit logs by record
router.get("/logs/record/:tableName/:recordId", auth, async (req, res) => {
  try {
    const { tableName, recordId } = req.params;

    const auditLogs = await db.query(`
      SELECT 
        al.*,
        u.name as user_name,
        u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.table_name = ? AND al.record_id = ?
      ORDER BY al.created_at DESC
    `, [tableName, recordId]);

    res.json(auditLogs);
  } catch (error) {
    console.error("Error fetching audit logs by record:", error);
    res.status(500).json({ message: "Failed to fetch audit logs" });
  }
});

// Get recent activity
router.get("/recent", auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recentActivity = await db.query(`
      SELECT 
        al.*,
        u.name as user_name,
        u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT ?
    `, [parseInt(limit)]);

    res.json(recentActivity);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({ message: "Failed to fetch recent activity" });
  }
});

// Get activity by date range
router.get("/activity", auth, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const activity = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        action
      FROM audit_logs
      WHERE DATE(created_at) BETWEEN ? AND ?
      GROUP BY DATE(created_at), action
      ORDER BY date DESC, action
    `, [start_date, end_date]);

    res.json(activity);
  } catch (error) {
    console.error("Error fetching activity by date range:", error);
    res.status(500).json({ message: "Failed to fetch activity" });
  }
});

// Get user activity summary
router.get("/users/:userId/activity", auth, async (req, res) => {
  try {
    const { userId } = req.params;

    const activitySummary = await db.query(`
      SELECT 
        action,
        table_name,
        COUNT(*) as count,
        MAX(created_at) as last_activity
      FROM audit_logs
      WHERE user_id = ?
      GROUP BY action, table_name
      ORDER BY last_activity DESC
    `, [userId]);

    res.json(activitySummary);
  } catch (error) {
    console.error("Error fetching user activity summary:", error);
    res.status(500).json({ message: "Failed to fetch user activity summary" });
  }
});

// Search audit logs
router.get("/search", auth, async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const searchResults = await db.query(`
      SELECT 
        al.*,
        u.name as user_name,
        u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 
        al.action LIKE ? OR
        al.table_name LIKE ? OR
        al.old_values LIKE ? OR
        al.new_values LIKE ? OR
        u.name LIKE ? OR
        u.email LIKE ?
      ORDER BY al.created_at DESC
      LIMIT ? OFFSET ?
    `, [
      `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`,
      parseInt(limit), offset
    ]);

    const countResult = await db.query(`
      SELECT COUNT(*) as total
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 
        al.action LIKE ? OR
        al.table_name LIKE ? OR
        al.old_values LIKE ? OR
        al.new_values LIKE ? OR
        u.name LIKE ? OR
        u.email LIKE ?
    `, [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`]);

    res.json({
      data: searchResults,
      total: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("Error searching audit logs:", error);
    res.status(500).json({ message: "Failed to search audit logs" });
  }
});

// Create audit log (for manual logging)
router.post("/logs", auth, async (req, res) => {
  try {
    const { action, table_name, record_id, old_values, new_values } = req.body;

    const result = await db.query(`
      INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id,
      action,
      table_name,
      record_id,
      old_values ? JSON.stringify(old_values) : null,
      new_values ? JSON.stringify(new_values) : null,
      req.ip
    ]);

    res.status(201).json({
      message: "Audit log created successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating audit log:", error);
    res.status(500).json({ message: "Failed to create audit log" });
  }
});

// Export audit logs
router.get("/export", auth, async (req, res) => {
  try {
    const {
      search = "",
      action = "",
      table_name = "",
      user_id = "",
      date_from = "",
      date_to = "",
    } = req.query;

    let whereConditions = [];
    let params = [];

    if (search) {
      whereConditions.push(`(
        al.action LIKE ? OR 
        al.table_name LIKE ? OR 
        u.name LIKE ? OR
        u.email LIKE ?
      )`);
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (action) {
      whereConditions.push("al.action = ?");
      params.push(action);
    }

    if (table_name) {
      whereConditions.push("al.table_name = ?");
      params.push(table_name);
    }

    if (user_id) {
      whereConditions.push("al.user_id = ?");
      params.push(user_id);
    }

    if (date_from) {
      whereConditions.push("DATE(al.created_at) >= ?");
      params.push(date_from);
    }

    if (date_to) {
      whereConditions.push("DATE(al.created_at) <= ?");
      params.push(date_to);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(" AND ")}` 
      : "";

    const auditLogs = await db.query(`
      SELECT 
        al.id,
        DATE_FORMAT(al.created_at, '%Y-%m-%d %H:%i:%s') as timestamp,
        u.name as user_name,
        u.email as user_email,
        al.action,
        al.table_name,
        al.record_id,
        al.ip_address,
        al.old_values,
        al.new_values
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ${whereClause}
      ORDER BY al.created_at DESC
    `, params);

    // Create CSV content
    const headers = ['ID', 'Timestamp', 'User Name', 'User Email', 'Action', 'Table', 'Record ID', 'IP Address', 'Old Values', 'New Values'];
    const csvRows = [headers.join(',')];

    auditLogs.forEach(row => {
      const values = [
        row.id,
        `"${row.timestamp}"`,
        `"${row.user_name || ''}"`,
        `"${row.user_email || ''}"`,
        `"${row.action}"`,
        `"${row.table_name}"`,
        `"${row.record_id || ''}"`,
        `"${row.ip_address || ''}"`,
        `"${row.old_values ? String(row.old_values).replace(/"/g, '""') : ''}"`,
        `"${row.new_values ? String(row.new_values).replace(/"/g, '""') : ''}"`
      ];
      csvRows.push(values.join(','));
    });

    const csvContent = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="audit-logs-export.csv"');
    res.send(csvContent);
  } catch (error) {
    console.error("Error exporting audit logs:", error);
    res.status(500).json({ message: "Failed to export audit logs" });
  }
});

module.exports = router;
