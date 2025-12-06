import { db } from "../src/db";
import { referrals, users } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function seedReferrals() {
  console.log("🌱 Seeding referrals...");

  // Find an alumni user
  const alumniUsers = await db
    .select()
    .from(users)
    .where(eq(users.role, "alumni"))
    .limit(1);

  if (alumniUsers.length === 0) {
    console.log("❌ No alumni users found. Please seed users first.");
    return;
  }

  const alumni = alumniUsers[0];

  // Create sample referrals
  const sampleReferrals = [
    {
      alumniId: alumni.id,
      code: "GOOGLE-AB12",
      company: "Google",
      position: "Software Engineer",
      description: "Looking for talented engineers to join our team",
      maxUses: 10,
      usedCount: 0,
      isActive: true,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
      createdAt: new Date().toISOString(),
    },
    {
      alumniId: alumni.id,
      code: "MICROSOFT-CD34",
      company: "Microsoft",
      position: "Product Manager",
      description: "Seeking PMs with strong technical background",
      maxUses: 5,
      usedCount: 0,
      isActive: true,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days
      createdAt: new Date().toISOString(),
    },
    {
      alumniId: alumni.id,
      code: "AMAZON-EF56",
      company: "Amazon",
      position: "Data Scientist",
      description: "Join our ML team working on cutting-edge projects",
      maxUses: 15,
      usedCount: 0,
      isActive: true,
      expiresAt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(), // 120 days
      createdAt: new Date().toISOString(),
    },
  ];

  for (const referral of sampleReferrals) {
    await db.insert(referrals).values(referral);
    console.log(
      `✅ Created referral: ${referral.code} for ${referral.company}`
    );
  }

  console.log("✅ Referrals seeded successfully!");
}

seedReferrals()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error seeding referrals:", error);
    process.exit(1);
  });
