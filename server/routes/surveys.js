const express = require("express");
const { executeQuery, executeTransaction } = require("../config/database");
const {
  authenticateToken,
  authorizeRoles,
  authorizeResourceAccess,
} = require("../middleware/auth");
const { logActivity } = require("../utils/auditLogger");
const logger = require("../utils/logger");

const router = express.Router();

// Apply authentication to all survey routes
router.use(authenticateToken);

// @route   GET /api/surveys
// @desc    Get all surveys with filtering and pagination
// @access  Private
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
      type_id = "",
      created_by = "",
    } = req.query;

    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        st.target_id, st.target_name, st.address, st.district, st.province,
        st.status, st.created_at, st.updated_at,
        stt.type_name,
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
        CONCAT(rev.first_name, ' ', rev.last_name) as reviewed_by_name
      FROM survey_targets st
      LEFT JOIN survey_target_types stt ON st.type_id = stt.type_id
      LEFT JOIN users u ON st.created_by = u.user_id
      LEFT JOIN users rev ON st.reviewed_by = rev.user_id
      WHERE 1=1
    `;

    let countQuery = `
      SELECT COUNT(*) as total 
      FROM survey_targets st
      LEFT JOIN survey_target_types stt ON st.type_id = stt.type_id
      WHERE 1=1
    `;

    const params = [];
    const countParams = [];

    // Role-based filtering
    if (req.user.role === "Surveyor") {
      query += ` AND st.created_by = ?`;
      countQuery += ` AND st.created_by = ?`;
      params.push(req.user.user_id);
      countParams.push(req.user.user_id);
    }

    // Search filter
    if (search) {
      query += ` AND (st.target_name LIKE ? OR st.address LIKE ? OR st.district LIKE ? OR st.province LIKE ?)`;
      countQuery += ` AND (st.target_name LIKE ? OR st.address LIKE ? OR st.district LIKE ? OR st.province LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Status filter
    if (status) {
      query += ` AND st.status = ?`;
      countQuery += ` AND st.status = ?`;
      params.push(status);
      countParams.push(status);
    }

    // Type filter
    if (type_id) {
      query += ` AND st.type_id = ?`;
      countQuery += ` AND st.type_id = ?`;
      params.push(type_id);
      countParams.push(type_id);
    }

    // Created by filter (Admin/Reviewer only)
    if (created_by && req.user.role !== "Surveyor") {
      query += ` AND st.created_by = ?`;
      countQuery += ` AND st.created_by = ?`;
      params.push(created_by);
      countParams.push(created_by);
    }

    // Add pagination
    query += ` ORDER BY st.updated_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    // Execute queries
    const [surveys, totalResult] = await Promise.all([
      executeQuery(query, params),
      executeQuery(countQuery, countParams),
    ]);

    const total = totalResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        surveys,
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
    logger.error("Get surveys error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลการสำรวจ",
    });
  }
});

// @route   GET /api/surveys/:id
// @desc    Get survey by ID with full details
// @access  Private
router.get(
  "/:id",
  authorizeResourceAccess(["Admin", "Reviewer"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Get main survey data
      const surveys = await executeQuery(
        `
      SELECT 
        st.*,
        stt.type_name,
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
        CONCAT(rev.first_name, ' ', rev.last_name) as reviewed_by_name
      FROM survey_targets st
      LEFT JOIN survey_target_types stt ON st.type_id = stt.type_id
      LEFT JOIN users u ON st.created_by = u.user_id
      LEFT JOIN users rev ON st.reviewed_by = rev.user_id
      WHERE st.target_id = ?
    `,
        [id]
      );

      if (surveys.length === 0) {
        return res.status(404).json({
          success: false,
          message: "ไม่พบข้อมูลการสำรวจที่ระบุ",
        });
      }

      const survey = surveys[0];

      // Get temple details if it's a temple survey
      let templeDetails = null;
      if (survey.type_name === "วัด") {
        const templeData = await executeQuery(
          `
        SELECT 
          td.*,
          mtt.name as temple_type_name,
          md.name as denomination_name
        FROM temple_details td
        LEFT JOIN master_temple_types mtt ON td.temple_type_id = mtt.id
        LEFT JOIN master_denominations md ON td.denomination_id = md.id
        WHERE td.target_id = ?
      `,
          [id]
        );

        templeDetails = templeData.length > 0 ? templeData[0] : null;
      }

      // Get personnel
      const personnel = await executeQuery(
        "SELECT * FROM personnel WHERE target_id = ? ORDER BY role",
        [id]
      );

      // Get bank accounts
      const bankAccounts = await executeQuery(
        "SELECT * FROM bank_accounts WHERE target_id = ? ORDER BY bank_name",
        [id]
      );

      // Get attachments
      const attachments = await executeQuery(
        `
      SELECT 
        a.*,
        CONCAT(u.first_name, ' ', u.last_name) as uploader_name
      FROM attachments a
      LEFT JOIN users u ON a.uploader_user_id = u.user_id
      WHERE a.target_id = ?
      ORDER BY a.uploaded_at DESC
    `,
        [id]
      );

      res.json({
        success: true,
        data: {
          ...survey,
          temple_details: templeDetails,
          personnel,
          bank_accounts: bankAccounts,
          attachments,
        },
      });
    } catch (error) {
      logger.error("Get survey details error:", error.message);
      res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงรายละเอียดการสำรวจ",
      });
    }
  }
);

// @route   POST /api/surveys
// @desc    Create new survey
// @access  Private/Surveyor+
router.post("/", authorizeRoles("Admin", "Surveyor"), async (req, res) => {
  try {
    const {
      type_id,
      target_name,
      address,
      subdistrict,
      district,
      province,
      postal_code,
      gps_latitude,
      gps_longitude,
      temple_details,
      personnel,
      bank_accounts,
    } = req.body;

    // Validation
    if (!type_id || !target_name) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกประเภทการสำรวจและชื่อเป้าหมาย",
      });
    }

    // Prepare transaction queries
    const queries = [];

    // Insert main survey target
    queries.push({
      query: `INSERT INTO survey_targets 
              (type_id, target_name, address, subdistrict, district, province, postal_code, 
               gps_latitude, gps_longitude, created_by) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params: [
        type_id,
        target_name,
        address,
        subdistrict,
        district,
        province,
        postal_code,
        gps_latitude,
        gps_longitude,
        req.user.user_id,
      ],
    });

    // Execute transaction
    const results = await executeTransaction(queries);
    const targetId = results[0].insertId;

    // Insert temple details if provided and type is temple
    if (temple_details && type_id === 1) {
      // Assuming type_id 1 is temple
      await executeQuery(
        `
        INSERT INTO temple_details (target_id, temple_type_id, denomination_id, monk_count, history_summary)
        VALUES (?, ?, ?, ?, ?)
      `,
        [
          targetId,
          temple_details.temple_type_id,
          temple_details.denomination_id,
          temple_details.monk_count,
          temple_details.history_summary,
        ]
      );
    }

    // Insert personnel if provided
    if (personnel && personnel.length > 0) {
      for (const person of personnel) {
        await executeQuery(
          `
          INSERT INTO personnel (target_id, role, first_name, last_name, phone)
          VALUES (?, ?, ?, ?, ?)
        `,
          [
            targetId,
            person.role,
            person.first_name,
            person.last_name,
            person.phone,
          ]
        );
      }
    }

    // Insert bank accounts if provided
    if (bank_accounts && bank_accounts.length > 0) {
      for (const account of bank_accounts) {
        await executeQuery(
          `
          INSERT INTO bank_accounts (target_id, bank_name, account_number, account_name, signatories)
          VALUES (?, ?, ?, ?, ?)
        `,
          [
            targetId,
            account.bank_name,
            account.account_number,
            account.account_name,
            account.signatories,
          ]
        );
      }
    }

    // Log activity
    await logActivity(
      req.user.user_id,
      "CREATE",
      "survey_targets",
      targetId,
      { target_name, type_id },
      req.ip
    );

    res.status(201).json({
      success: true,
      message: "สร้างการสำรวจสำเร็จ",
      data: {
        target_id: targetId,
      },
    });
  } catch (error) {
    logger.error("Create survey error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการสร้างการสำรวจ",
    });
  }
});

