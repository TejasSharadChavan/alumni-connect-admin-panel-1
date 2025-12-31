// Test Enhanced Alumni Analytics API
const testEnhancedAnalytics = async () => {
  try {
    // Login first
    const loginResponse = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "rahul.agarwal@gmail.com",
        password: "password123",
      }),
    });

    const loginData = await loginResponse.json();
    if (!loginResponse.ok || !loginData.token) {
      console.log("❌ Login failed");
      return;
    }

    console.log("✅ Login successful");
    const headers = { Authorization: `Bearer ${loginData.token}` };

    // Test enhanced analytics
    console.log("\n📊 Testing Enhanced Analytics API...");
    const enhancedResponse = await fetch(
      "http://localhost:3000/api/alumni/analytics-enhanced",
      {
        headers,
      }
    );

    if (enhancedResponse.ok) {
      const enhancedData = await enhancedResponse.json();

      console.log("\n📈 ENHANCED ANALYTICS DATA:");
      console.log("===========================");
      console.log(JSON.stringify(enhancedData, null, 2));
    } else {
      const errorData = await enhancedResponse.json();
      console.log("❌ Enhanced Analytics failed:", errorData);
    }

    // Compare with regular analytics
    console.log("\n📊 Testing Regular Analytics API...");
    const regularResponse = await fetch(
      "http://localhost:3000/api/alumni/dashboard-analytics",
      {
        headers,
      }
    );

    if (regularResponse.ok) {
      const regularData = await regularResponse.json();

      console.log("\n📈 REGULAR ANALYTICS DATA:");
      console.log("==========================");
      console.log(JSON.stringify(regularData, null, 2));
    } else {
      const errorData = await regularResponse.json();
      console.log("❌ Regular Analytics failed:", errorData);
    }
  } catch (error) {
    console.log("❌ Test error:", error.message);
  }
};

// Run the test
testEnhancedAnalytics();
