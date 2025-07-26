const bcrypt = require("./server/node_modules/bcryptjs");
const { executeQuery } = require("./server/config/database");

async function addNewAdmin() {
  const username = "tophatori";
  const password = "tophatori";
  const saltRounds = 10;

  try {
    console.log(`🔐 Creating new admin user: ${username}`);

    // Generate password hash
    const passwordHash = await bcrypt.hash(password, saltRounds);
    console.log(`✅ Password hash generated: ${passwordHash.substring(0, 20)}...`);

    // Check if user already exists
    console.log(`🔍 Checking if user already exists...`);
    const existingUsers = await executeQuery(
      "SELECT user_id FROM users WHERE username = ?",
      [username]
    );

    if (existingUsers.length > 0) {
      console.log(`❌ User '${username}' already exists!`);
      return;
    }

    console.log(`✅ User doesn't exist, proceeding with creation...`);

    // Insert new admin user
    console.log(`📝 Inserting new user into database...`);
    const result = await executeQuery(
      `INSERT INTO users (
        username, password_hash, role, first_name, last_name, email,
        is_active, approval_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        username,
        passwordHash,
        'Admin',
        'นาย',
        'โทฟะโตริ',
        'tophatori@survey.gov.th',
        1,  // Use 1 instead of true for MySQL
        'approved'
      ]
    );

    console.log(`✅ Admin user created successfully!`);
    console.log(`📋 User Details:`);
    console.log(`   - User ID: ${result.insertId}`);
    console.log(`   - Username: ${username}`);
    console.log(`   - Password: ${password}`);
    console.log(`   - Role: Admin`);
    console.log(`   - Name: นาย โทฟะโตริ`);
    console.log(`   - Email: tophatori@survey.gov.th`);
    console.log(`   - Status: Active & Approved`);
    console.log(``);
    console.log(`🎉 You can now login with:`);
    console.log(`   👤 Username: ${username}`);
    console.log(`   🔐 Password: ${password}`);

  } catch (error) {
    console.error(`💥 Error creating admin user:`, error.message);
    console.error(`💥 Full error:`, error);
  }
}

// Run the function
addNewAdmin().then(() => {
  console.log(`\n🏁 Script completed`);
}).catch(error => {
  console.error(`💥 Script failed:`, error.message);
});
