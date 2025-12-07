import { db } from "../src/db";
import { mentorshipRequests, users } from "../src/db/schema";
import { eq, desc } from "drizzle-orm";

async function checkLatestRequests() {
  console.log("🔍 Checking Latest Mentorship Requests...\n");

  // Get Aarav's ID
  const [aarav] = await db
    .select()
    .from(users)
    .where(eq(users.email, "aarav.sharma@terna.ac.in"))
    .limit(1);

  if (!aarav) {
    console.log("❌ Aarav not found");
    return;
  }

  console.log(`✅ Aarav Sharma (ID: ${aarav.id})\n`);

  // Get Rahul's ID
  const [rahul] = await db
    .select()
    .from(users)
    .where(eq(users.email, "rahul.agarwal@gmail.com"))
    .limit(1);

  if (!rahul) {
    console.log("❌ Rahul not found");
    return;
  }

  console.log(`✅ Rahul Agarwal (ID: ${rahul.id})\n`);

  // Get latest 10 requests
  const reqs = await db
    .select()
    .from(mentorshipRequests)
    .orderBy(desc(mentorshipRequests.id))
    .limit(10);

  console.log(`📋 Latest 10 Mentorship Requests:\n`);

  for (const r of reqs) {
    const [student] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, r.studentId))
      .limit(1);

    const [mentor] = await db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, r.mentorId))
      .limit(1);

    const isAaravRequest = r.studentId === aarav.id;
    const isToRahul = r.mentorId === rahul.id;
    const marker = isAaravRequest && isToRahul ? " ⭐ THIS ONE!" : "";

    console.log(`Request #${r.id}${marker}`);
    console.log(`  From: ${student.name} (ID: ${r.studentId})`);
    console.log(`  To: ${mentor.name} (ID: ${r.mentorId}) - ${mentor.email}`);
    console.log(`  Topic: ${r.topic}`);
    console.log(`  Status: ${r.status}`);
    console.log(`  Created: ${new Date(r.createdAt).toLocaleString()}`);
    console.log("");
  }

  // Check specifically for Aarav's requests to Rahul
  const aaravToRahul = await db
    .select()
    .from(mentorshipRequests)
    .where(eq(mentorshipRequests.studentId, aarav.id));

  console.log(`\n📊 All Aarav's Requests: ${aaravToRahul.length}`);

  const toRahul = aaravToRahul.filter((r) => r.mentorId === rahul.id);
  console.log(`   To Rahul: ${toRahul.length}`);

  if (toRahul.length > 0) {
    console.log("\n   Details:");
    toRahul.forEach((r) => {
      console.log(`   - Request #${r.id}: ${r.topic} (${r.status})`);
    });
  }

  // Check what Rahul should see
  const rahulRequests = await db
    .select()
    .from(mentorshipRequests)
    .where(eq(mentorshipRequests.mentorId, rahul.id));

  console.log(`\n📬 Requests Rahul Should See: ${rahulRequests.length}`);
  console.log(
    `   Pending: ${rahulRequests.filter((r) => r.status === "pending").length}`
  );
  console.log(
    `   Accepted: ${rahulRequests.filter((r) => r.status === "accepted").length}`
  );
  console.log(
    `   Rejected: ${rahulRequests.filter((r) => r.status === "rejected").length}`
  );
}

checkLatestRequests()
  .then(() => {
    console.log("\n✅ Check complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
