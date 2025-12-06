import { db } from "@/db";
import { jobs, events, posts } from "@/db/schema";

async function seedAll() {
  console.log("🌱 Starting database seeding...");

  try {
    // Run jobs seed
    console.log("📋 Seeding jobs...");
    await import("./jobs").then((m) => m.default());
    console.log("✅ Jobs seeded successfully");

    // Run events seed
    console.log("📅 Seeding events...");
    await import("./events").then((m) => m.default());
    console.log("✅ Events seeded successfully");

    // Run posts seed
    console.log("📝 Seeding posts...");
    await import("./posts").then((m) => m.default());
    console.log("✅ Posts seeded successfully");

    console.log("🎉 All seeds completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedAll();
