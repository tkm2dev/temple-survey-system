const jwt = require("jsonwebtoken");
const { executeQuery } = require("../config/database");
const logger = require("../utils/logger");

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    console.log(
      `🔐 [AUTH MIDDLEWARE] Checking authentication for ${req.method} ${req.path}`
    );

    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      console.log(`❌ [AUTH MIDDLEWARE] No token provided`);
      return res.status(401).json({
        success: false,
        message: "กรุณาเข้าสู่ระบบก่อนใช้งาน",
      });
    }

    console.log(`🔍 [AUTH MIDDLEWARE] Verifying token...`);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(
      `👤 [AUTH MIDDLEWARE] Token valid for user: ${decoded.username}`
    );

    // Get fresh user data from database
    const users = await executeQuery(
      `SELECT user_id, username, role, first_name, last_name, email, 
              is_active, approval_status FROM users WHERE user_id = ?`,
      [decoded.userId || decoded.user_id]
    );

    if (!users || users.length === 0) {
      console.log(
        `❌ [AUTH MIDDLEWARE] User not found in database: ${
          decoded.userId || decoded.user_id
        }`
      );
      return res.status(401).json({
        success: false,
        message: "ผู้ใช้ไม่มีในระบบ",
      });
    }

    const user = users[0];

    // Check if user is still active
    if (!user.is_active) {
      console.log(
        `❌ [AUTH MIDDLEWARE] User account disabled: ${user.username}`
      );
      return res.status(401).json({
        success: false,
        message: "บัญชีถูกปิดการใช้งาน",
      });
    }

    // Check approval status
    if (user.approval_status !== "approved") {
      console.log(
        `❌ [AUTH MIDDLEWARE] User not approved: ${user.username}, Status: ${user.approval_status}`
      );
      return res.status(401).json({
        success: false,
        message: "บัญชียังไม่ได้รับการอนุมัติ",
      });
    }

    console.log(
      `✅ [AUTH MIDDLEWARE] Authentication successful for user: ${user.username}`
    );

    // Add user info to request object
    req.user = user;
    next();
  } catch (error) {
    console.error(`💥 [AUTH MIDDLEWARE] Error: ${error.message}`);
    logger.error("Authentication error:", error.message);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token ไม่ถูกต้อง",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token หมดอายุ กรุณาเข้าสู่ระบบใหม่",
      });
    }

    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์",
    });
  }
};

// Check user role authorization
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }

    next();
  };
};

// Check if user owns resource or has appropriate role
const authorizeResourceAccess = (allowedRoles = ["Admin"]) => {
  return async (req, res, next) => {
    try {
      const { user } = req;
      const resourceId = req.params.id || req.params.targetId;

      // Admin has access to everything
      if (user.role === "Admin") {
        return next();
      }

      // Check if user role is in allowed roles
      if (allowedRoles.includes(user.role)) {
        return next();
      }

      // For Surveyor: check if they own the resource
      if (user.role === "Surveyor" && resourceId) {
        const resource = await executeQuery(
          "SELECT created_by FROM survey_targets WHERE target_id = ?",
          [resourceId]
        );

        if (resource.length > 0 && resource[0].created_by === user.user_id) {
          return next();
        }
      }

      return res.status(403).json({
        success: false,
        message: "Access denied - insufficient permissions",
      });
    } catch (error) {
      logger.error("Authorization error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Authorization server error",
      });
    }
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  authorizeResourceAccess,
};
