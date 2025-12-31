// Simple migration script to add job_id column to referrals table
const { createClient } = require("@libsql/client");
require("dotenv").config();

async function runMigration() {
  const client = createClient({
    url: process.env.TURSO_CONNECTION_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  try {
    console.log("🔄 Running migration: Add job_id column to referrals table");

    // Check if column already exists
    const tableInfo = await client.execute("PRAGMA table_info(referrals)");
    const hasJobId = tableInfo.rows.some((row) => row.name === "job_id");

    if (hasJobId) {
      console.log("✅ Column job_id already exists in referrals table");
      return;
    }

    // Add the job_id column
    await client.execute(`
      ALTER TABLE referrals 
      ADD COLUMN job_id INTEGER REFERENCES jobs(id)
    `);

    console.log("✅ Migration completed successfully!");
    console.log("📝 Added job_id column to referrals table");

    // Verify the column was added
    const updatedTableInfo = await client.execute(
      "PRAGMA table_info(referrals)"
    );
    const columns = updatedTableInfo.rows.map((row) => row.name);
    console.log("📊 Current referrals table columns:", columns);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    client.close();
  }
}

// Run the migration
runMigration();
