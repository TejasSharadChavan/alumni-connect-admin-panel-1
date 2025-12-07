import { db } from "../src/db";
import { mentorshipRequests, users } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function findPendingRequests() {
  console.log("🔍 Finding Alumni with Pending Mentorship Requests...\n");

  const pending = await db
    .select({
      requestId: mentorshipRequests.id,
      mentorId: mentorshipRequests.mentorId,
      studentId: mentorshipRequests.studentId,
      topic: mentorshipRequests.topic,
      createdAt: mentorshipRequests.createdAt,
    })
    .from(mentorshipRequests)
    .where(eq(mentorshipRequests.status, "pending"));

  console.log(`Total Pending Requests: ${pending.length}\n`);

  if (pending.length === 0) {
    console.log("ℹ️  No pending requests found in database");
    console.log("\n💡 To create test data:");
    console.log("   1. Login as a student");
    console.log("   2. Go to /student/mentorship");
    console.log("   3. Send mentorship requests to alumni");
    return;
  }

  // Group by mentor
  const byMentor: any = {};
  for (const req of pending) {
    if (!byMentor[req.mentorId]) {
      const [mentor] = await db
        .select({ name: users.name, email: users.email })
        .from(users)
        .where(eq(users.id, req.mentorId))
        .limit(1);

      byMentor[req.mentorId] = {
        mentor,
        requests: [],
      };
    }
    byMentor[req.mentorId].requests.push(req);
  }

  console.log("📋 Pending Requests by Alumni:\n");
  for (const [mentorId, data] of Object.entries(byMentor) as any) {
    console.log(`Alumni: ${data.mentor.name} (ID: ${mentorId})`);
    console.log(`Email: ${data.mentor.email}`);
    console.log(`Pending Requests: ${data.requests.length}`);

    for (const req of data.requests) {
      const [student] = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, req.studentId))
        .limit(1);

      console.log(`  - Request #${req.requestId} from ${student.name}`);
      console.log(`    Topic: ${req.topic}`);
      console.log(`    Date: ${new Date(req.createdAt).toLocaleDateString()}`);
    }
    console.log("");
  }

  console.log("✅ These requests should appear in:");
  console.log("   1. /alumni/mentorship page");
  console.log("   2. /alumni/analytics → Students Needing Help tab");
}

findPendingRequests()
  .then(() => {
    console.log("\n✅ Search complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
