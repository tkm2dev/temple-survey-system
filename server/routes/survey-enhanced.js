const express = require("express");
const router = express.Router();
const multer = require("multer");
const XLSX = require("xlsx");
const fs = require("fs").promises;
const path = require("path");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const db = require("../config/database");

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only Excel and CSV files are allowed."));
    }
  },
});

// Get surveys with advanced pagination and filtering
router.get("/paginated", authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = "",
      status = "",
      type_id = "",
      province = "",
      created_by = "",
      sort_field = "updated_at",
      sort_direction = "desc",
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const pageSize = parseInt(limit);

    // Build WHERE clause
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`(
        s.target_name ILIKE $${paramIndex} OR 
        s.address ILIKE $${paramIndex} OR 
        s.province ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`s.status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (type_id) {
      whereConditions.push(`s.type_id = $${paramIndex}`);
      queryParams.push(type_id);
      paramIndex++;
    }

    if (province) {
      whereConditions.push(`s.province = $${paramIndex}`);
      queryParams.push(province);
      paramIndex++;
    }

    if (created_by) {
      whereConditions.push(`s.created_by = $${paramIndex}`);
      queryParams.push(created_by);
      paramIndex++;
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    // Validate sort field and direction
    const validSortFields = [
      "target_name",
      "status",
      "updated_at",
      "created_at",
      "province",
    ];
    const sortField = validSortFields.includes(sort_field)
      ? sort_field
      : "updated_at";
    const sortDirection =
      sort_direction.toLowerCase() === "asc" ? "ASC" : "DESC";

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM surveys s
      LEFT JOIN survey_types st ON s.type_id = st.type_id
      LEFT JOIN users u ON s.created_by = u.user_id
      ${whereClause}
    `;

    const countResult = await db.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Get paginated data
    const dataQuery = `
      SELECT 
        s.target_id,
        s.target_name,
        s.address,
        s.province,
        s.status,
        s.created_at,
        s.updated_at,
        s.created_by,
        st.type_name,
        u.first_name || ' ' || u.last_name as created_by_name,
        COALESCE(progress.progress_percentage, 0) as progress
      FROM surveys s
      LEFT JOIN survey_types st ON s.type_id = st.type_id
      LEFT JOIN users u ON s.created_by = u.user_id
      LEFT JOIN (
        SELECT 
          target_id,
          (COUNT(CASE WHEN completed = true THEN 1 END) * 100.0 / COUNT(*)) as progress_percentage
        FROM survey_responses 
        GROUP BY target_id
      ) progress ON s.target_id = progress.target_id
      ${whereClause}
      ORDER BY s.${sortField} ${sortDirection}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(pageSize, offset);

    const dataResult = await db.query(dataQuery, queryParams);

    const totalPages = Math.ceil(total / pageSize);
    const currentPage = parseInt(page);

    res.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        currentPage,
        totalPages,
        total,
        itemsPerPage: pageSize,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
    });
  } catch (error) {
    console.error("Error getting paginated surveys:", error);
    res.status(500).json({
      success: false,
      message: "ไม่สามารถโหลดข้อมูลแบบสำรวจได้",
      error: error.message,
    });
  }
});

