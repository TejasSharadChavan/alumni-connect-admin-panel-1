import { db } from "../src/db";
import { mentorshipRequests, users } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function checkRequestStatus() {
  console.log("🔍 Checking Request #160 Status...\n");

  const [req] = await db
    .select()
    .from(mentorshipRequests)
    .where(eq(mentorshipRequests.id, 160))
    .limit(1);

  if (!req) {
    console.log("❌ Request #160 not found");
    return;
  }

  const [student] = await db
    .select({ name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, req.studentId))
    .limit(1);

  const [mentor] = await db
    .select({ name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, req.mentorId))
    .limit(1);

  console.log("Request #160 Details:");
  console.log(`  From: ${student.name} (${student.email})`);
  console.log(`  To: ${mentor.name} (${mentor.email})`);
  console.log(`  Topic: ${req.topic}`);
  console.log(`  Message: ${req.message}`);
  console.log(`  Status: ${req.status}`);
  console.log(`  Created: ${new Date(req.createdAt).toLocaleString()}`);
  console.log(
    `  Responded: ${req.respondedAt ? new Date(req.respondedAt).toLocaleString() : "Not yet"}`
  );

  // Check all requests for Rahul
  const allRahulRequests = await db
    .select()
    .from(mentorshipRequests)
    .where(eq(mentorshipRequests.mentorId, req.mentorId));

  console.log(`\n📊 All Requests for ${mentor.name}:`);
  console.log(`  Total: ${allRahulRequests.length}`);
  console.log(
    `  Pending: ${allRahulRequests.filter((r) => r.status === "pending").length}`
  );
  console.log(
    `  Accepted: ${allRahulRequests.filter((r) => r.status === "accepted").length}`
  );
  console.log(
    `  Rejected: ${allRahulRequests.filter((r) => r.status === "rejected").length}`
  );
  console.log(
    `  Completed: ${allRahulRequests.filter((r) => r.status === "completed").length}`
  );

  console.log("\n✅ What should show in UI:");
  console.log(
    `  Mentees KPI: ${allRahulRequests.filter((r) => r.status === "accepted").length}`
  );
  console.log(
    `  Pending Requests Badge: ${allRahulRequests.filter((r) => r.status === "pending").length}`
  );
}

checkRequestStatus()
  .then(() => {
    console.log("\n✅ Check complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
