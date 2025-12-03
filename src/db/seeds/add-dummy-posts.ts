import { db } from '@/db';
import { posts, users } from '@/db/schema';

async function seedDummyPosts() {
  try {
    console.log('Starting to seed dummy posts...');
    
    // Get existing users
    const existingUsers = await db.select({ id: users.id, role: users.role, name: users.name }).from(users).limit(10);
    
    if (existingUsers.length === 0) {
      console.log('❌ No users found in database. Please seed users first.');
      process.exit(1);
    }
    
    console.log(`Found ${existingUsers.length} users`);
    existingUsers.forEach(u => console.log(`  - ${u.name} (ID: ${u.id}, Role: ${u.role})`));
    
    // Use first few users as post authors
    const authorIds = existingUsers.map(u => u.id);
    
    const dummyPosts = [
      {
        authorId: authorIds[0] || 1,
        content: "🎉 Excited to announce that I've been selected for the Google Summer of Code 2024! Looking forward to contributing to open source. #GSoC #OpenSource",
        imageUrl: "https://picsum.photos/800/600?random=1",
        category: "achievement",
        visibility: "public",
        status: "approved",
        approvedBy: authorIds[0] || 1,
        approvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        authorId: authorIds[1] || authorIds[0] || 1,
        content: "Just finished my final year project on AI-powered campus navigation! Would love to get feedback from the community. Check out the demo video! 🚀",
        imageUrl: "https://picsum.photos/800/600?random=2",
        category: "project",
        visibility: "public",
        status: "approved",
        approvedBy: authorIds[0] || 1,
        approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        authorId: authorIds[2] || authorIds[0] || 1,
        content: "Reminder: Annual Alumni Meetup is happening this Saturday at 5 PM. Great opportunity to network and reconnect! RSVP on the events page. See you all there! 🎓",
        category: "announcement",
        visibility: "public",
        status: "approved",
        approvedBy: authorIds[0] || 1,
        approvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        authorId: authorIds[3] || authorIds[0] || 1,
        content: "Looking for advice on career transition from software engineering to product management. Any alumni in PM roles who can share their experience? 🤔",
        category: "question",
        visibility: "public",
        status: "approved",
        approvedBy: authorIds[0] || 1,
        approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        authorId: authorIds[4] || authorIds[0] || 1,
        content: "Proud to share that our college has been ranked in the top 50 engineering colleges in India! 🏆 Congratulations to everyone who contributed to this achievement!",
        imageUrl: "https://picsum.photos/800/600?random=3",
        category: "achievement",
        visibility: "public",
        status: "approved",
        approvedBy: authorIds[0] || 1,
        approvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        authorId: authorIds[0] || 1,
        content: "Tech Workshop Alert! 📢 Join us for a hands-on workshop on Machine Learning and Deep Learning fundamentals. Register now - limited seats available!",
        imageUrl: "https://picsum.photos/800/600?random=4",
        category: "announcement",
        visibility: "public",
        status: "approved",
        approvedBy: authorIds[0] || 1,
        approvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        authorId: authorIds[1] || authorIds[0] || 1,
        content: "Just got my dream offer from Microsoft! 🎊 Huge thanks to all the professors and mentors who guided me throughout my journey. Special mention to the career counseling team!",
        category: "achievement",
        visibility: "public",
        status: "approved",
        approvedBy: authorIds[0] || 1,
        approvedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        authorId: authorIds[2] || authorIds[0] || 1,
        content: "Question for CS students: Which programming language should I focus on for competitive programming - C++ or Python? Need advice from experienced coders! 💻",
        category: "question",
        visibility: "public",
        status: "approved",
        approvedBy: authorIds[0] || 1,
        approvedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        authorId: authorIds[3] || authorIds[0] || 1,
        content: "Campus placement drive update: Amazon, Google, and Microsoft are visiting next month! Prepare well and don't miss this opportunity. All the best! 💼",
        category: "announcement",
        visibility: "public",
        status: "approved",
        approvedBy: authorIds[0] || 1,
        approvedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        authorId: authorIds[4] || authorIds[0] || 1,
        content: "Sharing my experience: Just completed my first hackathon and won second place! The journey was incredible. Thanks to my amazing team! 🏅",
        imageUrl: "https://picsum.photos/800/600?random=5",
        category: "achievement",
        visibility: "public",
        status: "approved",
        approvedBy: authorIds[0] || 1,
        approvedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        authorId: authorIds[0] || 1,
        content: "College fest preparations are in full swing! 🎪 Looking for volunteers to help with event management. DM if interested. Let's make this the best fest ever!",
        imageUrl: "https://picsum.photos/800/600?random=6",
        category: "announcement",
        visibility: "public",
        status: "approved",
        approvedBy: authorIds[0] || 1,
        approvedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        authorId: authorIds[1] || authorIds[0] || 1,
        content: "Research paper accepted at IEEE conference! 📄 Topic: Novel approaches to IoT security. Grateful for the guidance from Dr. Sharma and the research team.",
        category: "achievement",
        visibility: "public",
        status: "approved",
        approvedBy: authorIds[0] || 1,
        approvedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        authorId: authorIds[2] || authorIds[0] || 1,
        content: "Anyone interested in starting a coding club? We can meet weekly to solve DSA problems and prepare for interviews together. Comment below if you're in! 👨‍💻",
        category: "discussion",
        visibility: "public",
        status: "approved",
        approvedBy: authorIds[0] || 1,
        approvedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        authorId: authorIds[3] || authorIds[0] || 1,
        content: "Library renovation complete! 📚 New study areas, high-speed WiFi, and comfortable seating. Check it out when you visit campus. Perfect for exam prep!",
        imageUrl: "https://picsum.photos/800/600?random=7",
        category: "announcement",
        visibility: "public",
        status: "approved",
        approvedBy: authorIds[0] || 1,
        approvedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        authorId: authorIds[4] || authorIds[0] || 1,
        content: "Congratulations to all students who cleared their semester exams! 🎓 Results are out. For those who didn't make it, keep your head up - there's always a next time!",
        category: "announcement",
        visibility: "public",
        status: "approved",
        approvedBy: authorIds[0] || 1,
        approvedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    
    // Insert all posts
    for (const post of dummyPosts) {
      await db.insert(posts).values(post);
      console.log(`✓ Added post: ${post.content.substring(0, 50)}...`);
    }
    
    console.log(`\n✅ Successfully seeded ${dummyPosts.length} dummy posts!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding posts:', error);
    process.exit(1);
  }
}

seedDummyPosts();