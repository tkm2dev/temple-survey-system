const express = require("express");
const { executeQuery } = require("../config/database");
const { authenticateToken } = require("../middleware/auth");
const { logActivity } = require("../utils/auditLogger");
const logger = require("../utils/logger");

const router = express.Router();

// @route   GET /api/user-settings
// @desc    Get user's personal settings
// @access  Private
router.get("/", authenticateToken, async (req, res) => {
  try {
    console.log(
      `👤 [USER SETTINGS] User ${req.user.username} fetching personal settings`
    );

    const userSettings = await executeQuery(
      `SELECT setting_key, setting_value, setting_type, updated_at 
       FROM user_settings 
       WHERE user_id = ?
       ORDER BY setting_key`,
      [req.user.user_id]
    );

    // Transform settings into key-value object
    const settingsObj = {};
    userSettings.forEach((setting) => {
      let value = setting.setting_value;

      // Convert based on type
      switch (setting.setting_type) {
        case "boolean":
          value = value === "true";
          break;
        case "number":
          value = parseFloat(value);
          break;
        case "json":
          try {
            value = JSON.parse(value);
          } catch (e) {
            console.warn(
              `Failed to parse JSON setting ${setting.setting_key}:`,
              e
            );
            value = null;
          }
          break;
      }

      settingsObj[setting.setting_key] = value;
    });

    console.log(
      `✅ [USER SETTINGS] Retrieved ${userSettings.length} user settings`
    );

    res.json({
      success: true,
      data: {
        settings: settingsObj,
        count: userSettings.length,
      },
    });
  } catch (error) {
    console.error(`💥 [USER SETTINGS] Error: ${error.message}`);
    logger.error("Get user settings error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงการตั้งค่าส่วนบุคคล",
    });
  }
});

