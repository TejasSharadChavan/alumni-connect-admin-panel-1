// Test the login API directly
async function testLoginAPI() {
  const testEmail = "aarav.sharma@terna.ac.in";
  const testPassword = "password123";

  console.log("🧪 Testing Login API...\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📧 Email: ${testEmail}`);
  console.log(`🔑 Password: ${testPassword}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  try {
    console.log(
      "📡 Sending POST request to http://localhost:3000/api/auth/login...\n"
    );

    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    console.log(
      `📊 Response Status: ${response.status} ${response.statusText}\n`
    );

    const data = await response.json();

    if (response.ok) {
      console.log("✅ LOGIN SUCCESSFUL!\n");
      console.log("Response Data:");
      console.log(JSON.stringify(data, null, 2));
      console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("✅ API is working correctly!");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    } else {
      console.log("❌ LOGIN FAILED!\n");
      console.log("Error Response:");
      console.log(JSON.stringify(data, null, 2));
      console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("❌ API returned an error");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    }
  } catch (error) {
    console.log("❌ REQUEST FAILED!\n");
    console.log("Error:", error);
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("❌ Could not connect to API");
    console.log("💡 Make sure dev server is running:");
    console.log("   cd alumni-connect-admin-panel-1");
    console.log("   bun run dev");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  }
}

testLoginAPI();
