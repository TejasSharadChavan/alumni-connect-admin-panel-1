const { createClient } = require("@libsql/client");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const db = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const industrySkills = [
  // Software Development - High Demand
  {
    skillName: "React.js",
    category: "framework",
    industry: "software",
    demandLevel: "high",
    description:
      "Modern JavaScript library for building user interfaces. Essential for frontend development roles.",
    relatedSkills: ["JavaScript", "TypeScript", "Next.js", "Redux", "HTML/CSS"],
    averageSalaryImpact: "+20%",
    learningResources: ["https://react.dev", "https://nextjs.org/learn"],
  },
  {
    skillName: "Python",
    category: "language",
    industry: "software",
    demandLevel: "high",
    description:
      "Versatile programming language used in web development, data science, AI/ML, and automation.",
    relatedSkills: ["Django", "Flask", "FastAPI", "NumPy", "Pandas"],
    averageSalaryImpact: "+25%",
    learningResources: ["https://python.org", "https://realpython.com"],
  },
  {
    skillName: "AWS (Amazon Web Services)",
    category: "tool",
    industry: "software",
    demandLevel: "high",
    description:
      "Cloud computing platform essential for modern application deployment and scaling.",
    relatedSkills: ["Docker", "Kubernetes", "Terraform", "CI/CD", "DevOps"],
    averageSalaryImpact: "+30%",
    learningResources: ["https://aws.amazon.com/training"],
  },
  {
    skillName: "TypeScript",
    category: "language",
    industry: "software",
    demandLevel: "high",
    description:
      "Typed superset of JavaScript that improves code quality and developer experience.",
    relatedSkills: ["JavaScript", "React", "Node.js", "Angular"],
    averageSalaryImpact: "+15%",
    learningResources: ["https://typescriptlang.org"],
  },
  {
    skillName: "Docker",
    category: "tool",
    industry: "software",
    demandLevel: "high",
    description:
      "Containerization platform for consistent application deployment across environments.",
    relatedSkills: ["Kubernetes", "AWS", "DevOps", "Linux"],
    averageSalaryImpact: "+20%",
    learningResources: ["https://docker.com/get-started"],
  },

  // Data Science - High Demand
  {
    skillName: "Machine Learning",
    category: "technical",
    industry: "data_science",
    demandLevel: "high",
    description:
      "Core skill for building predictive models and AI systems. Highly sought after across industries.",
    relatedSkills: [
      "Python",
      "TensorFlow",
      "PyTorch",
      "Scikit-learn",
      "Statistics",
    ],
    averageSalaryImpact: "+35%",
    learningResources: ["https://coursera.org/learn/machine-learning"],
  },
  {
    skillName: "SQL",
    category: "language",
    industry: "data_science",
    demandLevel: "high",
    description:
      "Essential for data analysis and database management. Required in almost all data roles.",
    relatedSkills: ["PostgreSQL", "MySQL", "Data Analysis", "Python"],
    averageSalaryImpact: "+18%",
    learningResources: ["https://mode.com/sql-tutorial"],
  },
  {
    skillName: "Data Visualization",
    category: "technical",
    industry: "data_science",
    demandLevel: "high",
    description:
      "Ability to present data insights through charts, dashboards, and interactive visualizations.",
    relatedSkills: ["Tableau", "Power BI", "Python", "D3.js", "Excel"],
    averageSalaryImpact: "+22%",
    learningResources: ["https://tableau.com/learn"],
  },

  // Soft Skills - High Demand
  {
    skillName: "Communication Skills",
    category: "soft_skill",
    industry: "software",
    demandLevel: "high",
    description:
      "Clear communication is critical for collaboration, presentations, and stakeholder management.",
    relatedSkills: ["Leadership", "Teamwork", "Presentation", "Writing"],
    averageSalaryImpact: "+12%",
    learningResources: ["https://linkedin.com/learning"],
  },
  {
    skillName: "Problem Solving",
    category: "soft_skill",
    industry: "software",
    demandLevel: "high",
    description:
      "Analytical thinking and creative problem-solving are essential for technical roles.",
    relatedSkills: ["Critical Thinking", "Algorithms", "System Design"],
    averageSalaryImpact: "+15%",
    learningResources: ["https://leetcode.com"],
  },

  // Medium Demand Skills
  {
    skillName: "Node.js",
    category: "framework",
    industry: "software",
    demandLevel: "medium",
    description:
      "JavaScript runtime for building scalable backend applications.",
    relatedSkills: ["JavaScript", "Express.js", "MongoDB", "REST APIs"],
    averageSalaryImpact: "+18%",
    learningResources: ["https://nodejs.org/en/learn"],
  },
  {
    skillName: "MongoDB",
    category: "tool",
    industry: "software",
    demandLevel: "medium",
    description: "NoSQL database popular for modern web applications.",
    relatedSkills: ["Node.js", "Express.js", "Mongoose", "Database Design"],
    averageSalaryImpact: "+12%",
    learningResources: ["https://university.mongodb.com"],
  },
  {
    skillName: "Git & GitHub",
    category: "tool",
    industry: "software",
    demandLevel: "high",
    description:
      "Version control is fundamental for all software development roles.",
    relatedSkills: ["CI/CD", "DevOps", "Collaboration"],
    averageSalaryImpact: "+10%",
    learningResources: ["https://github.com/skills"],
  },
  {
    skillName: "REST APIs",
    category: "technical",
    industry: "software",
    demandLevel: "high",
    description:
      "Understanding API design and integration is crucial for full-stack development.",
    relatedSkills: ["HTTP", "JSON", "Node.js", "Postman"],
    averageSalaryImpact: "+15%",
    learningResources: ["https://restfulapi.net"],
  },
  {
    skillName: "Agile/Scrum",
    category: "soft_skill",
    industry: "software",
    demandLevel: "medium",
    description:
      "Agile methodologies are standard in modern software development teams.",
    relatedSkills: ["Project Management", "Teamwork", "JIRA"],
    averageSalaryImpact: "+8%",
    learningResources: ["https://scrumguides.org"],
  },

  // Design
  {
    skillName: "Figma",
    category: "tool",
    industry: "design",
    demandLevel: "high",
    description: "Industry-standard tool for UI/UX design and prototyping.",
    relatedSkills: ["UI/UX Design", "Prototyping", "Design Systems"],
    averageSalaryImpact: "+20%",
    learningResources: ["https://figma.com/resources/learn-design"],
  },
  {
    skillName: "UI/UX Design",
    category: "technical",
    industry: "design",
    demandLevel: "high",
    description:
      "User-centered design principles for creating intuitive digital experiences.",
    relatedSkills: ["Figma", "User Research", "Wireframing", "Prototyping"],
    averageSalaryImpact: "+25%",
    learningResources: ["https://nngroup.com"],
  },

  // Emerging Technologies
  {
    skillName: "AI/ChatGPT Integration",
    category: "technical",
    industry: "software",
    demandLevel: "high",
    description:
      "Integrating AI capabilities into applications is becoming essential.",
    relatedSkills: ["Python", "APIs", "Machine Learning", "Prompt Engineering"],
    averageSalaryImpact: "+28%",
    learningResources: ["https://platform.openai.com/docs"],
  },
  {
    skillName: "Cybersecurity",
    category: "technical",
    industry: "software",
    demandLevel: "high",
    description:
      "Security awareness and best practices are critical in all development roles.",
    relatedSkills: [
      "Network Security",
      "Encryption",
      "Authentication",
      "OWASP",
    ],
    averageSalaryImpact: "+32%",
    learningResources: ["https://owasp.org"],
  },
  {
    skillName: "GraphQL",
    category: "technical",
    industry: "software",
    demandLevel: "medium",
    description: "Modern API query language gaining popularity over REST.",
    relatedSkills: ["REST APIs", "Node.js", "React", "Apollo"],
    averageSalaryImpact: "+15%",
    learningResources: ["https://graphql.org/learn"],
  },
];

