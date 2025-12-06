import { db } from "../src/db";
import { users, posts } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function seedPosts() {
  console.log("🌱 Seeding posts...");

  // Get all active/approved users
  const allUsers = await db
    .select()
    .from(users)
    .where(eq(users.status, "approved"));

  if (allUsers.length === 0) {
    console.log("❌ No users found. Please create users first.");
    return;
  }

  console.log(`✅ Found ${allUsers.length} users`);

  // Sample posts with relevant content
  const samplePosts = [
    {
      content:
        "Excited to share that I've completed my Machine Learning certification from Coursera! Looking forward to applying these skills in real-world projects. #MachineLearning #AI #CareerGrowth",
      category: "achievements",
      imageUrl:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop",
    },
    {
      content:
        "Our college tech fest is coming up next month! We're looking for volunteers and participants. Great opportunity to showcase your projects and network with industry professionals. DM for details! 🚀",
      category: "events",
      imageUrl:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop",
    },
    {
      content:
        "Just landed my dream job as a Software Engineer at a leading tech company! Grateful for all the support from our alumni network. Happy to help anyone with interview prep or career advice. 💼",
      category: "career",
      imageUrl:
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop",
    },
    {
      content:
        "Reminder: Final year project submissions are due next week. Make sure to include all documentation and test cases. Good luck everyone! 📚",
      category: "academic",
      imageUrl:
        "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=600&fit=crop",
    },
    {
      content:
        "Looking for recommendations on the best online courses for Full Stack Development. What worked for you? Drop your suggestions below! 👇",
      category: "general",
      imageUrl: null,
    },
    {
      content:
        "Important: Campus placement drive starts from next Monday. All final year students must register by Friday. Check your email for the registration link. #Placements2024",
      category: "announcements",
      imageUrl:
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop",
    },
    {
      content:
        "Attended an amazing workshop on Cloud Computing today! Learned about AWS, Azure, and GCP. The hands-on sessions were incredibly helpful. Thanks to the organizing team! ☁️",
      category: "events",
      imageUrl:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop",
    },
    {
      content:
        "Our team won first place in the National Hackathon! 36 hours of coding, debugging, and teamwork paid off. Proud of my teammates! 🏆 #Hackathon #TeamWork",
      category: "achievements",
      imageUrl:
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop",
    },
    {
      content:
        "Can someone explain the difference between REST and GraphQL APIs? Working on a project and trying to decide which one to use. Any insights would be helpful!",
      category: "general",
      imageUrl: null,
    },
    {
      content:
        "Internship opportunity at a startup! They're looking for React developers. Great learning experience and flexible hours. Interested? Let me know! 💻",
      category: "career",
      imageUrl:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop",
    },
    {
      content:
        "Study group forming for Data Structures and Algorithms. We meet every weekend to solve problems together. All levels welcome! Comment if you want to join. 📖",
      category: "academic",
      imageUrl: null,
    },
    {
      content:
        "Alumni meetup this Saturday at 5 PM! Great opportunity to network and hear success stories. Refreshments will be provided. See you there! 🤝",
      category: "events",
      imageUrl:
        "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop",
    },
    {
      content:
        "Just published my first research paper! It's been a long journey but totally worth it. Thanks to my mentors and peers for the constant support. 📄 #Research #Academic",
      category: "achievements",
      imageUrl:
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop",
    },
    {
      content:
        "Pro tip: Always keep your LinkedIn profile updated. You never know when an opportunity might come knocking! Also, engage with posts and build your network. #CareerAdvice",
      category: "career",
      imageUrl: null,
    },
    {
      content:
        "Library hours extended during exam week! Open from 7 AM to 11 PM. Make the most of it. Good luck with your exams! 📚",
      category: "announcements",
      imageUrl:
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop",
    },
  ];

  let postsCreated = 0;

  // Distribute posts among users
  for (let i = 0; i < samplePosts.length; i++) {
    const user = allUsers[i % allUsers.length]; // Cycle through users
    const post = samplePosts[i];

    try {
      await db.insert(posts).values({
        authorId: user.id,
        content: post.content,
        category: post.category,
        imageUrl: post.imageUrl,
        visibility: "public",
        status: "approved",
        approvedBy: user.id,
        approvedAt: new Date().toISOString(),
        createdAt: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
        ).toISOString(), // Random time in last 7 days
        updatedAt: new Date().toISOString(),
      });

      postsCreated++;
      console.log(
        `✅ Created post ${postsCreated}/${samplePosts.length} by ${user.name}`
      );
    } catch (error) {
      console.error(`❌ Failed to create post: ${error}`);
    }
  }

  console.log(`\n🎉 Successfully seeded ${postsCreated} posts!`);
}

seedPosts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error seeding posts:", error);
    process.exit(1);
  });
