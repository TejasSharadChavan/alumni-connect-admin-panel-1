import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobs, events, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    // Get first alumni user
    const alumniUsers = await db
      .select()
      .from(users)
      .where(eq(users.role, "alumni"))
      .limit(5);

    if (alumniUsers.length === 0) {
      return NextResponse.json(
        { error: "No alumni users found. Please create alumni users first." },
        { status: 400 }
      );
    }

    const alumniId = alumniUsers[0].id;
    const now = new Date();

    // Seed 15 sample jobs (more variety)
    const sampleJobs = [
      {
        postedById: alumniId,
        title: "Software Development Engineer",
        company: "Amazon",
        description:
          "We are looking for a talented Backend Engineer to join our e-commerce platform team. Work with cutting-edge technologies and contribute to solutions used by millions of customers daily.",
        location: "Bangalore",
        jobType: "full-time",
        salary: "₹15-22 LPA",
        skills: JSON.stringify(["Java", "Spring Boot", "Microservices", "AWS"]),
        status: "approved",
        branch: "Computer Engineering",
        approvedBy: alumniId,
        approvedAt: new Date(
          now.getTime() - 3 * 24 * 60 * 60 * 1000
        ).toISOString(),
        createdAt: new Date(
          now.getTime() - 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        expiresAt: new Date(
          now.getTime() + 60 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        postedById: alumniId,
        title: "Frontend Developer (React)",
        company: "Razorpay",
        description:
          "Join our frontend team to build intuitive and performant user interfaces for our payment gateway platform.",
        location: "Bangalore/Remote",
        jobType: "full-time",
        salary: "₹12-18 LPA",
        skills: JSON.stringify([
          "React",
          "TypeScript",
          "Next.js",
          "Tailwind CSS",
        ]),
        status: "approved",
        branch: "Computer Engineering",
        approvedBy: alumniId,
        approvedAt: new Date(
          now.getTime() - 2 * 24 * 60 * 60 * 1000
        ).toISOString(),
        createdAt: new Date(
          now.getTime() - 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
        expiresAt: new Date(
          now.getTime() + 60 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        postedById: alumniId,
        title: "Data Scientist - ML/AI",
        company: "Google",
        description:
          "We are seeking a Data Scientist to work on machine learning models for our advertising platform.",
        location: "Bangalore",
        jobType: "full-time",
        salary: "₹25-35 LPA",
        skills: JSON.stringify([
          "Python",
          "TensorFlow",
          "Machine Learning",
          "SQL",
        ]),
        status: "approved",
        branch: "Computer Engineering",
        approvedBy: alumniId,
        approvedAt: new Date(
          now.getTime() - 1 * 24 * 60 * 60 * 1000
        ).toISOString(),
        createdAt: new Date(
          now.getTime() - 4 * 24 * 60 * 60 * 1000
        ).toISOString(),
        expiresAt: new Date(
          now.getTime() + 60 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        postedById: alumniId,
        title: "DevOps Engineer",
        company: "Swiggy",
        description:
          "Join our DevOps team to build and maintain infrastructure for our food delivery platform.",
        location: "Bangalore",
        jobType: "full-time",
        salary: "₹15-20 LPA",
        skills: JSON.stringify(["Kubernetes", "Docker", "AWS", "CI/CD"]),
        status: "approved",
        branch: "Computer Engineering",
        approvedBy: alumniId,
        approvedAt: now.toISOString(),
        createdAt: new Date(
          now.getTime() - 3 * 24 * 60 * 60 * 1000
        ).toISOString(),
        expiresAt: new Date(
          now.getTime() + 60 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        postedById: alumniId,
        title: "Full Stack Developer",
        company: "Zomato",
        description:
          "We are looking for a Full Stack Developer to work on our restaurant management platform.",
        location: "Delhi NCR",
        jobType: "full-time",
        salary: "₹12-18 LPA",
        skills: JSON.stringify(["Node.js", "React", "MongoDB", "Express"]),
        status: "approved",
        branch: "Information Technology",
        approvedBy: alumniId,
        approvedAt: now.toISOString(),
        createdAt: new Date(
          now.getTime() - 2 * 24 * 60 * 60 * 1000
        ).toISOString(),
        expiresAt: new Date(
          now.getTime() + 60 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        postedById: alumniId,
        title: "Mobile App Developer (React Native)",
        company: "CRED",
        description:
          "Join our mobile team to build delightful user experiences for our fintech app.",
        location: "Bangalore",
        jobType: "full-time",
        salary: "₹15-22 LPA",
        skills: JSON.stringify([
          "React Native",
          "JavaScript",
          "TypeScript",
          "Mobile Development",
        ]),
        status: "approved",
        branch: "Computer Engineering",
        approvedBy: alumniId,
        approvedAt: now.toISOString(),
        createdAt: new Date(
          now.getTime() - 1 * 24 * 60 * 60 * 1000
        ).toISOString(),
        expiresAt: new Date(
          now.getTime() + 60 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        postedById: alumniId,
        title: "Software Engineering Intern",
        company: "Microsoft",
        description:
          "Join our summer internship program to work on real-world projects in cloud computing and AI.",
        location: "Hyderabad",
        jobType: "internship",
        salary: "₹25,000-35,000/month",
        skills: JSON.stringify([
          "Java",
          "Python",
          "Data Structures",
          "Algorithms",
        ]),
        status: "approved",
        branch: "Computer Engineering",
        approvedBy: alumniId,
        approvedAt: now.toISOString(),
        createdAt: now.toISOString(),
        expiresAt: new Date(
          now.getTime() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        postedById: alumniId,
        title: "Data Science Intern",
        company: "Flipkart",
        description:
          "Looking for a Data Science Intern to work on customer analytics and recommendation systems.",
        location: "Bangalore",
        jobType: "internship",
        salary: "₹20,000-30,000/month",
        skills: JSON.stringify(["Python", "SQL", "Pandas", "Machine Learning"]),
        status: "approved",
        branch: "Computer Engineering",
        approvedBy: alumniId,
        approvedAt: now.toISOString(),
        createdAt: now.toISOString(),
        expiresAt: new Date(
          now.getTime() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        postedById: alumniId,
        title: "UI/UX Designer",
        company: "PhonePe",
        description:
          "Join our design team to create intuitive user experiences for our digital payment platform.",
        location: "Bangalore",
        jobType: "full-time",
        salary: "₹12-18 LPA",
        skills: JSON.stringify([
          "UI Design",
          "UX Design",
          "Figma",
          "Prototyping",
        ]),
        status: "approved",
        branch: "Computer Engineering",
        approvedBy: alumniId,
        approvedAt: now.toISOString(),
        createdAt: new Date(
          now.getTime() - 1 * 24 * 60 * 60 * 1000
        ).toISOString(),
        expiresAt: new Date(
          now.getTime() + 60 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        postedById: alumniId,
        title: "Product Manager",
        company: "Freshworks",
        description:
          "We are hiring a Product Manager to lead our B2B SaaS products.",
        location: "Chennai",
        jobType: "full-time",
        salary: "₹18-25 LPA",
        skills: JSON.stringify([
          "Product Management",
          "Agile",
          "User Research",
          "Data Analysis",
        ]),
        status: "approved",
        branch: "Computer Engineering",
        approvedBy: alumniId,
        approvedAt: now.toISOString(),
        createdAt: new Date(
          now.getTime() - 2 * 24 * 60 * 60 * 1000
        ).toISOString(),
        expiresAt: new Date(
          now.getTime() + 60 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    ];

    await db.insert(jobs).values(sampleJobs);

    // Seed 5 sample events
    const sampleEvents = [
      {
        organizerId: alumniId,
        title: "React & Next.js Workshop",
        description:
          "Learn modern web development with React and Next.js from scratch. This hands-on workshop covers component architecture, state management, routing, and deployment.",
        location: "Terna Engineering College, Nerul - Computer Lab 301",
        startDate: new Date(
          now.getTime() + 15 * 24 * 60 * 60 * 1000
        ).toISOString(),
        endDate: new Date(
          now.getTime() + 15 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000
        ).toISOString(),
        category: "workshop",
        maxAttendees: 40,
        isPaid: true,
        price: "₹499",
        imageUrl:
          "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
        status: "approved",
        branch: "Computer Engineering",
        approvedBy: alumniId,
        approvedAt: new Date(
          now.getTime() - 3 * 24 * 60 * 60 * 1000
        ).toISOString(),
        createdAt: new Date(
          now.getTime() - 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        organizerId: alumniId,
        title: "Python Programming & Data Science Bootcamp",
        description:
          "Master Python programming and dive into data science fundamentals. This comprehensive workshop covers Python basics, pandas, NumPy, data visualization.",
        location: "Online - Zoom",
        startDate: new Date(
          now.getTime() + 25 * 24 * 60 * 60 * 1000
        ).toISOString(),
        endDate: new Date(
          now.getTime() + 25 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000
        ).toISOString(),
        category: "workshop",
        maxAttendees: 50,
        isPaid: true,
        price: "₹999",
        imageUrl:
          "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800",
        status: "approved",
        branch: null,
        approvedBy: alumniId,
        approvedAt: new Date(
          now.getTime() - 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
        createdAt: new Date(
          now.getTime() - 10 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        organizerId: alumniId,
        title: "Alumni Networking Meetup",
        description:
          "Join us for an evening of networking with fellow alumni. Share experiences, discuss career opportunities, and build lasting connections.",
        location: "Terna Campus Auditorium",
        startDate: new Date(
          now.getTime() + 10 * 24 * 60 * 60 * 1000
        ).toISOString(),
        endDate: new Date(
          now.getTime() + 10 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000
        ).toISOString(),
        category: "meetup",
        maxAttendees: 100,
        isPaid: false,
        price: null,
        imageUrl:
          "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",
        status: "approved",
        branch: null,
        approvedBy: alumniId,
        approvedAt: now.toISOString(),
        createdAt: new Date(
          now.getTime() - 2 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        organizerId: alumniId,
        title: "Career Guidance Webinar",
        description:
          "Industry experts share insights on career paths, interview preparation, and professional development. Q&A session included.",
        location: "Online - MS Teams",
        startDate: new Date(
          now.getTime() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        endDate: new Date(
          now.getTime() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
        ).toISOString(),
        category: "webinar",
        maxAttendees: 200,
        isPaid: false,
        price: null,
        imageUrl:
          "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
        status: "approved",
        branch: null,
        approvedBy: alumniId,
        approvedAt: now.toISOString(),
        createdAt: new Date(
          now.getTime() - 1 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        organizerId: alumniId,
        title: "Tech Conference 2025",
        description:
          "Annual tech conference featuring talks on AI, Cloud Computing, Blockchain, and emerging technologies. Network with industry leaders.",
        location: "Mumbai Convention Center",
        startDate: new Date(
          now.getTime() + 45 * 24 * 60 * 60 * 1000
        ).toISOString(),
        endDate: new Date(
          now.getTime() + 47 * 24 * 60 * 60 * 1000
        ).toISOString(),
        category: "conference",
        maxAttendees: 500,
        isPaid: true,
        price: "₹2999",
        imageUrl:
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
        status: "approved",
        branch: null,
        approvedBy: alumniId,
        approvedAt: now.toISOString(),
        createdAt: new Date(
          now.getTime() - 14 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    ];

    await db.insert(events).values(sampleEvents);

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully!",
      data: {
        jobs: sampleJobs.length,
        events: sampleEvents.length,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed database", details: (error as Error).message },
      { status: 500 }
    );
  }
}
