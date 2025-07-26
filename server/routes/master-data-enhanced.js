const express = require("express");
const router = express.Router();
const multer = require("multer");
const xlsx = require("xlsx");
const path = require("path");

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".xlsx", ".xls", ".csv"];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only Excel and CSV files are allowed."));
    }
  },
});

// Mock database - Replace with actual database implementation
let masterDataDB = [
  {
    id: 1,
    key: "app.name",
    value: "Temple Survey System",
    category: "application",
    description: "Application name",
    data_type: "text",
    status: "active",
    created_at: new Date().toISOString(),
    created_by: "system",
    updated_at: new Date().toISOString(),
    updated_by: "system",
  },
  {
    id: 2,
    key: "app.version",
    value: "1.0.0",
    category: "application",
    description: "Application version",
    data_type: "text",
    status: "active",
    created_at: new Date().toISOString(),
    created_by: "system",
    updated_at: new Date().toISOString(),
    updated_by: "system",
  },
];

let nextId = 3;

// Get paginated master data with filters
router.get("/paginated", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "created_at",
      sortOrder = "desc",
      search = "",
      category = "",
      status = "",
      dateFrom = "",
      dateTo = "",
      dataType = "",
      createdBy = "",
      description = "",
    } = req.query;

    // Filter data
    let filteredData = [...masterDataDB];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredData = filteredData.filter(
        (item) =>
          item.key.toLowerCase().includes(searchLower) ||
          (item.value &&
            item.value.toString().toLowerCase().includes(searchLower)) ||
          (item.description &&
            item.description.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (category) {
      filteredData = filteredData.filter((item) => item.category === category);
    }

    // Status filter
    if (status) {
      filteredData = filteredData.filter((item) => item.status === status);
    }

    // Data type filter
    if (dataType) {
      filteredData = filteredData.filter((item) => item.data_type === dataType);
    }

    // Created by filter
    if (createdBy) {
      filteredData = filteredData.filter(
        (item) =>
          item.created_by &&
          item.created_by.toLowerCase().includes(createdBy.toLowerCase())
      );
    }

    // Description filter
    if (description) {
      filteredData = filteredData.filter(
        (item) =>
          item.description &&
          item.description.toLowerCase().includes(description.toLowerCase())
      );
    }

    // Date range filter
    if (dateFrom) {
      filteredData = filteredData.filter(
        (item) => new Date(item.created_at) >= new Date(dateFrom)
      );
    }
    if (dateTo) {
      filteredData = filteredData.filter(
        (item) => new Date(item.created_at) <= new Date(dateTo + " 23:59:59")
      );
    }

    // Sort data
    filteredData.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedData = filteredData.slice(offset, offset + parseInt(limit));

    res.json({
      success: true,
      data: paginatedData,
      total: filteredData.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(filteredData.length / parseInt(limit)),
    });
  } catch (error) {
    console.error("Error fetching paginated master data:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
      error: error.message,
    });
  }
});

// Get all master data (simple)
router.get("/", async (req, res) => {
  try {
    const { category, status } = req.query;
    let data = [...masterDataDB];

    if (category) {
      data = data.filter((item) => item.category === category);
    }
    if (status) {
      data = data.filter((item) => item.status === status);
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching master data:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
      error: error.message,
    });
  }
});

// Get master data by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const item = masterDataDB.find((item) => item.id === parseInt(id));

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูล",
      });
    }

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error("Error fetching master data by ID:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
      error: error.message,
    });
  }
});

