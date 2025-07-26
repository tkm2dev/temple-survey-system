const express = require("express");
const router = express.Router();
const db = require("../config/database");
const auth = require("../middleware/auth");

// Get master data with pagination and filters
router.get("/", auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      category = "",
      status = "",
      data_type = "",
      sort = "key",
      order = "ASC",
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let params = [];

    // Build WHERE conditions
    if (search) {
      whereConditions.push("(key LIKE ? OR value LIKE ? OR description LIKE ?)");
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (category) {
      whereConditions.push("category = ?");
      params.push(category);
    }

    if (status) {
      whereConditions.push("status = ?");
      params.push(status);
    }

    if (data_type) {
      whereConditions.push("data_type = ?");
      params.push(data_type);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(" AND ")}` 
      : "";

    // Count total records
    const countQuery = `SELECT COUNT(*) as total FROM master_data ${whereClause}`;
    const countResult = await db.query(countQuery, params);
    const total = countResult[0].total;

    // Get master data with pagination
    const dataQuery = `
      SELECT * FROM master_data 
      ${whereClause}
      ORDER BY ${sort} ${order}
      LIMIT ? OFFSET ?
    `;
    const masterData = await db.query(dataQuery, [...params, parseInt(limit), offset]);

    res.json({
      success: true,
      data: masterData,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching master data:", error);
    res.status(500).json({ message: "Failed to fetch master data" });
  }
});

// Get master data statistics
router.get("/statistics", auth, async (req, res) => {
  try {
    const statistics = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive,
        COUNT(DISTINCT category) as categories
      FROM master_data
    `);

    res.json(statistics[0]);
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ message: "Failed to fetch statistics" });
  }
});

// Get categories
router.get("/categories", auth, async (req, res) => {
  try {
    const categories = await db.query(`
      SELECT DISTINCT category 
      FROM master_data 
      WHERE category IS NOT NULL AND category != ''
      ORDER BY category
    `);

    res.json(categories.map(row => row.category));
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

// Get single master data by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const masterData = await db.query("SELECT * FROM master_data WHERE id = ?", [id]);

    if (masterData.length === 0) {
      return res.status(404).json({ message: "Master data not found" });
    }

    res.json(masterData[0]);
  } catch (error) {
    console.error("Error fetching master data:", error);
    res.status(500).json({ message: "Failed to fetch master data" });
  }
});

// Get master data by key
router.get("/key/:key", auth, async (req, res) => {
  try {
    const { key } = req.params;
    const masterData = await db.query("SELECT * FROM master_data WHERE key = ?", [key]);

    if (masterData.length === 0) {
      return res.status(404).json({ message: "Master data not found" });
    }

    res.json(masterData[0]);
  } catch (error) {
    console.error("Error fetching master data:", error);
    res.status(500).json({ message: "Failed to fetch master data" });
  }
});

// Get master data by category
router.get("/category/:category", auth, async (req, res) => {
  try {
    const { category } = req.params;
    const { status = "", data_type = "" } = req.query;

    let whereConditions = ["category = ?"];
    let params = [category];

    if (status) {
      whereConditions.push("status = ?");
      params.push(status);
    }

    if (data_type) {
      whereConditions.push("data_type = ?");
      params.push(data_type);
    }

    const whereClause = `WHERE ${whereConditions.join(" AND ")}`;
    const masterData = await db.query(`
      SELECT * FROM master_data ${whereClause} ORDER BY key
    `, params);

    res.json(masterData);
  } catch (error) {
    console.error("Error fetching master data by category:", error);
    res.status(500).json({ message: "Failed to fetch master data" });
  }
});

// Create new master data
router.post("/", auth, async (req, res) => {
  try {
    const { key, category, value, data_type, status = 'active', description } = req.body;

    // Validate required fields
    if (!key || !category || !value || !data_type) {
      return res.status(400).json({ 
        message: "Key, category, value, and data_type are required" 
      });
    }

    // Validate data type
    if (!['string', 'number', 'boolean', 'json'].includes(data_type)) {
      return res.status(400).json({ message: "Invalid data type" });
    }

    // Validate JSON if data_type is json
    if (data_type === 'json') {
      try {
        JSON.parse(value);
      } catch {
        return res.status(400).json({ message: "Invalid JSON format" });
      }
    }

    // Check if key already exists
    const existing = await db.query("SELECT id FROM master_data WHERE key = ?", [key]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Key already exists" });
    }

    // Insert new master data
    const result = await db.query(`
      INSERT INTO master_data (key, category, value, data_type, status, description, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [key, category, value, data_type, status, description, req.user.id]);

    // Log audit entry
    await db.query(`
      INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
      VALUES (?, ?, ?, ?, ?)
    `, [
      req.user.id,
      'CREATE',
      'master_data',
      result.insertId,
      JSON.stringify({ key, category, value, data_type, status, description })
    ]);

    res.status(201).json({
      message: "Master data created successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating master data:", error);
    res.status(500).json({ message: "Failed to create master data" });
  }
});

// Update master data
router.put("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { category, value, data_type, status, description } = req.body;

    // Get existing data for audit log
    const existing = await db.query("SELECT * FROM master_data WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Master data not found" });
    }

    // Validate data type
    if (data_type && !['string', 'number', 'boolean', 'json'].includes(data_type)) {
      return res.status(400).json({ message: "Invalid data type" });
    }

    // Validate JSON if data_type is json
    if (data_type === 'json' && value) {
      try {
        JSON.parse(value);
      } catch {
        return res.status(400).json({ message: "Invalid JSON format" });
      }
    }

    // Update master data
    const result = await db.query(`
      UPDATE master_data 
      SET category = COALESCE(?, category),
          value = COALESCE(?, value),
          data_type = COALESCE(?, data_type),
          status = COALESCE(?, status),
          description = COALESCE(?, description),
          updated_at = NOW()
      WHERE id = ?
    `, [category, value, data_type, status, description, id]);

    // Log audit entry
    await db.query(`
      INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      req.user.id,
      'UPDATE',
      'master_data',
      id,
      JSON.stringify(existing[0]),
      JSON.stringify({ category, value, data_type, status, description })
    ]);

    res.json({
      message: "Master data updated successfully",
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error("Error updating master data:", error);
    res.status(500).json({ message: "Failed to update master data" });
  }
});

// Delete master data
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Get existing data for audit log
    const existing = await db.query("SELECT * FROM master_data WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Master data not found" });
    }

    // Delete master data
    const result = await db.query("DELETE FROM master_data WHERE id = ?", [id]);

    // Log audit entry
    await db.query(`
      INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values)
      VALUES (?, ?, ?, ?, ?)
    `, [
      req.user.id,
      'DELETE',
      'master_data',
      id,
      JSON.stringify(existing[0])
    ]);

    res.json({
      message: "Master data deleted successfully",
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error("Error deleting master data:", error);
    res.status(500).json({ message: "Failed to delete master data" });
  }
});

