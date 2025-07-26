const jwt = require("jsonwebtoken");
const { executeQuery } = require("../config/database");
const logger = require("../utils/logger");

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await executeQuery(
      "SELECT user_id, username, role, first_name, last_name, email, is_active FROM users WHERE user_id = ?",
      [decoded.userId]
    );

    if (!user || user.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid token - user not found",
      });
    }

    if (!user[0].is_active) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    req.user = user[0];
    next();
  } catch (error) {
    logger.error("Authentication error:", error.message);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication server error",
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