// @route   PUT /api/user-settings
// @desc    Update user's personal settings (bulk update)
// @access  Private
router.put("/", authenticateToken, async (req, res) => {
  try {
    const { settings } = req.body;

    console.log(
      `👤 [UPDATE USER SETTINGS] User ${req.user.username} updating personal settings`
    );

    // Validation
    if (!settings || typeof settings !== "object") {
      return res.status(400).json({
        success: false,
        message: "รูปแบบข้อมูลไม่ถูกต้อง",
      });
    }

    const updateResults = [];
    const errors = [];

    // Define allowed settings and their types
    const allowedSettings = {
      theme: { type: "string", values: ["light", "dark", "auto"] },
      fontSize: {
        type: "string",
        values: ["small", "medium", "large", "extra-large"],
      },
      fontFamily: {
        type: "string",
        values: ["sarabun", "kanit", "prompt", "mali", "mitr", "system"],
      },
      language: { type: "string", values: ["th", "en"] },
      compactMode: { type: "boolean" },
      animations: { type: "boolean" },
      emailNotifications: { type: "boolean" },
      pushNotifications: { type: "boolean" },
      soundEnabled: { type: "boolean" },
      dataRetention: {
        type: "string",
        values: ["30", "90", "180", "365", "forever"],
      },
      analytics: { type: "boolean" },
      notifications: { type: "json" },
      twoFactorEnabled: { type: "boolean" },
      loginNotifications: { type: "boolean" },
      sessionTimeout: {
        type: "string",
        values: ["15", "30", "60", "180", "480"],
      },
      timezone: { type: "string" },
      dateFormat: {
        type: "string",
        values: ["dd/mm/yyyy", "mm/dd/yyyy", "yyyy-mm-dd"],
      },
      timeFormat: { type: "string", values: ["12", "24"] },
      keyboardEnabled: { type: "boolean" },
      itemsPerPage: { type: "string", values: ["10", "25", "50", "100"] },
      enableCaching: { type: "boolean" },
      preloadData: { type: "boolean" },
      enableLazyLoading: { type: "boolean" },
      autoBackup: { type: "boolean" },
      backupFrequency: {
        type: "string",
        values: ["daily", "weekly", "monthly"],
      },
    };

    // Process each setting
    for (const [settingKey, value] of Object.entries(settings)) {
      try {
        // Check if setting is allowed
        const allowedSetting = allowedSettings[settingKey];
        if (!allowedSetting) {
          errors.push({
            setting_key: settingKey,
            error: "การตั้งค่านี้ไม่ได้รับอนุญาต",
          });
          continue;
        }

        // Validate value type and range
        let newValue = value;
        let stringValue = value;

        switch (allowedSetting.type) {
          case "boolean":
            if (typeof value !== "boolean") {
              errors.push({
                setting_key: settingKey,
                error: "ค่าต้องเป็น true หรือ false",
              });
              continue;
            }
            stringValue = value.toString();
            break;

          case "number":
            if (typeof value !== "number" || isNaN(value)) {
              errors.push({
                setting_key: settingKey,
                error: "ค่าต้องเป็นตัวเลข",
              });
              continue;
            }
            stringValue = value.toString();
            break;

          case "string":
            stringValue = value.toString();
            // Check allowed values if specified
            if (
              allowedSetting.values &&
              !allowedSetting.values.includes(stringValue)
            ) {
              errors.push({
                setting_key: settingKey,
                error: `ค่าที่อนุญาต: ${allowedSetting.values.join(", ")}`,
              });
              continue;
            }
            break;

          case "json":
            if (typeof value === "object") {
              stringValue = JSON.stringify(value);
            } else {
              errors.push({
                setting_key: settingKey,
                error: "ค่าต้องเป็น JSON object",
              });
              continue;
            }
            break;
        }

        // Insert or update setting
        await executeQuery(
          `INSERT INTO user_settings (user_id, setting_key, setting_value, setting_type, updated_at) 
           VALUES (?, ?, ?, ?, NOW()) 
           ON DUPLICATE KEY UPDATE 
           setting_value = VALUES(setting_value), 
           updated_at = NOW()`,
          [req.user.user_id, settingKey, stringValue, allowedSetting.type]
        );

        updateResults.push({
          setting_key: settingKey,
          new_value: newValue,
          success: true,
        });
      } catch (settingError) {
        console.error(`Error updating setting ${settingKey}:`, settingError);
        errors.push({
          setting_key: settingKey,
          error: settingError.message,
        });
      }
    }

    // Log activity
    if (updateResults.length > 0) {
      await logActivity(
        req.user.user_id,
        "USER_SETTINGS_UPDATE",
        null,
        null,
        {
          updated_settings: updateResults.map((r) => r.setting_key),
          total_updated: updateResults.length,
        },
        req.ip
      );
    }

    console.log(
      `✅ [UPDATE USER SETTINGS] Updated ${updateResults.length} settings, ${errors.length} errors`
    );

    res.json({
      success: errors.length === 0,
      message:
        errors.length === 0
          ? "อัปเดตการตั้งค่าส่วนบุคคลสำเร็จ"
          : `อัปเดตสำเร็จ ${updateResults.length} รายการ, ไม่สำเร็จ ${errors.length} รายการ`,
      data: {
        updated: updateResults,
        errors: errors,
        total_processed: Object.keys(settings).length,
      },
    });
  } catch (error) {
    console.error(`💥 [UPDATE USER SETTINGS] Error: ${error.message}`);
    logger.error("Update user settings error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัปเดตการตั้งค่าส่วนบุคคล",
    });
  }
});

// @route   GET /api/user-settings/profile
// @desc    Get user profile information
// @access  Private
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    console.log(`👤 [USER PROFILE] User ${req.user.username} fetching profile`);

    const userProfile = await executeQuery(
      `SELECT user_id, username, email, first_name, last_name, role, phone, 
              created_at, updated_at, last_login, identity_verified
       FROM users 
       WHERE user_id = ?`,
      [req.user.user_id]
    );

    if (userProfile.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูลผู้ใช้",
      });
    }

    const profile = userProfile[0];

    // Combine first_name and last_name into full_name for frontend compatibility
    profile.full_name = `${profile.first_name || ""} ${
      profile.last_name || ""
    }`.trim();

    // Remove sensitive information
    delete profile.password_hash;
    console.log(
      `✅ [USER PROFILE] Retrieved profile for user ${req.user.username}`
    );

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error(`💥 [USER PROFILE] Error: ${error.message}`);
    logger.error("Get user profile error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์",
    });
  }
});