// Validate JSON value
router.post("/validate-json", auth, async (req, res) => {
  try {
    const { value } = req.body;

    try {
      JSON.parse(value);
      res.json({ valid: true, message: "Valid JSON" });
    } catch (error) {
      res.json({ valid: false, message: error.message });
    }
  } catch (error) {
    console.error("Error validating JSON:", error);
    res.status(500).json({ message: "Failed to validate JSON" });
  }
});

// Export master data
router.get("/export", auth, async (req, res) => {
  try {
    const { search = "", category = "", status = "", data_type = "" } = req.query;

    let whereConditions = [];
    let params = [];

    if (search) {
      whereConditions.push("(key LIKE ? OR value LIKE ? OR description LIKE ?)");
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (category) {
      whereConditions.push("category = ?");
      params.push(category);
    }

    if (status) {
      whereConditions.push("status = ?");
      params.push(status);
    }

    if (data_type) {
      whereConditions.push("data_type = ?");
      params.push(data_type);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(" AND ")}` 
      : "";

    const masterData = await db.query(`
      SELECT key, category, value, data_type, status, description, 
             DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at,
             DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') as updated_at
      FROM master_data ${whereClause}
      ORDER BY category, key
    `, params);

    // Create CSV content
    const headers = ['Key', 'Category', 'Value', 'Data Type', 'Status', 'Description', 'Created At', 'Updated At'];
    const csvRows = [headers.join(',')];

    masterData.forEach(row => {
      const values = [
        `"${row.key}"`,
        `"${row.category}"`,
        `"${String(row.value).replace(/"/g, '""')}"`,
        `"${row.data_type}"`,
        `"${row.status}"`,
        `"${row.description || ''}"`,
        `"${row.created_at}"`,
        `"${row.updated_at}"`
      ];
      csvRows.push(values.join(','));
    });

    const csvContent = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="master-data-export.csv"');
    res.send(csvContent);
  } catch (error) {
    console.error("Error exporting master data:", error);
    res.status(500).json({ message: "Failed to export master data" });
  }
});

// Bulk operations
router.patch("/bulk/status", auth, async (req, res) => {
  try {
    const { masterDataIds, status } = req.body;
    
    if (!masterDataIds || !Array.isArray(masterDataIds) || masterDataIds.length === 0) {
      return res.status(400).json({ message: "Master data IDs array is required" });
    }

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Update master data status
    const result = await db.query(
      "UPDATE master_data SET status = ?, updated_at = NOW() WHERE id IN (?)",
      [status, masterDataIds]
    );

    // Log audit entries
    for (const masterDataId of masterDataIds) {
      await db.query(
        "INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values) VALUES (?, ?, ?, ?, ?, ?)",
        [
          req.user.id,
          "BULK_UPDATE",
          "master_data",
          masterDataId,
          JSON.stringify({ field: "status" }),
          JSON.stringify({ status }),
        ]
      );
    }

    res.json({
      message: `Successfully updated ${result.affectedRows} master data items`,
      updatedCount: result.affectedRows,
    });
  } catch (error) {
    console.error("Bulk status update error:", error);
    res.status(500).json({ message: "Failed to update master data status" });
  }
});

router.delete("/bulk", auth, async (req, res) => {
  try {
    const { masterDataIds } = req.body;
    
    if (!masterDataIds || !Array.isArray(masterDataIds) || masterDataIds.length === 0) {
      return res.status(400).json({ message: "Master data IDs array is required" });
    }

    // Get master data for audit log before deletion
    const masterDataItems = await db.query(
      "SELECT * FROM master_data WHERE id IN (?)",
      [masterDataIds]
    );

    // Delete master data
    const result = await db.query(
      "DELETE FROM master_data WHERE id IN (?)",
      [masterDataIds]
    );

    // Log audit entries
    for (const item of masterDataItems) {
      await db.query(
        "INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values) VALUES (?, ?, ?, ?, ?)",
        [
          req.user.id,
          "BULK_DELETE",
          "master_data",
          item.id,
          JSON.stringify(item),
        ]
      );
    }

    res.json({
      message: `Successfully deleted ${result.affectedRows} master data items`,
      deletedCount: result.affectedRows,
    });
  } catch (error) {
    console.error("Bulk delete error:", error);
    res.status(500).json({ message: "Failed to delete master data" });
  }
});

module.exports = router;
