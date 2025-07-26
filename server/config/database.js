const mysql = require("mysql2/promise");
const logger = require("../utils/logger");

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "123456",
  database: process.env.DB_NAME || "temple_survey_db_v2",
  charset: "utf8mb4",
  connectionLimit: 10,
  acquireTimeout: 60000,
  idleTimeout: 600000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const connectDB = async () => {
  try {
    console.log(
      `🔌 [DATABASE] Attempting to connect to database: ${dbConfig.database} at ${dbConfig.host}:${dbConfig.port}`
    );
    const connection = await pool.getConnection();
    console.log(`✅ [DATABASE] Connection established successfully`);
    logger.info("Database connection established successfully");
    connection.release();
    return true;
  } catch (error) {
    console.error(`💥 [DATABASE] Connection failed: ${error.message}`);
    logger.error("Database connection failed:", error.message);
    throw error;
  }
};

// Execute query with error handling
const executeQuery = async (query, params = []) => {
  try {
    console.log(
      `📊 [DATABASE] Executing query: ${query.substring(0, 150)}${
        query.length > 150 ? "..." : ""
      }`
    );
    if (params.length > 0) {
      console.log(`📊 [DATABASE] Query params:`, params);
    }

    const [results] = await pool.execute(query, params);

    console.log(
      `✅ [DATABASE] Query executed successfully, rows affected/returned: ${
        Array.isArray(results) ? results.length : results.affectedRows || 0
      }`
    );

    return results;
  } catch (error) {
    console.error(`💥 [DATABASE ERROR] Query failed: ${error.message}`);
    console.error(
      `💥 [DATABASE ERROR] Failed query: ${query.substring(0, 200)}`
    );
    logger.error("Database query error:", {
      query: query.substring(0, 100) + "...",
      error: error.message,
    });
    throw error;
  }
};

// Execute transaction
const executeTransaction = async (queries) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const results = [];
    for (const { query, params } of queries) {
      const [result] = await connection.execute(query, params);
      results.push(result);
    }

    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    logger.error("Transaction error:", error.message);
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  pool,
  connectDB,
  executeQuery,
  executeTransaction,
};
