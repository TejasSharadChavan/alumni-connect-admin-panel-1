import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobs, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    // Get an alumni user to post the job
    const alumni = await db
      .select()
      .from(users)
      .where(eq(users.role, "alumni"))
      .limit(1);

    if (alumni.length === 0) {
      return NextResponse.json(
        { error: "No alumni found. Please seed users first." },
        { status: 400 }
      );
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days

    const detailedJob = {
      postedById: alumni[0].id,
      title: "Senior Full Stack Engineer - Cloud Platform",
      company: "Google",
      description: `About the Role:

We are seeking an exceptional Senior Full Stack Engineer to join our Cloud Platform team at Google. This is a unique opportunity to work on cutting-edge cloud infrastructure that serves millions of users worldwide. You'll be at the forefront of innovation, building scalable solutions that power the next generation of cloud computing.

Key Responsibilities:

• Design and Development: Architect, develop, and maintain highly scalable microservices and web applications using modern technologies. You'll work across the full stack, from designing elegant user interfaces to building robust backend systems.

• Cloud Infrastructure: Build and optimize cloud-native applications on Google Cloud Platform (GCP). Implement containerization strategies using Docker and Kubernetes, ensuring high availability and fault tolerance.

• System Architecture: Collaborate with senior architects to design distributed systems that can handle massive scale. Make critical decisions about technology choices, system design, and architectural patterns.

• Code Quality: Write clean, maintainable, and well-documented code. Conduct thorough code reviews and mentor junior engineers. Establish and enforce best practices for testing, deployment, and monitoring.

• Performance Optimization: Identify and resolve performance bottlenecks. Implement caching strategies, optimize database queries, and ensure applications meet strict SLA requirements.

• Cross-functional Collaboration: Work closely with product managers, designers, and other engineering teams to deliver features that delight users. Participate in agile ceremonies and contribute to sprint planning.

• Innovation: Stay current with emerging technologies and industry trends. Propose and implement innovative solutions to complex technical challenges. Contribute to technical blog posts and open-source projects.

Required Qualifications:

• 5+ years of professional software development experience with a strong track record of delivering production systems
• Expert-level proficiency in JavaScript/TypeScript and modern frameworks (React, Next.js, Vue.js, or Angular)
• Strong backend development skills with Node.js, Python, or Go
• Deep understanding of RESTful APIs, GraphQL, and microservices architecture
• Extensive experience with cloud platforms (GCP preferred, AWS or Azure acceptable)
• Proficiency with containerization (Docker) and orchestration (Kubernetes)
• Strong knowledge of SQL and NoSQL databases (PostgreSQL, MongoDB, Redis)
• Experience with CI/CD pipelines and DevOps practices
• Excellent problem-solving skills and ability to debug complex systems
• Strong communication skills and ability to work in a collaborative environment

Preferred Qualifications:

• Bachelor's or Master's degree in Computer Science, Engineering, or related field
• Experience with distributed systems and event-driven architectures
• Knowledge of message queues (Kafka, RabbitMQ, Pub/Sub)
• Familiarity with monitoring and observability tools (Prometheus, Grafana, Datadog)
• Experience with Infrastructure as Code (Terraform, CloudFormation)
• Contributions to open-source projects
• Experience mentoring and leading technical initiatives
• Understanding of security best practices and compliance requirements

What We Offer:

• Competitive Compensation: Industry-leading salary package with equity and performance bonuses
• Comprehensive Benefits: Health, dental, and vision insurance for you and your family
• Work-Life Balance: Flexible working hours and hybrid work options
• Professional Growth: Generous learning and development budget, conference attendance, and certification support
• Cutting-Edge Technology: Work with the latest tools and technologies in a fast-paced environment
• Collaborative Culture: Join a team of talented engineers who are passionate about technology and innovation
• Impact: Your work will directly impact millions of users around the world
• Perks: Free meals, gym membership, commuter benefits, and more

About Google Cloud Platform:

Google Cloud Platform is one of the world's leading cloud computing platforms, serving enterprises, startups, and developers globally. Our mission is to accelerate every organization's ability to digitally transform its business. We provide a comprehensive suite of cloud services including compute, storage, networking, big data, machine learning, and IoT.

Our Engineering Culture:

At Google, we believe in fostering a culture of innovation, collaboration, and continuous learning. We encourage engineers to take ownership of their projects, experiment with new ideas, and learn from failures. We value diversity and inclusion, and we're committed to building a team that represents a variety of backgrounds, perspectives, and skills.

Application Process:

1. Initial Screening: Resume review and preliminary assessment
2. Technical Phone Screen: 45-minute coding interview focusing on data structures and algorithms
3. Virtual Onsite: 4-5 rounds of technical interviews covering system design, coding, and behavioral questions
4. Team Matching: Discussion with potential team leads to find the best fit
5. Offer: Competitive offer package with detailed breakdown

We are committed to equal employment opportunity regardless of race, color, ancestry, religion, sex, national origin, sexual orientation, age, citizenship, marital status, disability, gender identity, or Veteran status.

Join us in building the future of cloud computing!`,
      location: "Mountain View, CA (Hybrid)",
      jobType: "full-time",
      salary: "$180,000 - $250,000 + equity + bonus",
      skills: JSON.stringify([
        "React",
        "Next.js",
        "TypeScript",
        "Node.js",
        "Python",
        "Go",
        "Docker",
        "Kubernetes",
        "Google Cloud Platform",
        "PostgreSQL",
        "MongoDB",
        "Redis",
        "GraphQL",
        "Microservices",
        "CI/CD",
        "System Design",
      ]),
      branch: "Computer Engineering",
      status: "approved",
      approvedBy: alumni[0].id,
      approvedAt: now.toISOString(),
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    const [createdJob] = await db.insert(jobs).values(detailedJob).returning();

    return NextResponse.json({
      success: true,
      message: "Detailed job posted successfully!",
      job: {
        id: createdJob.id,
        title: createdJob.title,
        company: createdJob.company,
        descriptionLength: detailedJob.description.length,
      },
    });
  } catch (error) {
    console.error("Seed detailed job error:", error);
    return NextResponse.json(
      {
        error: "Failed to seed detailed job",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
