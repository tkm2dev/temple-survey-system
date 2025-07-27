const { executeQuery } = require("./config/database");
require("dotenv").config();

async function testTotalSurveys() {
  console.log("=== ทดสอบ getTotalSurveys ===");
  try {
    const result = await executeQuery(
      "SELECT COUNT(*) as total FROM survey_targets"
    );
    console.log("Result:", result);
    return result[0];
  } catch (error) {
    console.error("Error in getTotalSurveys:", error);
  }
}

async function testSurveysByStatus() {
  console.log("\n=== ทดสอบ getSurveysByStatus ===");
  try {
    const results = await executeQuery(`
      SELECT 
        status,
        COUNT(*) as count
      FROM survey_targets 
      GROUP BY status
    `);
    console.log("Results:", results);
    return results;
  } catch (error) {
    console.error("Error in getSurveysByStatus:", error);
  }
}

async function testUserStatistics() {
  console.log("\n=== ทดสอบ getUserStatistics ===");
  try {
    const [totalResult, activeResult] = await Promise.all([
      executeQuery("SELECT COUNT(*) as total FROM users WHERE is_active = 1"),
      executeQuery(`
        SELECT COUNT(DISTINCT user_id) as active 
        FROM activity_logs 
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      `),
    ]);

    console.log("Total users:", totalResult);
    console.log("Active users:", activeResult);

    return {
      total: totalResult[0].total,
      active: activeResult[0].active,
    };
  } catch (error) {
    console.error("Error in getUserStatistics:", error);
  }
}

async function testPerformanceMetrics() {
  console.log("\n=== ทดสอบ getPerformanceMetrics ===");
  try {
    const todayResult = await executeQuery(`
      SELECT COUNT(*) as count 
      FROM survey_targets 
      WHERE DATE(created_at) = CURDATE()
    `);

    console.log("Today result:", todayResult);

    const weekResult = await executeQuery(`
      SELECT COUNT(*) as count 
      FROM survey_targets 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    console.log("Week result:", weekResult);

    return {
      today: todayResult[0].count,
      week: weekResult[0].count,
    };
  } catch (error) {
    console.error("Error in getPerformanceMetrics:", error);
  }
}

(async () => {
  await testTotalSurveys();
  await testSurveysByStatus();
  await testUserStatistics();
  await testPerformanceMetrics();
  process.exit();
})();
