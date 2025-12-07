import { db } from "../src/db";
import { mentorshipRequests } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function fixRequest() {
  console.log("🔧 Fixing Request #160...\n");

  // Update request #160 to pending
  const updated = await db
    .update(mentorshipRequests)
    .set({
      status: "pending",
      respondedAt: null,
    })
    .where(eq(mentorshipRequests.id, 160))
    .returning();

  if (updated.length > 0) {
    console.log("✅ Request #160 updated:");
    console.log(`   Status: ${updated[0].status}`);
    console.log(`   Student ID: ${updated[0].studentId}`);
    console.log(`   Mentor ID: ${updated[0].mentorId}`);
    console.log(`   Topic: ${updated[0].topic}`);
    console.log("\n✅ Rahul should now see this request in:");
    console.log("   1. /alumni/mentorship → Requests tab");
    console.log("   2. /alumni/analytics → Students Needing Help tab");
  } else {
    console.log("❌ Request #160 not found");
  }
}

fixRequest()
  .then(() => {
    console.log("\n✅ Fix complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
