import { db } from "../src/db";
import { users } from "../src/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

async function resetPassword() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(
      "❌ Usage: bun run scripts/reset-password.ts <email> <new-password>"
    );
    console.log("\nExample:");
    console.log(
      "  bun run scripts/reset-password.ts aarav.sharma@terna.ac.in password123"
    );
    process.exit(1);
  }

  const email = args[0];
  const newPassword = args[1];

  console.log("🔐 Resetting password...");
  console.log(`   Email: ${email}`);
  console.log(`   New Password: ${newPassword}\n`);

  // Find user
  const userResults = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()))
    .limit(1);

  if (userResults.length === 0) {
    console.log("❌ User not found!");
    process.exit(1);
  }

  const user = userResults[0];
  console.log("✅ User found:");
  console.log(`   Name: ${user.name}`);
  console.log(`   Role: ${user.role}`);
  console.log(`   Status: ${user.status}\n`);

  // Hash new password
  console.log("🔒 Hashing new password...");
  const passwordHash = await bcrypt.hash(newPassword, 10);
  console.log("✅ Password hashed\n");

  // Update password
  console.log("💾 Updating database...");
  await db
    .update(users)
    .set({
      passwordHash,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(users.id, user.id));

  console.log("✅ Password updated successfully!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n🎉 You can now login with:");
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${newPassword}`);
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

resetPassword()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
