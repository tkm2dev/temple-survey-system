const { executeQuery } = require("./config/database");
require("dotenv").config();

(async () => {
  try {
    console.log("=== โครงสร้างตาราง users ===");
    const columns = await executeQuery("DESCRIBE users");
    columns.forEach((col) => console.log(`${col.Field} - ${col.Type}`));
  } catch (error) {
    console.error("Error:", error);
  }
  process.exit();
})();
