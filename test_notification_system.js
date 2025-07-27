const { executeQuery } = require("./server/config/database");
const {
  sendNotification,
  notifyAdminsNewRegistration,
  notifyUserApproval,
  notifyUserRejection,
  getUnreadNotificationCount,
} = require("./server/utils/notificationService");

async function testNotificationSystem() {
  try {
    console.log("🧪 [TEST] เริ่มทดสอบระบบการแจ้งเตือน...\n");

    // 1. ทดสอบการส่งการแจ้งเตือนปกติ
    console.log("1. ทดสอบการส่งการแจ้งเตือนพื้นฐาน...");

    // หา Admin คนแรก
    const admins = await executeQuery(
      "SELECT * FROM users WHERE role = 'Admin' AND is_active = TRUE LIMIT 1"
    );

    if (admins.length === 0) {
      console.log("❌ ไม่พบ Admin ในระบบ");
      return;
    }

    const admin = admins[0];
    console.log(`   ส่งการแจ้งเตือนให้ Admin: ${admin.username}`);

    const testSent = await sendNotification(
      admin.user_id,
      "ทดสอบระบบการแจ้งเตือน",
      "นี่คือการทดสอบระบบการแจ้งเตือนใหม่ ถ้าคุณเห็นข้อความนี้แสดงว่าระบบทำงานถูกต้อง",
      "info"
    );

    console.log(`   ✅ ส่งสำเร็จ: ${testSent}\n`);

    // 2. ทดสอบการแจ้งเตือนผู้ใช้ใหม่
    console.log("2. ทดสอบการแจ้งเตือนผู้ใช้ใหม่...");

    const mockNewUser = {
      user_id: 999,
      username: "test_user_mock",
      first_name: "ทดสอบ",
      last_name: "ระบบ",
      email: "test@example.com",
      department: "หน่วยทดสอบ",
      position: "ผู้ทดสอบระบบ",
    };

    const newUserNotified = await notifyAdminsNewRegistration(mockNewUser);
    console.log(`   ✅ แจ้งเตือนผู้ใช้ใหม่สำเร็จ: ${newUserNotified}\n`);

    // 3. ทดสอบการนับการแจ้งเตือนที่ยังไม่ได้อ่าน
    console.log("3. ทดสอบการนับการแจ้งเตือนที่ยังไม่ได้อ่าน...");

    const unreadCount = await getUnreadNotificationCount(admin.user_id);
    console.log(
      `   📬 Admin ${admin.username} มีการแจ้งเตือนที่ยังไม่ได้อ่าน: ${unreadCount} รายการ\n`
    );

    // 4. แสดงการแจ้งเตือนล่าสุด
    console.log("4. การแจ้งเตือนล่าสุดในระบบ:");

    const recentNotifications = await executeQuery(`
      SELECT 
        n.title,
        n.message,
        n.type,
        n.is_read,
        n.created_at,
        u.username,
        u.first_name,
        u.last_name
      FROM notifications n
      JOIN users u ON n.user_id = u.user_id
      ORDER BY n.created_at DESC
      LIMIT 5
    `);

    recentNotifications.forEach((notif, index) => {
      const status = notif.is_read ? "✅ อ่านแล้ว" : "🔔 ยังไม่ได้อ่าน";
      console.log(
        `   ${index + 1}. [${notif.type.toUpperCase()}] ${notif.title}`
      );
      console.log(
        `      ถึง: ${notif.first_name} ${notif.last_name} (${notif.username})`
      );
      console.log(`      สถานะ: ${status}`);
      console.log(`      เวลา: ${notif.created_at}`);
      console.log(`      ข้อความ: ${notif.message.substring(0, 100)}...`);
      console.log("");
    });

    console.log("🎉 [TEST] ทดสอบระบบการแจ้งเตือนเสร็จสิ้น!");
    console.log("\n📝 [INFO] วิธีใช้งาน:");
    console.log("- ผู้ใช้ใหม่ลงทะเบียน → Admin ทุกคนจะได้รับการแจ้งเตือน");
    console.log("- Admin อนุมัติ/ปฏิเสธ → ผู้ใช้จะได้รับการแจ้งเตือน");
    console.log("- ดูการแจ้งเตือนได้ที่ API: GET /api/notifications");
    console.log(
      "- ทำเครื่องหมายอ่านแล้วได้ที่ API: PUT /api/notifications/:id/read"
    );
  } catch (error) {
    console.error("❌ [TEST ERROR] เกิดข้อผิดพลาดในการทดสอบ:", error.message);
    console.error(error.stack);
  } finally {
    process.exit(0);
  }
}

// เริ่มทดสอบ
testNotificationSystem();
