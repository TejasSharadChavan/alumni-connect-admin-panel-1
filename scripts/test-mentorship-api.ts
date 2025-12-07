import { db } from "../src/db";
import { users, sessions } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function testMentorshipAPI() {
  console.log("Testing Mentorship API...\n");

  // Get a faculty user (Dr. Meera Joshi - ID 475)
  const [faculty] = await db
    .select()
    .from(users)
    .where(eq(users.id, 475))
    .limit(1);

  if (!faculty) {
    console.log("❌ Faculty user not found");
    return;
  }

  console.log(`✅ Found faculty: ${faculty.name} (${faculty.email})`);

  // Get their session token
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.userId, faculty.id))
    .limit(1);

  if (!session) {
    console.log("❌ No active session found for faculty");
    console.log("   Creating a test session...");

    const newSession = await db
      .insert(sessions)
      .values({
        userId: faculty.id,
        token: `test-token-${Date.now()}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      })
      .returning();

    console.log(`✅ Created session with token: ${newSession[0].token}`);
    console.log(`\nTest the API with this token:`);
    console.log(
      `curl -H "Authorization: Bearer ${newSession[0].token}" http://localhost:3000/api/mentorship`
    );
    return;
  }

  console.log(`✅ Found session token: ${session.token.substring(0, 20)}...`);

  // Test the API endpoint
  console.log("\n📡 Testing GET /api/mentorship...");

  try {
    const response = await fetch("http://localhost:3000/api/mentorship", {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ API Response: ${JSON.stringify(data, null, 2)}`);
    } else {
      console.log(`❌ API Error: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.log(`   Response: ${text}`);
    }
  } catch (error) {
    console.log(`❌ Fetch error: ${error}`);
    console.log("\n💡 Make sure the dev server is running:");
    console.log("   npm run dev");
  }

  // Get a student user
  const [student] = await db
    .select()
    .from(users)
    .where(eq(users.id, 480))
    .limit(1);

  if (student) {
    console.log(`\n✅ Found student: ${student.name} (${student.email})`);

    const [studentSession] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, student.id))
      .limit(1);

    if (studentSession) {
      console.log(
        `✅ Student session token: ${studentSession.token.substring(0, 20)}...`
      );
      console.log(`\nTest student API with:`);
      console.log(
        `curl -H "Authorization: Bearer ${studentSession.token}" http://localhost:3000/api/mentorship`
      );
    }
  }
}

testMentorshipAPI()
  .then(() => {
    console.log("\n✅ Test complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
