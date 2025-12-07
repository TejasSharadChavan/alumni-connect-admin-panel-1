// Quick script to check referral-ready students
const fetch = require("node-fetch");

async function checkReferralReady() {
  try {
    // You'll need to get a valid token first
    const token = process.argv[2];

    if (!token) {
      console.log("Usage: node check-referral-ready.js <auth_token>");
      console.log("\nTo get your token:");
      console.log("1. Login to the app");
      console.log("2. Open browser console (F12)");
      console.log('3. Run: localStorage.getItem("auth_token")');
      console.log("4. Copy the token and run this script");
      return;
    }

    const response = await fetch(
      "http://localhost:3000/api/alumni/referral-ready",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    console.log("\n📊 Referral-Ready Students Report\n");
    console.log("=".repeat(50));
    console.log(`Total: ${data.referralReady.total}`);
    console.log(
      `Highly Ready (80%+): ${data.referralReady.highlyReady.length}`
    );
    console.log(`Ready (65-80%): ${data.referralReady.ready.length}`);
    console.log(`Emerging (50-65%): ${data.referralReady.emerging.length}`);
    console.log("=".repeat(50));

    if (data.referralReady.highlyReady.length > 0) {
      console.log("\n✅ Highly Ready Students:");
      data.referralReady.highlyReady.forEach((s) => {
        console.log(
          `  - ${s.name} (${s.readinessScore}%) - ${s.skills.length} skills, ${s.stats.projectCount} projects`
        );
      });
    }

    if (data.referralReady.ready.length > 0) {
      console.log("\n📘 Ready Students:");
      data.referralReady.ready.forEach((s) => {
        console.log(
          `  - ${s.name} (${s.readinessScore}%) - ${s.skills.length} skills, ${s.stats.projectCount} projects`
        );
      });
    }

    if (data.referralReady.emerging.length > 0) {
      console.log("\n🌱 Emerging Students:");
      data.referralReady.emerging.forEach((s) => {
        console.log(
          `  - ${s.name} (${s.readinessScore}%) - ${s.skills.length} skills, ${s.stats.projectCount} projects`
        );
      });
    }

    if (data.referralReady.total === 0) {
      console.log("\n❌ No referral-ready students found (need 50%+ score)");
      console.log("\nTo make students referral-ready, they need:");
      console.log("  - 5+ skills (25 points)");
      console.log(
        "  - Complete profile: headline, bio, image, resume (20 points)"
      );
      console.log("  - 3+ projects (25 points)");
      console.log("  - 5+ job applications (15 points)");
      console.log("  - Current/final year student (15 points)");
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkReferralReady();
