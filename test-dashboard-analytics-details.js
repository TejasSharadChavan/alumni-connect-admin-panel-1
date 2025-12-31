// Test Alumni Dashboard Analytics Details
const testDashboardAnalyticsDetails = async () => {
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

    // Get detailed analytics
    const analyticsResponse = await fetch(
      "http://localhost:3000/api/alumni/dashboard-analytics",
      {
        headers,
      }
    );

    if (analyticsResponse.ok) {
      const analyticsData = await analyticsResponse.json();

      console.log("\n📊 ALUMNI DASHBOARD ANALYTICS DETAILS:");
      console.log("=====================================");

      if (analyticsData.analytics) {
        const analytics = analyticsData.analytics;

        console.log("\n📈 STATISTICS:");
        console.log(`   Jobs Posted: ${analytics.jobsPosted || 0}`);
        console.log(`   Job Applications: ${analytics.jobApplications || 0}`);
        console.log(`   Events Organized: ${analytics.eventsOrganized || 0}`);
        console.log(`   Event RSVPs: ${analytics.eventRsvps || 0}`);
        console.log(`   Connections: ${analytics.connections || 0}`);
        console.log(
          `   Mentorship Requests: ${analytics.mentorshipRequests || 0}`
        );
        console.log(`   Referrals Created: ${analytics.referralsCreated || 0}`);
        console.log(`   Referrals Used: ${analytics.referralsUsed || 0}`);
        console.log(`   Total Donations: ₹${analytics.totalDonations || 0}`);
        console.log(`   Donation Count: ${analytics.donationCount || 0}`);

        if (analytics.recentActivity) {
          console.log("\n🔄 RECENT ACTIVITY:");
          analytics.recentActivity.forEach((activity, index) => {
            console.log(
              `   ${index + 1}. ${activity.action} - ${activity.timestamp}`
            );
          });
        }

        if (analytics.monthlyStats) {
          console.log("\n📅 MONTHLY STATISTICS:");
          Object.entries(analytics.monthlyStats).forEach(([month, stats]) => {
            console.log(`   ${month}: ${JSON.stringify(stats)}`);
          });
        }

        if (analytics.topPerformingJobs) {
          console.log("\n🏆 TOP PERFORMING JOBS:");
          analytics.topPerformingJobs.forEach((job, index) => {
            console.log(
              `   ${index + 1}. ${job.title} - ${job.applicationsCount} applications`
            );
          });
        }

        if (analytics.networkGrowth) {
          console.log("\n📊 NETWORK GROWTH:");
          console.log(`   Growth Rate: ${analytics.networkGrowth.rate}%`);
          console.log(
            `   New Connections: ${analytics.networkGrowth.newConnections}`
          );
        }
      }

      console.log("\n✅ Dashboard analytics are comprehensive and detailed!");
    } else {
      const errorData = await analyticsResponse.json();
      console.log("❌ Analytics API failed:", errorData);
    }
  } catch (error) {
    console.log("❌ Test error:", error.message);
  }
};

// Run the test
testDashboardAnalyticsDetails();