// Create new master data
router.post("/", async (req, res) => {
  try {
    const {
      key,
      value,
      category,
      description,
      data_type = "text",
      status = "active",
    } = req.body;

    // Validate required fields
    if (!key || value === undefined) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ key และ value",
      });
    }

    // Check if key already exists
    const existingItem = masterDataDB.find((item) => item.key === key);
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: "Key นี้มีอยู่แล้วในระบบ",
      });
    }

    const newItem = {
      id: nextId++,
      key,
      value,
      category: category || "general",
      description: description || "",
      data_type,
      status,
      created_at: new Date().toISOString(),
      created_by: req.user?.username || "system",
      updated_at: new Date().toISOString(),
      updated_by: req.user?.username || "system",
    };

    masterDataDB.push(newItem);

    res.status(201).json({
      success: true,
      message: "เพิ่มข้อมูลเรียบร้อยแล้ว",
      data: newItem,
    });
  } catch (error) {
    console.error("Error creating master data:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการเพิ่มข้อมูล",
      error: error.message,
    });
  }
});

// Update master data
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { key, value, category, description, data_type, status } = req.body;

    const itemIndex = masterDataDB.findIndex(
      (item) => item.id === parseInt(id)
    );
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูล",
      });
    }

    // Check if key already exists (excluding current item)
    if (key && key !== masterDataDB[itemIndex].key) {
      const existingItem = masterDataDB.find(
        (item) => item.key === key && item.id !== parseInt(id)
      );
      if (existingItem) {
        return res.status(400).json({
          success: false,
          message: "Key นี้มีอยู่แล้วในระบบ",
        });
      }
    }

    // Update item
    const updatedItem = {
      ...masterDataDB[itemIndex],
      ...(key !== undefined && { key }),
      ...(value !== undefined && { value }),
      ...(category !== undefined && { category }),
      ...(description !== undefined && { description }),
      ...(data_type !== undefined && { data_type }),
      ...(status !== undefined && { status }),
      updated_at: new Date().toISOString(),
      updated_by: req.user?.username || "system",
    };

    masterDataDB[itemIndex] = updatedItem;

    res.json({
      success: true,
      message: "อัพเดทข้อมูลเรียบร้อยแล้ว",
      data: updatedItem,
    });
  } catch (error) {
    console.error("Error updating master data:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัพเดทข้อมูล",
      error: error.message,
    });
  }
});

// Delete master data
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const itemIndex = masterDataDB.findIndex(
      (item) => item.id === parseInt(id)
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูล",
      });
    }

    masterDataDB.splice(itemIndex, 1);

    res.json({
      success: true,
      message: "ลบข้อมูลเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Error deleting master data:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการลบข้อมูล",
      error: error.message,
    });
  }
});

// Get categories
router.get("/categories", async (req, res) => {
  try {
    const categories = [
      ...new Set(masterDataDB.map((item) => item.category)),
    ].map((cat) => ({
      id: cat,
      key: cat,
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
    }));

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงหมวดหมู่",
      error: error.message,
    });
  }
});

// Advanced search
router.post("/advanced-search", async (req, res) => {
  try {
    const { criteria } = req.body;
    let filteredData = [...masterDataDB];

    // Apply advanced search criteria
    if (criteria.keys && criteria.keys.length > 0) {
      filteredData = filteredData.filter((item) =>
        criteria.keys.some((key) => item.key.includes(key))
      );
    }

    if (criteria.values && criteria.values.length > 0) {
      filteredData = filteredData.filter((item) =>
        criteria.values.some(
          (value) => item.value && item.value.toString().includes(value)
        )
      );
    }

    if (criteria.categories && criteria.categories.length > 0) {
      filteredData = filteredData.filter((item) =>
        criteria.categories.includes(item.category)
      );
    }

    res.json({
      success: true,
      data: filteredData,
    });
  } catch (error) {
    console.error("Error in advanced search:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการค้นหา",
      error: error.message,
    });
  }
});

// Get filter options
router.get("/filter-options", async (req, res) => {
  try {
    const categories = [...new Set(masterDataDB.map((item) => item.category))];
    const dataTypes = [...new Set(masterDataDB.map((item) => item.data_type))];
    const statuses = [...new Set(masterDataDB.map((item) => item.status))];
    const creators = [...new Set(masterDataDB.map((item) => item.created_by))];

    res.json({
      success: true,
      data: {
        categories,
        dataTypes,
        statuses,
        creators,
      },
    });
  } catch (error) {
    console.error("Error fetching filter options:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงตัวเลือกการกรอง",
      error: error.message,
    });
  }
});

