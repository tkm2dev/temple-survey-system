const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { executeQuery } = require("../config/database");
const { logActivity } = require("../utils/auditLogger");
const logger = require("../utils/logger");
const { authenticateToken } = require("../middleware/auth");

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
    const users = await executeQuery(
      "SELECT user_id, username, password_hash, role, first_name, last_name, email, is_active FROM users WHERE username = ?",
      [username]
    );

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
      return res.status(401).json({
        success: false,
        message: "บัญชีถูกปิดการใช้งาน กรุณาติดต่อผู้ดูแลระบบ",
      });
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

// @route   POST /api/auth/register
// @desc    Register new user (Admin only)
// @access  Private/Admin
router.post("/register", async (req, res) => {
  try {
    const { username, password, role, first_name, last_name, email } = req.body;

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
      `INSERT INTO users (username, password_hash, role, first_name, last_name, email) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, password_hash, role, first_name, last_name, email]
    );

    res.status(201).json({
      success: true,
      message: "สร้างบัญชีผู้ใช้สำเร็จ",
      data: {
        user_id: result.insertId,
        username,
        role,
        first_name,
        last_name,
        email,
      },
    });
  } catch (error) {
    logger.error("Registration error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการสร้างบัญชี",
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
      "PASSWORD_CHANGE",
      null,
      null,
      { action: "Password changed successfully" },
      req.ip
    );

    console.log(
      `✅ [CHANGE PASSWORD] Password changed successfully for user: ${req.user.username}`
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
    const users = await executeQuery(
      `SELECT user_id, username, role, first_name, last_name, email, 
              phone_number, line_id, rank_position, job_position, agency,
              is_active, approval_status, created_at, updated_at 
       FROM users WHERE user_id = ?`,
      [req.user.user_id]
    );

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
      "LOGOUT",
      null,
      null,
      {
        logout_time: new Date(),
        user_agent: req.headers["user-agent"],
      },
      req.ip
    );

    console.log(
      `✅ [LOGOUT] User ${req.user.username} logged out successfully`
    );

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
