const express = require("express");
const router = express.Router();
const db = require("../config/database");
const { authenticateToken } = require("../middleware/auth");

// Health check endpoint for master-data
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Master Data API is running",
    timestamp: new Date().toISOString(),
    endpoints: [
      "/provinces",
      "/survey-types",
      "/surveyors",
      "/districts",
      "/subdistricts",
    ],
  });
});

// Get master data with pagination and filters
router.get("/", authenticateToken, async (req, res) => {
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
      whereConditions.push(
        "(key LIKE ? OR value LIKE ? OR description LIKE ?)"
      );
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

    const whereClause =
      whereConditions.length > 0
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
    const masterData = await db.query(dataQuery, [
      ...params,
      parseInt(limit),
      offset,
    ]);

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
router.get("/statistics", authenticateToken, async (req, res) => {
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
router.get("/categories", authenticateToken, async (req, res) => {
  try {
    const categories = await db.query(`
      SELECT DISTINCT category 
      FROM master_data 
      WHERE category IS NOT NULL AND category != ''
      ORDER BY category
    `);

    res.json(categories.map((row) => row.category));
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

// Get single master data by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const masterData = await db.query(
      "SELECT * FROM master_data WHERE id = ?",
      [id]
    );

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
router.get("/key/:key", authenticateToken, async (req, res) => {
  try {
    const { key } = req.params;
    const masterData = await db.query(
      "SELECT * FROM master_data WHERE key = ?",
      [key]
    );

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
router.get("/category/:category", authenticateToken, async (req, res) => {
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
    const masterData = await db.query(
      `
      SELECT * FROM master_data ${whereClause} ORDER BY key
    `,
      params
    );

    res.json(masterData);
  } catch (error) {
    console.error("Error fetching master data by category:", error);
    res.status(500).json({ message: "Failed to fetch master data" });
  }
});

// Create new master data
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      key,
      category,
      value,
      data_type,
      status = "active",
      description,
    } = req.body;

    // Validate required fields
    if (!key || !category || !value || !data_type) {
      return res.status(400).json({
        message: "Key, category, value, and data_type are required",
      });
    }

    // Validate data type
    if (!["string", "number", "boolean", "json"].includes(data_type)) {
      return res.status(400).json({ message: "Invalid data type" });
    }

    // Validate JSON if data_type is json
    if (data_type === "json") {
      try {
        JSON.parse(value);
      } catch {
        return res.status(400).json({ message: "Invalid JSON format" });
      }
    }

    // Check if key already exists
    const existing = await db.query(
      "SELECT id FROM master_data WHERE key = ?",
      [key]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Key already exists" });
    }

    // Insert new master data
    const result = await db.query(
      `
      INSERT INTO master_data (key, category, value, data_type, status, description, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [key, category, value, data_type, status, description, req.user.id]
    );

    // Log audit entry
    await db.query(
      `
      INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
      VALUES (?, ?, ?, ?, ?)
    `,
      [
        req.user.id,
        "CREATE",
        "master_data",
        result.insertId,
        JSON.stringify({
          key,
          category,
          value,
          data_type,
          status,
          description,
        }),
      ]
    );

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
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { category, value, data_type, status, description } = req.body;

    // Get existing data for audit log
    const existing = await db.query("SELECT * FROM master_data WHERE id = ?", [
      id,
    ]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Master data not found" });
    }

    // Validate data type
    if (
      data_type &&
      !["string", "number", "boolean", "json"].includes(data_type)
    ) {
      return res.status(400).json({ message: "Invalid data type" });
    }

    // Validate JSON if data_type is json
    if (data_type === "json" && value) {
      try {
        JSON.parse(value);
      } catch {
        return res.status(400).json({ message: "Invalid JSON format" });
      }
    }

    // Update master data
    const result = await db.query(
      `
      UPDATE master_data 
      SET category = COALESCE(?, category),
          value = COALESCE(?, value),
          data_type = COALESCE(?, data_type),
          status = COALESCE(?, status),
          description = COALESCE(?, description),
          updated_at = NOW()
      WHERE id = ?
    `,
      [category, value, data_type, status, description, id]
    );

    // Log audit entry
    await db.query(
      `
      INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        req.user.id,
        "UPDATE",
        "master_data",
        id,
        JSON.stringify(existing[0]),
        JSON.stringify({ category, value, data_type, status, description }),
      ]
    );

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
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get existing data for audit log
    const existing = await db.query("SELECT * FROM master_data WHERE id = ?", [
      id,
    ]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Master data not found" });
    }

    // Delete master data
    const result = await db.query("DELETE FROM master_data WHERE id = ?", [id]);

    // Log audit entry
    await db.query(
      `
      INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values)
      VALUES (?, ?, ?, ?, ?)
    `,
      [req.user.id, "DELETE", "master_data", id, JSON.stringify(existing[0])]
    );

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
router.post("/validate-json", authenticateToken, async (req, res) => {
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
router.get("/export", authenticateToken, async (req, res) => {
  try {
    const {
      search = "",
      category = "",
      status = "",
      data_type = "",
    } = req.query;

    let whereConditions = [];
    let params = [];

    if (search) {
      whereConditions.push(
        "(key LIKE ? OR value LIKE ? OR description LIKE ?)"
      );
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

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    const masterData = await db.query(
      `
      SELECT key, category, value, data_type, status, description, 
             DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at,
             DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') as updated_at
      FROM master_data ${whereClause}
      ORDER BY category, key
    `,
      params
    );

    // Create CSV content
    const headers = [
      "Key",
      "Category",
      "Value",
      "Data Type",
      "Status",
      "Description",
      "Created At",
      "Updated At",
    ];
    const csvRows = [headers.join(",")];

    masterData.forEach((row) => {
      const values = [
        `"${row.key}"`,
        `"${row.category}"`,
        `"${String(row.value).replace(/"/g, '""')}"`,
        `"${row.data_type}"`,
        `"${row.status}"`,
        `"${row.description || ""}"`,
        `"${row.created_at}"`,
        `"${row.updated_at}"`,
      ];
      csvRows.push(values.join(","));
    });

    const csvContent = csvRows.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="master-data-export.csv"'
    );
    res.send(csvContent);
  } catch (error) {
    console.error("Error exporting master data:", error);
    res.status(500).json({ message: "Failed to export master data" });
  }
});

// Get provinces
router.get("/provinces", async (req, res) => {
  try {
    console.log("📍 [PROVINCES] Request received");

    // ตรวจสอบว่ามี table provinces หรือไม่ ถ้าไม่มีให้ส่ง fallback data
    let provinces;
    try {
      provinces = await db.query(`
        SELECT id, name, code 
        FROM provinces 
        ORDER BY name
      `);
    } catch (dbError) {
      console.log(
        "⚠️ [PROVINCES] Database table not found, using fallback data"
      );
      // ส่ง fallback data ถ้า table ไม่มี
      provinces = [
        { id: 1, name: "กรุงเทพมหานคร", code: "10" },
        { id: 2, name: "เชียงใหม่", code: "50" },
        { id: 3, name: "เชียงราย", code: "57" },
        { id: 4, name: "ลำปาง", code: "52" },
        { id: 5, name: "ลำพูน", code: "51" },
        { id: 6, name: "แม่ฮ่องสอน", code: "58" },
        { id: 7, name: "น่าน", code: "55" },
        { id: 8, name: "พะเยา", code: "56" },
        { id: 9, name: "แพร่", code: "54" },
        { id: 10, name: "อุตรดิตถ์", code: "53" },
      ];
    }

    console.log(`✅ [PROVINCES] Found ${provinces.length} provinces`);
    res.json({
      success: true,
      data: provinces,
    });
  } catch (error) {
    console.error("❌ [PROVINCES] Error fetching provinces:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch provinces",
      error: error.message,
    });
  }
});

// Get districts by province
router.get("/districts", authenticateToken, async (req, res) => {
  try {
    const { province_id, province } = req.query;
    let query = "SELECT id, name, province_id FROM districts";
    let params = [];

    if (province_id) {
      query += " WHERE province_id = ?";
      params.push(province_id);
    } else if (province) {
      query += " WHERE province_id = (SELECT id FROM provinces WHERE name = ?)";
      params.push(province);
    }

    query += " ORDER BY name";

    const districts = await db.query(query, params);

    res.json({
      success: true,
      data: districts,
    });
  } catch (error) {
    console.error("Error fetching districts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch districts",
    });
  }
});

// Get subdistricts by district
router.get("/subdistricts", authenticateToken, async (req, res) => {
  try {
    const { district_id, province, district } = req.query;
    let query = "SELECT id, name, district_id FROM subdistricts";
    let params = [];

    if (district_id) {
      query += " WHERE district_id = ?";
      params.push(district_id);
    } else if (province && district) {
      query += ` WHERE district_id = (
        SELECT d.id FROM districts d 
        JOIN provinces p ON d.province_id = p.id 
        WHERE p.name = ? AND d.name = ?
      )`;
      params.push(province, district);
    }

    query += " ORDER BY name";

    const subdistricts = await db.query(query, params);

    res.json({
      success: true,
      data: subdistricts,
    });
  } catch (error) {
    console.error("Error fetching subdistricts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subdistricts",
    });
  }
});

// Get survey types
router.get("/survey-types", async (req, res) => {
  try {
    console.log("📊 [SURVEY-TYPES] Request received");

    // ตรวจสอบว่ามี table survey_target_types หรือไม่
    let surveyTypes;
    try {
      surveyTypes = await db.query(`
        SELECT type_id as id, type_name as name 
        FROM survey_target_types 
        ORDER BY type_name
      `);
    } catch (dbError) {
      console.log(
        "⚠️ [SURVEY-TYPES] Database table not found, using fallback data"
      );
      // ส่ง fallback data ถ้า table ไม่มี
      surveyTypes = [
        { id: 1, name: "การสำรวจพื้นฐาน" },
        { id: 2, name: "การสำรวจขั้นสูง" },
        { id: 3, name: "การสำรวจพิเศษ" },
        { id: 4, name: "การสำรวจวัด" },
        { id: 5, name: "การสำรวจโบราณสถาน" },
      ];
    }

    console.log(`✅ [SURVEY-TYPES] Found ${surveyTypes.length} survey types`);
    res.json({
      success: true,
      data: surveyTypes,
    });
  } catch (error) {
    console.error("❌ [SURVEY-TYPES] Error fetching survey types:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch survey types",
      error: error.message,
    });
  }
});

// Get temple types
router.get("/temple-types", authenticateToken, async (req, res) => {
  try {
    const templeTypes = await db.query(`
      SELECT id, name 
      FROM master_temple_types 
      ORDER BY name
    `);

    res.json({
      success: true,
      data: templeTypes,
    });
  } catch (error) {
    console.error("Error fetching temple types:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch temple types",
    });
  }
});

// Get denominations/sects
router.get("/sects", authenticateToken, async (req, res) => {
  try {
    const sects = await db.query(`
      SELECT id, name 
      FROM master_denominations 
      ORDER BY name
    `);

    res.json({
      success: true,
      data: sects,
    });
  } catch (error) {
    console.error("Error fetching sects:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sects",
    });
  }
});

// Get surveyors (users with Surveyor role)
router.get("/surveyors", async (req, res) => {
  try {
    console.log("👥 [SURVEYORS] Request received");

    // ตรวจสอบว่ามี table users หรือไม่
    let surveyors;
    try {
      surveyors = await db.query(`
        SELECT user_id as id, CONCAT(first_name, ' ', last_name) as name, email
        FROM users 
        WHERE role = 'Surveyor' AND is_active = 1
        ORDER BY first_name, last_name
      `);
    } catch (dbError) {
      console.log(
        "⚠️ [SURVEYORS] Database table not found, using fallback data"
      );
      // ส่ง fallback data ถ้า table ไม่มี
      surveyors = [
        { id: 1, name: "ผู้สำรวจ 1", email: "surveyor1@example.com" },
        { id: 2, name: "ผู้สำรวจ 2", email: "surveyor2@example.com" },
        { id: 3, name: "ผู้สำรวจ 3", email: "surveyor3@example.com" },
      ];
    }

    console.log(`✅ [SURVEYORS] Found ${surveyors.length} surveyors`);
    res.json({
      success: true,
      data: surveyors,
    });
  } catch (error) {
    console.error("❌ [SURVEYORS] Error fetching surveyors:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch surveyors",
      error: error.message,
    });
  }
});

// Get users with surveyor role (for frontend compatibility)
router.get("/users", authenticateToken, async (req, res) => {
  try {
    const { role, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT user_id as id, first_name, last_name, email, role, is_active,
             CONCAT(first_name, ' ', last_name) as name,
             created_at, updated_at
      FROM users 
    `;
    let params = [];

    if (role) {
      query += " WHERE role = ?";
      params.push(role);
    }

    query += " ORDER BY first_name, last_name LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const users = await db.query(query, params);

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
});

// Get subdistricts by district (alternative endpoint)
router.get("/sub-districts", authenticateToken, async (req, res) => {
  try {
    const { district_id, province, district } = req.query;
    let query = "SELECT id, name, district_id FROM subdistricts";
    let params = [];

    if (district_id) {
      query += " WHERE district_id = ?";
      params.push(district_id);
    } else if (province && district) {
      query += ` WHERE district_id = (
        SELECT d.id FROM districts d 
        JOIN provinces p ON d.province_id = p.id 
        WHERE p.name = ? AND d.name = ?
      )`;
      params.push(province, district);
    }

    query += " ORDER BY name";

    const subdistricts = await db.query(query, params);

    res.json({
      success: true,
      data: subdistricts,
    });
  } catch (error) {
    console.error("Error fetching sub-districts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sub-districts",
    });
  }
});

// Bulk operations
router.patch("/bulk/status", authenticateToken, async (req, res) => {
  try {
    const { masterDataIds, status } = req.body;

    if (
      !masterDataIds ||
      !Array.isArray(masterDataIds) ||
      masterDataIds.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Master data IDs array is required" });
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

router.delete("/bulk", authenticateToken, async (req, res) => {
  try {
    const { masterDataIds } = req.body;

    if (
      !masterDataIds ||
      !Array.isArray(masterDataIds) ||
      masterDataIds.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Master data IDs array is required" });
    }

    // Get master data for audit log before deletion
    const masterDataItems = await db.query(
      "SELECT * FROM master_data WHERE id IN (?)",
      [masterDataIds]
    );

    // Delete master data
    const result = await db.query("DELETE FROM master_data WHERE id IN (?)", [
      masterDataIds,
    ]);

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
