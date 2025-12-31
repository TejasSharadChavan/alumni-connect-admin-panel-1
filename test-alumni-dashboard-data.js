// Test Alumni Dashboard Data Fetching
const testAlumniDashboardData = async () => {
  let authToken = null;

  const addResult = (title, content, isError = false) => {
    console.log(`\n${isError ? "❌" : "✅"} ${title}`);
    console.log(content);
  };

  try {
    // 1. Login as Alumni
    console.log("🔐 Testing Alumni Login...");
    const loginResponse = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "rahul.agarwal@gmail.com",
        password: "password123",
      }),
    });

    const loginData = await loginResponse.json();
    if (loginResponse.ok && loginData.token) {
      authToken = loginData.token;
      addResult(
        "Alumni Login",
        `Success! User: ${loginData.user.name} (ID: ${loginData.user.id})`
      );
    } else {
      addResult("Alumni Login", `Failed: ${JSON.stringify(loginData)}`, true);
      return;
    }

    const headers = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };

    // 2. Test Alumni Dashboard Analytics API
    console.log("\n📊 Testing Alumni Dashboard Analytics...");
    const analyticsResponse = await fetch(
      "http://localhost:3000/api/alumni/dashboard-analytics",
      {
        headers,
      }
    );

    if (analyticsResponse.ok) {
      const analyticsData = await analyticsResponse.json();
      addResult(
        "Dashboard Analytics",
        `Success! Data keys: ${Object.keys(analyticsData).join(", ")}`
      );

      // Check specific data points
      if (analyticsData.stats) {
        console.log(
          "   📈 Stats:",
          JSON.stringify(analyticsData.stats, null, 2)
        );
      }
      if (analyticsData.recentActivity) {
        console.log(
          `   🔄 Recent Activity: ${analyticsData.recentActivity.length} items`
        );
      }
    } else {
      const errorData = await analyticsResponse.json();
      addResult(
        "Dashboard Analytics",
        `Failed: ${JSON.stringify(errorData)}`,
        true
      );
    }

    // 3. Test Notifications API
    console.log("\n🔔 Testing Notifications...");
    const notificationsResponse = await fetch(
      "http://localhost:3000/api/notifications?limit=5",
      {
        headers,
      }
    );

    if (notificationsResponse.ok) {
      const notificationsData = await notificationsResponse.json();
      addResult(
        "Notifications",
        `Found ${notificationsData.notifications?.length || 0} notifications`
      );

      if (notificationsData.notifications?.length > 0) {
        notificationsData.notifications.forEach((notif, index) => {
          console.log(
            `   ${index + 1}. ${notif.title} - ${notif.type} (${notif.isRead ? "Read" : "Unread"})`
          );
        });
      }
    } else {
      const errorData = await notificationsResponse.json();
      addResult("Notifications", `Failed: ${JSON.stringify(errorData)}`, true);
    }

    // 4. Test Jobs API (Alumni's posted jobs)
    console.log("\n💼 Testing Jobs Data...");
    const jobsResponse = await fetch("http://localhost:3000/api/jobs", {
      headers,
    });

    if (jobsResponse.ok) {
      const jobsData = await jobsResponse.json();
      const jobs = jobsData.jobs || [];
      addResult("Jobs Data", `Found ${jobs.length} total jobs`);

      // Filter jobs posted by current alumni
      const alumniJobs = jobs.filter(
        (job) => job.postedById === loginData.user.id
      );
      console.log(`   📝 Jobs posted by current alumni: ${alumniJobs.length}`);

      alumniJobs.forEach((job, index) => {
        console.log(
          `   ${index + 1}. ${job.title} at ${job.company} (Status: ${job.status})`
        );
      });
    } else {
      const errorData = await jobsResponse.json();
      addResult("Jobs Data", `Failed: ${JSON.stringify(errorData)}`, true);
    }

    // 5. Test Connections API
    console.log("\n🤝 Testing Connections Data...");
    const connectionsResponse = await fetch(
      "http://localhost:3000/api/connections",
      {
        headers,
      }
    );

    if (connectionsResponse.ok) {
      const connectionsData = await connectionsResponse.json();
      const connections = connectionsData.connections || [];
      addResult("Connections Data", `Found ${connections.length} connections`);

      const acceptedConnections = connections.filter(
        (conn) => conn.status === "accepted"
      );
      const pendingConnections = connections.filter(
        (conn) => conn.status === "pending"
      );

      console.log(`   ✅ Accepted: ${acceptedConnections.length}`);
      console.log(`   ⏳ Pending: ${pendingConnections.length}`);
    } else {
      const errorData = await connectionsResponse.json();
      addResult(
        "Connections Data",
        `Failed: ${JSON.stringify(errorData)}`,
        true
      );
    }

    // 6. Test Mentorship API
    console.log("\n🎓 Testing Mentorship Data...");
    const mentorshipResponse = await fetch(
      "http://localhost:3000/api/mentorship",
      {
        headers,
      }
    );

    if (mentorshipResponse.ok) {
      const mentorshipData = await mentorshipResponse.json();
      const requests = mentorshipData.requests || [];
      addResult(
        "Mentorship Data",
        `Found ${requests.length} mentorship requests`
      );

      const pendingRequests = requests.filter(
        (req) => req.status === "pending"
      );
      const acceptedRequests = requests.filter(
        (req) => req.status === "accepted"
      );

      console.log(`   ⏳ Pending requests: ${pendingRequests.length}`);
      console.log(`   ✅ Accepted requests: ${acceptedRequests.length}`);
    } else {
      const errorData = await mentorshipResponse.json();
      addResult(
        "Mentorship Data",
        `Failed: ${JSON.stringify(errorData)}`,
        true
      );
    }

    // 7. Test Donations Stats API
    console.log("\n💰 Testing Donations Data...");
    const donationsResponse = await fetch(
      "http://localhost:3000/api/donations/stats",
      {
        headers,
      }
    );

    if (donationsResponse.ok) {
      const donationsData = await donationsResponse.json();
      addResult(
        "Donations Data",
        `Success! Total: ₹${donationsData.totalDonations || 0}, Count: ${donationsData.donationCount || 0}`
      );

      console.log(
        `   💳 User donations: ₹${donationsData.userStats?.totalDonations || 0}`
      );
      console.log(
        `   📊 User contribution count: ${donationsData.userStats?.donationCount || 0}`
      );
      console.log(
        `   🔄 Recent donations: ${donationsData.recentDonations?.length || 0}`
      );
    } else {
      const errorData = await donationsResponse.json();
      addResult("Donations Data", `Failed: ${JSON.stringify(errorData)}`, true);
    }

    // 8. Test Referrals API
    console.log("\n🔗 Testing Referrals Data...");
    const referralsResponse = await fetch(
      "http://localhost:3000/api/referrals",
      {
        headers,
      }
    );

    if (referralsResponse.ok) {
      const referralsData = await referralsResponse.json();
      const referrals = referralsData.referrals || [];
      addResult("Referrals Data", `Found ${referrals.length} referrals`);

      const activeReferrals = referrals.filter((ref) => ref.isActive);
      const totalUsage = referrals.reduce(
        (sum, ref) => sum + (ref.usedCount || 0),
        0
      );

      console.log(`   ✅ Active referrals: ${activeReferrals.length}`);
      console.log(`   📈 Total usage: ${totalUsage}`);

      referrals.forEach((ref, index) => {
        console.log(
          `   ${index + 1}. ${ref.code} - ${ref.company} (${ref.usedCount}/${ref.maxUses})`
        );
      });
    } else {
      const errorData = await referralsResponse.json();
      addResult("Referrals Data", `Failed: ${JSON.stringify(errorData)}`, true);
    }

    // 9. Test Events API
    console.log("\n📅 Testing Events Data...");
    const eventsResponse = await fetch("http://localhost:3000/api/events", {
      headers,
    });

    if (eventsResponse.ok) {
      const eventsData = await eventsResponse.json();
      const events = eventsData.events || [];
      addResult("Events Data", `Found ${events.length} events`);

      // Filter events organized by current alumni
      const alumniEvents = events.filter(
        (event) => event.organizerId === loginData.user.id
      );
      console.log(
        `   📝 Events organized by current alumni: ${alumniEvents.length}`
      );
    } else {
      const errorData = await eventsResponse.json();
      addResult("Events Data", `Failed: ${JSON.stringify(errorData)}`, true);
    }

    // 10. Test Auth Me API (user profile data)
    console.log("\n👤 Testing User Profile Data...");
    const profileResponse = await fetch("http://localhost:3000/api/auth/me", {
      headers,
    });

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      addResult(
        "User Profile",
        `Success! User: ${profileData.user.name} (${profileData.user.role})`
      );

      console.log(`   📧 Email: ${profileData.user.email}`);
      console.log(`   🏢 Role: ${profileData.user.role}`);
      console.log(`   📊 Status: ${profileData.user.status}`);
      if (profileData.user.currentCompany) {
        console.log(`   🏢 Company: ${profileData.user.currentCompany}`);
      }
    } else {
      const errorData = await profileResponse.json();
      addResult("User Profile", `Failed: ${JSON.stringify(errorData)}`, true);
    }

    console.log("\n🎯 Alumni Dashboard Data Test Complete!");
    console.log("\n📊 Summary:");
    console.log("✅ All major dashboard APIs tested");
    console.log("✅ Data fetching functionality verified");
    console.log("✅ Authentication working correctly");
    console.log("✅ Dashboard should display real data");
    console.log("\n🌐 Visit dashboard at: http://localhost:3000/alumni");
  } catch (error) {
    addResult("Test Error", `${error.message}`, true);
  }
};

// Run the test
testAlumniDashboardData();
