// Script to clean dummy referrals and test real referral creation
const { createClient } = require("@libsql/client");
require("dotenv").config();

async function cleanAndTestReferrals() {
  const client = createClient({
    url: process.env.TURSO_CONNECTION_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  try {
    console.log("🔍 Checking current referrals...");

    // Check current referrals
    const currentReferrals = await client.execute("SELECT * FROM referrals");
    console.log(
      `📊 Found ${currentReferrals.rows.length} referrals in database`
    );

    if (currentReferrals.rows.length > 0) {
      console.log("📋 Current referrals:");
      currentReferrals.rows.forEach((row, index) => {
        console.log(
          `  ${index + 1}. ${row.code} - ${row.company} (${row.position}) - Alumni ID: ${row.alumni_id}`
        );
      });

      // Ask if user wants to delete all referrals
      console.log("\n🗑️  Deleting all existing referrals...");
      await client.execute("DELETE FROM referrals");
      console.log("✅ All referrals deleted");
    } else {
      console.log("✅ No referrals found - database is clean");
    }

    // Check if referral_usage table has entries
    const referralUsage = await client.execute("SELECT * FROM referral_usage");
    if (referralUsage.rows.length > 0) {
      console.log(
        `🗑️  Cleaning ${referralUsage.rows.length} referral usage records...`
      );
      await client.execute("DELETE FROM referral_usage");
      console.log("✅ Referral usage records cleaned");
    }

    // Verify tables are clean
    const finalCheck = await client.execute(
      "SELECT COUNT(*) as count FROM referrals"
    );
    console.log(
      `✅ Final verification: ${finalCheck.rows[0].count} referrals remaining`
    );

    console.log(
      "\n🎯 Database is now clean and ready for real referral testing!"
    );
    console.log(
      "📝 You can now test creating referrals through the UI at /alumni/referrals"
    );
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    client.close();
  }
}

// Run the cleanup
cleanAndTestReferrals();
