const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { executeQuery } = require("../config/database");
const { authenticateToken } = require("../middleware/auth");
const { logActivity } = require("../utils/auditLogger");
const logger = require("../utils/logger");

const router = express.Router();

// Apply authentication to all upload routes
router.use(authenticateToken);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const targetId = req.body.target_id || "temp";
    const targetDir = path.join(uploadsDir, targetId.toString());

    // Create target-specific directory
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + extension);
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allow images and documents
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        "ประเภทไฟล์ไม่ถูกต้อง อนุญาตเฉพาะ: jpeg, jpg, png, gif, pdf, doc, docx, xls, xlsx"
      )
    );
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
  fileFilter: fileFilter,
});

// @route   POST /api/upload/files
// @desc    Upload files for survey
// @access  Private
router.post("/files", upload.array("files", 10), async (req, res) => {
  try {
    const { target_id, description } = req.body;

    if (!target_id) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ target_id",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "กรุณาเลือกไฟล์ที่ต้องการอัปโหลด",
      });
    }

    // Check if survey target exists
    const surveys = await executeQuery(
      "SELECT target_id FROM survey_targets WHERE target_id = ?",
      [target_id]
    );

    if (surveys.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูลการสำรวจที่ระบุ",
      });
    }

    const uploadedFiles = [];

    // Process each uploaded file
    for (const file of req.files) {
      try {
        // Insert file record into database
        const result = await executeQuery(
          `
          INSERT INTO attachments (target_id, uploader_user_id, file_name, file_path, file_type, description)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
          [
            target_id,
            req.user.user_id,
            file.originalname,
            file.path,
            file.mimetype,
            description || null,
          ]
        );

        uploadedFiles.push({
          attachment_id: result.insertId,
          file_name: file.originalname,
          file_size: file.size,
          file_type: file.mimetype,
        });

        // Log activity
        await logActivity(
          req.user.user_id,
          "CREATE",
          "attachments",
          result.insertId,
          {
            target_id,
            file_name: file.originalname,
            file_size: file.size,
          },
          req.ip
        );
      } catch (error) {
        logger.error("File database insert error:", error.message);
        // Clean up physical file if database insert fails
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    res.status(201).json({
      success: true,
      message: `อัปโหลดไฟล์สำเร็จ ${uploadedFiles.length} ไฟล์`,
      data: {
        uploaded_files: uploadedFiles,
      },
    });
  } catch (error) {
    logger.error("File upload error:", error.message);

    // Clean up uploaded files if error occurs
    if (req.files) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัปโหลดไฟล์",
    });
  }
});

// @route   GET /api/upload/files/:targetId
// @desc    Get all files for a survey target
// @access  Private
router.get("/files/:targetId", async (req, res) => {
  try {
    const { targetId } = req.params;

    const attachments = await executeQuery(
      `
      SELECT 
        a.*,
        CONCAT(u.first_name, ' ', u.last_name) as uploader_name
      FROM attachments a
      LEFT JOIN users u ON a.uploader_user_id = u.user_id
      WHERE a.target_id = ?
      ORDER BY a.uploaded_at DESC
    `,
      [targetId]
    );

    res.json({
      success: true,
      data: attachments,
    });
  } catch (error) {
    logger.error("Get files error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลไฟล์",
    });
  }
});

// @route   GET /api/upload/files/:targetId/:attachmentId
// @desc    Download/view file
// @access  Private
router.get("/files/:targetId/:attachmentId", async (req, res) => {
  try {
    const { targetId, attachmentId } = req.params;

    // Get file info from database
    const attachments = await executeQuery(
      "SELECT * FROM attachments WHERE attachment_id = ? AND target_id = ?",
      [attachmentId, targetId]
    );

    if (attachments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบไฟล์ที่ระบุ",
      });
    }

    const attachment = attachments[0];
    const filePath = attachment.file_path;

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "ไฟล์ไม่พบในระบบ",
      });
    }

    // Set appropriate headers
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${attachment.file_name}"`
    );
    res.setHeader("Content-Type", attachment.file_type);

    // Stream file to response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    logger.error("File download error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์",
    });
  }
});

// @route   DELETE /api/upload/files/:attachmentId
// @desc    Delete attachment file
// @access  Private
router.delete("/files/:attachmentId", async (req, res) => {
  try {
    const { attachmentId } = req.params;

    // Get file info from database
    const attachments = await executeQuery(
      "SELECT * FROM attachments WHERE attachment_id = ?",
      [attachmentId]
    );

    if (attachments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบไฟล์ที่ระบุ",
      });
    }

    const attachment = attachments[0];

    // Check permission (only uploader or admin can delete)
    if (
      req.user.role !== "Admin" &&
      attachment.uploader_user_id !== req.user.user_id
    ) {
      return res.status(403).json({
        success: false,
        message: "ไม่มีสิทธิ์ลบไฟล์นี้",
      });
    }

    // Delete from database
    await executeQuery("DELETE FROM attachments WHERE attachment_id = ?", [
      attachmentId,
    ]);

    // Delete physical file
    if (fs.existsSync(attachment.file_path)) {
      fs.unlinkSync(attachment.file_path);
    }

    // Log activity
    await logActivity(
      req.user.user_id,
      "DELETE",
      "attachments",
      attachmentId,
      {
        deleted_file: {
          file_name: attachment.file_name,
          target_id: attachment.target_id,
        },
      },
      req.ip
    );

    res.json({
      success: true,
      message: "ลบไฟล์สำเร็จ",
    });
  } catch (error) {
    logger.error("File delete error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการลบไฟล์",
    });
  }
});

module.exports = router;
