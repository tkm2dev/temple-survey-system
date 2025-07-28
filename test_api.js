// Test API connectivity
const testAPI = async () => {
  console.log("=== ทดสอบการเชื่อมต่อ API ===");

  try {
    // Test 1: ทดสอบการเชื่อมต่อพื้นฐาน
    const response1 = await fetch(
      "http://localhost:3000/api/surveys/targets?type_id=1",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      "Response 1 (no auth):",
      response1.status,
      response1.statusText
    );

    if (response1.status === 401) {
      console.log("✅ ต้องการ Authentication (ถูกต้อง)");
    }

    // Test 2: ทดสอบด้วย Token (ถ้ามี)
    const token = localStorage.getItem("token");
    if (token) {
      const response2 = await fetch(
        "http://localhost:3000/api/surveys/targets?type_id=1",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Response 2 (with auth):",
        response2.status,
        response2.statusText
      );

      if (response2.ok) {
        const data = await response2.json();
        console.log("✅ ได้ข้อมูล:", data.data?.length || 0, "รายการ");
        console.log("ตัวอย่างข้อมูล:", data.data?.[0]);
      } else {
        console.log("❌ Error:", await response2.text());
      }
    } else {
      console.log("❌ ไม่พบ Token ใน localStorage");
    }
  } catch (error) {
    console.error("❌ Network Error:", error);
  }
};

// เรียกใช้ทันที
testAPI();
