import { db } from "../src/db";
import { posts } from "../src/db/schema";
import { sql } from "drizzle-orm";

async function checkPosts() {
  console.log("📊 Checking posts in database...\n");

  // Get all posts
  const allPosts = await db.select().from(posts);
  console.log(`Total posts: ${allPosts.length}\n`);

  if (allPosts.length === 0) {
    console.log("❌ No posts found! Run: bun run scripts/seed-posts.ts");
    return;
  }

  // Count by category
  const categoryCounts: Record<string, number> = {};
  allPosts.forEach((post) => {
    categoryCounts[post.category] = (categoryCounts[post.category] || 0) + 1;
  });

  console.log("📈 Posts by category:");
  Object.entries(categoryCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`);
    });

  console.log("\n📝 Sample posts:");
  allPosts.slice(0, 5).forEach((post) => {
    console.log(`  [${post.category}] ${post.content.substring(0, 60)}...`);
  });

  console.log("\n✅ Database check complete!");
}

checkPosts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