// Get survey statistics
router.get("/statistics", authenticateToken, async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'Approved' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'Pending Review' THEN 1 END) as inProgress,
        COUNT(CASE WHEN status = 'Draft' THEN 1 END) as draft
      FROM surveys
    `;

    const result = await db.query(statsQuery);
    const stats = result.rows[0];

    res.json({
      success: true,
      data: {
        total: parseInt(stats.total),
        completed: parseInt(stats.completed),
        inProgress: parseInt(stats.inprogress),
        draft: parseInt(stats.draft),
      },
    });
  } catch (error) {
    console.error("Error getting survey statistics:", error);
    res.status(500).json({
      success: false,
      message: "ไม่สามารถโหลดสถิติได้",
      error: error.message,
    });
  }
});

// Advanced search
router.post("/advanced-search", authenticateToken, async (req, res) => {
  try {
    const {
      keywords = "",
      status = [],
      type_ids = [],
      provinces = [],
      date_from = "",
      date_to = "",
      created_by = [],
      page = 1,
      limit = 12,
    } = req.body;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const pageSize = parseInt(limit);

    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    if (keywords) {
      whereConditions.push(`(
        s.target_name ILIKE $${paramIndex} OR 
        s.address ILIKE $${paramIndex} OR 
        s.description ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${keywords}%`);
      paramIndex++;
    }

    if (status.length > 0) {
      whereConditions.push(`s.status = ANY($${paramIndex})`);
      queryParams.push(status);
      paramIndex++;
    }

    if (type_ids.length > 0) {
      whereConditions.push(`s.type_id = ANY($${paramIndex})`);
      queryParams.push(type_ids);
      paramIndex++;
    }

    if (provinces.length > 0) {
      whereConditions.push(`s.province = ANY($${paramIndex})`);
      queryParams.push(provinces);
      paramIndex++;
    }

    if (date_from) {
      whereConditions.push(`s.created_at >= $${paramIndex}`);
      queryParams.push(date_from);
      paramIndex++;
    }

    if (date_to) {
      whereConditions.push(`s.created_at <= $${paramIndex}`);
      queryParams.push(date_to);
      paramIndex++;
    }

    if (created_by.length > 0) {
      whereConditions.push(`s.created_by = ANY($${paramIndex})`);
      queryParams.push(created_by);
      paramIndex++;
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM surveys s
      LEFT JOIN survey_types st ON s.type_id = st.type_id
      LEFT JOIN users u ON s.created_by = u.user_id
      ${whereClause}
    `;

    const countResult = await db.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Get data
    const dataQuery = `
      SELECT 
        s.target_id,
        s.target_name,
        s.address,
        s.province,
        s.status,
        s.created_at,
        s.updated_at,
        s.created_by,
        st.type_name,
        u.first_name || ' ' || u.last_name as created_by_name
      FROM surveys s
      LEFT JOIN survey_types st ON s.type_id = st.type_id
      LEFT JOIN users u ON s.created_by = u.user_id
      ${whereClause}
      ORDER BY s.updated_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(pageSize, offset);

    const dataResult = await db.query(dataQuery, queryParams);

    const totalPages = Math.ceil(total / pageSize);
    const currentPage = parseInt(page);

    res.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        currentPage,
        totalPages,
        total,
        itemsPerPage: pageSize,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
    });
  } catch (error) {
    console.error("Error in advanced search:", error);
    res.status(500).json({
      success: false,
      message: "ไม่สามารถค้นหาข้อมูลได้",
      error: error.message,
    });
  }
});

// Bulk update surveys
router.patch(
  "/bulk/update",
  authenticateToken,
  authorizeRoles(["Admin"]),
  async (req, res) => {
    const client = await db.getClient();

    try {
      await client.query("BEGIN");

      const { ids, data } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: "กรุณาระบุรายการที่ต้องการอัปเดต",
        });
      }

      // Build update query dynamically
      const updateFields = [];
      const queryParams = [];
      let paramIndex = 1;

      if (data.status) {
        updateFields.push(`status = $${paramIndex}`);
        queryParams.push(data.status);
        paramIndex++;
      }

      if (data.province) {
        updateFields.push(`province = $${paramIndex}`);
        queryParams.push(data.province);
        paramIndex++;
      }

      if (data.type_id) {
        updateFields.push(`type_id = $${paramIndex}`);
        queryParams.push(data.type_id);
        paramIndex++;
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: "ไม่มีข้อมูลที่ต้องการอัปเดต",
        });
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

      const updateQuery = `
      UPDATE surveys 
      SET ${updateFields.join(", ")}
      WHERE target_id = ANY($${paramIndex})
      RETURNING target_id, target_name, status
    `;

      queryParams.push(ids);

      const result = await client.query(updateQuery, queryParams);

      // Log activity
      for (const survey of result.rows) {
        await client.query(
          `
        INSERT INTO activity_logs (entity_type, entity_id, action, details, user_id, created_at)
        VALUES ('survey', $1, 'bulk_update', $2, $3, CURRENT_TIMESTAMP)
      `,
          [
            survey.target_id,
            JSON.stringify({ updated_data: data }),
            req.user.user_id,
          ]
        );
      }

      await client.query("COMMIT");

      res.json({
        success: true,
        message: `อัปเดตข้อมูล ${result.rows.length} รายการเรียบร้อยแล้ว`,
        data: result.rows,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error in bulk update:", error);
      res.status(500).json({
        success: false,
        message: "ไม่สามารถอัปเดตข้อมูลได้",
        error: error.message,
      });
    } finally {
      client.release();
    }
  }
);

// Bulk status change
router.patch(
  "/bulk/status-change",
  authenticateToken,
  authorizeRoles(["Admin"]),
  async (req, res) => {
    const client = await db.getClient();

    try {
      await client.query("BEGIN");

      const { ids, status } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: "กรุณาระบุรายการที่ต้องการอัปเดตสถานะ",
        });
      }

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "กรุณาระบุสถานะที่ต้องการ",
        });
      }

      const updateQuery = `
      UPDATE surveys 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE target_id = ANY($2)
      RETURNING target_id, target_name, status
    `;

      const result = await client.query(updateQuery, [status, ids]);

      // Log activity
      for (const survey of result.rows) {
        await client.query(
          `
        INSERT INTO activity_logs (entity_type, entity_id, action, details, user_id, created_at)
        VALUES ('survey', $1, 'status_change', $2, $3, CURRENT_TIMESTAMP)
      `,
          [
            survey.target_id,
            JSON.stringify({ old_status: "unknown", new_status: status }),
            req.user.user_id,
          ]
        );
      }

      await client.query("COMMIT");

      res.json({
        success: true,
        message: `อัปเดตสถานะ ${result.rows.length} รายการเรียบร้อยแล้ว`,
        data: result.rows,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error in bulk status change:", error);
      res.status(500).json({
        success: false,
        message: "ไม่สามารถอัปเดตสถานะได้",
        error: error.message,
      });
    } finally {
      client.release();
    }
  }
);

// Bulk delete surveys
router.delete(
  "/bulk",
  authenticateToken,
  authorizeRoles(["Admin"]),
  async (req, res) => {
    const client = await db.getClient();

    try {
      await client.query("BEGIN");

      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: "กรุณาระบุรายการที่ต้องการลบ",
        });
      }

      // Get survey details before deletion
      const surveysQuery = `
      SELECT target_id, target_name 
      FROM surveys 
      WHERE target_id = ANY($1)
    `;
      const surveysResult = await client.query(surveysQuery, [ids]);

      // Delete related data first
      await client.query(
        "DELETE FROM survey_responses WHERE target_id = ANY($1)",
        [ids]
      );
      await client.query(
        "DELETE FROM survey_attachments WHERE target_id = ANY($1)",
        [ids]
      );

      // Delete surveys
      const deleteQuery = `
      DELETE FROM surveys 
      WHERE target_id = ANY($1)
      RETURNING target_id
    `;

      const result = await client.query(deleteQuery, [ids]);

      // Log activity
      for (const survey of surveysResult.rows) {
        await client.query(
          `
        INSERT INTO activity_logs (entity_type, entity_id, action, details, user_id, created_at)
        VALUES ('survey', $1, 'bulk_delete', $2, $3, CURRENT_TIMESTAMP)
      `,
          [
            survey.target_id,
            JSON.stringify({ deleted_survey: survey.target_name }),
            req.user.user_id,
          ]
        );
      }

      await client.query("COMMIT");

      res.json({
        success: true,
        message: `ลบข้อมูล ${result.rows.length} รายการเรียบร้อยแล้ว`,
        data: result.rows,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error in bulk delete:", error);
      res.status(500).json({
        success: false,
        message: "ไม่สามารถลบข้อมูลได้",
        error: error.message,
      });
    } finally {
      client.release();
    }
  }
);

// Bulk assign surveyor
router.patch(
  "/bulk/assign",
  authenticateToken,
  authorizeRoles(["Admin"]),
  async (req, res) => {
    const client = await db.getClient();

    try {
      await client.query("BEGIN");

      const { ids, surveyor_id } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: "กรุณาระบุรายการที่ต้องการมอบหมาย",
        });
      }

      if (!surveyor_id) {
        return res.status(400).json({
          success: false,
          message: "กรุณาระบุผู้สำรวจ",
        });
      }

      const updateQuery = `
      UPDATE surveys 
      SET assigned_to = $1, updated_at = CURRENT_TIMESTAMP
      WHERE target_id = ANY($2)
      RETURNING target_id, target_name
    `;

      const result = await client.query(updateQuery, [surveyor_id, ids]);

      // Log activity
      for (const survey of result.rows) {
        await client.query(
          `
        INSERT INTO activity_logs (entity_type, entity_id, action, details, user_id, created_at)
        VALUES ('survey', $1, 'assign_surveyor', $2, $3, CURRENT_TIMESTAMP)
      `,
          [
            survey.target_id,
            JSON.stringify({ assigned_to: surveyor_id }),
            req.user.user_id,
          ]
        );
      }

      await client.query("COMMIT");

      res.json({
        success: true,
        message: `มอบหมายผู้สำรวจ ${result.rows.length} รายการเรียบร้อยแล้ว`,
        data: result.rows,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error in bulk assign:", error);
      res.status(500).json({
        success: false,
        message: "ไม่สามารถมอบหมายผู้สำรวจได้",
        error: error.message,
      });
    } finally {
      client.release();
    }
  }
);

// Bulk export surveys
router.post("/bulk/export", authenticateToken, async (req, res) => {
  try {
    const { ids, format = "xlsx" } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุรายการที่ต้องการส่งออก",
      });
    }

    const query = `
      SELECT 
        s.target_id,
        s.target_name,
        s.address,
        s.province,
        s.status,
        s.created_at,
        s.updated_at,
        st.type_name,
        u.first_name || ' ' || u.last_name as created_by_name
      FROM surveys s
      LEFT JOIN survey_types st ON s.type_id = st.type_id
      LEFT JOIN users u ON s.created_by = u.user_id
      WHERE s.target_id = ANY($1)
      ORDER BY s.updated_at DESC
    `;

    const result = await db.query(query, [ids]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูลที่ต้องการส่งออก",
      });
    }

    // Create Excel workbook
    const workbook = XLSX.utils.book_new();

    // Format data for Excel
    const excelData = result.rows.map((row) => ({
      รหัสเป้าหมาย: row.target_id,
      ชื่อเป้าหมาย: row.target_name,
      ที่อยู่: row.address,
      จังหวัด: row.province,
      ประเภท: row.type_name,
      สถานะ: row.status,
      ผู้สร้าง: row.created_by_name,
      วันที่สร้าง: new Date(row.created_at).toLocaleDateString("th-TH"),
      วันที่อัปเดต: new Date(row.updated_at).toLocaleDateString("th-TH"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Surveys");

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=surveys_export_${
        new Date().toISOString().split("T")[0]
      }.xlsx`
    );

    res.send(excelBuffer);
  } catch (error) {
    console.error("Error in bulk export:", error);
    res.status(500).json({
      success: false,
      message: "ไม่สามารถส่งออกข้อมูลได้",
      error: error.message,
    });
  }
});

