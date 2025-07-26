const express = require("express");
const bcrypt = require("bcryptjs");
const { executeQuery } = require("../config/database");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const { logActivity } = require("../utils/auditLogger");
const logger = require("../utils/logger");

const router = express.Router();

// Apply authentication to all user routes
router.use(authenticateToken);

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get("/", authorizeRoles("Admin"), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      role = "",
      approval_status = "",
    } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT user_id, username, role, first_name, last_name, email, is_active, 
             approval_status, rank, position, department, phone, created_at
      FROM users
      WHERE 1=1
    `;
    let countQuery = "SELECT COUNT(*) as total FROM users WHERE 1=1";
    const params = [];
    const countParams = [];

    // Add search filter
    if (search) {
      query += ` AND (username LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR email LIKE ? 
                 OR rank LIKE ? OR position LIKE ? OR department LIKE ? OR phone LIKE ?)`;
      countQuery += ` AND (username LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR email LIKE ? 
                     OR rank LIKE ? OR position LIKE ? OR department LIKE ? OR phone LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm
      );
      countParams.push(
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm
      );
    }

    // Add role filter
    if (role) {
      query += ` AND role = ?`;
      countQuery += ` AND role = ?`;
      params.push(role);
      countParams.push(role);
    }

    // Add approval status filter
    if (approval_status) {
      query += ` AND approval_status = ?`;
      countQuery += ` AND approval_status = ?`;
      params.push(approval_status);
      countParams.push(approval_status);
    }

    // Add pagination
    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    // Execute queries
    const [users, totalResult] = await Promise.all([
      executeQuery(query, params),
      executeQuery(countQuery, countParams),
    ]);

    const total = totalResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        users,
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
    logger.error("Get users error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้",
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private/Admin
router.get("/:id", authorizeRoles("Admin"), async (req, res) => {
  try {
    const { id } = req.params;

    const users = await executeQuery(
      "SELECT user_id, username, role, first_name, last_name, email, is_active, approval_status, rank, position, department, phone, line_id, created_at FROM users WHERE user_id = ?",
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบผู้ใช้ที่ระบุ",
      });
    }

    res.json({
      success: true,
      data: users[0],
    });
  } catch (error) {
    logger.error("Get user error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้",
    });
  }
});

