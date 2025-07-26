const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { executeQuery } = require("../config/database");
const { logActivity } = require("../utils/auditLogger");
const logger = require("../utils/logger");

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
router.post("/change-password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // This would need authentication middleware
    // For now, return method not implemented
    res.status(501).json({
      success: false,
      message: "ฟังก์ชันนี้ยังไม่พร้อมใช้งาน",
    });
  } catch (error) {
    logger.error("Password change error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน",
    });
  }
});

module.exports = router;
