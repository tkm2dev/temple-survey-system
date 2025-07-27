const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { executeQuery } = require("../config/database");
const { logActivity } = require("../utils/auditLogger");
const logger = require("../utils/logger");
const { authenticateToken } = require("../middleware/auth");
const {
  notifyAdminsNewRegistration,
  notifyUserApproval,
  notifyUserRejection,
} = require("../utils/notificationService");

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log(`🔐 [LOGIN ATTEMPT] Username: ${username}`);

    // Validation
    if (!username || !password) {
      console.log(`❌ [LOGIN FAILED] Missing credentials`);
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน",
      });
    }

    // Find user
    console.log(`🔍 [LOGIN] Searching for user: ${username}`);
    const users = await executeQuery("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (users.length === 0) {
      console.log(`❌ [LOGIN FAILED] User not found: ${username}`);
      return res.status(401).json({
        success: false,
        message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
      });
    }

    const user = users[0];
    console.log(
      `👤 [LOGIN] Found user: ${user.username}, Role: ${user.role}, Active: ${user.is_active}`
    );

    // Check if user is active
    if (!user.is_active) {
      console.log(`❌ [LOGIN FAILED] User account disabled: ${username}`);

      // Check approval status for better error message
      if (user.approval_status === "pending") {
        return res.status(401).json({
          success: false,
          message: "บัญชีของคุณยังรออนุมัติจากผู้ดูแลระบบ กรุณารอสักครู่",
        });
      } else if (user.approval_status === "rejected") {
        return res.status(401).json({
          success: false,
          message: "บัญชีของคุณถูกปฏิเสธ กรุณาติดต่อผู้ดูแลระบบ",
        });
      } else {
        return res.status(401).json({
          success: false,
          message: "บัญชีถูกปิดการใช้งาน กรุณาติดต่อผู้ดูแลระบบ",
        });
      }
    }

    // Check password
    console.log(`🔑 [LOGIN] Verifying password for user: ${username}`);
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      console.log(`❌ [LOGIN FAILED] Invalid password for user: ${username}`);
      return res.status(401).json({
        success: false,
        message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
      });
    }

    console.log(`✅ [LOGIN SUCCESS] Password verified for user: ${username}`);

    // Create JWT payload
    const payload = {
      userId: user.user_id,
      username: user.username,
      role: user.role,
    };

    // Sign token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    });

    console.log(`🎫 [LOGIN] JWT token generated for user: ${username}`);

    // Log login activity
    await logActivity(
      user.user_id,
      "LOGIN",
      null,
      null,
      {
        login_time: new Date(),
        user_agent: req.headers["user-agent"],
      },
      req.ip
    );

    console.log(`📝 [LOGIN] Activity logged for user: ${username}`);

    // Remove password from response
    const { password_hash, ...userResponse } = user;

    console.log(`🎉 [LOGIN COMPLETE] User ${username} logged in successfully`);

    res.json({
      success: true,
      message: "เข้าสู่ระบบสำเร็จ",
      data: {
        token,
        user: userResponse,
      },
    });
  } catch (error) {
    console.error(`💥 [LOGIN ERROR] ${error.message}`);
    logger.error("Login error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในระบบ",
    });
  }
});

// @route   GET /api/auth/check-username/:username
// @desc    Check if username is available
// @access  Public
router.get("/check-username/:username", async (req, res) => {
  try {
    const { username } = req.params;

    console.log(`🔍 [CHECK USERNAME] Checking availability for: ${username}`);

    // Validation
    if (!username) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุชื่อผู้ใช้",
      });
    }

    // Check if username exists
    const existingUsers = await executeQuery(
      "SELECT user_id FROM users WHERE username = ?",
      [username]
    );

    const isAvailable = existingUsers.length === 0;

    console.log(
      `✅ [CHECK USERNAME] ${username} is ${
        isAvailable ? "available" : "taken"
      }`
    );

    res.json({
      success: true,
      data: {
        username,
        available: isAvailable,
        message: isAvailable
          ? "ชื่อผู้ใช้นี้สามารถใช้งานได้"
          : "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว",
      },
    });
  } catch (error) {
    console.error(`💥 [CHECK USERNAME] Error: ${error.message}`);
    logger.error("Check username error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการตรวจสอบชื่อผู้ใช้",
    });
  }
});

