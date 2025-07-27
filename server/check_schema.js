const { executeQuery } = require("./config/database");

(async () => {
  try {
    console.log("=== ตรวจสอบโครงสร้างตาราง activity_logs ===");
    const columns = await executeQuery("DESCRIBE activity_logs");
    console.table(columns);

    console.log("\n=== ตัวอย่างข้อมูลในตาราง ===");
    const sample = await executeQuery("SELECT * FROM activity_logs LIMIT 3");
    console.table(sample);
  } catch (error) {
    console.error("Error:", error);
  }
  process.exit();
})();
