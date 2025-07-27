const { executeQuery } = require("./config/database");

(async () => {
  try {
    console.log("=== ตรวจสอบผู้ใช้ในระบบ ===");

    const users = await executeQuery(`
      SELECT 
        user_id, 
        username, 
        first_name, 
        last_name, 
        role, 
        is_active, 
        approval_status,
        created_at
      FROM users 
      ORDER BY user_id
    `);

    console.log("จำนวนผู้ใช้ทั้งหมด:", users.length);
    console.log("\n=== รายชื่อผู้ใช้ ===");

    users.forEach((user) => {
      console.log(`
ID: ${user.user_id}
Username: ${user.username}
ชื่อ: ${user.first_name} ${user.last_name}
Role: ${user.role}
สถานะ: ${user.is_active ? "Active" : "Inactive"}
อนุมัติ: ${user.approval_status}
สร้างเมื่อ: ${user.created_at}
---`);
    });

    // ตรวจสอบ token ของผู้ใช้ที่มีปัญหา
    console.log("\n=== ตรวจสอบ JWT Token ===");
    const jwt = require("jsonwebtoken");

    // ลองดู JWT secret
    console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
  } catch (error) {
    console.error("Error:", error);
  }

  process.exit();
})();
