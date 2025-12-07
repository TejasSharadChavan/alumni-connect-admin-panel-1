import { db } from "../src/db";
import {
  users,
  mentorshipRequests,
  jobs,
  referrals,
  posts,
} from "../src/db/schema";
import { eq, count } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

async function diagnoseAnalytics() {
  console.log("🔍 Diagnosing Alumni Analytics Setup...\n");

  // 1. Check if files exist
  console.log("📁 Checking Files:");
  const files = [
    "src/app/alumni/analytics/page.tsx",
    "src/app/api/alumni/influence-score/route.ts",
    "src/app/api/alumni/recommended-students/route.ts",
    "src/app/api/alumni/referral-ready/route.ts",
  ];

  for (const file of files) {
    const exists = fs.existsSync(path.join(process.cwd(), file));
    console.log(`  ${exists ? "✅" : "❌"} ${file}`);
  }

  // 2. Check navigation
  console.log("\n🧭 Checking Navigation:");
  const layoutPath = path.join(
    process.cwd(),
    "src/components/layout/role-layout.tsx"
  );
  if (fs.existsSync(layoutPath)) {
    const content = fs.readFileSync(layoutPath, "utf-8");
    const hasAnalyticsLink =
      content.includes('label: "Analytics"') &&
      content.includes('href: "/alumni/analytics"');
    console.log(
      `  ${hasAnalyticsLink ? "✅" : "❌"} Analytics link in navigation`
    );
  } else {
    console.log("  ❌ role-layout.tsx not found");
  }

  // 3. Check database data
  console.log("\n💾 Checking Database Data:");

  // Alumni count
  const alumniData = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.role, "alumni"));
  console.log(`  ✅ Alumni users: ${alumniData[0]?.count || 0}`);

  // Student count
  const studentData = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.role, "student"));
  console.log(`  ✅ Student users: ${studentData[0]?.count || 0}`);

  // Mentorship requests
  const mentorshipData = await db
    .select({ count: count() })
    .from(mentorshipRequests);
  console.log(`  ✅ Mentorship requests: ${mentorshipData[0]?.count || 0}`);

  // Jobs
  const jobsData = await db.select({ count: count() }).from(jobs);
  console.log(`  ✅ Job postings: ${jobsData[0]?.count || 0}`);

  // Posts
  const postsData = await db.select({ count: count() }).from(posts);
  console.log(`  ✅ Posts: ${postsData[0]?.count || 0}`);

  // 4. Test with a sample alumni
  console.log("\n👤 Testing with Sample Alumni:");
  const [sampleAlumni] = await db
    .select()
    .from(users)
    .where(eq(users.role, "alumni"))
    .limit(1);

  if (sampleAlumni) {
    console.log(
      `  ✅ Sample alumni: ${sampleAlumni.name} (ID: ${sampleAlumni.id})`
    );

    // Check their mentorships
    const theirMentorships = await db
      .select({ count: count() })
      .from(mentorshipRequests)
      .where(eq(mentorshipRequests.mentorId, sampleAlumni.id));
    console.log(`     - Mentorships: ${theirMentorships[0]?.count || 0}`);

    // Check their jobs
    const theirJobs = await db
      .select({ count: count() })
      .from(jobs)
      .where(eq(jobs.postedById, sampleAlumni.id));
    console.log(`     - Jobs posted: ${theirJobs[0]?.count || 0}`);

    // Check their posts
    const theirPosts = await db
      .select({ count: count() })
      .from(posts)
      .where(eq(posts.authorId, sampleAlumni.id));
    console.log(`     - Posts created: ${theirPosts[0]?.count || 0}`);

    // Calculate expected influence score
    const mentorshipScore = Math.min((theirMentorships[0]?.count || 0) * 5, 30);
    const jobsScore = Math.min((theirJobs[0]?.count || 0) * 8, 25);
    const postsScore = Math.min((theirPosts[0]?.count || 0) * 3, 15);
    const expectedScore = mentorshipScore + jobsScore + postsScore;

    console.log(`     - Expected influence score: ~${expectedScore}/100`);
  } else {
    console.log("  ❌ No alumni found in database");
  }

  // 5. Check for students with skills (for matching)
  console.log("\n🎯 Checking Student Profiles:");
  const studentsWithSkills = await db
    .select()
    .from(users)
    .where(eq(users.role, "student"))
    .limit(5);

  let studentsWithSkillsCount = 0;
  for (const student of studentsWithSkills) {
    const skills =
      typeof student.skills === "string"
        ? JSON.parse(student.skills || "[]")
        : student.skills || [];
    if (skills.length > 0) studentsWithSkillsCount++;
  }
  console.log(
    `  ✅ Students with skills: ${studentsWithSkillsCount}/${studentsWithSkills.length}`
  );

  // 6. Summary
  console.log("\n📊 Summary:");
  const allGood =
    alumniData[0]?.count > 0 &&
    studentData[0]?.count > 0 &&
    mentorshipData[0]?.count > 0;

  if (allGood) {
    console.log("  ✅ All systems ready!");
    console.log("\n🚀 Next Steps:");
    console.log("  1. Start dev server: npm run dev");
    console.log("  2. Login as alumni user");
    console.log("  3. Navigate to: http://localhost:3000/alumni/analytics");
    console.log(`  4. Or click "Analytics" in the sidebar`);
  } else {
    console.log("  ⚠️  Some data is missing:");
    if (alumniData[0]?.count === 0) console.log("     - No alumni users found");
    if (studentData[0]?.count === 0)
      console.log("     - No student users found");
    if (mentorshipData[0]?.count === 0)
      console.log("     - No mentorship data found");
  }

  console.log("\n💡 Troubleshooting:");
  console.log("  - If page doesn't load: Check browser console for errors");
  console.log("  - If no data shows: This is normal for new alumni accounts");
  console.log("  - If 401 error: Logout and login again");
  console.log("  - If 404 error: Restart dev server (npm run dev)");
}

diagnoseAnalytics()
  .then(() => {
    console.log("\n✅ Diagnosis complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
