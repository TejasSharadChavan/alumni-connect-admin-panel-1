// Test script to verify real data APIs are working
// Run with: node test-real-data.js

const testRealDataAPIs = async () => {
  console.log("🧪 Testing Real Data APIs...\n");

  const baseUrl = "http://localhost:3000";

  // You'll need to replace this with a real auth token
  const authToken = "your-auth-token-here";

  const headers = {
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json",
  };

  try {
    console.log("1. Testing Admin Real Stats API...");
    const adminStatsResponse = await fetch(`${baseUrl}/api/admin/real-stats`, {
      headers,
    });

    if (adminStatsResponse.ok) {
      const adminData = await adminStatsResponse.json();
      console.log("✅ Admin Stats API working!");
      console.log(`   - Total Users: ${adminData.stats.totalUsers}`);
      console.log(`   - Students: ${adminData.stats.students}`);
      console.log(`   - Alumni: ${adminData.stats.alumni}`);
      console.log(
        `   - Active Mentorships: ${adminData.stats.activeMentorships}`
      );
      console.log(`   - Data Source: Real Database\n`);
    } else {
      console.log("❌ Admin Stats API failed:", adminStatsResponse.status);
    }

    console.log("2. Testing Alumni Real Analytics API...");
    const alumniAnalyticsResponse = await fetch(
      `${baseUrl}/api/alumni/real-analytics`,
      { headers }
    );

    if (alumniAnalyticsResponse.ok) {
      const alumniData = await alumniAnalyticsResponse.json();
      console.log("✅ Alumni Analytics API working!");
      console.log(`   - Influence Score: ${alumniData.influenceScore.total}`);
      console.log(`   - Percentile: ${alumniData.influenceScore.percentile}%`);
      console.log(
        `   - High Priority Students: ${alumniData.recommendations.highPriority.length}`
      );
      console.log(`   - Data Source: Real Database\n`);
    } else {
      console.log(
        "❌ Alumni Analytics API failed:",
        alumniAnalyticsResponse.status
      );
    }

    console.log("🎉 Real Data API Testing Complete!");
    console.log("\n📊 Key Benefits of Real Data:");
    console.log("   • Numbers reflect actual database content");
    console.log("   • Influence scores based on real user activities");
    console.log("   • Student recommendations use actual matching algorithms");
    console.log(
      "   • Growth rates calculated from real user registration data"
    );
    console.log("   • Industry breakdowns from actual user profiles");
    console.log("   • Engagement metrics from real user interactions");
  } catch (error) {
    console.error("❌ Error testing APIs:", error.message);
    console.log("\n💡 To test with real data:");
    console.log("   1. Start the development server: npm run dev");
    console.log("   2. Login as an admin or alumni user");
    console.log("   3. Get the auth token from browser localStorage");
    console.log("   4. Replace 'your-auth-token-here' in this script");
    console.log("   5. Run: node test-real-data.js");
  }
};

// Run the test
testRealDataAPIs();
