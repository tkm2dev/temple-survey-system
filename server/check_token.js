const jwt = require("jsonwebtoken");
require("dotenv").config();

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInVzZXJuYW1lIjoidG9waGF0b3JpIiwicm9sZSI6IkFkbWluIiwiaWF0IjoxNzUzNjI3MjE2LCJleHAiOjE3NTM3MTM2MTZ9.hz6SEYcyvI28NElSLsirRB5VdI6R9RehLcH6JuzDpDc";

try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log("Token decoded:", JSON.stringify(decoded, null, 2));
  console.log("userId property:", decoded.userId);
  console.log("user_id property:", decoded.user_id);
} catch (error) {
  console.error("Token error:", error.message);
}

process.exit();
