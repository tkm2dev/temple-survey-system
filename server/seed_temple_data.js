const { executeQuery } = require("./config/database");
require("dotenv").config();

// ข้อมูลตัวอย่างวัด
const sampleTemples = [
  {
    target_name: "วัดพระแก้ว",
    address: "2 ถนนณ วรรณพงศ์ แขวงพระบรมมหาราชวัง",
    subdistrict: "พระนคร",
    district: "พระนคร",
    province: "กรุงเทพมหานคร",
    postal_code: "10200",
    gps_latitude: 13.751811,
    gps_longitude: 100.491589,
    status: "Approved",
    created_by: 4, // user tophatori
  },
  {
    target_name: "วัดพระศรีรัตนศาสดาราม",
    address: "ถนนณ วรรณพงศ์ แขวงพระบรมมหาราชวang",
    subdistrict: "พระนคร",
    district: "พระนคร",
    province: "กรุงเทพมหานคร",
    postal_code: "10200",
    gps_latitude: 13.7508,
    gps_longitude: 100.4914,
    status: "Pending Review",
    created_by: 4,
  },
  {
    target_name: "วัดอรุณราชวรารามราชวรมหาวิหาร",
    address: "34 ถนนอรุณอมรินทร์ แขวงวัดอรุณ",
    subdistrict: "บางกอกใหญ่",
    district: "บางกอกใหญ่",
    province: "กรุงเทพมหานคร",
    postal_code: "10600",
    gps_latitude: 13.7436,
    gps_longitude: 100.4873,
    status: "Draft",
    created_by: 4,
  },
  {
    target_name: "วัดโพธิ์",
    address: "2 ถนนสนามชัย แขวงพระบรมมหาราชวัง",
    subdistrict: "พระนคร",
    district: "พระนคร",
    province: "กรุงเทพมหานคร",
    postal_code: "10200",
    gps_latitude: 13.7462,
    gps_longitude: 100.4925,
    status: "Approved",
    created_by: 4,
  },
  {
    target_name: "วัดราชนัดดาราม",
    address: "ถนนราชนัดดา แขวงดุสิต",
    subdistrict: "ดุสิต",
    district: "ดุสิต",
    province: "กรุงเทพมหานคร",
    postal_code: "10300",
    gps_latitude: 13.7794,
    gps_longitude: 100.5152,
    status: "Pending Review",
    created_by: 4,
  },
  {
    target_name: "วัดสุทัศนเทพวรารามราชวรมหาวิหาร",
    address: "146 ถนนบำรุงเมือง แขวงวัดราชบพิธ",
    subdistrict: "พระนคร",
    district: "พระนคร",
    province: "กรุงเทพมหานคร",
    postal_code: "10200",
    gps_latitude: 13.7553,
    gps_longitude: 100.5017,
    status: "Approved",
    created_by: 4,
  },
];

(async () => {
  try {
    console.log("=== เพิ่มข้อมูลตัวอย่างวัด ===");

    for (const temple of sampleTemples) {
      const result = await executeQuery(
        `
        INSERT INTO survey_targets (
          type_id, target_name, address, subdistrict, district, province, 
          postal_code, gps_latitude, gps_longitude, status, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          1, // type_id สำหรับวัด
          temple.target_name,
          temple.address,
          temple.subdistrict,
          temple.district,
          temple.province,
          temple.postal_code,
          temple.gps_latitude,
          temple.gps_longitude,
          temple.status,
          temple.created_by,
        ]
      );

      console.log(
        `✅ เพิ่ม ${temple.target_name} สำเร็จ (ID: ${result.insertId})`
      );

      // เพิ่มข้อมูลรายละเอียดวัด
      await executeQuery(
        `
        INSERT INTO temple_details (
          target_id, temple_type_id, denomination_id, monk_count, history_summary
        ) VALUES (?, ?, ?, ?, ?)
      `,
        [
          result.insertId,
          1, // ประเภทวัด: วัดราชวรวิหาร
          1, // นิกาย: มหานิกาย
          Math.floor(Math.random() * 20) + 5, // จำนวนพระ 5-25 รูป
          `${temple.target_name} เป็นวัดโบราณที่มีประวัติศาสตร์ยาวนาน สร้างขึ้นในสมัยกรุงรัตนโกสินทร์ มีสถาปัตยกรรมที่งดงามและเป็นสถานที่สำคัญทางพระพุทธศาสนา`,
        ]
      );
    }

    console.log("\n=== สรุปข้อมูลที่เพิ่ม ===");
    const totalSurveys = await executeQuery(
      "SELECT COUNT(*) as total FROM survey_targets"
    );
    console.log(`จำนวนการสำรวจทั้งหมด: ${totalSurveys[0].total} รายการ`);

    const templeCount = await executeQuery(
      "SELECT COUNT(*) as total FROM survey_targets WHERE type_id = 1"
    );
    console.log(`จำนวนวัด: ${templeCount[0].total} รายการ`);
  } catch (error) {
    console.error("Error:", error);
  }
  process.exit();
})();
