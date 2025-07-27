const express = require("express");
const { executeQuery } = require("../config/database");
const { authenticateToken } = require("../middleware/auth");
const { logActivity } = require("../utils/auditLogger");
const logger = require("../utils/logger");

const router = express.Router();

// @route   GET /api/settings/public
// @desc    Get public system settings (available to all users)
// @access  Public
router.get("/public", async (req, res) => {
  try {
    console.log(`⚙️ [PUBLIC SETTINGS] Fetching public settings`);

    const settings = await executeQuery(
      `SELECT setting_key, setting_value, setting_type, description, category 
       FROM system_settings 
       WHERE is_public = TRUE 
       ORDER BY category, setting_key`
    );

    // Transform settings into key-value object
    const settingsObj = {};
    settings.forEach((setting) => {
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
          }
          break;
      }

      settingsObj[setting.setting_key] = {
        value,
        type: setting.setting_type,
        description: setting.description,
        category: setting.category,
      };
    });

    console.log(
      `✅ [PUBLIC SETTINGS] Retrieved ${settings.length} public settings`
    );

    res.json({
      success: true,
      data: {
        settings: settingsObj,
        count: settings.length,
      },
    });
  } catch (error) {
    console.error(`💥 [PUBLIC SETTINGS] Error: ${error.message}`);
    logger.error("Get public settings error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงการตั้งค่าระบบ",
    });
  }
});

// @route   GET /api/settings
// @desc    Get all system settings (Admin only)
// @access  Private/Admin
router.get("/", authenticateToken, async (req, res) => {
  try {
    console.log(
      `⚙️ [ADMIN SETTINGS] Admin ${req.user.username} fetching all settings`
    );

    // Check if user is admin
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "ไม่มีสิทธิ์ในการดูการตั้งค่าระบบ",
      });
    }

    const settings = await executeQuery(
      `SELECT * FROM system_settings ORDER BY category, setting_key`
    );

    // Transform settings into categorized object
    const categorizedSettings = {};
    settings.forEach((setting) => {
      if (!categorizedSettings[setting.category]) {
        categorizedSettings[setting.category] = {};
      }

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
          }
          break;
      }

      categorizedSettings[setting.category][setting.setting_key] = {
        id: setting.id,
        value,
        type: setting.setting_type,
        description: setting.description,
        is_public: setting.is_public,
        created_at: setting.created_at,
        updated_at: setting.updated_at,
      };
    });

    console.log(`✅ [ADMIN SETTINGS] Retrieved ${settings.length} settings`);

    res.json({
      success: true,
      data: {
        settings: categorizedSettings,
        count: settings.length,
      },
    });
  } catch (error) {
    console.error(`💥 [ADMIN SETTINGS] Error: ${error.message}`);
    logger.error("Get admin settings error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงการตั้งค่าระบบ",
    });
  }
});

// @route   PUT /api/settings/:settingKey
// @desc    Update system setting (Admin only)
// @access  Private/Admin
router.put("/:settingKey", authenticateToken, async (req, res) => {
  try {
    const { settingKey } = req.params;
    const { value } = req.body;

    console.log(
      `⚙️ [UPDATE SETTING] Admin ${req.user.username} updating ${settingKey}`
    );

    // Check if user is admin
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "ไม่มีสิทธิ์ในการแก้ไขการตั้งค่าระบบ",
      });
    }

    // Validation
    if (value === undefined || value === null) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุค่าที่ต้องการตั้ง",
      });
    }

    // Get current setting
    const currentSettings = await executeQuery(
      "SELECT * FROM system_settings WHERE setting_key = ?",
      [settingKey]
    );

    if (currentSettings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบการตั้งค่าที่ระบุ",
      });
    }

    const currentSetting = currentSettings[0];
    let newValue = value;

    // Validate and convert value based on type
    switch (currentSetting.setting_type) {
      case "boolean":
        if (typeof value !== "boolean") {
          return res.status(400).json({
            success: false,
            message: "ค่าที่ระบุต้องเป็น true หรือ false",
          });
        }
        newValue = value.toString();
        break;

      case "number":
        if (typeof value !== "number" || isNaN(value)) {
          return res.status(400).json({
            success: false,
            message: "ค่าที่ระบุต้องเป็นตัวเลข",
          });
        }
        newValue = value.toString();
        break;

      case "json":
        if (typeof value === "object") {
          newValue = JSON.stringify(value);
        } else {
          return res.status(400).json({
            success: false,
            message: "ค่าที่ระบุต้องเป็น JSON object",
          });
        }
        break;

      default: // string
        newValue = value.toString();
    }

    // Update setting
    await executeQuery(
      "UPDATE system_settings SET setting_value = ?, updated_at = NOW() WHERE setting_key = ?",
      [newValue, settingKey]
    );

    // Log activity
    await logActivity(
      req.user.user_id,
      "SYSTEM_SETTING_UPDATE",
      null,
      null,
      {
        setting_key: settingKey,
        old_value: currentSetting.setting_value,
        new_value: newValue,
        setting_type: currentSetting.setting_type,
      },
      req.ip
    );

    console.log(
      `✅ [UPDATE SETTING] Setting ${settingKey} updated successfully`
    );

    res.json({
      success: true,
      message: "อัปเดตการตั้งค่าสำเร็จ",
      data: {
        setting_key: settingKey,
        old_value: currentSetting.setting_value,
        new_value: newValue,
        updated_at: new Date(),
      },
    });
  } catch (error) {
    console.error(`💥 [UPDATE SETTING] Error: ${error.message}`);
    logger.error("Update setting error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัปเดตการตั้งค่า",
    });
  }
});