// @route   PUT /api/user-settings/profile
// @desc    Update user profile information
// @access  Private
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { full_name, email, phone } = req.body;

    console.log(
      `👤 [UPDATE PROFILE] User ${req.user.username} updating profile`
    );

    // Basic validation
    if (!full_name || full_name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุชื่อ-นามสกุล",
      });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "รูปแบบอีเมลไม่ถูกต้อง",
      });
    }

    // Check if email is already used by another user
    const existingUser = await executeQuery(
      "SELECT user_id FROM users WHERE email = ? AND user_id != ?",
      [email, req.user.user_id]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: "อีเมลนี้ถูกใช้งานแล้ว",
      });
    }

    // Split full_name into first_name and last_name
    const nameParts = full_name.trim().split(" ");
    const first_name = nameParts[0] || "";
    const last_name = nameParts.slice(1).join(" ") || "";

    // Update profile
    await executeQuery(
      `UPDATE users 
       SET first_name = ?, last_name = ?, email = ?, phone = ?, updated_at = NOW() 
       WHERE user_id = ?`,
      [first_name, last_name, email, phone || null, req.user.user_id]
    );

    // Log activity
    await logActivity(
      req.user.user_id,
      "PROFILE_UPDATE",
      null,
      null,
      {
        updated_fields: [
          "first_name",
          "last_name",
          "email",
          phone ? "phone" : null,
        ].filter(Boolean),
      },
      req.ip
    );

    console.log(
      `✅ [UPDATE PROFILE] Profile updated for user ${req.user.username}`
    );

    res.json({
      success: true,
      message: "อัปเดตโปรไฟล์สำเร็จ",
      data: {
        full_name,
        email,
        phone,
        updated_at: new Date(),
      },
    });
  } catch (error) {
    console.error(`💥 [UPDATE PROFILE] Error: ${error.message}`);
    logger.error("Update user profile error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์",
    });
  }
});

// @route   POST /api/user-settings/export
// @desc    Export user data
// @access  Private
router.post("/export", authenticateToken, async (req, res) => {
  try {
    console.log(`👤 [EXPORT DATA] User ${req.user.username} exporting data`);

    // Get user profile
    const userProfile = await executeQuery(
      `SELECT user_id, username, email, full_name, role, phone, 
              created_at, updated_at, last_login_at
       FROM users 
       WHERE user_id = ?`,
      [req.user.user_id]
    );

    // Get user settings
    const userSettings = await executeQuery(
      `SELECT setting_key, setting_value, setting_type, updated_at 
       FROM user_settings 
       WHERE user_id = ?`,
      [req.user.user_id]
    );

    // Transform settings
    const settingsObj = {};
    userSettings.forEach((setting) => {
      let value = setting.setting_value;
      switch (setting.setting_type) {
        case "boolean":
          value = value === "true";
          break;
        case "number":
          value = parseFloat(value);
          break;
        case "json":
          try {
            value = JSON.parse(value);
          } catch (e) {
            value = setting.setting_value;
          }
          break;
      }
      settingsObj[setting.setting_key] = value;
    });

    const exportData = {
      profile: userProfile[0] || {},
      settings: settingsObj,
      exportDate: new Date().toISOString(),
      version: "1.1.0",
    };

    // Log activity
    await logActivity(
      req.user.user_id,
      "DATA_EXPORT",
      null,
      null,
      {
        export_type: "user_data",
        data_size: JSON.stringify(exportData).length,
      },
      req.ip
    );

    console.log(`✅ [EXPORT DATA] Data exported for user ${req.user.username}`);

    res.json({
      success: true,
      message: "ส่งออกข้อมูลสำเร็จ",
      data: exportData,
    });
  } catch (error) {
    console.error(`💥 [EXPORT DATA] Error: ${error.message}`);
    logger.error("Export user data error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการส่งออกข้อมูล",
    });
  }
});

module.exports = router;
