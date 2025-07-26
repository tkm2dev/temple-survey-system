const mysql = require("mysql2/promise");

async function testDatabase() {
  try {
    console.log("Testing database connection and table structure...");

    // Create connection (adjust these settings to match your database config)
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "123456", // Update with your MySQL password
      database: "temple_survey_db_v2",
    });

    console.log("✅ Connected to database successfully");

    // Test table structure
    const [rows] = await connection.execute("DESCRIBE users");
    console.log("\n📋 Users table structure:");
    console.table(rows);

    // Check if approval_status column exists
    const approvalStatusExists = rows.some(
      (row) => row.Field === "approval_status"
    );
    if (approvalStatusExists) {
      console.log("✅ approval_status column exists");
    } else {
      console.log(
        "❌ approval_status column is missing - please run the migration"
      );
    }

    // Test sample query
    try {
      const [users] = await connection.execute(`
        SELECT user_id, username, approval_status, rank, position, department 
        FROM users 
        LIMIT 3
      `);
      console.log("\n👥 Sample user data:");
      console.table(users);
    } catch (error) {
      console.log("❌ Error querying users table:", error.message);
    }

    await connection.end();
    console.log("\n✅ Database test completed");
  } catch (error) {
    console.error("❌ Database connection error:", error.message);
    console.log("\nPossible solutions:");
    console.log("1. Make sure MySQL server is running");
    console.log("2. Check database credentials in the script");
    console.log("3. Ensure temple_survey_db_v2 database exists");
    console.log(
      "4. Run the migration script if approval_status column is missing"
    );
  }
}

testDatabase();