// Export all surveys
router.post("/export", authenticateToken, async (req, res) => {
  try {
    const { filters = {}, format = "xlsx" } = req.body;

    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    if (filters.status) {
      whereConditions.push(`s.status = $${paramIndex}`);
      queryParams.push(filters.status);
      paramIndex++;
    }

    if (filters.type_id) {
      whereConditions.push(`s.type_id = $${paramIndex}`);
      queryParams.push(filters.type_id);
      paramIndex++;
    }

    if (filters.province) {
      whereConditions.push(`s.province = $${paramIndex}`);
      queryParams.push(filters.province);
      paramIndex++;
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    const query = `
      SELECT 
        s.target_id,
        s.target_name,
        s.address,
        s.province,
        s.status,
        s.created_at,
        s.updated_at,
        st.type_name,
        u.first_name || ' ' || u.last_name as created_by_name
      FROM surveys s
      LEFT JOIN survey_types st ON s.type_id = st.type_id
      LEFT JOIN users u ON s.created_by = u.user_id
      ${whereClause}
      ORDER BY s.updated_at DESC
    `;

    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูลที่ต้องการส่งออก",
      });
    }

    // Create Excel workbook
    const workbook = XLSX.utils.book_new();

    // Format data for Excel
    const excelData = result.rows.map((row) => ({
      รหัสเป้าหมาย: row.target_id,
      ชื่อเป้าหมาย: row.target_name,
      ที่อยู่: row.address,
      จังหวัด: row.province,
      ประเภท: row.type_name,
      สถานะ: row.status,
      ผู้สร้าง: row.created_by_name,
      วันที่สร้าง: new Date(row.created_at).toLocaleDateString("th-TH"),
      วันที่อัปเดต: new Date(row.updated_at).toLocaleDateString("th-TH"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "All Surveys");

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=all_surveys_${
        new Date().toISOString().split("T")[0]
      }.xlsx`
    );

    res.send(excelBuffer);
  } catch (error) {
    console.error("Error in export all:", error);
    res.status(500).json({
      success: false,
      message: "ไม่สามารถส่งออกข้อมูลได้",
      error: error.message,
    });
  }
});

// Import surveys
router.post(
  "/import",
  authenticateToken,
  authorizeRoles(["Admin"]),
  upload.single("file"),
  async (req, res) => {
    const client = await db.getClient();

    try {
      await client.query("BEGIN");

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "กรุณาเลือกไฟล์ที่ต้องการนำเข้า",
        });
      }

      const filePath = req.file.path;
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      if (data.length === 0) {
        return res.status(400).json({
          success: false,
          message: "ไฟล์ที่นำเข้าไม่มีข้อมูล",
        });
      }

      const imported = [];
      const errors = [];

      for (let i = 0; i < data.length; i++) {
        const row = data[i];

        try {
          // Validate required fields
          if (!row["ชื่อเป้าหมาย"] || !row["ที่อยู่"] || !row["จังหวัด"]) {
            errors.push(`แถว ${i + 1}: ข้อมูลไม่ครบถ้วน`);
            continue;
          }

          // Get or create survey type
          let typeId = null;
          if (row["ประเภท"]) {
            const typeResult = await client.query(
              "SELECT type_id FROM survey_types WHERE type_name = $1",
              [row["ประเภท"]]
            );

            if (typeResult.rows.length > 0) {
              typeId = typeResult.rows[0].type_id;
            }
          }

          // Insert survey
          const insertQuery = `
          INSERT INTO surveys (target_name, address, province, type_id, status, created_by, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING target_id, target_name
        `;

          const insertResult = await client.query(insertQuery, [
            row["ชื่อเป้าหมาย"],
            row["ที่อยู่"],
            row["จังหวัด"],
            typeId,
            row["สถานะ"] || "Draft",
            req.user.user_id,
          ]);

          imported.push(insertResult.rows[0]);
        } catch (error) {
          errors.push(`แถว ${i + 1}: ${error.message}`);
        }
      }

      // Clean up uploaded file
      await fs.unlink(filePath);

      await client.query("COMMIT");

      res.json({
        success: true,
        message: `นำเข้าข้อมูลสำเร็จ ${imported.length} รายการ`,
        data: {
          imported: imported.length,
          errors: errors.length,
          errorDetails: errors,
        },
      });
    } catch (error) {
      await client.query("ROLLBACK");

      // Clean up uploaded file
      if (req.file && req.file.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error("Error deleting uploaded file:", unlinkError);
        }
      }

      console.error("Error in import:", error);
      res.status(500).json({
        success: false,
        message: "ไม่สามารถนำเข้าข้อมูลได้",
        error: error.message,
      });
    } finally {
      client.release();
    }
  }
);

// Get import template
router.get("/import/template", authenticateToken, async (req, res) => {
  try {
    const workbook = XLSX.utils.book_new();

    const templateData = [
      {
        ชื่อเป้าหมาย: "วัดตัวอย่าง",
        ที่อยู่: "123 ถนนตัวอย่าง ตำบลตัวอย่าง",
        จังหวัด: "กรุงเทพมหานคร",
        ประเภท: "วัดโบราณ",
        สถานะ: "Draft",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=survey_import_template.xlsx"
    );

    res.send(excelBuffer);
  } catch (error) {
    console.error("Error generating template:", error);
    res.status(500).json({
      success: false,
      message: "ไม่สามารถสร้างเทมเพลตได้",
      error: error.message,
    });
  }
});

// Get filter options
router.get("/filter-options", authenticateToken, async (req, res) => {
  try {
    const [statusesResult, typesResult, provincesResult, surveyorsResult] =
      await Promise.all([
        db.query(
          "SELECT DISTINCT status FROM surveys WHERE status IS NOT NULL ORDER BY status"
        ),
        db.query(
          "SELECT type_id, type_name FROM survey_types ORDER BY type_name"
        ),
        db.query(
          "SELECT DISTINCT province FROM surveys WHERE province IS NOT NULL ORDER BY province"
        ),
        db.query(`
        SELECT DISTINCT u.user_id, u.first_name || ' ' || u.last_name as name
        FROM users u
        INNER JOIN surveys s ON u.user_id = s.created_by
        ORDER BY name
      `),
      ]);

    res.json({
      success: true,
      data: {
        statuses: statusesResult.rows.map((r) => r.status),
        types: typesResult.rows,
        provinces: provincesResult.rows.map((r) => r.province),
        surveyors: surveyorsResult.rows,
      },
    });
  } catch (error) {
    console.error("Error getting filter options:", error);
    res.status(500).json({
      success: false,
      message: "ไม่สามารถโหลดตัวเลือกการกรองได้",
      error: error.message,
    });
  }
});

module.exports = router;