// @route   PUT /api/surveys/:id/status
// @desc    Update survey status (Review workflow)
// @access  Private/Reviewer+
router.put(
  "/:id/status",
  authorizeRoles("Admin", "Reviewer"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, comments } = req.body;

      // Validation
      const validStatuses = ["Pending Review", "Approved", "Needs Revision"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "สถานะที่ระบุไม่ถูกต้อง",
        });
      }

      // Get current survey
      const surveys = await executeQuery(
        "SELECT * FROM survey_targets WHERE target_id = ?",
        [id]
      );

      if (surveys.length === 0) {
        return res.status(404).json({
          success: false,
          message: "ไม่พบข้อมูลการสำรวจที่ระบุ",
        });
      }

      // Update status
      await executeQuery(
        "UPDATE survey_targets SET status = ?, reviewed_by = ? WHERE target_id = ?",
        [status, req.user.user_id, id]
      );

      // Create notification for surveyor
      const notificationTitle =
        status === "Approved"
          ? "การสำรวจได้รับการอนุมัติ"
          : "การสำรวจต้องแก้ไข";
      const notificationMessage =
        status === "Approved"
          ? `การสำรวจ "${surveys[0].target_name}" ได้รับการอนุมัติเรียบร้อยแล้ว`
          : `การสำรวจ "${surveys[0].target_name}" ต้องการแก้ไข: ${comments}`;

      await executeQuery(
        `
      INSERT INTO notifications (user_id, title, message, type, related_target_id)
      VALUES (?, ?, ?, ?, ?)
    `,
        [
          surveys[0].created_by,
          notificationTitle,
          notificationMessage,
          status === "Approved" ? "success" : "warning",
          id,
        ]
      );

      // Log activity
      await logActivity(
        req.user.user_id,
        "UPDATE",
        "survey_targets",
        id,
        { status_change: { old: surveys[0].status, new: status }, comments },
        req.ip
      );

      res.json({
        success: true,
        message: "อัปเดตสถานะสำเร็จ",
      });
    } catch (error) {
      logger.error("Update survey status error:", error.message);
      res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการอัปเดตสถานะ",
      });
    }
  }
);

module.exports = router;
