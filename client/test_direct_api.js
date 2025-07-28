// Simple API test without authentication
const testDirectAPI = async () => {
  console.log("=== ทดสอบ API โดยตรง ===");

  try {
    // Test backend server
    const backendTest = await fetch("http://localhost:3000/", {
      method: "GET",
    });
    console.log("Backend server status:", backendTest.status);

    // Test with minimal data
    const testResponse = await fetch(
      "http://localhost:3000/api/surveys/targets?type_id=1&limit=5",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("API Response status:", testResponse.status);
    console.log("API Response headers:", testResponse.headers);

    if (testResponse.status === 401) {
      console.log("✅ Authentication required (expected)");
      return;
    }

    const data = await testResponse.json();
    console.log("API Response data:", data);
  } catch (error) {
    console.error("❌ API Test failed:", error);
  }
};

testDirectAPI();