// @route   POST /api/auth/register
// @desc    Register new user (requires approval)
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const {
      username,
      password,
      first_name,
      last_name,
      email,
      phone,
      line_id,
      rank,
      position,
      department,
      station,
      idcard,
    } = req.body;

    console.log(`📝 [REGISTER] New registration attempt: ${username}`);

    // Validation
    if (
      !username ||
      !password ||
      !first_name ||
      !last_name ||
      !email ||
      !idcard
    ) {
      return res.status(400).json({
        success: false,
        message:
          "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ชื่อผู้ใช้, รหัสผ่าน, ชื่อ, นามสกุล, อีเมล)",
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "รูปแบบอีเมลไม่ถูกต้อง",
      });
    }

    // Check if user exists
    const existingUsers = await executeQuery(
      "SELECT user_id FROM users WHERE username = ? OR email = ? OR idcard = ?",
      [username, email, idcard]
    );

    if (existingUsers.length > 0) {
      console.log(`❌ [REGISTER] User already exists: ${username} or ${email}`);
      return res.status(400).json({
        success: false,
        message: "ชื่อผู้ใช้หรืออีเมลนี้มีในระบบแล้ว",
      });
    }

    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert new user with pending approval status
    const result = await executeQuery(
      `INSERT INTO users (
        username, password_hash, role, first_name, last_name, email,
        phone, line_id, rank, position, department, idcard,
        is_active, approval_status, station
      ) VALUES (?, ?, 'Surveyor', ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'pending', ?)`,
      [
        username,
        password_hash,
        first_name,
        last_name,
        email,
        phone || null,
        line_id || null,
        rank || null,
        position || null,
        department || null,
        idcard,
        station || null,
      ]
    );

    console.log(
      `✅ [REGISTER] New user registered: ${username} (ID: ${result.insertId})`
    );

    // Log registration activity
    await logActivity(
      result.insertId,
      "ผู้ใช้งานใหม่ลงทะเบียน",
      null,
      null,
      {
        action: "ผู้ใช้งานใหม่ลงทะเบียน",
        username: username,
        email: email,
        status: "pending_approval",
      },
      req.ip
    );

    // ส่งการแจ้งเตือนให้ Admin ทุกคนเกี่ยวกับผู้ใช้ใหม่
    const newUserData = {
      user_id: result.insertId,
      username,
      first_name,
      last_name,
      email,
      department: department || null,
      position: position || null,
    };

    try {
      await notifyAdminsNewRegistration(newUserData);
      console.log(
        `📬 [REGISTER] Admin notification sent for new user: ${username}`
      );
    } catch (notifyError) {
      console.error(
        `❌ [REGISTER] Failed to notify admins:`,
        notifyError.message
      );
      // ไม่ให้ error นี้ไปขัดขวางการลงทะเบียน
    }

    res.status(201).json({
      success: true,
      message: "ลงทะเบียนสำเร็จ! กรุณารอการอนุมัติจากผู้ดูแลระบบ",
      data: {
        user_id: result.insertId,
        username,
        first_name,
        last_name,
        email,
        phone: phone || null,
        line_id: line_id || null,
        department: department || null,
        station: station || null,
        approval_status: "pending",
      },
    });
  } catch (error) {
    console.error(`💥 [REGISTER] Error: ${error.message}`);
    logger.error("Registration error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการสร้างบัญชี",
    });
  }
});

// @route   POST /api/auth/approve-user
// @desc    Approve or reject user registration (Admin only)
// @access  Private/Admin
router.post("/approve-user", authenticateToken, async (req, res) => {
  try {
    const { user_id, action, reason } = req.body; // action: 'approve' or 'reject'

    console.log(
      `🔍 [USER APPROVAL] Admin ${req.user.username} ${action}ing user ID: ${user_id}`
    );

    // Check if current user is admin
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "ไม่มีสิทธิ์ในการอนุมัติผู้ใช้งาน",
      });
    }

    // Validation
    if (!user_id || !action || !["approve", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง",
      });
    }

    // Get user info
    const users = await executeQuery("SELECT * FROM users WHERE user_id = ?", [
      user_id,
    ]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบผู้ใช้งานที่ต้องการอนุมัติ",
      });
    }

    const user = users[0];

    if (user.approval_status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "ผู้ใช้งานนี้ได้รับการพิจารณาแล้ว",
      });
    }

    // Update user status
    let newStatus = action === "approve" ? "approved" : "rejected";
    let isActive = action === "approve" ? 1 : 0;

    await executeQuery(
      "UPDATE users SET approval_status = ?, is_active = ?, approved_by = ?, approved_at = NOW() WHERE user_id = ?",
      [newStatus, isActive, req.user.user_id, user_id]
    );

    console.log(
      `✅ [USER APPROVAL] User ${user.username} has been ${newStatus}`
    );

    // ส่งการแจ้งเตือนให้ผู้ใช้เกี่ยวกับการอนุมัติ/ปฏิเสธ
    try {
      if (action === "approve") {
        await notifyUserApproval(user, req.user);
        console.log(
          `📬 [USER APPROVAL] Approval notification sent to user: ${user.username}`
        );
      } else {
        await notifyUserRejection(user, req.user, reason);
        console.log(
          `📬 [USER APPROVAL] Rejection notification sent to user: ${user.username}`
        );
      }
    } catch (notifyError) {
      console.error(
        `❌ [USER APPROVAL] Failed to send notification:`,
        notifyError.message
      );
      // ไม่ให้ error นี้ไปขัดขวางการอนุมัติ
    }

    // Log approval activity
    await logActivity(
      req.user.user_id,
      "อนุมัติผู้ใช้งาน",
      user_id,
      null,
      {
        action: `User ${action}`,
        target_username: user.username,
        target_email: user.email,
        reason: reason || null,
        new_status: newStatus,
      },
      req.ip
    );

    res.json({
      success: true,
      message:
        action === "approve"
          ? "อนุมัติผู้ใช้งานสำเร็จ"
          : "ปฏิเสธผู้ใช้งานสำเร็จ",
      data: {
        user_id,
        username: user.username,
        new_status: newStatus,
        approved_by: req.user.username,
      },
    });
  } catch (error) {
    console.error(`💥 [USER APPROVAL] Error: ${error.message}`);
    logger.error("User approval error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอนุมัติผู้ใช้งาน",
    });
  }
});

