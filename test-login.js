const { createClient } = require("@libsql/client");
require("dotenv").config();

async function testLogin() {
  console.log("🔍 Testing database connection and users...\n");

  const client = createClient({
    url: process.env.TURSO_CONNECTION_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  try {
    // Check if users table exists and has data
    const result = await client.execute(
      "SELECT id, name, email, role, status FROM users LIMIT 10"
    );

    console.log(`✅ Found ${result.rows.length} users in database:\n`);

    result.rows.forEach((row) => {
      console.log(`  - ${row.name} (${row.email})`);
      console.log(`    Role: ${row.role}, Status: ${row.status}\n`);
    });

    // Check for admin user
    const adminResult = await client.execute(
      "SELECT id, name, email, role, status FROM users WHERE email = 'dean@terna.ac.in'"
    );

    if (adminResult.rows.length > 0) {
      console.log("✅ Admin user found:", adminResult.rows[0].name);
    } else {
      console.log("❌ Admin user (dean@terna.ac.in) not found!");
    }

    // Check sessions table
    const sessionsResult = await client.execute(
      "SELECT COUNT(*) as count FROM sessions"
    );
    console.log(`\n📊 Active sessions: ${sessionsResult.rows[0].count}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testLogin();