// @route   POST /api/users
// @desc    Create new user
// @access  Private/Admin
router.post("/", authorizeRoles("Admin"), async (req, res) => {
  try {
    const {
      username,
      password,
      role,
      first_name,
      last_name,
      email,
      approval_status,
      rank,
      position,
      department,
      phone,
      line_id,
      notes,
    } = req.body;

    // Validation
    if (!username || !password || !role || !email) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน",
      });
    }

    // Check if user exists
    const existingUsers = await executeQuery(
      "SELECT user_id FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "ชื่อผู้ใช้หรืออีเมลนี้มีในระบบแล้ว",
      });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await executeQuery(
      `INSERT INTO users (
         username, password_hash, role, first_name, last_name, email,
         approval_status, rank, position, department, phone, line_id, notes
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        username,
        password_hash,
        role,
        first_name,
        last_name,
        email,
        approval_status || "pending",
        rank || null,
        position || null,
        department || null,
        phone || null,
        line_id || null,
        notes || null,
      ]
    );

    // Log activity
    await logActivity(
      req.user.user_id,
      "CREATE",
      "users",
      result.insertId,
      {
        created_user: {
          username,
          role,
          email,
          approval_status,
          rank,
          position,
          department,
          phone,
          line_id,
        },
      },
      req.ip
    );

    res.status(201).json({
      success: true,
      message: "สร้างผู้ใช้สำเร็จ",
      data: {
        user_id: result.insertId,
        username,
        role,
        first_name,
        last_name,
        email,
        approval_status: approval_status || "pending",
        rank,
        position,
        department,
        phone,
        line_id,
      },
    });
  } catch (error) {
    logger.error("Create user error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการสร้างผู้ใช้",
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private/Admin
router.put("/:id", authorizeRoles("Admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      username,
      role,
      first_name,
      last_name,
      email,
      is_active,
      approval_status,
      rank,
      position,
      department,
      phone,
      line_id,
      notes,
    } = req.body;

    // Get current user data for audit log
    const currentUsers = await executeQuery(
      "SELECT * FROM users WHERE user_id = ?",
      [id]
    );

    if (currentUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบผู้ใช้ที่ระบุ",
      });
    }

    const currentUser = currentUsers[0];

    // Check if username/email conflicts with other users
    if (username || email) {
      const conflictUsers = await executeQuery(
        "SELECT user_id FROM users WHERE (username = ? OR email = ?) AND user_id != ?",
        [username || currentUser.username, email || currentUser.email, id]
      );

      if (conflictUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: "ชื่อผู้ใช้หรืออีเมลนี้มีในระบบแล้ว",
        });
      }
    }

    // Update user
    await executeQuery(
      `UPDATE users 
       SET username = ?, role = ?, first_name = ?, last_name = ?, email = ?, 
           is_active = ?, approval_status = ?, rank = ?, position = ?, 
           department = ?, phone = ?, line_id = ?, notes = ?
       WHERE user_id = ?`,
      [
        username || currentUser.username,
        role || currentUser.role,
        first_name || currentUser.first_name,
        last_name || currentUser.last_name,
        email || currentUser.email,
        is_active !== undefined ? is_active : currentUser.is_active,
        approval_status || currentUser.approval_status || "pending",
        rank !== undefined ? rank : currentUser.rank,
        position !== undefined ? position : currentUser.position,
        department !== undefined ? department : currentUser.department,
        phone !== undefined ? phone : currentUser.phone,
        line_id !== undefined ? line_id : currentUser.line_id,
        notes !== undefined ? notes : currentUser.notes,
        id,
      ]
    );

    // Log activity
    await logActivity(
      req.user.user_id,
      "UPDATE",
      "users",
      id,
      {
        old_data: currentUser,
        new_data: {
          username,
          role,
          first_name,
          last_name,
          email,
          is_active,
          approval_status,
          rank,
          position,
          department,
          phone,
          line_id,
          notes,
        },
      },
      req.ip
    );

    res.json({
      success: true,
      message: "อัปเดตข้อมูลผู้ใช้สำเร็จ",
    });
  } catch (error) {
    logger.error("Update user error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัปเดตผู้ใช้",
    });
  }
});

// @route   PATCH /api/users/:id/status
// @desc    Update user active status
// @access  Private/Admin
router.patch("/:id/status", authorizeRoles("Admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    // Validate is_active parameter
    if (is_active === undefined || typeof is_active !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "สถานะการเปิดใช้งานไม่ถูกต้อง",
      });
    }

    // Check if user exists
    const users = await executeQuery("SELECT * FROM users WHERE user_id = ?", [
      id,
    ]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบผู้ใช้ที่ระบุ",
      });
    }

    const currentUser = users[0];

    // Prevent changing own account status
    if (parseInt(id) === req.user.user_id) {
      return res.status(400).json({
        success: false,
        message: "ไม่สามารถเปลี่ยนสถานะบัญชีของตนเองได้",
      });
    }

    // Update user status
    await executeQuery("UPDATE users SET is_active = ? WHERE user_id = ?", [
      is_active,
      id,
    ]);

    // Log activity
    await logActivity(
      req.user.user_id,
      "UPDATE",
      "users",
      id,
      {
        old_data: { is_active: currentUser.is_active },
        new_data: { is_active },
      },
      req.ip
    );

    res.json({
      success: true,
      message: `${is_active ? "เปิด" : "ปิด"}ใช้งานผู้ใช้สำเร็จ`,
    });
  } catch (error) {
    logger.error("Update user status error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัปเดตสถานะผู้ใช้",
    });
  }
});

// @route   PATCH /api/users/:id/approval
// @desc    Update user approval status
// @access  Private/Admin
router.patch("/:id/approval", authorizeRoles("Admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { approval_status } = req.body;

    // Validate approval status
    const validStatuses = ["pending", "approved", "rejected"];
    if (!validStatuses.includes(approval_status)) {
      return res.status(400).json({
        success: false,
        message: "สถานะการอนุมัติไม่ถูกต้อง",
      });
    }

    // Check if user exists
    const users = await executeQuery("SELECT * FROM users WHERE user_id = ?", [
      id,
    ]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบผู้ใช้ที่ระบุ",
      });
    }

    const currentUser = users[0];

    // Update user approval status
    await executeQuery(
      "UPDATE users SET approval_status = ? WHERE user_id = ?",
      [approval_status, id]
    );

    // Log activity
    await logActivity(
      req.user.user_id,
      "UPDATE",
      "users",
      id,
      {
        old_data: { approval_status: currentUser.approval_status },
        new_data: { approval_status },
      },
      req.ip
    );

    res.json({
      success: true,
      message: "อัปเดตสถานะการอนุมัติผู้ใช้สำเร็จ",
    });
  } catch (error) {
    logger.error("Update user approval status error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัปเดตสถานะการอนุมัติผู้ใช้",
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete("/:id", authorizeRoles("Admin"), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const users = await executeQuery("SELECT * FROM users WHERE user_id = ?", [
      id,
    ]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบผู้ใช้ที่ระบุ",
      });
    }

    // Prevent deleting own account
    if (parseInt(id) === req.user.user_id) {
      return res.status(400).json({
        success: false,
        message: "ไม่สามารถลบบัญชีของตนเองได้",
      });
    }

    // Delete user
    await executeQuery("DELETE FROM users WHERE user_id = ?", [id]);

    // Log activity
    await logActivity(
      req.user.user_id,
      "DELETE",
      "users",
      id,
      { deleted_user: users[0] },
      req.ip
    );

    res.json({
      success: true,
      message: "ลบผู้ใช้สำเร็จ",
    });
  } catch (error) {
    logger.error("Delete user error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการลบผู้ใช้",
    });
  }
});

module.exports = router;