// @route   GET /api/auth/pending-users
// @desc    Get list of pending user registrations (Admin only)
// @access  Private/Admin
router.get("/pending-users", authenticateToken, async (req, res) => {
  try {
    console.log(
      `📋 [PENDING USERS] Admin ${req.user.username} requesting pending users list`
    );

    // Check if current user is admin
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "ไม่มีสิทธิ์ในการดูรายการผู้ใช้งานที่รออนุมัติ",
      });
    }

    // Get pending users
    const pendingUsers = await executeQuery(
      `SELECT * FROM users WHERE approval_status = 'pending' ORDER BY created_at ASC`
    );

    console.log(
      `✅ [PENDING USERS] Found ${pendingUsers.length} pending users`
    );

    res.json({
      success: true,
      message: "ดึงรายการผู้ใช้งานที่รออนุมัติสำเร็จ",
      data: {
        pending_users: pendingUsers,
        count: pendingUsers.length,
      },
    });
  } catch (error) {
    console.error(`💥 [PENDING USERS] Error: ${error.message}`);
    logger.error("Get pending users error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงรายการผู้ใช้งาน",
    });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post("/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.user_id;

    console.log(
      `🔑 [CHANGE PASSWORD] User ${req.user.username} requesting password change`
    );

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร",
      });
    }

    // Get current password hash
    const users = await executeQuery(
      "SELECT password_hash FROM users WHERE user_id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูลผู้ใช้",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      users[0].password_hash
    );

    if (!isCurrentPasswordValid) {
      console.log(
        `❌ [CHANGE PASSWORD] Invalid current password for user: ${req.user.username}`
      );
      return res.status(400).json({
        success: false,
        message: "รหัสผ่านปัจจุบันไม่ถูกต้อง",
      });
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await executeQuery(
      "UPDATE users SET password_hash = ?, updated_at = NOW() WHERE user_id = ?",
      [newPasswordHash, userId]
    );

    // Log activity
    await logActivity(
      userId,
      "เปลี่ยนรหัสผ่าน",
      null,
      null,
      { action: "เปลี่ยนรหัสผ่านสำเร็จ" },
      req.ip
    );

    console.log(
      `✅ [CHANGE PASSWORD] เปลี่ยนรหัสผ่านสำเร็จสำหรับผู้ใช้: ${req.user.username}`
    );

    res.json({
      success: true,
      message: "เปลี่ยนรหัสผ่านสำเร็จ",
    });
  } catch (error) {
    console.error(`💥 [CHANGE PASSWORD] Error: ${error.message}`);
    logger.error("Password change error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน",
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user information
// @access  Private
router.get("/me", authenticateToken, async (req, res) => {
  try {
    console.log(
      `👤 [GET PROFILE] User ${req.user.username} requesting profile info`
    );

    // Get fresh user data (already done in middleware, but get complete info)
    const users = await executeQuery(`SELECT * FROM users WHERE user_id = ?`, [
      req.user.user_id,
    ]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูลผู้ใช้",
      });
    }

    const user = users[0];
    console.log(
      `✅ [GET PROFILE] Profile data retrieved for user: ${user.username}`
    );

    res.json({
      success: true,
      message: "ดึงข้อมูลผู้ใช้สำเร็จ",
      data: {
        user: user,
      },
    });
  } catch (error) {
    console.error(`💥 [GET PROFILE] Error: ${error.message}`);
    logger.error("Get profile error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้",
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (mainly for logging purposes)
// @access  Private
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    console.log(`👋 [LOGOUT] User ${req.user.username} logging out`);

    // Log logout activity
    await logActivity(
      req.user.user_id,
      "ออกจากระบบ",
      null,
      null,
      {
        logout_time: new Date(),
        user_agent: req.headers["user-agent"],
      },
      req.ip
    );

    console.log(`✅ [LOGOUT] User ${req.user.username} ออกจากระบบสำเร็จ`);

    res.json({
      success: true,
      message: "ออกจากระบบสำเร็จ",
    });
  } catch (error) {
    console.error(`💥 [LOGOUT] Error: ${error.message}`);
    logger.error("Logout error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการออกจากระบบ",
    });
  }
});

module.exports = router;
