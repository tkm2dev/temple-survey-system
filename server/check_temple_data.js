const { executeQuery } = require("./config/database");
require("dotenv").config();

(async () => {
  try {
    console.log("=== ตรวจสอบข้อมูลวัดเฉพาะ ===");

    // จำนวนวัดทั้งหมด
    const templesResult = await executeQuery(
      "SELECT COUNT(*) as total FROM survey_targets WHERE type_id = 1"
    );
    console.log("จำนวนวัดทั้งหมด:", templesResult[0].total);

    // วัดตามสถานะ
    const statusResult = await executeQuery(`
      SELECT status, COUNT(*) as count 
      FROM survey_targets 
      WHERE type_id = 1 
      GROUP BY status
    `);
    console.log("\n=== วัดตามสถานะ ===");
    statusResult.forEach((row) =>
      console.log(`${row.status}: ${row.count} รายการ`)
    );

    // ตัวอย่างข้อมูลวัด
    console.log("\n=== ตัวอย่างข้อมูลวัด ===");
    const sampleTemples = await executeQuery(`
      SELECT st.target_id, st.target_name, st.province, st.status, 
             td.monk_count, st.created_at
      FROM survey_targets st
      LEFT JOIN temple_details td ON st.target_id = td.target_id
      WHERE st.type_id = 1 
      ORDER BY st.created_at DESC
      LIMIT 5
    `);
    console.table(sampleTemples);
  } catch (error) {
    console.error("Error:", error);
  }
  process.exit();
})();
