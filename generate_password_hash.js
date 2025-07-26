const bcrypt = require("bcryptjs");

async function generatePasswordHash() {
  const password = "admin123";
  const saltRounds = 10;

  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log("Password:", password);
    console.log("Generated hash:", hash);

    // Test the hash
    const isMatch = await bcrypt.compare(password, hash);
    console.log("Hash verification:", isMatch ? "SUCCESS" : "FAILED");

    // Test against the existing hash from seed data
    const existingHash =
      "$2b$10$rOH7vT8FKZgCzN7Nz8jMuOuLJKHx7GJ9BvQhGzKNmKhJ6YzJq5K5m";
    const existingMatch = await bcrypt.compare(password, existingHash);
    console.log(
      "Existing hash verification:",
      existingMatch ? "SUCCESS" : "FAILED"
    );
  } catch (error) {
    console.error("Error:", error.message);
  }
}

generatePasswordHash();
