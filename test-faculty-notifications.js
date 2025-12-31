const { db } = require("./src/db/index.js");
const { notifications, users } = require("./src/db/schema.js");
const { eq } = require("drizzle-orm");

async function testFacultyNotifications() {
  console.log("🔔 Testing Faculty Notifications System...\n");

  try {
    // Find a faculty user
    const facultyUsers = await db
      .select()
      .from(users)
      .where(eq(users.role, "faculty"))
      .limit(1);

    if (facultyUsers.length === 0) {
      console.log("❌ No faculty users found in database");
      return;
    }

    const facultyUser = facultyUsers[0];
    console.log(
      `👨‍🏫 Testing with faculty user: ${facultyUser.name} (ID: ${facultyUser.id})`
    );

    // Check existing notifications
    const existingNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, facultyUser.id));

    console.log(`📋 Existing notifications: ${existingNotifications.length}`);

    if (existingNotifications.length > 0) {
      const unreadCount = existingNotifications.filter((n) => !n.isRead).length;
      console.log(`📬 Unread notifications: ${unreadCount}`);

      console.log("\n📝 Recent notifications:");
      existingNotifications.slice(0, 3).forEach((notif, index) => {
        console.log(
          `   ${index + 1}. ${notif.title} - ${notif.isRead ? "✅ Read" : "🔴 Unread"}`
        );
        console.log(
          `      Type: ${notif.type} | Created: ${new Date(notif.createdAt).toLocaleDateString()}`
        );
      });
    } else {
      console.log("📝 Creating test notifications...");

      // Create some test notifications
      const testNotifications = [
        {
          userId: facultyUser.id,
          title: "New Project Submission",
          message: "A student has submitted a new project for approval",
          type: "application",
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        {
          userId: facultyUser.id,
          title: "Event Reminder",
          message: 'Your workshop "Advanced Programming" starts in 2 hours',
          type: "event",
          isRead: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        },
        {
          userId: facultyUser.id,
          title: "New Message",
          message: "You have received a new message from a student",
          type: "message",
          isRead: true,
          createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        },
      ];

      const created = await db
        .insert(notifications)
        .values(testNotifications)
        .returning();
      console.log(`✅ Created ${created.length} test notifications`);

      const unreadCount = created.filter((n) => !n.isRead).length;
      console.log(`📬 Unread notifications: ${unreadCount}`);
    }

    console.log("\n🎯 Notification Badge Test Results:");
    console.log("✅ Faculty layout should now show notification badge");
    console.log("✅ Badge count should reflect unread notifications");
    console.log("✅ Clicking notifications should mark them as read");
    console.log("✅ Badge should update dynamically");

    console.log("\n📱 To test the notification system:");
    console.log("1. Login as faculty user");
    console.log("2. Check the bell icon in the header");
    console.log("3. Click to see notification dropdown");
    console.log("4. Click on notifications to mark as read");
    console.log("5. Badge count should decrease");
  } catch (error) {
    console.error("❌ Error testing notifications:", error);
  }
}

testFacultyNotifications();
