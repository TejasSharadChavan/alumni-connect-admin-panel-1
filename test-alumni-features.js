// Comprehensive Alumni Features Test
const testAlumniFeatures = async () => {
  let authToken = null;

  const addResult = (title, content, isError = false) => {
    console.log(`\n${isError ? "❌" : "✅"} ${title}`);
    console.log(content);
  };

  try {
    // 1. Test Login
    const loginResponse = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "rahul.agarwal@gmail.com",
        password: "Password@123",
      }),
    });

    const loginData = await loginResponse.json();
    if (loginData.success) {
      authToken = loginData.token;
      addResult(
        "Alumni Login",
        `Success! Token: ${authToken.substring(0, 20)}...`
      );
    } else {
      addResult("Alumni Login", `Failed: ${JSON.stringify(loginData)}`, true);
      return;
    }

    const headers = { Authorization: `Bearer ${authToken}` };

    // 2. Test Connections API
    const connectionsResponse = await fetch(
      "http://localhost:3000/api/connections",
      { headers }
    );
    const connectionsData = await connectionsResponse.json();

    if (connectionsResponse.ok) {
      const connections = connectionsData.connections || [];
      addResult("Connections API", `Found ${connections.length} connections`);
    } else {
      addResult(
        "Connections API",
        `Failed: ${JSON.stringify(connectionsData)}`,
        true
      );
    }

    // 3. Test Jobs API
    const jobsResponse = await fetch("http://localhost:3000/api/jobs", {
      headers,
    });
    const jobsData = await jobsResponse.json();

    if (jobsResponse.ok) {
      const jobs = jobsData.jobs || [];
      addResult("Jobs API", `Found ${jobs.length} jobs`);

      // Test job details if jobs exist
      if (jobs.length > 0) {
        const jobDetailsResponse = await fetch(
          `http://localhost:3000/api/jobs/${jobs[0].id}`,
          { headers }
        );
        const jobDetailsData = await jobDetailsResponse.json();

        if (jobDetailsResponse.ok && jobDetailsData.success) {
          addResult(
            "Job Details API",
            `Job details loaded: ${jobDetailsData.job.title}`
          );
        } else {
          addResult(
            "Job Details API",
            `Failed: ${JSON.stringify(jobDetailsData)}`,
            true
          );
        }
      }
    } else {
      addResult("Jobs API", `Failed: ${JSON.stringify(jobsData)}`, true);
    }

    // 4. Test Events API
    const eventsResponse = await fetch("http://localhost:3000/api/events", {
      headers,
    });
    const eventsData = await eventsResponse.json();

    if (eventsResponse.ok) {
      const events = eventsData.events || [];
      addResult("Events API", `Found ${events.length} events`);
    } else {
      addResult("Events API", `Failed: ${JSON.stringify(eventsData)}`, true);
    }

    // 5. Test Messages/Chats API
    const chatsResponse = await fetch("http://localhost:3000/api/chats", {
      headers,
    });
    const chatsData = await chatsResponse.json();

    if (chatsResponse.ok) {
      const chats = chatsData.chats || [];
      addResult("Chats API", `Found ${chats.length} chats`);
    } else {
      addResult("Chats API", `Failed: ${JSON.stringify(chatsData)}`, true);
    }

    // 6. Test Users API (for network)
    const usersResponse = await fetch("http://localhost:3000/api/users", {
      headers,
    });
    const usersData = await usersResponse.json();

    if (usersResponse.ok) {
      const users = usersData.users || [];
      addResult("Users API", `Found ${users.length} users`);
    } else {
      addResult("Users API", `Failed: ${JSON.stringify(usersData)}`, true);
    }

    // 7. Test Donations API
    const donationsResponse = await fetch(
      "http://localhost:3000/api/donations",
      { headers }
    );
    const donationsData = await donationsResponse.json();

    if (donationsResponse.ok) {
      const campaigns = donationsData.campaigns || [];
      addResult("Donations API", `Found ${campaigns.length} campaigns`);
    } else {
      addResult(
        "Donations API",
        `Failed: ${JSON.stringify(donationsData)}`,
        true
      );
    }

    console.log("\n🎯 Alumni Features Test Complete!");
  } catch (error) {
    addResult("Test Error", `${error.message}`, true);
  }
};

// Run the test
testAlumniFeatures();
