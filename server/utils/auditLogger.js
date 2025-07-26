const { executeQuery } = require("../config/database");
const logger = require("./logger");

// Log user activity for audit trail
const logActivity = async (
  userId,
  actionType,
  targetTable = null,
  targetId = null,
  details = null,
  ipAddress = null
) => {
  try {
    await executeQuery(
      `INSERT INTO activity_logs (user_id, action_type, target_table, target_id, details, ip_address) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        actionType,
        targetTable,
        targetId,
        JSON.stringify(details),
        ipAddress,
      ]
    );
  } catch (error) {
    logger.error("Failed to log activity:", error.message);
  }
};

module.exports = {
  logActivity,
};
