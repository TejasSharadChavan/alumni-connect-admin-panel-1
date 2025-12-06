import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  users,
  connections,
  messages,
  chats,
  chatMembers,
  posts,
  comments,
  postReactions,
  userSkills,
  skillEndorsements,
  mentorshipRequests,
  notifications,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const now = new Date();

    // Create diverse users (students, alumni, faculty)
    const password = await bcrypt.hash("password123", 10);

    // Create 10 students with diverse profiles
    const studentData = [
      {
        name: "Rahul Sharma",
        email: "rahul.sharma@student.terna.ac.in",
        branch: "Computer Engineering",
        cohort: "2024",
        yearOfPassing: 2024,
        headline: "Full Stack Developer | MERN Stack Enthusiast",
        bio: "Passionate about building scalable web applications. Love to learn new technologies.",
        skills: JSON.stringify([
          "React",
          "Node.js",
          "MongoDB",
          "Express",
          "TypeScript",
        ]),
      },
      {
        name: "Priya Patel",
        email: "priya.patel@student.terna.ac.in",
        branch: "Information Technology",
        cohort: "2024",
        yearOfPassing: 2024,
        headline: "Data Science Enthusiast | Python Developer",
        bio: "Exploring the world of data science and machine learning. Interested in AI applications.",
        skills: JSON.stringify([
          "Python",
          "Machine Learning",
          "Pandas",
          "NumPy",
          "Scikit-learn",
        ]),
      },
      {
        name: "Amit Kumar",
        email: "amit.kumar@student.terna.ac.in",
        branch: "Computer Engineering",
        cohort: "2025",
        yearOfPassing: 2025,
        headline: "Mobile App Developer | Flutter Expert",
        bio: "Building beautiful cross-platform mobile applications. Open source contributor.",
        skills: JSON.stringify([
          "Flutter",
          "Dart",
          "Firebase",
          "React Native",
          "UI/UX",
        ]),
      },
      {
        name: "Sneha Desai",
        email: "sneha.desai@student.terna.ac.in",
        branch: "Electronics Engineering",
        cohort: "2024",
        yearOfPassing: 2024,
        headline: "IoT Developer | Embedded Systems",
        bio: "Working on IoT projects and embedded systems. Passionate about hardware-software integration.",
        skills: JSON.stringify([
          "Arduino",
          "Raspberry Pi",
          "C++",
          "IoT",
          "Embedded C",
        ]),
      },
      {
        name: "Vikram Singh",
        email: "vikram.singh@student.terna.ac.in",
        branch: "Mechanical Engineering",
        cohort: "2024",
        yearOfPassing: 2024,
        headline: "CAD Designer | Automotive Enthusiast",
        bio: "Designing mechanical components and systems. Interested in automotive engineering.",
        skills: JSON.stringify([
          "AutoCAD",
          "SolidWorks",
          "CATIA",
          "3D Modeling",
          "FEA",
        ]),
      },
    ];

    // Create 10 alumni with diverse backgrounds
    const alumniData = [
      {
        name: "Dr. Rajesh Mehta",
        email: "rajesh.mehta@alumni.terna.ac.in",
        branch: "Computer Engineering",
        cohort: "2015",
        yearOfPassing: 2015,
        headline: "Senior Software Engineer @ Google | Ex-Microsoft",
        bio: "10+ years in software development. Passionate about mentoring and giving back to the community.",
        skills: JSON.stringify([
          "Java",
          "Python",
          "System Design",
          "Cloud Architecture",
          "Leadership",
        ]),
      },
      {
        name: "Anita Verma",
        email: "anita.verma@alumni.terna.ac.in",
        branch: "Information Technology",
        cohort: "2016",
        yearOfPassing: 2016,
        headline: "Data Scientist @ Amazon | ML Researcher",
        bio: "Specializing in NLP and computer vision. Published researcher in AI/ML.",
        skills: JSON.stringify([
          "Machine Learning",
          "Deep Learning",
          "TensorFlow",
          "PyTorch",
          "NLP",
        ]),
      },
      {
        name: "Karan Joshi",
        email: "karan.joshi@alumni.terna.ac.in",
        branch: "Computer Engineering",
        cohort: "2017",
        yearOfPassing: 2017,
        headline: "Tech Lead @ Flipkart | Full Stack Expert",
        bio: "Leading engineering teams to build scalable e-commerce solutions.",
        skills: JSON.stringify([
          "React",
          "Node.js",
          "Microservices",
          "AWS",
          "Team Leadership",
        ]),
      },
      {
        name: "Meera Nair",
        email: "meera.nair@alumni.terna.ac.in",
        branch: "Electronics Engineering",
        cohort: "2014",
        yearOfPassing: 2014,
        headline: "Hardware Engineer @ Intel | Chip Design Specialist",
        bio: "Working on next-generation processor designs. Mentor for hardware enthusiasts.",
        skills: JSON.stringify([
          "VLSI",
          "Verilog",
          "FPGA",
          "Circuit Design",
          "Signal Processing",
        ]),
      },
      {
        name: "Sanjay Gupta",
        email: "sanjay.gupta@alumni.terna.ac.in",
        branch: "Mechanical Engineering",
        cohort: "2013",
        yearOfPassing: 2013,
        headline: "Senior Design Engineer @ Tesla | Automotive Innovation",
        bio: "Designing electric vehicle components. Passionate about sustainable engineering.",
        skills: JSON.stringify([
          "CAD",
          "FEA",
          "CFD",
          "Product Design",
          "Manufacturing",
        ]),
      },
    ];

    const createdStudents = [];
    const createdAlumni = [];

    // Insert students (check if exists first)
    for (const student of studentData) {
      // Check if user already exists
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, student.email))
        .limit(1);

      if (existing.length > 0) {
        createdStudents.push(existing[0]);
        continue;
      }

      const [user] = await db
        .insert(users)
        .values({
          ...student,
          passwordHash: password,
          role: "student",
          status: "approved",
          approvedAt: now.toISOString(),
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        })
        .returning();
      createdStudents.push(user);
    }

    // Insert alumni (check if exists first)
    for (const alumni of alumniData) {
      // Check if user already exists
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, alumni.email))
        .limit(1);

      if (existing.length > 0) {
        createdAlumni.push(existing[0]);
        continue;
      }

      const [user] = await db
        .insert(users)
        .values({
          ...alumni,
          passwordHash: password,
          role: "alumni",
          status: "approved",
          approvedAt: now.toISOString(),
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        })
        .returning();
      createdAlumni.push(user);
    }

    // Create connections (students connecting with alumni and each other)
    const connectionData = [];

    // Students connect with alumni (accepted connections)
    for (let i = 0; i < createdStudents.length; i++) {
      const student = createdStudents[i];
      const alumni = createdAlumni[i % createdAlumni.length];
      connectionData.push({
        requesterId: student.id,
        responderId: alumni.id,
        status: "accepted",
        message: `Hi ${alumni.name}, I'd love to connect and learn from your experience!`,
        createdAt: new Date(
          now.getTime() - (10 - i) * 24 * 60 * 60 * 1000
        ).toISOString(),
        respondedAt: new Date(
          now.getTime() - (9 - i) * 24 * 60 * 60 * 1000
        ).toISOString(),
      });
    }

    // Students connect with each other
    for (let i = 0; i < createdStudents.length - 1; i++) {
      connectionData.push({
        requesterId: createdStudents[i].id,
        responderId: createdStudents[i + 1].id,
        status: "accepted",
        message: "Hey! Let's connect and collaborate on projects!",
        createdAt: new Date(
          now.getTime() - (i + 5) * 24 * 60 * 60 * 1000
        ).toISOString(),
        respondedAt: new Date(
          now.getTime() - (i + 4) * 24 * 60 * 60 * 1000
        ).toISOString(),
      });
    }

    // Some pending connections
    connectionData.push({
      requesterId: createdStudents[0].id,
      responderId: createdAlumni[2].id,
      status: "pending",
      message: "Would love to learn about your work at Flipkart!",
      createdAt: new Date(
        now.getTime() - 2 * 24 * 60 * 60 * 1000
      ).toISOString(),
      respondedAt: null,
    });

    await db.insert(connections).values(connectionData);

    // Create chats and messages
    const chatData = [];

    // Create direct chats between connected users
    for (let i = 0; i < 5; i++) {
      const [chat] = await db
        .insert(chats)
        .values({
          chatType: "direct",
          name: null,
          createdBy: createdStudents[i].id,
          createdAt: new Date(
            now.getTime() - (8 - i) * 24 * 60 * 60 * 1000
          ).toISOString(),
        })
        .returning();

      // Add chat members
      await db.insert(chatMembers).values([
        {
          chatId: chat.id,
          userId: createdStudents[i].id,
          joinedAt: chat.createdAt,
          lastReadAt: now.toISOString(),
        },
        {
          chatId: chat.id,
          userId: createdAlumni[i % createdAlumni.length].id,
          joinedAt: chat.createdAt,
          lastReadAt: now.toISOString(),
        },
      ]);

      // Add messages to the chat
      const messageData = [
        {
          chatId: chat.id,
          senderId: createdStudents[i].id,
          content: `Hi ${createdAlumni[i % createdAlumni.length].name}! Thanks for connecting!`,
          messageType: "text",
          isRead: true,
          readAt: new Date(
            now.getTime() - (7 - i) * 24 * 60 * 60 * 1000
          ).toISOString(),
          createdAt: new Date(
            now.getTime() - (7 - i) * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
        {
          chatId: chat.id,
          senderId: createdAlumni[i % createdAlumni.length].id,
          content:
            "Happy to help! Feel free to ask me anything about the industry.",
          messageType: "text",
          isRead: true,
          readAt: new Date(
            now.getTime() - (6 - i) * 24 * 60 * 60 * 1000
          ).toISOString(),
          createdAt: new Date(
            now.getTime() - (6 - i) * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
        {
          chatId: chat.id,
          senderId: createdStudents[i].id,
          content:
            "I'm interested in learning more about your career path. Could we schedule a mentorship session?",
          messageType: "text",
          isRead: true,
          readAt: new Date(
            now.getTime() - (5 - i) * 24 * 60 * 60 * 1000
          ).toISOString(),
          createdAt: new Date(
            now.getTime() - (5 - i) * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      ];

      await db.insert(messages).values(messageData);
    }

    // Create posts with engagement
    const postData = [
      {
        authorId: createdAlumni[0].id,
        content:
          "Just completed 10 years at Google! Grateful for the journey and excited for what's next. Happy to mentor students interested in software engineering. 🚀",
        category: "achievement",
        tags: JSON.stringify(["career", "milestone", "mentorship"]),
        visibility: "public",
        status: "approved",
        approvedBy: createdAlumni[0].id,
        approvedAt: now.toISOString(),
        createdAt: new Date(
          now.getTime() - 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updatedAt: new Date(
          now.getTime() - 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        authorId: createdStudents[0].id,
        content:
          "Just deployed my first full-stack MERN application! 🎉 Check it out and let me know your feedback. Link in comments.",
        category: "project",
        tags: JSON.stringify(["webdev", "mern", "project"]),
        visibility: "public",
        status: "approved",
        approvedBy: createdAlumni[0].id,
        approvedAt: now.toISOString(),
        createdAt: new Date(
          now.getTime() - 3 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updatedAt: new Date(
          now.getTime() - 3 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        authorId: createdAlumni[1].id,
        content:
          "Excited to share that our research paper on NLP has been accepted at NeurIPS 2024! Proud of the team's hard work. 📄✨",
        category: "achievement",
        tags: JSON.stringify(["research", "ai", "nlp"]),
        visibility: "public",
        status: "approved",
        approvedBy: createdAlumni[1].id,
        approvedAt: now.toISOString(),
        createdAt: new Date(
          now.getTime() - 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updatedAt: new Date(
          now.getTime() - 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        authorId: createdStudents[1].id,
        content:
          "Looking for project partners for a machine learning hackathon next month. Anyone interested in computer vision? 🤖",
        category: "question",
        tags: JSON.stringify(["hackathon", "ml", "collaboration"]),
        visibility: "public",
        status: "approved",
        approvedBy: createdAlumni[0].id,
        approvedAt: now.toISOString(),
        createdAt: new Date(
          now.getTime() - 2 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updatedAt: new Date(
          now.getTime() - 2 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        authorId: createdAlumni[2].id,
        content:
          "We're hiring! Flipkart is looking for talented engineers. DM me if you're interested. Great opportunity for freshers! 💼",
        category: "announcement",
        tags: JSON.stringify(["hiring", "jobs", "opportunity"]),
        visibility: "public",
        status: "approved",
        approvedBy: createdAlumni[2].id,
        approvedAt: now.toISOString(),
        createdAt: new Date(
          now.getTime() - 1 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updatedAt: new Date(
          now.getTime() - 1 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    ];

    const createdPosts = [];
    for (const post of postData) {
      const [createdPost] = await db.insert(posts).values(post).returning();
      createdPosts.push(createdPost);
    }

    // Add comments to posts
    const commentData = [
      {
        postId: createdPosts[0].id,
        authorId: createdStudents[0].id,
        content:
          "Congratulations! Your journey is truly inspiring. Would love to learn from you!",
        createdAt: new Date(
          now.getTime() - 4 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        postId: createdPosts[0].id,
        authorId: createdStudents[1].id,
        content:
          "Amazing milestone! Thank you for offering to mentor students 🙏",
        createdAt: new Date(
          now.getTime() - 4 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        postId: createdPosts[1].id,
        authorId: createdAlumni[2].id,
        content:
          "Great work! The UI looks clean. Have you considered adding authentication?",
        createdAt: new Date(
          now.getTime() - 2 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        postId: createdPosts[3].id,
        authorId: createdStudents[2].id,
        content:
          "I'm interested! I have experience with OpenCV and TensorFlow.",
        createdAt: new Date(
          now.getTime() - 1 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        postId: createdPosts[4].id,
        authorId: createdStudents[3].id,
        content: "Sent you a DM! Very interested in this opportunity.",
        createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
      },
    ];

    await db.insert(comments).values(commentData);

    // Add reactions to posts
    const reactionData = [];
    for (let i = 0; i < createdPosts.length; i++) {
      const post = createdPosts[i];
      // Each post gets 3-5 reactions
      const numReactions = 3 + (i % 3);
      for (let j = 0; j < numReactions; j++) {
        const user =
          j < createdStudents.length
            ? createdStudents[j]
            : createdAlumni[j % createdAlumni.length];
        reactionData.push({
          postId: post.id,
          userId: user.id,
          reactionType: ["like", "heart", "celebrate"][j % 3],
          createdAt: new Date(
            now.getTime() - (i + j) * 12 * 60 * 60 * 1000
          ).toISOString(),
        });
      }
    }

    await db.insert(postReactions).values(reactionData);

    // Create user skills for better matching
    const skillsData = [];

    // Add skills for students
    const studentSkillsMap = [
      ["React", "Node.js", "MongoDB", "Express", "TypeScript"],
      ["Python", "Machine Learning", "Pandas", "NumPy", "Scikit-learn"],
      ["Flutter", "Dart", "Firebase", "React Native", "UI/UX"],
      ["Arduino", "Raspberry Pi", "C++", "IoT", "Embedded C"],
      ["AutoCAD", "SolidWorks", "CATIA", "3D Modeling", "FEA"],
    ];

    for (
      let i = 0;
      i < Math.min(createdStudents.length, studentSkillsMap.length);
      i++
    ) {
      const student = createdStudents[i];
      const skills = studentSkillsMap[i];
      for (const skill of skills) {
        skillsData.push({
          userId: student.id,
          skillName: skill,
          proficiencyLevel: ["intermediate", "advanced"][
            Math.floor(Math.random() * 2)
          ],
          yearsOfExperience: Math.floor(Math.random() * 3) + 1,
          endorsements: 0,
          addedAt: new Date(
            now.getTime() - 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        });
      }
    }

    // Add skills for alumni
    const alumniSkillsMap = [
      ["Java", "Python", "System Design", "Cloud Architecture", "Leadership"],
      ["Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "NLP"],
      ["React", "Node.js", "Microservices", "AWS", "Team Leadership"],
      ["VLSI", "Verilog", "FPGA", "Circuit Design", "Signal Processing"],
      ["CAD", "FEA", "CFD", "Product Design", "Manufacturing"],
    ];

    for (
      let i = 0;
      i < Math.min(createdAlumni.length, alumniSkillsMap.length);
      i++
    ) {
      const alumni = createdAlumni[i];
      const skills = alumniSkillsMap[i];
      for (const skill of skills) {
        skillsData.push({
          userId: alumni.id,
          skillName: skill,
          proficiencyLevel: ["advanced", "expert"][
            Math.floor(Math.random() * 2)
          ],
          yearsOfExperience: Math.floor(Math.random() * 8) + 3,
          endorsements: 0,
          addedAt: new Date(
            now.getTime() - 365 * 24 * 60 * 60 * 1000
          ).toISOString(),
        });
      }
    }

    const createdSkills = await db
      .insert(userSkills)
      .values(skillsData)
      .returning();

    // Add skill endorsements
    const endorsementData = [];
    for (let i = 0; i < Math.min(20, createdSkills.length); i++) {
      const skill = createdSkills[i];
      const endorser =
        i < createdAlumni.length
          ? createdAlumni[i]
          : createdStudents[i % createdStudents.length];
      endorsementData.push({
        skillId: skill.id,
        endorsedBy: endorser.id,
        endorsedAt: new Date(
          now.getTime() - i * 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
      });
    }

    await db.insert(skillEndorsements).values(endorsementData);

    // Update endorsement counts
    for (const endorsement of endorsementData) {
      await db
        .update(userSkills)
        .set({ endorsements: 1 })
        .where(eq(userSkills.id, endorsement.skillId));
    }

    // Create mentorship requests
    const mentorshipData = [
      {
        studentId: createdStudents[0].id,
        mentorId: createdAlumni[0].id,
        topic: "Career guidance in software engineering",
        message:
          "I'm interested in learning about career paths at big tech companies. Would love your guidance!",
        preferredTime: "Weekends",
        status: "accepted",
        createdAt: new Date(
          now.getTime() - 10 * 24 * 60 * 60 * 1000
        ).toISOString(),
        respondedAt: new Date(
          now.getTime() - 9 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        studentId: createdStudents[1].id,
        mentorId: createdAlumni[1].id,
        topic: "Machine Learning and AI research",
        message:
          "I want to pursue research in ML. Can you guide me on how to get started?",
        preferredTime: "Evenings",
        status: "accepted",
        createdAt: new Date(
          now.getTime() - 8 * 24 * 60 * 60 * 1000
        ).toISOString(),
        respondedAt: new Date(
          now.getTime() - 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        studentId: createdStudents[2].id,
        mentorId: createdAlumni[2].id,
        topic: "Full stack development best practices",
        message:
          "Looking to improve my full stack skills. Would appreciate your mentorship!",
        preferredTime: "Flexible",
        status: "pending",
        createdAt: new Date(
          now.getTime() - 2 * 24 * 60 * 60 * 1000
        ).toISOString(),
        respondedAt: null,
      },
    ];

    await db.insert(mentorshipRequests).values(mentorshipData);

    // Create notifications
    const notificationData = [
      {
        userId: createdStudents[0].id,
        type: "connection",
        title: "Connection Accepted",
        message: `${createdAlumni[0].name} accepted your connection request`,
        relatedId: String(createdAlumni[0].id),
        isRead: false,
        createdAt: new Date(
          now.getTime() - 1 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        userId: createdStudents[0].id,
        type: "message",
        title: "New Message",
        message: `${createdAlumni[0].name} sent you a message`,
        relatedId: "1",
        isRead: false,
        createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
      },
      {
        userId: createdStudents[1].id,
        type: "mentorship",
        title: "Mentorship Request Accepted",
        message: `${createdAlumni[1].name} accepted your mentorship request`,
        relatedId: "2",
        isRead: false,
        createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        userId: createdAlumni[0].id,
        type: "post",
        title: "New Comment",
        message: `${createdStudents[0].name} commented on your post`,
        relatedId: String(createdPosts[0].id),
        isRead: true,
        createdAt: new Date(
          now.getTime() - 3 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    ];

    await db.insert(notifications).values(notificationData);

    return NextResponse.json({
      success: true,
      message: "Enhanced database seeded successfully! 🎉",
      data: {
        students: createdStudents.length,
        alumni: createdAlumni.length,
        connections: connectionData.length,
        chats: 5,
        messages: 15,
        posts: createdPosts.length,
        comments: commentData.length,
        reactions: reactionData.length,
        skills: createdSkills.length,
        endorsements: endorsementData.length,
        mentorshipRequests: mentorshipData.length,
        notifications: notificationData.length,
      },
    });
  } catch (error) {
    console.error("Enhanced seed error:", error);
    return NextResponse.json(
      {
        error: "Failed to seed enhanced data",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