// Bulk status change
router.patch("/bulk/status-change", async (req, res) => {
  try {
    const { ids, status } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุรายการที่ต้องการเปลี่ยนสถานะ",
      });
    }

    if (!["active", "inactive", "draft"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "สถานะไม่ถูกต้อง",
      });
    }

    let updatedCount = 0;
    masterDataDB.forEach((item) => {
      if (ids.includes(item.id)) {
        item.status = status;
        item.updated_at = new Date().toISOString();
        item.updated_by = req.user?.username || "system";
        updatedCount++;
      }
    });

    res.json({
      success: true,
      message: `เปลี่ยนสถานะสำเร็จ ${updatedCount} รายการ`,
      updatedCount,
    });
  } catch (error) {
    console.error("Error bulk updating status:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการเปลี่ยนสถานะ",
      error: error.message,
    });
  }
});

// Bulk delete
router.delete("/bulk", async (req, res) => {
  try {
    const { masterDataIds } = req.body;

    if (
      !masterDataIds ||
      !Array.isArray(masterDataIds) ||
      masterDataIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุรายการที่ต้องการลบ",
      });
    }

    const originalLength = masterDataDB.length;
    masterDataDB = masterDataDB.filter(
      (item) => !masterDataIds.includes(item.id)
    );
    const deletedCount = originalLength - masterDataDB.length;

    res.json({
      success: true,
      message: `ลบข้อมูลสำเร็จ ${deletedCount} รายการ`,
      deletedCount,
    });
  } catch (error) {
    console.error("Error bulk deleting:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการลบข้อมูล",
      error: error.message,
    });
  }
});

// Bulk update
router.patch("/bulk/update", async (req, res) => {
  try {
    const { items, updateData } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุรายการที่ต้องการอัพเดท",
      });
    }

    let updatedCount = 0;
    masterDataDB.forEach((item) => {
      if (items.includes(item.id)) {
        Object.keys(updateData).forEach((key) => {
          if (updateData[key] !== undefined) {
            item[key] = updateData[key];
          }
        });
        item.updated_at = new Date().toISOString();
        item.updated_by = req.user?.username || "system";
        updatedCount++;
      }
    });

    res.json({
      success: true,
      message: `อัพเดทข้อมูลสำเร็จ ${updatedCount} รายการ`,
      updatedCount,
    });
  } catch (error) {
    console.error("Error bulk updating:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัพเดทข้อมูล",
      error: error.message,
    });
  }
});

// Bulk export
router.post("/bulk/export", async (req, res) => {
  try {
    const { ids, format = "excel" } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุรายการที่ต้องการส่งออก",
      });
    }

    const exportData = masterDataDB.filter((item) => ids.includes(item.id));

    if (format === "excel") {
      // Create Excel workbook
      const ws = xlsx.utils.json_to_sheet(exportData);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, "Master Data");

      // Generate buffer
      const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=master-data-export-${Date.now()}.xlsx`
      );
      res.send(buffer);
    } else {
      // JSON format
      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=master-data-export-${Date.now()}.json`
      );
      res.json(exportData);
    }
  } catch (error) {
    console.error("Error bulk exporting:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการส่งออกข้อมูล",
      error: error.message,
    });
  }
});

// Export all data
router.get("/export", async (req, res) => {
  try {
    const { format = "excel", ...filters } = req.query;

    // Apply filters if any
    let exportData = [...masterDataDB];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      exportData = exportData.filter(
        (item) =>
          item.key.toLowerCase().includes(searchLower) ||
          (item.value &&
            item.value.toString().toLowerCase().includes(searchLower))
      );
    }

    if (filters.category) {
      exportData = exportData.filter(
        (item) => item.category === filters.category
      );
    }

    if (filters.status) {
      exportData = exportData.filter((item) => item.status === filters.status);
    }

    if (format === "excel") {
      // Create Excel workbook
      const ws = xlsx.utils.json_to_sheet(exportData);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, "Master Data");

      // Generate buffer
      const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=master-data-full-export-${Date.now()}.xlsx`
      );
      res.send(buffer);
    } else {
      // JSON format
      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=master-data-full-export-${Date.now()}.json`
      );
      res.json(exportData);
    }
  } catch (error) {
    console.error("Error exporting all data:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการส่งออกข้อมูล",
      error: error.message,
    });
  }
});