async function seedIndustrySkills() {
  try {
    console.log("🌱 Starting industry skills seeding...");

    // Get all alumni users
    const alumniResult = await db.execute({
      sql: "SELECT id, name FROM users WHERE role = 'alumni' LIMIT 10",
      args: [],
    });

    const alumni = alumniResult.rows;

    if (alumni.length === 0) {
      console.log("❌ No alumni found in database. Please seed users first.");
      return;
    }

    console.log(`✅ Found ${alumni.length} alumni users`);

    const now = new Date().toISOString();
    let skillsCreated = 0;

    for (const skill of industrySkills) {
      // Randomly assign to an alumni
      const randomAlumni = alumni[Math.floor(Math.random() * alumni.length)];

      // Random upvotes/downvotes for realism
      const upvotes = Math.floor(Math.random() * 50) + 10;
      const downvotes = Math.floor(Math.random() * 10);

      await db.execute({
        sql: `INSERT INTO industry_skills 
          (posted_by, skill_name, category, industry, demand_level, description, 
           related_skills, average_salary_impact, learning_resources, upvotes, downvotes, 
           is_active, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          randomAlumni.id,
          skill.skillName,
          skill.category,
          skill.industry,
          skill.demandLevel,
          skill.description,
          JSON.stringify(skill.relatedSkills),
          skill.averageSalaryImpact,
          JSON.stringify(skill.learningResources),
          upvotes,
          downvotes,
          1,
          now,
          now,
        ],
      });

      skillsCreated++;
      console.log(
        `✅ Created: ${skill.skillName} (${skill.category}) - Posted by ${randomAlumni.name}`
      );
    }

    console.log(`\n🎉 Successfully seeded ${skillsCreated} industry skills!`);
    console.log("\n📊 Summary:");
    console.log(
      `   - High demand skills: ${industrySkills.filter((s) => s.demandLevel === "high").length}`
    );
    console.log(
      `   - Medium demand skills: ${industrySkills.filter((s) => s.demandLevel === "medium").length}`
    );
    console.log(
      `   - Categories: ${[...new Set(industrySkills.map((s) => s.category))].join(", ")}`
    );
    console.log(
      `   - Industries: ${[...new Set(industrySkills.map((s) => s.industry))].join(", ")}`
    );
  } catch (error) {
    console.error("❌ Error seeding industry skills:", error);
  }
}

seedIndustrySkills();
