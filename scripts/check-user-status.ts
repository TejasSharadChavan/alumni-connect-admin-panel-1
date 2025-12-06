import { db } from "../src/db";
import { users } from "../src/db/schema";
import { eq, like } from "drizzle-orm";

async function checkUserStatus() {
  console.log("🔍 Checking user status...\n");

  // Check for aaravsharma
  const aaravResults = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
    })
    .from(users)
    .where(like(users.email, "%aarav%"));

  console.log("📧 Users matching 'aarav':");
  if (aaravResults.length === 0) {
    console.log("❌ No users found with 'aarav' in email");
  } else {
    aaravResults.forEach((user) => {
      console.log(`\n👤 User: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   ID: ${user.id}`);
    });
  }

  // Check all users and their statuses
  console.log("\n\n📊 All users status summary:");
  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
    })
    .from(users);

  const statusCounts: Record<string, number> = {};
  allUsers.forEach((user) => {
    statusCounts[user.status] = (statusCounts[user.status] || 0) + 1;
  });

  console.log("\nStatus breakdown:");
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`  ${status}: ${count} users`);
  });

  console.log("\n\n📋 All users:");
  allUsers.forEach((user) => {
    const statusIcon =
      user.status === "active" || user.status === "approved" ? "✅" : "❌";
    console.log(`${statusIcon} ${user.email} - ${user.role} - ${user.status}`);
  });

  console.log("\n\n💡 Login Requirements:");
  console.log("   Users can login if status is: 'active' OR 'approved'");
  console.log("   Users CANNOT login if status is: 'pending' or 'rejected'");
}

checkUserStatus()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
