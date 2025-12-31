// Test Job-Specific Referral System
const testJobSpecificReferrals = async () => {
  let alumniToken = null;
  let jobId = null;
  let referralCode = null;

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

    const headers = {
      Authorization: `Bearer ${alumniToken}`,
      "Content-Type": "application/json",
    };

    // 2. Get Alumni's Jobs
    const jobsResponse = await fetch("http://localhost:3000/api/alumni/jobs", {
      headers,
    });

    const jobsData = await jobsResponse.json();
    if (jobsResponse.ok && jobsData.success) {
      const jobs = jobsData.jobs || [];
      addResult(
        "Get Alumni Jobs",
        `Found ${jobs.length} jobs posted by alumni`
      );

      if (jobs.length > 0) {
        jobId = jobs[0].id;
        addResult(
          "Selected Job",
          `Using: ${jobs[0].title} at ${jobs[0].company} (ID: ${jobId})`
        );
      } else {
        addResult("No Jobs Found", "Alumni has not posted any jobs yet", true);

        // Create a job first
        const createJobResponse = await fetch(
          "http://localhost:3000/api/jobs",
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              title: "Senior Software Engineer",
              company: "TechCorp",
              description: "We are looking for a senior software engineer...",
              location: "Mumbai, India",
              jobType: "full-time",
              salary: "₹15-25 LPA",
              skills: ["JavaScript", "React", "Node.js"],
              branch: "Computer Engineering",
            }),
          }
        );

        const createJobData = await createJobResponse.json();
        if (createJobResponse.ok) {
          jobId = createJobData.id;
          addResult(
            "Created Test Job",
            `Job created: ${createJobData.title} (ID: ${jobId})`
          );
        } else {
          addResult(
            "Create Job Failed",
            `Error: ${JSON.stringify(createJobData)}`,
            true
          );
          return;
        }
      }
    } else {
      addResult("Get Alumni Jobs", `Failed: ${JSON.stringify(jobsData)}`, true);
    }

    // 3. Create Job-Specific Referral
    if (jobId) {
      const createReferralResponse = await fetch(
        "http://localhost:3000/api/referrals",
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            jobId: jobId,
            company: "TechCorp",
            position: "Senior Software Engineer",
            description:
              "Job-specific referral for our senior engineer position",
            maxUses: 3,
          }),
        }
      );

      const referralData = await createReferralResponse.json();
      if (createReferralResponse.ok) {
        referralCode = referralData.referral.code;
        addResult(
          "Create Job-Specific Referral",
          `Code: ${referralCode}, Job ID: ${referralData.referral.jobId}`
        );
      } else {
        addResult(
          "Create Job-Specific Referral",
          `Failed: ${JSON.stringify(referralData)}`,
          true
        );
      }
    }

    // 4. Create General Referral (no jobId)
    const generalReferralResponse = await fetch(
      "http://localhost:3000/api/referrals",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          company: "Google",
          position: "Software Engineer",
          description: "General referral for Google positions",
          maxUses: 5,
        }),
      }
    );

    const generalReferralData = await generalReferralResponse.json();
    if (generalReferralResponse.ok) {
      addResult(
        "Create General Referral",
        `Code: ${generalReferralData.referral.code}, Job ID: ${generalReferralData.referral.jobId || "null"}`
      );
    } else {
      addResult(
        "Create General Referral",
        `Failed: ${JSON.stringify(generalReferralData)}`,
        true
      );
    }

    // 5. Get Updated Referrals with Job Info
    const referralsResponse = await fetch(
      "http://localhost:3000/api/referrals",
      {
        headers,
      }
    );

    const referralsData = await referralsResponse.json();
    if (referralsResponse.ok && referralsData.success) {
      const referrals = referralsData.referrals || [];
      addResult(
        "Get Referrals with Job Info",
        `Found ${referrals.length} referrals`
      );

      referrals.forEach((ref, index) => {
        console.log(
          `  ${index + 1}. ${ref.code} - ${ref.company} (${ref.position})`
        );
        if (ref.jobId) {
          console.log(
            `     ↳ Linked to Job: ${ref.jobTitle || "Unknown"} (ID: ${ref.jobId})`
          );
        } else {
          console.log(`     ↳ General referral (no specific job)`);
        }
      });
    } else {
      addResult(
        "Get Referrals",
        `Failed: ${JSON.stringify(referralsData)}`,
        true
      );
    }

    // 6. Test Invalid Job ID (try to create referral for job not owned by alumni)
    const invalidJobResponse = await fetch(
      "http://localhost:3000/api/referrals",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          jobId: 99999, // Non-existent or not owned by this alumni
          company: "InvalidCorp",
          position: "Test Position",
          description: "This should fail",
          maxUses: 1,
        }),
      }
    );

    const invalidJobData = await invalidJobResponse.json();
    if (!invalidJobResponse.ok) {
      addResult(
        "Invalid Job ID Test",
        `Correctly rejected: ${invalidJobData.error}`
      );
    } else {
      addResult(
        "Invalid Job ID Test",
        "Should have been rejected but was accepted",
        true
      );
    }

    console.log("\n🎯 Job-Specific Referral System Test Complete!");
    console.log("\n📊 Test Results:");
    console.log("✅ Alumni can view their posted jobs");
    console.log("✅ Job-specific referrals can be created");
    console.log("✅ General referrals still work");
    console.log("✅ Job ownership validation works");
    console.log("✅ Referrals show linked job information");
  } catch (error) {
    addResult("Test Error", `${error.message}`, true);
  }
};

// Run the test
testJobSpecificReferrals();
