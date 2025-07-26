// Simple database test using the project's existing configuration
const { executeQuery, connectDB } = require("./server/config/database");

async function testDatabaseStructure() {
  try {
    console.log("🔍 Testing database connection and structure...");

    // Test connection
    await connectDB();
    console.log("✅ Database connection successful");

    // Check table structure
    console.log("\n📋 Checking users table structure...");
    const structure = await executeQuery("DESCRIBE users");

    console.log("Current table structure:");
    structure.forEach((field) => {
      console.log(
        `  ${field.Field} - ${field.Type} ${
          field.Null === "YES" ? "(nullable)" : "(required)"
        }`
      );
    });

    // Check for required fields
    const requiredFields = [
      "approval_status",
      "rank",
      "position",
      "department",
      "phone",
      "line_id",
      "notes",
      "last_login",
      "updated_at",
    ];

    const existingFields = structure.map((field) => field.Field);
    const missingFields = requiredFields.filter(
      (field) => !existingFields.includes(field)
    );

    if (missingFields.length > 0) {
      console.log("\n❌ Missing fields:");
      missingFields.forEach((field) => console.log(`  - ${field}`));
      console.log("\n🔧 Please run the migration script to add these fields");
    } else {
      console.log("\n✅ All required fields are present");

      // Test a sample query
      console.log("\n👥 Testing sample query...");
      const users = await executeQuery(`
        SELECT user_id, username, approval_status, rank, position 
        FROM users 
        LIMIT 3
      `);

      console.log("Sample users:");
      console.table(users);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);

    if (error.message.includes("Unknown column")) {
      console.log("\n🔧 This error indicates missing database columns.");
      console.log("Please run the migration script:");
      console.log("1. Use phpMyAdmin to run migration_add_user_fields.sql");
      console.log("2. Or use MySQL command line");
      console.log("3. Then restart the server");
    }
  }
}

// Run the test
testDatabaseStructure();