// Batch process
router.post("/batch/:operation", async (req, res) => {
  try {
    const { operation } = req.params;
    const { data } = req.body;

    // Simulate batch processing
    const batchId = `batch_${Date.now()}`;

    // Return batch ID for status tracking
    res.json({
      success: true,
      message: "เริ่มกระบวนการ batch แล้ว",
      batchId,
      operation,
      estimatedTime: "2-5 นาที",
    });

    // Simulate background processing
    setTimeout(() => {
      console.log(
        `Batch operation ${operation} completed for batch ${batchId}`
      );
    }, 5000);
  } catch (error) {
    console.error("Error in batch processing:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการประมวลผล batch",
      error: error.message,
    });
  }
});

// Get batch status
router.get("/batch/status/:batchId", async (req, res) => {
  try {
    const { batchId } = req.params;

    // Simulate batch status check
    res.json({
      success: true,
      data: {
        batchId,
        status: "completed",
        progress: 100,
        message: "กระบวนการเสร็จสิ้นแล้ว",
        startTime: new Date(Date.now() - 300000).toISOString(),
        endTime: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error checking batch status:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการตรวจสอบสถานะ batch",
      error: error.message,
    });
  }
});

// Import data
router.post("/import", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "กรุณาเลือกไฟล์",
      });
    }

    // Read uploaded file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    let importedCount = 0;
    let errorCount = 0;
    const errors = [];

    jsonData.forEach((row, index) => {
      try {
        if (!row.key || row.value === undefined) {
          errors.push(`แถว ${index + 2}: ข้อมูล key หรือ value ไม่ครบถ้วน`);
          errorCount++;
          return;
        }

        // Check if key already exists
        const existingItem = masterDataDB.find((item) => item.key === row.key);
        if (existingItem) {
          errors.push(`แถว ${index + 2}: Key '${row.key}' มีอยู่แล้วในระบบ`);
          errorCount++;
          return;
        }

        const newItem = {
          id: nextId++,
          key: row.key,
          value: row.value,
          category: row.category || "imported",
          description: row.description || "",
          data_type: row.data_type || "text",
          status: row.status || "active",
          created_at: new Date().toISOString(),
          created_by: req.user?.username || "system",
          updated_at: new Date().toISOString(),
          updated_by: req.user?.username || "system",
        };

        masterDataDB.push(newItem);
        importedCount++;
      } catch (error) {
        errors.push(`แถว ${index + 2}: ${error.message}`);
        errorCount++;
      }
    });

    // Clean up uploaded file
    require("fs").unlinkSync(req.file.path);

    res.json({
      success: true,
      message: `นำเข้าข้อมูลเสร็จสิ้น`,
      importedCount,
      errorCount,
      totalRows: jsonData.length,
      errors: errors.slice(0, 10), // Show only first 10 errors
    });
  } catch (error) {
    console.error("Error importing data:", error);

    // Clean up uploaded file if exists
    if (req.file) {
      require("fs").unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการนำเข้าข้อมูล",
      error: error.message,
    });
  }
});

// Validate JSON value
router.post("/validate-json", async (req, res) => {
  try {
    const { value } = req.body;

    try {
      JSON.parse(value);
      res.json({
        success: true,
        message: "JSON ถูกต้อง",
        isValid: true,
      });
    } catch (error) {
      res.json({
        success: true,
        message: "JSON ไม่ถูกต้อง",
        isValid: false,
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Error validating JSON:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการตรวจสอบ JSON",
      error: error.message,
    });
  }
});

module.exports = router;
