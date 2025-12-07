const { drizzle } = require("drizzle-orm/neon-http");
const { neon } = require("@neondatabase/serverless");
require("dotenv").config();

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

(async () => {
  try {
    const { mentorshipRequests, users } = require("./src/db/schema");
    const { eq } = require("drizzle-orm");

    const requests = await db
      .select({
        id: mentorshipRequests.id,
        studentId: mentorshipRequests.studentId,
        mentorId: mentorshipRequests.mentorId,
        topic: mentorshipRequests.topic,
        status: mentorshipRequests.status,
        createdAt: mentorshipRequests.createdAt,
        studentName: users.name,
      })
      .from(mentorshipRequests)
      .leftJoin(users, eq(mentorshipRequests.studentId, users.id));

    console.log("All Mentorship Requests:");
    console.log(JSON.stringify(requests, null, 2));

    // Check Rahul's requests specifically
    const rahulRequests = requests.filter((r) => r.mentorId === 2);
    console.log("\n\nRahul's Requests (mentorId=2):");
    console.log(JSON.stringify(rahulRequests, null, 2));

    const acceptedCount = rahulRequests.filter(
      (r) => r.status === "accepted"
    ).length;
    console.log(`\nAccepted requests count: ${acceptedCount}`);
  } catch (error) {
    console.error("Error:", error);
  }
  process.exit(0);
})();
