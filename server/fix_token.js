const jwt = require("jsonwebtoken");
require("dotenv").config();

console.log("=== ตรวจสอบและแก้ไข JWT Token ===");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "มี" : "ไม่มี");

// สร้าง token ใหม่สำหรับผู้ใช้ที่มีในระบบ
const users = [
  { user_id: 4, username: "tophatori", role: "Admin" },
  { user_id: 7, username: "surveyor01", role: "Surveyor" },
];

console.log("\n=== สร้าง Token ใหม่ ===");

users.forEach((user) => {
  const token = jwt.sign(
    {
      user_id: user.user_id,
      username: user.username,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
  );

  console.log(`\nUser: ${user.username} (ID: ${user.user_id})`);
  console.log(`Token: ${token}`);

  // ทดสอบ decode token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded:", decoded);
  } catch (error) {
    console.error("Token verification failed:", error.message);
  }
});

// ตรวจสอบ token เก่าถ้ามี
const oldToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo2LCJ1c2VybmFtZSI6InRvcGhhdG9yaSIsInJvbGUiOiJBZG1pbiIsImlhdCI6MTczNzk3NjQwMCwiZXhwIjoxNzM4MDYyODAwfQ.example";

console.log("\n=== ตรวจสอบ Token เก่า ===");
try {
  const decoded = jwt.verify(oldToken, process.env.JWT_SECRET);
  console.log("Old token decoded:", decoded);
} catch (error) {
  console.log("Old token error:", error.message);
}

process.exit();
