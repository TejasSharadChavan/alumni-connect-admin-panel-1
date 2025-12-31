// Test script to verify job details API
const testJobDetails = async () => {
  try {
    // First login to get a valid token
    const loginResponse = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "rahul.agarwal@gmail.com",
        password: "Password@123",
      }),
    });

    if (!loginResponse.ok) {
      console.error("Login failed:", await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    console.log("Login successful:", loginData.success);

    const token = loginData.token;

    // Test job details API
    const jobResponse = await fetch("http://localhost:3000/api/jobs/1", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!jobResponse.ok) {
      console.error("Job details failed:", await jobResponse.text());
      return;
    }

    const jobData = await jobResponse.json();
    console.log("Job details response:", JSON.stringify(jobData, null, 2));
  } catch (error) {
    console.error("Test failed:", error);
  }
};

testJobDetails();
