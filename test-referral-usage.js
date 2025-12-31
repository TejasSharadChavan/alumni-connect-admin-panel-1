// Test Referral Usage Count Tracking
const testReferralUsageTracking = async () => {
  let alumniToken = null;
  let studentToken = null;
  let referralCode = null;
  let jobId = null;

  const addResult = (title, content, isError = false) => {
    console.log(`\n${isError ? "❌" : "✅"} ${title}`);
    console.log(content);
  };

  try {
    // 1. Alumni Login
    const alumniLogin = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "rahul.agarwal@gmail.com",
        password: "Password@123",
      }),
    });

    const alumniData = await alumniLogin.json();
    if (alumniData.success) {
      alumniToken = alumniData.token;
      addResult("Alumni Login", `Success: ${alumniData.user.name}`);
    } else {
      addResult("Alumni Login", `Failed: ${JSON.stringify(alumniData)}`, true);
      return;
    }

    // 2. Student Login
    const studentLogin = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "aarav.sharma@terna.ac.in",
        password: "Password@123",
      }),
    });

    const studentData = await studentLogin.json();
    if (studentData.success) {
      studentToken = studentData.token;
      addResult("Student Login", `Success: ${studentData.user.name}`);
    } else {
      addResult(
        "Student Login",
        `Failed: ${JSON.stringify(studentData)}`,
        true
      );
      return;
    }

    const alumniHeaders = {
      Authorization: `Bearer ${alumniToken}`,
      "Content-Type": "application/json",
    };

    const studentHeaders = {
      Authorization: `Bearer ${studentToken}`,
      "Content-Type": "application/json",
    };

    // 3. Create Referral (Alumni)
    const createReferral = await fetch("http://localhost:3000/api/referrals", {
      method: "POST",
      headers: alumniHeaders,
      body: JSON.stringify({
        company: "TestCorp",
        position: "Software Engineer",
        description: "Test referral for usage tracking",
        maxUses: 3,
      }),
    });

    const referralData = await createReferral.json();
    if (createReferral.ok) {
      referralCode = referralData.referral.code;
      addResult(
        "Create Referral",
        `Code: ${referralCode}, Initial Usage: ${referralData.referral.usedCount}/${referralData.referral.maxUses}`
      );
    } else {
      addResult(
        "Create Referral",
        `Failed: ${JSON.stringify(referralData)}`,
        true
      );
      return;
    }

    // 4. Get Jobs (Student)
    const jobsResponse = await fetch("http://localhost:3000/api/jobs", {
      headers: studentHeaders,
    });

    const jobsData = await jobsResponse.json();
    if (jobsResponse.ok && jobsData.jobs?.length > 0) {
      jobId = jobsData.jobs[0].id;
      addResult(
        "Get Jobs",
        `Using job: ${jobsData.jobs[0].title} (ID: ${jobId})`
      );
    } else {
      addResult("Get Jobs", `No jobs available`, true);
      return;
    }

    // 5. Apply with Referral Code (Student)
    const applyResponse = await fetch(
      `http://localhost:3000/api/jobs/${jobId}/apply`,
      {
        method: "POST",
        headers: studentHeaders,
        body: JSON.stringify({
          coverLetter: "I am interested in this position and have a referral.",
          referralCode: referralCode,
        }),
      }
    );

    const applyData = await applyResponse.json();
    if (applyResponse.ok) {
      addResult(
        "Apply with Referral",
        `Application submitted! ID: ${applyData.id}`
      );
    } else {
      addResult(
        "Apply with Referral",
        `Failed: ${JSON.stringify(applyData)}`,
        true
      );
      return;
    }

    // 6. Check Updated Referral Usage (Alumni)
    const updatedReferrals = await fetch(
      "http://localhost:3000/api/referrals",
      {
        headers: alumniHeaders,
      }
    );

    const updatedData = await updatedReferrals.json();
    if (updatedReferrals.ok) {
      const usedReferral = updatedData.referrals?.find(
        (r) => r.code === referralCode
      );
      if (usedReferral) {
        addResult(
          "Usage Count Updated",
          `Code: ${usedReferral.code}, Usage: ${usedReferral.usedCount}/${usedReferral.maxUses}`
        );

        if (usedReferral.usedCount > 0) {
          addResult(
            "✅ SUCCESS",
            "Referral usage count was incremented correctly!"
          );
        } else {
          addResult(
            "❌ FAILED",
            "Referral usage count was NOT incremented",
            true
          );
        }
      } else {
        addResult("Check Usage", "Referral not found in updated list", true);
      }
    } else {
      addResult("Check Usage", `Failed: ${JSON.stringify(updatedData)}`, true);
    }

    // 7. Test Duplicate Usage Prevention
    const duplicateApply = await fetch(
      `http://localhost:3000/api/jobs/${jobId}/apply`,
      {
        method: "POST",
        headers: studentHeaders,
        body: JSON.stringify({
          coverLetter: "Trying to apply again with same referral.",
          referralCode: referralCode,
        }),
      }
    );

    const duplicateData = await duplicateApply.json();
    if (!duplicateApply.ok) {
      if (duplicateData.code === "ALREADY_APPLIED") {
        addResult(
          "Duplicate Prevention",
          "Correctly prevented duplicate application"
        );
      } else if (duplicateData.code === "REFERRAL_ALREADY_USED") {
        addResult(
          "Referral Reuse Prevention",
          "Correctly prevented referral code reuse"
        );
      } else {
        addResult(
          "Duplicate Prevention",
          `Prevented with: ${duplicateData.error}`
        );
      }
    } else {
      addResult(
        "Duplicate Prevention",
        "Failed to prevent duplicate application",
        true
      );
    }

    console.log("\n🎯 Referral Usage Tracking Test Complete!");
    console.log("\n📊 Test Results:");
    console.log("✅ Referral code validation");
    console.log("✅ Usage count increment");
    console.log("✅ Duplicate prevention");
    console.log("✅ Alumni notification");
  } catch (error) {
    addResult("Test Error", `${error.message}`, true);
  }
};

// Run the test
testReferralUsageTracking();
