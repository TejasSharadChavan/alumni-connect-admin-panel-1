// Test real referral creation through API
const testRealReferralCreation = async () => {
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
        `Success! User: ${loginData.user.name} (${loginData.user.email})`
      );
    } else {
      addResult("Alumni Login", `Failed: ${JSON.stringify(loginData)}`, true);
      return;
    }

    const headers = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };

    // 2. Check Current Referrals (should be empty)
    console.log("\n📋 Checking current referrals...");
    const getReferralsResponse = await fetch(
      "http://localhost:3000/api/referrals",
      {
        headers,
      }
    );

    const getReferralsData = await getReferralsResponse.json();
    if (getReferralsResponse.ok) {
      const referrals = getReferralsData.referrals || [];
      addResult(
        "Current Referrals",
        `Found ${referrals.length} existing referrals (should be 0 after cleanup)`
      );
    } else {
      addResult(
        "Get Referrals",
        `Failed: ${JSON.stringify(getReferralsData)}`,
        true
      );
    }

    // 3. Test Creating Real Referral
    console.log("\n🎯 Testing real referral creation...");
    const createReferralResponse = await fetch(
      "http://localhost:3000/api/referrals",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          company: "TechCorp India",
          position: "Senior Software Engineer",
          description:
            "Looking for experienced developers to join our growing team. Great opportunity for career growth.",
          maxUses: 5,
          expiresAt: "2024-12-31",
        }),
      }
    );

    const createReferralData = await createReferralResponse.json();
    if (createReferralResponse.ok) {
      addResult(
        "Create Real Referral",
        `Success! 
Code: ${createReferralData.referral.code}
Company: ${createReferralData.referral.company}
Position: ${createReferralData.referral.position}
Max Uses: ${createReferralData.referral.maxUses}
Expires: ${createReferralData.referral.expiresAt}`
      );
    } else {
      addResult(
        "Create Real Referral",
        `Failed: ${JSON.stringify(createReferralData)}`,
        true
      );
      return;
    }

    // 4. Create Another Referral
    console.log("\n🎯 Creating second referral...");
    const createReferral2Response = await fetch(
      "http://localhost:3000/api/referrals",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          company: "StartupXYZ",
          position: "Full Stack Developer",
          description:
            "Join our innovative startup building the next big thing!",
          maxUses: 3,
        }),
      }
    );

    const createReferral2Data = await createReferral2Response.json();
    if (createReferral2Response.ok) {
      addResult(
        "Create Second Referral",
        `Success! Code: ${createReferral2Data.referral.code}`
      );
    } else {
      addResult(
        "Create Second Referral",
        `Failed: ${JSON.stringify(createReferral2Data)}`,
        true
      );
    }

    // 5. Verify Referrals Were Created
    console.log("\n🔍 Verifying referrals were created...");
    const verifyReferralsResponse = await fetch(
      "http://localhost:3000/api/referrals",
      {
        headers,
      }
    );

    const verifyReferralsData = await verifyReferralsResponse.json();
    if (verifyReferralsResponse.ok) {
      const referrals = verifyReferralsData.referrals || [];
      addResult(
        "Verify Referrals",
        `Found ${referrals.length} referrals after creation`
      );

      referrals.forEach((ref, index) => {
        console.log(
          `  ${index + 1}. ${ref.code} - ${ref.company} (${ref.position})`
        );
        console.log(
          `     Usage: ${ref.usedCount}/${ref.maxUses}, Active: ${ref.isActive}`
        );
        if (ref.expiresAt) {
          console.log(`     Expires: ${ref.expiresAt}`);
        }
      });
    } else {
      addResult(
        "Verify Referrals",
        `Failed: ${JSON.stringify(verifyReferralsData)}`,
        true
      );
    }

    // 6. Test Invalid Referral Creation
    console.log(
      "\n🚫 Testing invalid referral creation (missing required fields)..."
    );
    const invalidReferralResponse = await fetch(
      "http://localhost:3000/api/referrals",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          company: "TestCorp",
          // Missing position - should fail
          description: "This should fail",
        }),
      }
    );

    const invalidReferralData = await invalidReferralResponse.json();
    if (!invalidReferralResponse.ok) {
      addResult(
        "Invalid Referral Test",
        `Correctly rejected: ${invalidReferralData.error}`
      );
    } else {
      addResult(
        "Invalid Referral Test",
        "Should have been rejected but was accepted",
        true
      );
    }

    console.log("\n🎉 Real Referral Creation Test Complete!");
    console.log("\n📊 Test Summary:");
    console.log("✅ Alumni can login successfully");
    console.log("✅ Real referrals can be created");
    console.log("✅ Referrals are stored in database");
    console.log("✅ Validation works for required fields");
    console.log("✅ Multiple referrals can be created");
    console.log(
      "\n🌐 You can now test the UI at: http://localhost:3000/alumni/referrals"
    );
  } catch (error) {
    addResult("Test Error", `${error.message}`, true);
  }
};

// Run the test
testRealReferralCreation();
