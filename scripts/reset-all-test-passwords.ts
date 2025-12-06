import { db } from "../src/db";
import { users } from "../src/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

async function resetAllTestPasswords() {
  console.log("🔐 Resetting passwords for all test users...\n");

  const testPassword = "password123";
  const passwordHash = await bcrypt.hash(testPassword, 10);

  // Get all users
  const allUsers = await db.select().from(users);

  console.log(`Found ${allUsers.length} users\n`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  let updated = 0;

  for (const user of allUsers) {
    try {
      await db
        .update(users)
        .set({
          passwordHash,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(users.id, user.id));

      console.log(`✅ ${user.email} (${user.role})`);
      updated++;
    } catch (error) {
      console.log(`❌ ${user.email} - Error: ${error}`);
    }
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`\n🎉 Updated ${updated} out of ${allUsers.length} users`);
  console.log("\n📝 All users can now login with:");
  console.log(`   Password: ${testPassword}`);
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n📋 Test Accounts:");
  console.log("\n👨‍🎓 Students:");
  allUsers
    .filter((u) => u.role === "student")
    .slice(0, 5)
    .forEach((u) => {
      console.log(`   ${u.email}`);
    });
  console.log("\n👨‍🏫 Alumni:");
  allUsers
    .filter((u) => u.role === "alumni")
    .slice(0, 5)
    .forEach((u) => {
      console.log(`   ${u.email}`);
    });
  console.log("\n👨‍💼 Faculty:");
  allUsers
    .filter((u) => u.role === "faculty")
    .slice(0, 3)
    .forEach((u) => {
      console.log(`   ${u.email}`);
    });
  console.log("\n👑 Admin:");
  allUsers
    .filter((u) => u.role === "admin")
    .slice(0, 2)
    .forEach((u) => {
      console.log(`   ${u.email}`);
    });
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

resetAllTestPasswords()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
