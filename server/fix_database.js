// Database fix script - runs the migration directly from Node.js
const { executeQuery, connectDB } = require("./config/database");
const bcrypt = require("bcryptjs");

async function fixDatabase() {
  try {
    console.log("🔧 Starting database migration...");

    // Test connection
    await connectDB();
    console.log("✅ Database connected");

    // Add missing columns (ignore errors if they already exist)
    const alterCommands = [
      "ALTER TABLE users ADD COLUMN approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved'",
      "ALTER TABLE users ADD COLUMN rank VARCHAR(50)",
      "ALTER TABLE users ADD COLUMN position VARCHAR(100)",
      "ALTER TABLE users ADD COLUMN department VARCHAR(150)",
      "ALTER TABLE users ADD COLUMN line_id VARCHAR(50)",
      "ALTER TABLE users ADD COLUMN notes TEXT",
      "ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL",
      "ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE",
    ];

    console.log("📋 Adding missing columns...");
    for (const command of alterCommands) {
      try {
        await executeQuery(command);
        console.log("✅ Added column");
      } catch (error) {
        if (error.message.includes("Duplicate column")) {
          console.log("⚠️  Column already exists, skipping");
        } else {
          console.log("❌ Error:", error.message);
        }
      }
    }

    // Fix role enum values
    console.log("🔄 Fixing role values...");
    try {
      await executeQuery(
        "UPDATE users SET role = 'Admin' WHERE role = 'admin'"
      );
      await executeQuery(
        "UPDATE users SET role = 'Surveyor' WHERE role = 'surveyor'"
      );
      await executeQuery(
        "ALTER TABLE users MODIFY COLUMN role ENUM('Admin', 'Reviewer', 'Surveyor') NOT NULL"
      );
      console.log("✅ Role values fixed");
    } catch (error) {
      console.log("⚠️  Role fix error:", error.message);
    }

    // Generate correct password hash
    const password = "admin123";
    const passwordHash = await bcrypt.hash(password, 10);

    // Delete existing admin user
    await executeQuery("DELETE FROM users WHERE username = 'admin'");
    console.log("🗑️  Removed existing admin user");

    // Insert admin user with correct credentials
    await executeQuery(
      `
      INSERT INTO users (
        username, password_hash, role, first_name, last_name, email, 
        is_active, approval_status, rank, position, department, phone, line_id, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        "admin",
        passwordHash,
        "Admin",
        "ผู้ดูแล",
        "ระบบ",
        "admin@survey.gov.th",
        true,
        "approved",
        "ผู้อำนวยการ",
        "ผู้บริหารระบบ",
        "ศูนย์เทคโนโลยีสารสนเทศ",
        "02-111-2222",
        "admin_line",
        "ผู้ดูแลระบบหลัก",
      ]
    );
    console.log("👤 Created admin user");

    // Add test users
    await executeQuery(
      `
      INSERT INTO users (
        username, password_hash, role, first_name, last_name, email, 
        is_active, approval_status, rank, position, department, phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        "surveyor1",
        passwordHash,
        "Surveyor",
        "นายสำรวจ",
        "ข้อมูล",
        "surveyor1@survey.gov.th",
        true,
        "approved",
        "เจ้าพนักงาน",
        "นักสำรวจ",
        "ฝ่ายสำรวจภาคสนาม",
        "02-333-4444",
      ]
    );

    await executeQuery(
      `
      INSERT INTO users (
        username, password_hash, role, first_name, last_name, email, 
        is_active, approval_status, rank, position, department, phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        "reviewer1",
        passwordHash,
        "Reviewer",
        "นายตรวจ",
        "สอบ",
        "reviewer1@survey.gov.th",
        true,
        "approved",
        "นักวิชาการ",
        "ผู้ตรวจสอบข้อมูล",
        "ฝ่ายตรวจสอบและประเมินผล",
        "02-222-3333",
      ]
    );
    console.log("👥 Created test users");

    // Create indexes
    try {
      await executeQuery(
        "CREATE INDEX idx_users_approval_status ON users(approval_status)"
      );
      await executeQuery("CREATE INDEX idx_users_role ON users(role)");
      await executeQuery(
        "CREATE INDEX idx_users_is_active ON users(is_active)"
      );
      console.log("📊 Created indexes");
    } catch (error) {
      console.log("⚠️  Index creation (might already exist):", error.message);
    }

    // Verify the fix
    const users = await executeQuery(
      "SELECT username, role, approval_status, is_active FROM users"
    );
    console.log("\n👥 Current users:");
    console.table(users);

    console.log("\n🎉 Database migration completed successfully!");
    console.log("");
    console.log("You can now login with:");
    console.log("👤 Username: admin");
    console.log("🔐 Password: admin123");
    console.log("");
    console.log("Please restart your Node.js server now.");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    console.log("\nIf this error persists, please:");
    console.log("1. Check your database connection settings in server/.env");
    console.log("2. Ensure MySQL server is running");
    console.log("3. Verify database temple_survey_db_v2 exists");
  }
}

// Run the fix
fixDatabase();
