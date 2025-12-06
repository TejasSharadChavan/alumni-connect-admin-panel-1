import { db } from "../src/db";
import { notifications, users } from "../src/db/schema";
import { eq, desc } from "drizzle-orm";

async function checkNotifications() {
  console.log("🔔 Checking Recent Notifications...\n");

  // Check for Aarav's notifications
  const aaravUser = await db
    .select()
    .from(users)
    .where(eq(users.email, "aarav.sharma@terna.ac.in"))
    .limit(1);

  if (aaravUser.length === 0) {
    console.log("❌ Aarav not found");
    return;
  }

  const aarav = aaravUser[0];
  console.log(`✅ Found user: ${aarav.name} (ID: ${aarav.id})\n`);

  // Get all notifications for Aarav
  const aaravNotifications = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, aarav.id))
    .orderBy(desc(notifications.createdAt))
    .limit(10);

  console.log(
    `📬 Total notifications for ${aarav.name}: ${aaravNotifications.length}\n`
  );

  if (aaravNotifications.length === 0) {
    console.log("❌ No notifications found");
    return;
  }

  console.log("Recent notifications:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  aaravNotifications.forEach((notif, index) => {
    const readStatus = notif.isRead ? "✓ Read" : "✉ Unread";
    console.log(`${index + 1}. ${readStatus}`);
    console.log(`   Type: ${notif.type}`);
    console.log(`   Title: ${notif.title}`);
    console.log(`   Message: ${notif.message}`);
    console.log(`   Created: ${new Date(notif.createdAt).toLocaleString()}`);
    console.log();
  });

  // Count by type
  const byType: Record<string, number> = {};
  aaravNotifications.forEach((n) => {
    byType[n.type] = (byType[n.type] || 0) + 1;
  });

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n📊 Notifications by type:");
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });

  const unreadCount = aaravNotifications.filter((n) => !n.isRead).length;
  console.log(`\n✉️  Unread: ${unreadCount}`);
  console.log(`✓  Read: ${aaravNotifications.length - unreadCount}`);
}

checkNotifications()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
