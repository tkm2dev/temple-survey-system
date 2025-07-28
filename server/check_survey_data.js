const { executeQuery } = require("./config/database");
require("dotenv").config();

(async () => {
  try {
    console.log("=== ตรวจสอบข้อมูลการสำรวจ ===");
    const surveys = await executeQuery(
      "SELECT COUNT(*) as total FROM survey_targets"
    );
    console.log("จำนวนการสำรวจ:", surveys[0].total);

    const types = await executeQuery("SELECT * FROM survey_target_types");
    console.log("\n=== ประเภทการสำรวจ ===");
    types.forEach((type) =>
      console.log(`ID: ${type.type_id}, ชื่อ: ${type.type_name}`)
    );

    console.log("\n=== ตัวอย่างข้อมูลการสำรวจ ===");
    const sampleSurveys = await executeQuery(
      "SELECT * FROM survey_targets LIMIT 3"
    );
    console.table(sampleSurveys);
  } catch (error) {
    console.error("Error:", error);
  }
  process.exit();
})();
