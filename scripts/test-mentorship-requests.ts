import { db } from "../src/db";
import { mentorshipRequests, users } from "../src/db/schema";
import { eq, and } from "drizzle-orm";

async function testMentorshipRequests() {
  console.log("🧪 Testing Mentorship Request System...\n");

  // Get an alumni user (Rahul Agarwal - ID 490)
  const [alumni] = await db
    .select()
    .from(users)
    .where(eq(users.id, 490))
    .limit(1);

  if (!alumni) {
    console.log("❌ Alumni user not found");
    return;
  }

  console.log(`✅ Testing with alumni: ${alumni.name} (ID: ${alumni.id})\n`);

  // Get pending requests for this alumni
  const pendingRequests = await db
    .select({
      id: mentorshipRequests.id,
      studentId: mentorshipRequests.studentId,
      topic: mentorshipRequests.topic,
      message: mentorshipRequests.message,
      status: mentorshipRequests.status,
      createdAt: mentorshipRequests.createdAt,
      studentName: users.name,
      studentEmail: users.email,
      studentBranch: users.branch,
    })
    .from(mentorshipRequests)
    .innerJoin(users, eq(mentorshipRequests.studentId, users.id))
    .where(
      and(
        eq(mentorshipRequests.mentorId, alumni.id),
        eq(mentorshipRequests.status, "pending")
      )
    );

  console.log(`📋 Pending Requests: ${pendingRequests.length}\n`);

  if (pendingRequests.length > 0) {
    console.log("Pending Mentorship Requests:");
    pendingRequests.forEach((req, index) => {
      console.log(`\n${index + 1}. Request #${req.id}`);
      console.log(`   Student: ${req.studentName} (${req.studentEmail})`);
      console.log(`   Branch: ${req.studentBranch}`);
      console.log(`   Topic: ${req.topic}`);
      console.log(`   Message: ${req.message}`);
      console.log(
        `   Created: ${new Date(req.createdAt).toLocaleDateString()}`
      );
    });

    console.log("\n✅ These requests should appear in:");
    console.log("   1. Alumni Mentorship page (/alumni/mentorship)");
    console.log("   2. Alumni Analytics → Students Needing Help tab");
  } else {
    console.log("ℹ️  No pending requests for this alumni");
    console.log("\n💡 To test:");
    console.log("   1. Login as a student");
    console.log("   2. Go to /student/mentorship");
    console.log("   3. Send a mentorship request to this alumni");
  }

  // Get all requests (any status) for this alumni
  const allRequests = await db
    .select({
      id: mentorshipRequests.id,
      status: mentorshipRequests.status,
    })
    .from(mentorshipRequests)
    .where(eq(mentorshipRequests.mentorId, alumni.id));

  console.log(`\n📊 Total Requests (all statuses): ${allRequests.length}`);
  const statusCounts = allRequests.reduce((acc: any, req) => {
    acc[req.status] = (acc[req.status] || 0) + 1;
    return acc;
  }, {});

  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`   - ${status}: ${count}`);
  });

  // Test API endpoint format
  console.log("\n🔗 API Endpoints:");
  console.log(`   GET /api/mentorship - Get all requests for alumni`);
  console.log(`   GET /api/alumni/recommended-students - Get pending requests`);
  console.log(`   PUT /api/mentorship/request/{id} - Accept/Reject request`);

  console.log("\n📝 To Accept a Request:");
  console.log(`   PUT /api/mentorship/request/{requestId}`);
  console.log(`   Body: { "status": "accepted" }`);

  console.log("\n📝 To Reject a Request:");
  console.log(`   PUT /api/mentorship/request/{requestId}`);
  console.log(`   Body: { "status": "rejected" }`);
}

testMentorshipRequests()
  .then(() => {
    console.log("\n✅ Test complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
