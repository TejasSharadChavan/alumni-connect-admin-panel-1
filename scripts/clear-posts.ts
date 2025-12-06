import { db } from "../src/db";
import { posts, postReactions, comments } from "../src/db/schema";

async function clearPosts() {
  console.log("🗑️  Clearing all posts...");

  try {
    // Delete all comments first (foreign key constraint)
    const deletedComments = await db.delete(comments).returning();
    console.log(`✅ Deleted ${deletedComments.length} comments`);

    // Delete all reactions
    const deletedReactions = await db.delete(postReactions).returning();
    console.log(`✅ Deleted ${deletedReactions.length} reactions`);

    // Delete all posts
    const deletedPosts = await db.delete(posts).returning();
    console.log(`✅ Deleted ${deletedPosts.length} posts`);

    console.log("\n🎉 All posts cleared successfully!");
  } catch (error) {
    console.error("❌ Error clearing posts:", error);
    throw error;
  }
}

clearPosts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
