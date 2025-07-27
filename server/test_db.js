const { executeQuery } = require("./config/database");
require("dotenv").config();

// แค่ทดสอบการเชื่อมต่อฐานข้อมูลพื้นฐาน
(async () => {
  try {
    console.log("=== ทดสอบเชื่อมต่อฐานข้อมูล ===");

    // ทดสอบ query ง่ายๆ ก่อน
    const result = await executeQuery("SELECT 1 as test");
    console.log("✅ Database connection OK:", result);

    // ทดสอบดูตารางที่มี
    const tables = await executeQuery("SHOW TABLES");
    console.log("✅ Tables in database:", tables);

    // ทดสอบ describe survey_targets
    const columns = await executeQuery("DESCRIBE survey_targets");
    console.log("✅ survey_targets columns:", columns);
  } catch (error) {
    console.error("❌ Error:", error);
  }
  process.exit();
})();
