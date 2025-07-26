const bcrypt = require("bcryptjs");
require("dotenv").config(); // โหลด .env ก่อน
const { executeQuery } = require("../config/database");

async function createTestUsers() {
  try {
    console.log("Creating test users...");

    // ลบ users เก่า (ถ้ามี)
    await executeQuery("DELETE FROM users WHERE username IN (?, ?, ?)", [
      "admin",
      "reviewer",
      "surveyor",
    ]);

    // สร้าง hash สำหรับรหัสผ่าน
    const adminPassword = await bcrypt.hash("admin123", 10);
    const reviewerPassword = await bcrypt.hash("reviewer123", 10);
    const surveyorPassword = await bcrypt.hash("surveyor123", 10);

    // เพิ่ม users ใหม่
    const users = [
      {
        username: "admin",
        password_hash: adminPassword,
        role: "Admin",
        first_name: "ผู้ดูแล",
        last_name: "ระบบ",
        email: "admin@survey.gov.th",
      },
      {
        username: "reviewer",
        password_hash: reviewerPassword,
        role: "Reviewer",
        first_name: "ผู้ตรวจ",
        last_name: "สอบ",
        email: "reviewer@survey.gov.th",
      },
      {
        username: "surveyor",
        password_hash: surveyorPassword,
        role: "Surveyor",
        first_name: "ผู้สำรวจ",
        last_name: "ข้อมูล",
        email: "surveyor@survey.gov.th",
      },
    ];

    for (const user of users) {
      await executeQuery(
        `INSERT INTO users (username, password_hash, role, first_name, last_name, email, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
        [
          user.username,
          user.password_hash,
          user.role,
          user.first_name,
          user.last_name,
          user.email,
        ]
      );
      console.log(`✅ Created user: ${user.username} (${user.role})`);
    }

    console.log("\n🎉 Test users created successfully!");
    console.log("Login credentials:");
    console.log("Admin: admin / admin123");
    console.log("Reviewer: reviewer / reviewer123");
    console.log("Surveyor: surveyor / surveyor123");
  } catch (error) {
    console.error("❌ Error creating test users:", error);
  }
}

// เรียกใช้ function ถ้าไฟล์นี้ถูกรันโดยตรง
if (require.main === module) {
  require("dotenv").config();
  createTestUsers()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { createTestUsers };
