const { executeQuery } = require("../config/database");
const logger = require("./logger");

/**
 * ส่งการแจ้งเตือนให้ผู้ใช้
 * @param {number} userId - รหัสผู้ใช้ที่จะได้รับการแจ้งเตือน
 * @param {string} title - หัวข้อการแจ้งเตือน
 * @param {string} message - ข้อความแจ้งเตือน
 * @param {string} type - ประเภทการแจ้งเตือน (info, success, warning, error)
 * @param {number|null} relatedTargetId - รหัสเป้าหมายที่เกี่ยวข้อง (ถ้ามี)
 * @returns {Promise<boolean>} - ส่งสำเร็จหรือไม่
 */
async function sendNotification(
  userId,
  title,
  message,
  type = "info",
  relatedTargetId = null
) {
  try {
    await executeQuery(
      `INSERT INTO notifications (user_id, title, message, type, related_target_id)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, title, message, type, relatedTargetId]
    );

    logger.info(`📬 [NOTIFICATION] Sent to user ${userId}: ${title}`);
    return true;
  } catch (error) {
    logger.error(
      `❌ [NOTIFICATION ERROR] Failed to send to user ${userId}:`,
      error.message
    );
    return false;
  }
}

/**
 * ส่งการแจ้งเตือนให้ Admin ทุกคนเมื่อมีผู้ใช้ใหม่ลงทะเบียน
 * @param {Object} newUser - ข้อมูลผู้ใช้ใหม่
 * @returns {Promise<boolean>} - ส่งสำเร็จหรือไม่
 */
async function notifyAdminsNewRegistration(newUser) {
  try {
    // ดึงรายชื่อ Admin ทั้งหมด
    const admins = await executeQuery(
      `SELECT user_id FROM users WHERE role = 'Admin' AND is_active = TRUE`
    );

    if (admins.length === 0) {
      logger.warn(
        `⚠️ [NOTIFICATION] No active admins found for new registration notification`
      );
      return false;
    }

    const title = "มีผู้ใช้งานใหม่ลงทะเบียน";
    const message = `ผู้ใช้งานใหม่ "${newUser.first_name} ${
      newUser.last_name
    }" (${
      newUser.username
    }) ได้ลงทะเบียนเข้าใช้งานระบบ กรุณาพิจารณาอนุมัติ\n\nข้อมูลเพิ่มเติม:\n- อีเมล: ${
      newUser.email
    }\n- หน่วยงาน: ${newUser.department || "ไม่ระบุ"}\n- ตำแหน่ง: ${
      newUser.position || "ไม่ระบุ"
    }`;

    // ส่งการแจ้งเตือนให้ Admin ทุกคน
    const promises = admins.map((admin) =>
      sendNotification(admin.user_id, title, message, "warning", null)
    );

    await Promise.all(promises);

    logger.info(
      `✅ [NOTIFICATION] Notified ${admins.length} admins about new registration: ${newUser.username}`
    );
    return true;
  } catch (error) {
    logger.error(
      `❌ [NOTIFICATION ERROR] Failed to notify admins about new registration:`,
      error.message
    );
    return false;
  }
}

/**
 * ส่งการแจ้งเตือนให้ผู้ใช้เมื่อได้รับการอนุมัติ
 * @param {Object} user - ข้อมูลผู้ใช้
 * @param {Object} approver - ข้อมูลผู้อนุมัติ
 * @returns {Promise<boolean>} - ส่งสำเร็จหรือไม่
 */
async function notifyUserApproval(user, approver) {
  try {
    const title = "บัญชีของคุณได้รับการอนุมัติ ✅";
    const message = `ยินดีต้อนรับเข้าสู่ระบบสำรวจข้อมูลวัด!\n\nบัญชีของคุณได้รับการอนุมัติโดย ${approver.first_name} ${approver.last_name} เรียบร้อยแล้ว\n\nตอนนี้คุณสามารถเข้าสู่ระบบและใช้งานได้ทันที`;

    await sendNotification(user.user_id, title, message, "success", null);

    logger.info(
      `✅ [NOTIFICATION] Notified user ${user.username} about approval`
    );
    return true;
  } catch (error) {
    logger.error(
      `❌ [NOTIFICATION ERROR] Failed to notify user about approval:`,
      error.message
    );
    return false;
  }
}

/**
 * ส่งการแจ้งเตือนให้ผู้ใช้เมื่อถูกปฏิเสธ
 * @param {Object} user - ข้อมูลผู้ใช้
 * @param {Object} approver - ข้อมูลผู้อนุมัติ
 * @param {string} reason - เหตุผลในการปฏิเสธ
 * @returns {Promise<boolean>} - ส่งสำเร็จหรือไม่
 */
async function notifyUserRejection(user, approver, reason = null) {
  try {
    const title = "การลงทะเบียนถูกปฏิเสธ ❌";
    let message = `เสียใจด้วย บัญชีของคุณถูกปฏิเสธโดย ${approver.first_name} ${approver.last_name}`;

    if (reason && reason.trim()) {
      message += `\n\nเหตุผล: ${reason}`;
    }

    message += `\n\nหากต้องการสอบถามเพิ่มเติม กรุณาติดต่อผู้ดูแลระบบ`;

    await sendNotification(user.user_id, title, message, "error", null);

    logger.info(
      `✅ [NOTIFICATION] Notified user ${user.username} about rejection`
    );
    return true;
  } catch (error) {
    logger.error(
      `❌ [NOTIFICATION ERROR] Failed to notify user about rejection:`,
      error.message
    );
    return false;
  }
}

/**
 * ส่งการแจ้งเตือนเกี่ยวกับการเปลี่ยนแปลงสถานะบัญชี
 * @param {number} userId - รหัสผู้ใช้
 * @param {string} statusChange - การเปลี่ยนแปลงสถานะ
 * @param {string} message - ข้อความแจ้งเตือน
 * @param {string} type - ประเภทการแจ้งเตือน
 * @returns {Promise<boolean>} - ส่งสำเร็จหรือไม่
 */
async function notifyStatusChange(
  userId,
  statusChange,
  message,
  type = "info"
) {
  try {
    const title = `การเปลี่ยนแปลงสถานะบัญชี: ${statusChange}`;

    await sendNotification(userId, title, message, type, null);

    logger.info(
      `✅ [NOTIFICATION] Notified user ${userId} about status change: ${statusChange}`
    );
    return true;
  } catch (error) {
    logger.error(
      `❌ [NOTIFICATION ERROR] Failed to notify user about status change:`,
      error.message
    );
    return false;
  }
}

/**
 * ดึงจำนวนการแจ้งเตือนที่ยังไม่ได้อ่านของผู้ใช้
 * @param {number} userId - รหัสผู้ใช้
 * @returns {Promise<number>} - จำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน
 */
async function getUnreadNotificationCount(userId) {
  try {
    const result = await executeQuery(
      `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE`,
      [userId]
    );

    return result[0].count;
  } catch (error) {
    logger.error(
      `❌ [NOTIFICATION ERROR] Failed to get unread count for user ${userId}:`,
      error.message
    );
    return 0;
  }
}

/**
 * ส่งการแจ้งเตือนเกี่ยวกับการสำรวจ
 * @param {number} userId - รหัสผู้ใช้
 * @param {string} title - หัวข้อ
 * @param {string} message - ข้อความ
 * @param {string} type - ประเภท
 * @param {number} targetId - รหัสเป้าหมายการสำรวจ
 * @returns {Promise<boolean>} - ส่งสำเร็จหรือไม่
 */
async function notifySurveyUpdate(
  userId,
  title,
  message,
  type = "info",
  targetId = null
) {
  try {
    await sendNotification(userId, title, message, type, targetId);

    logger.info(
      `✅ [NOTIFICATION] Sent survey notification to user ${userId}: ${title}`
    );
    return true;
  } catch (error) {
    logger.error(
      `❌ [NOTIFICATION ERROR] Failed to send survey notification:`,
      error.message
    );
    return false;
  }
}

module.exports = {
  sendNotification,
  notifyAdminsNewRegistration,
  notifyUserApproval,
  notifyUserRejection,
  notifyStatusChange,
  getUnreadNotificationCount,
  notifySurveyUpdate,
};
