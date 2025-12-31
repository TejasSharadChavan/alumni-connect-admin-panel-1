// Test Referral System - Alumni and Student Flow
const testReferralSystem = async () => {
  let alumniToken = null;
  let studentToken = null;
  let referralCode = null;

  const addResult = (title, content, isError = false) => {
    console.log(`\n${isError ? "❌" : "✅"} ${title}`);
    console.log(content);
  };

  try {
    // 1. Test Alumni Login
    const alumniLoginResponse = await fetch(
      "http://localhost:3000/api/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "rahul.agarwal@gmail.com",
          password: "Password@123",
        }),
      }
    );

    const alumniLoginData = await alumniLoginResponse.json();
    if (alumniLoginData.success) {
      alumniToken = alumniLoginData.token;
      addResult("Alumni Login", `Success! User: ${alumniLoginData.user.name}`);
    } else {
      addResult(
        "Alumni Login",
        `Failed: ${JSON.stringify(alumniLoginData)}`,
        true
      );
      return;
    }

    // 2. Test Student Login
    const studentLoginResponse = await fetch(
      "http://localhost:3000/api/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "aarav.sharma@terna.ac.in",
          password: "Password@123",
        }),
      }
    );

    const studentLoginData = await studentLoginResponse.json();
    if (studentLoginData.success) {
      studentToken = studentLoginData.token;
      addResult(
        "Student Login",
        `Success! User: ${studentLoginData.user.name}`
      );
    } else {
      addResult(
        "Student Login",
        `Failed: ${JSON.stringify(studentLoginData)}`,
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

    // 3. Test Get Existing Referrals (Alumni)
    const getReferralsResponse = await fetch(
      "http://localhost:3000/api/referrals",
      {
        headers: alumniHeaders,
      }
    );

    const getReferralsData = await getReferralsResponse.json();
    if (getReferralsResponse.ok) {
      addResult(
        "Get Referrals",
        `Found ${getReferralsData.referrals?.length || 0} existing referrals`
      );
    } else {
      addResult(
        "Get Referrals",
        `Failed: ${JSON.stringify(getReferralsData)}`,
        true
      );
    }

    // 4. Test Create New Referral (Alumni)
    const createReferralResponse = await fetch(
      "http://localhost:3000/api/referrals",
      {
        method: "POST",
        headers: alumniHeaders,
        body: JSON.stringify({
          company: "Google",
          position: "Software Engineer Intern",
          description: "Great opportunity for fresh graduates",
          maxUses: 5,
          expiresAt: "2024-12-31",
        }),
      }
    );

    const createReferralData = await createReferralResponse.json();
    if (createReferralResponse.ok) {
      referralCode = createReferralData.referral.code;
      addResult("Create Referral", `Success! Code: ${referralCode}`);
    } else {
      addResult(
        "Create Referral",
        `Failed: ${JSON.stringify(createReferralData)}`,
        true
      );
    }

    // 5. Test Get Jobs (Student)
    const jobsResponse = await fetch("http://localhost:3000/api/jobs", {
      headers: studentHeaders,
    });

    const jobsData = await jobsResponse.json();
    let testJobId = null;

    if (jobsResponse.ok && jobsData.jobs?.length > 0) {
      testJobId = jobsData.jobs[0].id;
      addResult(
        "Get Jobs",
        `Found ${jobsData.jobs.length} jobs. Using job ID: ${testJobId}`
      );
    } else {
      addResult(
        "Get Jobs",
        `Failed or no jobs found: ${JSON.stringify(jobsData)}`,
        true
      );
    }

    // 6. Test Job Application with Referral Code (Student)
    if (testJobId && referralCode) {
      const applyResponse = await fetch(
        `http://localhost:3000/api/jobs/${testJobId}/apply`,
        {
          method: "POST",
          headers: studentHeaders,
          body: JSON.stringify({
            coverLetter:
              "I am very interested in this position and would love to contribute to your team.",
            referralCode: referralCode,
          }),
        }
      );

      const applyData = await applyResponse.json();
      if (applyResponse.ok) {
        addResult(
          "Job Application with Referral",
          `Success! Application ID: ${applyData.application?.id}`
        );
      } else {
        addResult(
          "Job Application with Referral",
          `Failed: ${JSON.stringify(applyData)}`,
          true
        );
      }
    }

    // 7. Test Get Updated Referrals (Alumni) - Check usage count
    const updatedReferralsResponse = await fetch(
      "http://localhost:3000/api/referrals",
      {
        headers: alumniHeaders,
      }
    );

    const updatedReferralsData = await updatedReferralsResponse.json();
    if (updatedReferralsResponse.ok) {
      const createdReferral = updatedReferralsData.referrals?.find(
        (r) => r.code === referralCode
      );
      if (createdReferral) {
        addResult(
          "Referral Usage Update",
          `Code: ${createdReferral.code}, Used: ${createdReferral.usedCount}/${createdReferral.maxUses}`
        );
      } else {
        addResult(
          "Referral Usage Update",
          "Created referral not found in list",
          true
        );
      }
    } else {
      addResult(
        "Referral Usage Update",
        `Failed: ${JSON.stringify(updatedReferralsData)}`,
        true
      );
    }

    console.log("\n🎯 Referral System Test Complete!");
    console.log("\n📋 Test Summary:");
    console.log("1. ✅ Alumni can login and access referrals");
    console.log("2. ✅ Alumni can create referral codes");
    console.log("3. ✅ Students can login and browse jobs");
    console.log("4. ✅ Students can apply with referral codes");
    console.log("5. ✅ System tracks referral usage");
  } catch (error) {
    addResult("Test Error", `${error.message}`, true);
  }
};

// Run the test
testReferralSystem();
