import { db } from "../src/db";
import { users, sessions, activityLog } from "../src/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

async function debugLogin() {
  console.log("🔍 Debugging Login System...\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const testEmail = "aarav.sharma@terna.ac.in";
  const testPassword = "password123";

  try {
    // Step 1: Check database connection
    console.log("1️⃣ Testing database connection...");
    const allUsers = await db.select().from(users).limit(1);
    console.log("   ✅ Database connected\n");

    // Step 2: Find user
    console.log("2️⃣ Finding user...");
    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.email, testEmail))
      .limit(1);

    if (userResults.length === 0) {
      console.log("   ❌ User not found!");
      return;
    }

    const user = userResults[0];
    console.log("   ✅ User found:");
    console.log(`      Name: ${user.name}`);
    console.log(`      Email: ${user.email}`);
    console.log(`      Role: ${user.role}`);
    console.log(`      Status: ${user.status}\n`);

    // Step 3: Check status
    console.log("3️⃣ Checking user status...");
    if (user.status === "active" || user.status === "approved") {
      console.log(`   ✅ Status '${user.status}' is valid\n`);
    } else {
      console.log(`   ❌ Status '${user.status}' is NOT valid\n`);
      return;
    }

    // Step 4: Verify password
    console.log("4️⃣ Verifying password...");
    const passwordMatch = await bcrypt.compare(testPassword, user.passwordHash);
    if (passwordMatch) {
      console.log("   ✅ Password matches\n");
    } else {
      console.log("   ❌ Password does NOT match\n");
      return;
    }

    // Step 5: Test session creation
    console.log("5️⃣ Testing session creation...");
    const token = "test-token-" + Date.now();
    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString();
    const createdAt = new Date().toISOString();

    try {
      const newSession = await db
        .insert(sessions)
        .values({
          userId: user.id,
          token,
          expiresAt,
          createdAt,
          ipAddress: "127.0.0.1",
          userAgent: "test",
        })
        .returning();

      console.log("   ✅ Session created successfully");
      console.log(`      Session ID: ${newSession[0].id}\n`);

      // Clean up test session
      await db.delete(sessions).where(eq(sessions.id, newSession[0].id));
      console.log("   ✅ Test session cleaned up\n");
    } catch (sessionError) {
      console.log("   ❌ Session creation failed!");
      console.log("   Error:", sessionError);
      return;
    }

    // Step 6: Test activity log
    console.log("6️⃣ Testing activity log...");
    try {
      await db.insert(activityLog).values({
        userId: user.id,
        role: user.role,
        action: "test_login",
        metadata: JSON.stringify({ test: true }),
        timestamp: createdAt,
      });
      console.log("   ✅ Activity log created successfully\n");
    } catch (logError) {
      console.log("   ⚠️  Activity log failed (non-critical)");
      console.log("   Error:", logError);
      console.log();
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n✅ ALL CHECKS PASSED!");
    console.log("\n💡 Login should work. If it doesn't:");
    console.log("   1. Check browser console for errors");
    console.log("   2. Check Network tab for API response");
    console.log("   3. Make sure you're using the correct credentials:");
    console.log(`      Email: ${testEmail}`);
    console.log(`      Password: ${testPassword}`);
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  } catch (error) {
    console.log("\n❌ ERROR OCCURRED!");
    console.log("\nError details:");
    console.log(error);
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  }
}

debugLogin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
