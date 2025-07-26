const { executeQuery } = require("./server/config/database");

async function checkUser() {
  try {
    console.log(`🔍 Checking for user 'tophatori'...`);

    const users = await executeQuery(
      "SELECT user_id, username, role, first_name, last_name, email, is_active, approval_status, created_at FROM users WHERE username = ?",
      ["tophatori"]
    );

    if (users.length > 0) {
      const user = users[0];
      console.log(`✅ User found!`);
      console.log(`📋 User Details:`);
      console.log(`   - User ID: ${user.user_id}`);
      console.log(`   - Username: ${user.username}`);
      console.log(`   - Role: ${user.role}`);
      console.log(`   - Name: ${user.first_name} ${user.last_name}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Active: ${user.is_active}`);
      console.log(`   - Approval Status: ${user.approval_status}`);
      console.log(`   - Created: ${user.created_at}`);
    } else {
      console.log(`❌ User 'tophatori' not found`);

      // Show all users for reference
      console.log(`\n📋 All users in database:`);
      const allUsers = await executeQuery(
        "SELECT username, role, is_active, approval_status FROM users"
      );
      allUsers.forEach((user) => {
        console.log(
          `   - ${user.username} (${user.role}) - Active: ${user.is_active}, Status: ${user.approval_status}`
        );
      });
    }
  } catch (error) {
    console.error(`💥 Error checking user:`, error.message);
  }
}

checkUser();