// @route   POST /api/settings/bulk-update
// @desc    Update multiple system settings (Admin only)
// @access  Private/Admin
router.post("/bulk-update", authenticateToken, async (req, res) => {
  try {
    const { settings } = req.body;

    console.log(
      `⚙️ [BULK UPDATE] Admin ${req.user.username} updating multiple settings`
    );

    // Check if user is admin
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "ไม่มีสิทธิ์ในการแก้ไขการตั้งค่าระบบ",
      });
    }

    // Validation
    if (!settings || typeof settings !== "object") {
      return res.status(400).json({
        success: false,
        message: "รูปแบบข้อมูลไม่ถูกต้อง",
      });
    }

    const updateResults = [];
    const errors = [];

    // Process each setting
    for (const [settingKey, value] of Object.entries(settings)) {
      try {
        // Get current setting
        const currentSettings = await executeQuery(
          "SELECT * FROM system_settings WHERE setting_key = ?",
          [settingKey]
        );

        if (currentSettings.length === 0) {
          errors.push({
            setting_key: settingKey,
            error: "ไม่พบการตั้งค่าที่ระบุ",
          });
          continue;
        }

        const currentSetting = currentSettings[0];
        let newValue = value;

        // Validate and convert value based on type
        switch (currentSetting.setting_type) {
          case "boolean":
            if (typeof value !== "boolean") {
              errors.push({
                setting_key: settingKey,
                error: "ค่าต้องเป็น boolean",
              });
              continue;
            }
            newValue = value.toString();
            break;

          case "number":
            if (typeof value !== "number" || isNaN(value)) {
              errors.push({
                setting_key: settingKey,
                error: "ค่าต้องเป็นตัวเลข",
              });
              continue;
            }
            newValue = value.toString();
            break;

          case "json":
            if (typeof value === "object") {
              newValue = JSON.stringify(value);
            } else {
              errors.push({
                setting_key: settingKey,
                error: "ค่าต้องเป็น JSON object",
              });
              continue;
            }
            break;

          default: // string
            newValue = value.toString();
        }

        // Update setting
        await executeQuery(
          "UPDATE system_settings SET setting_value = ?, updated_at = NOW() WHERE setting_key = ?",
          [newValue, settingKey]
        );

        updateResults.push({
          setting_key: settingKey,
          old_value: currentSetting.setting_value,
          new_value: newValue,
          success: true,
        });

        // Log individual activity
        await logActivity(
          req.user.user_id,
          "SYSTEM_SETTING_UPDATE",
          null,
          null,
          {
            setting_key: settingKey,
            old_value: currentSetting.setting_value,
            new_value: newValue,
            setting_type: currentSetting.setting_type,
            bulk_update: true,
          },
          req.ip
        );
      } catch (settingError) {
        console.error(`Error updating setting ${settingKey}:`, settingError);
        errors.push({
          setting_key: settingKey,
          error: settingError.message,
        });
      }
    }

    console.log(
      `✅ [BULK UPDATE] Updated ${updateResults.length} settings, ${errors.length} errors`
    );

    res.json({
      success: errors.length === 0,
      message:
        errors.length === 0
          ? "อัปเดตการตั้งค่าทั้งหมดสำเร็จ"
          : `อัปเดตสำเร็จ ${updateResults.length} รายการ, ไม่สำเร็จ ${errors.length} รายการ`,
      data: {
        updated: updateResults,
        errors: errors,
        total_processed: Object.keys(settings).length,
      },
    });
  } catch (error) {
    console.error(`💥 [BULK UPDATE] Error: ${error.message}`);
    logger.error("Bulk update settings error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัปเดตการตั้งค่า",
    });
  }
});

// @route   GET /api/settings/categories
// @desc    Get setting categories (Admin only)
// @access  Private/Admin
router.get("/categories", authenticateToken, async (req, res) => {
  try {
    console.log(
      `⚙️ [SETTING CATEGORIES] Admin ${req.user.username} fetching categories`
    );

    // Check if user is admin
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "ไม่มีสิทธิ์ในการดูการตั้งค่าระบบ",
      });
    }

    const categories = await executeQuery(
      `SELECT DISTINCT category, COUNT(*) as setting_count 
       FROM system_settings 
       GROUP BY category 
       ORDER BY category`
    );

    console.log(
      `✅ [SETTING CATEGORIES] Retrieved ${categories.length} categories`
    );

    res.json({
      success: true,
      data: {
        categories: categories,
        count: categories.length,
      },
    });
  } catch (error) {
    console.error(`💥 [SETTING CATEGORIES] Error: ${error.message}`);
    logger.error("Get setting categories error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงหมวดหมู่การตั้งค่า",
    });
  }
});

module.exports = router;
