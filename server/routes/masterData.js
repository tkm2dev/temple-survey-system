const express = require("express");
const { executeQuery } = require("../config/database");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const { logActivity } = require("../utils/auditLogger");
const logger = require("../utils/logger");

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// @route   GET /api/master-data/survey-types
// @desc    Get all survey target types
// @access  Private
router.get("/survey-types", async (req, res) => {
  try {
    const surveyTypes = await executeQuery(
      "SELECT type_id, type_name FROM survey_target_types ORDER BY type_name"
    );

    res.json({
      success: true,
      data: surveyTypes,
    });
  } catch (error) {
    logger.error("Get survey types error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลประเภทการสำรวจ",
    });
  }
});

// @route   GET /api/master-data/temple-types
// @desc    Get all temple types
// @access  Private
router.get("/temple-types", async (req, res) => {
  try {
    const templeTypes = await executeQuery(
      "SELECT id, name FROM master_temple_types ORDER BY name"
    );

    res.json({
      success: true,
      data: templeTypes,
    });
  } catch (error) {
    logger.error("Get temple types error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลประเภทวัด",
    });
  }
});

// @route   GET /api/master-data/denominations
// @desc    Get all denominations
// @access  Private
router.get("/denominations", async (req, res) => {
  try {
    const denominations = await executeQuery(
      "SELECT id, name FROM master_denominations ORDER BY name"
    );

    res.json({
      success: true,
      data: denominations,
    });
  } catch (error) {
    logger.error("Get denominations error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลสังกัด",
    });
  }
});

// @route   POST /api/master-data/survey-types
// @desc    Create new survey type
// @access  Private/Admin
router.post("/survey-types", authorizeRoles("Admin"), async (req, res) => {
  try {
    const { type_name } = req.body;

    if (!type_name) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกชื่อประเภทการสำรวจ",
      });
    }

    const result = await executeQuery(
      "INSERT INTO survey_target_types (type_name) VALUES (?)",
      [type_name]
    );

    // Log activity
    await logActivity(
      req.user.user_id,
      "CREATE",
      "survey_target_types",
      result.insertId,
      { type_name },
      req.ip
    );

    res.status(201).json({
      success: true,
      message: "เพิ่มประเภทการสำรวจสำเร็จ",
      data: {
        type_id: result.insertId,
        type_name,
      },
    });
  } catch (error) {
    logger.error("Create survey type error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการเพิ่มประเภทการสำรวจ",
    });
  }
});

// @route   POST /api/master-data/temple-types
// @desc    Create new temple type
// @access  Private/Admin
router.post("/temple-types", authorizeRoles("Admin"), async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกชื่อประเภทวัด",
      });
    }

    const result = await executeQuery(
      "INSERT INTO master_temple_types (name) VALUES (?)",
      [name]
    );

    // Log activity
    await logActivity(
      req.user.user_id,
      "CREATE",
      "master_temple_types",
      result.insertId,
      { name },
      req.ip
    );

    res.status(201).json({
      success: true,
      message: "เพิ่มประเภทวัดสำเร็จ",
      data: {
        id: result.insertId,
        name,
      },
    });
  } catch (error) {
    logger.error("Create temple type error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการเพิ่มประเภทวัด",
    });
  }
});

// @route   POST /api/master-data/denominations
// @desc    Create new denomination
// @access  Private/Admin
router.post("/denominations", authorizeRoles("Admin"), async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกชื่อสังกัด",
      });
    }

    const result = await executeQuery(
      "INSERT INTO master_denominations (name) VALUES (?)",
      [name]
    );

    // Log activity
    await logActivity(
      req.user.user_id,
      "CREATE",
      "master_denominations",
      result.insertId,
      { name },
      req.ip
    );

    res.status(201).json({
      success: true,
      message: "เพิ่มสังกัดสำเร็จ",
      data: {
        id: result.insertId,
        name,
      },
    });
  } catch (error) {
    logger.error("Create denomination error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการเพิ่มสังกัด",
    });
  }
});

// @route   PUT /api/master-data/survey-types/:id
// @desc    Update survey type
// @access  Private/Admin
router.put("/survey-types/:id", authorizeRoles("Admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { type_name } = req.body;

    if (!type_name) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกชื่อประเภทการสำรวจ",
      });
    }

    // Get current data for audit log
    const current = await executeQuery(
      "SELECT * FROM survey_target_types WHERE type_id = ?",
      [id]
    );

    if (current.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบประเภทการสำรวจที่ระบุ",
      });
    }

    // Update
    await executeQuery(
      "UPDATE survey_target_types SET type_name = ? WHERE type_id = ?",
      [type_name, id]
    );

    // Log activity
    await logActivity(
      req.user.user_id,
      "UPDATE",
      "survey_target_types",
      id,
      { old_data: current[0], new_data: { type_name } },
      req.ip
    );

    res.json({
      success: true,
      message: "อัปเดตประเภทการสำรวจสำเร็จ",
    });
  } catch (error) {
    logger.error("Update survey type error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัปเดตประเภทการสำรวจ",
    });
  }
});

// @route   DELETE /api/master-data/survey-types/:id
// @desc    Delete survey type
// @access  Private/Admin
router.delete(
  "/survey-types/:id",
  authorizeRoles("Admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check if type is being used
      const usage = await executeQuery(
        "SELECT COUNT(*) as count FROM survey_targets WHERE type_id = ?",
        [id]
      );

      if (usage[0].count > 0) {
        return res.status(400).json({
          success: false,
          message: "ไม่สามารถลบประเภทการสำรวจนี้ได้ เนื่องจากมีการใช้งานอยู่",
        });
      }

      // Get current data for audit log
      const current = await executeQuery(
        "SELECT * FROM survey_target_types WHERE type_id = ?",
        [id]
      );

      if (current.length === 0) {
        return res.status(404).json({
          success: false,
          message: "ไม่พบประเภทการสำรวจที่ระบุ",
        });
      }

      // Delete
      await executeQuery("DELETE FROM survey_target_types WHERE type_id = ?", [
        id,
      ]);

      // Log activity
      await logActivity(
        req.user.user_id,
        "DELETE",
        "survey_target_types",
        id,
        { deleted_data: current[0] },
        req.ip
      );

      res.json({
        success: true,
        message: "ลบประเภทการสำรวจสำเร็จ",
      });
    } catch (error) {
      logger.error("Delete survey type error:", error.message);
      res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการลบประเภทการสำรวจ",
      });
    }
  }
);

module.exports = router;
