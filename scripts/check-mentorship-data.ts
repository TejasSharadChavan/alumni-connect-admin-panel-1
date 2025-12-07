import { db } from "../src/db";
import { mentorshipRequests, users } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function checkMentorshipData() {
  console.log("Checking mentorship data...\n");

  // Get all mentorship requests
  const requests = await db
    .select({
      id: mentorshipRequests.id,
      studentId: mentorshipRequests.studentId,
      mentorId: mentorshipRequests.mentorId,
      topic: mentorshipRequests.topic,
      status: mentorshipRequests.status,
      createdAt: mentorshipRequests.createdAt,
    })
    .from(mentorshipRequests);

  console.log(`Total mentorship requests: ${requests.length}\n`);

  if (requests.length > 0) {
    console.log("Mentorship Requests:");
    for (const request of requests) {
      const [student] = await db
        .select({ name: users.name, role: users.role })
        .from(users)
        .where(eq(users.id, request.studentId))
        .limit(1);

      const [mentor] = await db
        .select({ name: users.name, role: users.role })
        .from(users)
        .where(eq(users.id, request.mentorId))
        .limit(1);

      console.log(`\nRequest #${request.id}:`);
      console.log(
        `  Student: ${student?.name} (ID: ${request.studentId}, Role: ${student?.role})`
      );
      console.log(
        `  Mentor: ${mentor?.name} (ID: ${request.mentorId}, Role: ${mentor?.role})`
      );
      console.log(`  Topic: ${request.topic}`);
      console.log(`  Status: ${request.status}`);
      console.log(`  Created: ${request.createdAt}`);
    }
  } else {
    console.log("No mentorship requests found in database.");
    console.log("\nLet's check available users:");

    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users);

    const students = allUsers.filter((u) => u.role === "student");
    const alumni = allUsers.filter((u) => u.role === "alumni");
    const faculty = allUsers.filter((u) => u.role === "faculty");

    console.log(`\nStudents (${students.length}):`);
    students
      .slice(0, 3)
      .forEach((s) => console.log(`  - ${s.name} (ID: ${s.id})`));

    console.log(`\nAlumni (${alumni.length}):`);
    alumni
      .slice(0, 3)
      .forEach((a) => console.log(`  - ${a.name} (ID: ${a.id})`));

    console.log(`\nFaculty (${faculty.length}):`);
    faculty
      .slice(0, 3)
      .forEach((f) => console.log(`  - ${f.name} (ID: ${f.id})`));
  }
}

checkMentorshipData()
  .then(() => {
    console.log("\n✅ Check complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
