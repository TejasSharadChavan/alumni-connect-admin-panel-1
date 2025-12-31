// Test Analytics with Detailed Logging
const testAnalyticsWithLogs = async () => {
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

    console.log("✅ Login successful - User ID:", loginData.user.id);
    const headers = { Authorization: `Bearer ${loginData.token}` };

    // Test the fixed analytics API
    console.log("\n📊 Testing Fixed Analytics API...");
    const analyticsResponse = await fetch(
      "http://localhost:3000/api/alumni/dashboard-analytics",
      {
        headers,
      }
    );

    if (analyticsResponse.ok) {
      const analyticsData = await analyticsResponse.json();

      console.log("\n📈 FIXED ANALYTICS DATA:");
      console.log("========================");
      console.log(JSON.stringify(analyticsData, null, 2));

      if (analyticsData.analytics?.totals) {
        const totals = analyticsData.analytics.totals;
        console.log("\n🎯 KEY TOTALS:");
        console.log(`   Jobs: ${totals.jobs}`);
        console.log(`   Connections: ${totals.connections}`);
        console.log(`   Referrals: ${totals.referrals}`);
        console.log(`   Mentorship: ${totals.mentees}`);
        console.log(`   Donations: ₹${totals.donations}`);
        console.log(`   Events: ${totals.events}`);
        console.log(`   Applications: ${totals.applications}`);
      }
    } else {
      const errorData = await analyticsResponse.json();
      console.log("❌ Analytics API failed:", errorData);
    }
  } catch (error) {
    console.log("❌ Test error:", error.message);
  }
};

// Run the test
testAnalyticsWithLogs();
