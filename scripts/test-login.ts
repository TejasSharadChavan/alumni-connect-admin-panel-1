import { db } from "../src/db";
import { users } from "../src/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

async function testLogin() {
  const testEmail = "aarav.sharma@terna.ac.in";
  const testPassword = "password123"; // Common test password

  console.log("🔐 Testing login for:", testEmail);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Find user
  const userResults = await db
    .select()
    .from(users)
    .where(eq(users.email, testEmail))
    .limit(1);

  if (userResults.length === 0) {
    console.log("❌ User not found!");
    return;
  }

  const user = userResults[0];
  console.log("✅ User found:");
  console.log(`   Name: ${user.name}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Role: ${user.role}`);
  console.log(`   Status: ${user.status}`);
  console.log(`   Password Hash: ${user.passwordHash.substring(0, 20)}...`);

  // Check status
  console.log("\n📋 Status Check:");
  if (user.status === "active" || user.status === "approved") {
    console.log(`   ✅ Status is '${user.status}' - Login allowed`);
  } else {
    console.log(`   ❌ Status is '${user.status}' - Login NOT allowed`);
    return;
  }

  // Test password
  console.log("\n🔑 Password Verification:");
  console.log(`   Testing password: "${testPassword}"`);

  try {
    const passwordMatch = await bcrypt.compare(testPassword, user.passwordHash);
    if (passwordMatch) {
      console.log("   ✅ Password matches!");
    } else {
      console.log("   ❌ Password does NOT match!");
      console.log("\n💡 Possible passwords to try:");
      console.log("   - password123");
      console.log("   - Password123");
      console.log("   - aarav123");
      console.log("   - Aarav@123");
    }
  } catch (error) {
    console.log("   ❌ Error verifying password:", error);
  }

  // Check if password hash looks valid
  console.log("\n🔍 Password Hash Analysis:");
  if (
    user.passwordHash.startsWith("$2b$") ||
    user.passwordHash.startsWith("$2a$")
  ) {
    console.log("   ✅ Hash format looks valid (bcrypt)");
  } else {
    console.log("   ❌ Hash format looks invalid!");
    console.log("   Expected: $2b$ or $2a$ prefix");
    console.log(`   Got: ${user.passwordHash.substring(0, 10)}...`);
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n📝 Summary:");
  console.log("   If password doesn't match, you need to:");
  console.log("   1. Reset the password in database, OR");
  console.log("   2. Use the correct password");
  console.log("\n   To reset password, run:");
  console.log(`   bun run scripts/reset-password.ts ${testEmail} newpassword`);
}

testLogin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
