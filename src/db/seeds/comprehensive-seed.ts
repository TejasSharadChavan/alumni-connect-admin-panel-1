import { db } from '../index';
import { 
  users, posts, comments, postReactions, connections, jobs, applications, 
  events, rsvps, mentorshipRequests, mentorshipSessions, teams, teamMembers,
  tasks, taskComments, chats, chatMembers, messages, campaigns, donations, notifications,
  activityLog, payments
} from '../schema';
import { eq, sql } from 'drizzle-orm';

// Comprehensive seed with 50+ students, 40+ alumni, 15+ faculty, 100-200 posts
async function comprehensiveSeed() {
  console.log('🌱 Starting comprehensive seed...');

  // Disable foreign key checks temporarily for cleanup
  await db.run(sql`PRAGMA foreign_keys = OFF`);

  // Clear existing data in correct order
  await db.delete(taskComments);
  await db.delete(tasks);
  await db.delete(teamMembers);
  await db.delete(teams);
  await db.delete(mentorshipSessions);
  await db.delete(mentorshipRequests);
  await db.delete(messages);
  await db.delete(chatMembers);
  await db.delete(chats);
  await db.delete(donations);
  await db.delete(campaigns);
  await db.delete(rsvps);
  await db.delete(events);
  await db.delete(applications);
  await db.delete(jobs);
  await db.delete(comments);
  await db.delete(postReactions);
  await db.delete(posts);
  await db.delete(connections);
  await db.delete(notifications);
  await db.delete(activityLog);
  await db.delete(payments);
  await db.delete(users);

  // Re-enable foreign key checks
  await db.run(sql`PRAGMA foreign_keys = ON`);

  const now = new Date().toISOString();
  const hashPassword = (pwd: string) => `$2a$10$${pwd.padEnd(53, 'x')}`; // Mock hash

  // 1. SEED USERS (50+ students, 40+ alumni, 15+ faculty, 2 admin)
  console.log('👥 Seeding users...');
  
  const adminUsers = await db.insert(users).values([
    {
      name: 'Dr. Rajesh Kumar',
      email: 'dean@terna.ac.in',
      passwordHash: hashPassword('Password@123'),
      role: 'admin',
      status: 'approved',
      department: 'Administration',
      headline: 'Dean - Terna Engineering College',
      bio: 'Leading educational excellence for over 20 years',
      profileImageUrl: 'https://i.pravatar.cc/150?img=12',
      phone: '+91-9876543210',
      createdAt: now,
      updatedAt: now
    },
    {
      name: 'Prof. Anjali Sharma',
      email: 'admin@terna.ac.in',
      passwordHash: hashPassword('Password@123'),
      role: 'admin',
      status: 'approved',
      department: 'Administration',
      headline: 'Academic Director',
      bio: 'Passionate about student success and institutional growth',
      profileImageUrl: 'https://i.pravatar.cc/150?img=47',
      phone: '+91-9876543211',
      createdAt: now,
      updatedAt: now
    }
  ]).returning();

  const firstAdminId = adminUsers[0].id;

  // Seed 15 faculty members
  const facultyData = [
    { name: 'Dr. Priya Joshi', dept: 'Computer Science', expertise: 'AI/ML', img: 1 },
    { name: 'Prof. Amit Patel', dept: 'Computer Science', expertise: 'Cloud Computing', img: 2 },
    { name: 'Dr. Sneha Reddy', dept: 'Information Technology', expertise: 'Cybersecurity', img: 5 },
    { name: 'Prof. Vikram Singh', dept: 'Electronics', expertise: 'IoT', img: 8 },
    { name: 'Dr. Meera Nair', dept: 'Mechanical', expertise: 'Robotics', img: 9 },
    { name: 'Prof. Rahul Desai', dept: 'Civil', expertise: 'Structural Engineering', img: 11 },
    { name: 'Dr. Kavita Shah', dept: 'Computer Science', expertise: 'Data Science', img: 20 },
    { name: 'Prof. Suresh Kumar', dept: 'Electronics', expertise: 'VLSI Design', img: 13 },
    { name: 'Dr. Pooja Gupta', dept: 'Information Technology', expertise: 'Web Technologies', img: 23 },
    { name: 'Prof. Arjun Rao', dept: 'Mechanical', expertise: 'CAD/CAM', img: 15 },
    { name: 'Dr. Neha Verma', dept: 'Computer Science', expertise: 'Blockchain', img: 24 },
    { name: 'Prof. Kiran Mehta', dept: 'Civil', expertise: 'Environmental Engineering', img: 16 },
    { name: 'Dr. Sanjay Iyer', dept: 'Electronics', expertise: 'Embedded Systems', img: 14 },
    { name: 'Prof. Deepa Kulkarni', dept: 'Information Technology', expertise: 'Mobile Development', img: 28 },
    { name: 'Dr. Manoj Jain', dept: 'Mechanical', expertise: 'Thermal Engineering', img: 17 }
  ];

  const facultyUsers = await db.insert(users).values(
    facultyData.map((f, i) => ({
      name: f.name,
      email: `${f.name.toLowerCase().replace(/[.\s]/g, '')}@terna.ac.in`,
      passwordHash: hashPassword('Password@123'),
      role: 'faculty',
      status: 'approved',
      department: f.dept,
      headline: `${f.name.startsWith('Dr.') ? 'Professor' : 'Assistant Professor'} - ${f.expertise}`,
      bio: `Experienced educator specializing in ${f.expertise}. Committed to student mentorship and research.`,
      skills: JSON.stringify([f.expertise, 'Teaching', 'Research', 'Mentoring']),
      profileImageUrl: `https://i.pravatar.cc/150?img=${f.img}`,
      linkedinUrl: `https://linkedin.com/in/${f.name.toLowerCase().replace(/[.\s]/g, '')}`,
      phone: `+91-98765432${20 + i}`,
      approvedBy: firstAdminId,
      approvedAt: now,
      createdAt: now,
      updatedAt: now
    }))
  ).returning();

  // Seed 50+ students
  const studentNames = [
    'Aarav Sharma', 'Diya Patel', 'Arjun Mehta', 'Ananya Singh', 'Rohan Gupta',
    'Isha Reddy', 'Vivaan Kumar', 'Aanya Nair', 'Aditya Joshi', 'Sara Desai',
    'Kabir Shah', 'Myra Verma', 'Vihaan Rao', 'Kiara Iyer', 'Reyansh Kulkarni',
    'Aadhya Sharma', 'Ayaan Patel', 'Pari Singh', 'Shaurya Mehta', 'Navya Gupta',
    'Dhruv Reddy', 'Zara Nair', 'Atharv Kumar', 'Anika Joshi', 'Aarush Desai',
    'Tara Shah', 'Vedant Verma', 'Saanvi Rao', 'Pranav Iyer', 'Riya Kulkarni',
    'Om Sharma', 'Mishka Patel', 'Sai Singh', 'Ahana Mehta', 'Rudra Gupta',
    'Anvi Reddy', 'Darsh Nair', 'Kimaya Kumar', 'Advait Joshi', 'Avni Desai',
    'Yuvan Shah', 'Ishita Verma', 'Arnav Rao', 'Shanaya Iyer', 'Krish Kulkarni',
    'Meera Sharma', 'Viraj Patel', 'Amaira Singh', 'Laksh Mehta', 'Aarohi Gupta',
    'Dev Reddy', 'Nitya Nair', 'Shivansh Kumar', 'Aditi Joshi', 'Ayush Desai'
  ];

  const branches = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil'];
  const cohorts = ['2021-2025', '2022-2026', '2023-2027', '2024-2028'];
  const skills = ['Python', 'Java', 'JavaScript', 'React', 'Node.js', 'AI/ML', 'Data Science', 'Cloud', 'Docker', 'Kubernetes'];

  const studentUsers = await db.insert(users).values(
    studentNames.map((name, i) => {
      const branch = branches[i % branches.length];
      const cohort = cohorts[i % cohorts.length];
      const yearOfPassing = parseInt(cohort.split('-')[1]);
      const studentSkills = skills.slice(i % 5, (i % 5) + 4);
      
      return {
        name,
        email: `${name.toLowerCase().replace(/\s/g, '.')}@terna.student.ac.in`,
        passwordHash: hashPassword('Password@123'),
        role: 'student',
        status: 'approved',
        branch,
        cohort,
        yearOfPassing,
        headline: `${branch} Student | ${cohort}`,
        bio: `Passionate ${branch} student interested in ${studentSkills[0]} and ${studentSkills[1]}. Always eager to learn new technologies and work on innovative projects.`,
        skills: JSON.stringify(studentSkills),
        profileImageUrl: `https://i.pravatar.cc/150?img=${30 + i}`,
        resumeUrl: i % 3 === 0 ? `https://example.com/resumes/${name.replace(/\s/g, '_')}.pdf` : undefined,
        linkedinUrl: `https://linkedin.com/in/${name.toLowerCase().replace(/\s/g, '')}`,
        githubUrl: `https://github.com/${name.toLowerCase().replace(/\s/g, '')}`,
        phone: `+91-9${String(100000000 + i).padStart(9, '0')}`,
        approvedBy: firstAdminId,
        approvedAt: now,
        createdAt: now,
        updatedAt: now
      };
    })
  ).returning();

  // Seed 40+ alumni
  const alumniNames = [
    'Rahul Agarwal', 'Priya Kapoor', 'Amit Singhania', 'Neha Malhotra', 'Karan Chopra',
    'Simran Bhatia', 'Rohan Sinha', 'Divya Menon', 'Varun Khanna', 'Swati Jain',
    'Nikhil Agarwal', 'Pooja Saxena', 'Siddharth Rao', 'Megha Pillai', 'Abhishek Sharma',
    'Ritu Verma', 'Gaurav Mishra', 'Anjali Nambiar', 'Sandeep Kumar', 'Kavita Reddy',
    'Rajesh Nair', 'Shweta Iyer', 'Manoj Kulkarni', 'Deepika Shah', 'Anil Desai',
    'Sneha Patel', 'Vikrant Mehta', 'Aditi Gupta', 'Sunil Reddy', 'Preeti Joshi',
    'Harsh Sharma', 'Nidhi Singh', 'Akash Verma', 'Richa Rao', 'Rohit Iyer',
    'Shruti Kulkarni', 'Vishal Desai', 'Pallavi Shah', 'Suresh Patel', 'Anita Mehta',
    'Naveen Gupta', 'Sakshi Reddy', 'Praveen Nair', 'Madhuri Joshi', 'Ashok Kumar'
  ];

  const companies = ['Google', 'Microsoft', 'Amazon', 'TCS', 'Infosys', 'Wipro', 'Accenture', 'Cognizant', 'IBM', 'Oracle', 'Capgemini', 'Tech Mahindra', 'HCL', 'Mindtree', 'L&T Infotech'];
  const positions = ['Software Engineer', 'Senior Developer', 'Tech Lead', 'Product Manager', 'Data Scientist', 'DevOps Engineer', 'Solutions Architect', 'Engineering Manager', 'Consultant'];

  const alumniUsers = await db.insert(users).values(
    alumniNames.map((name, i) => {
      const branch = branches[i % branches.length];
      const yearOfPassing = 2015 + (i % 9);
      const company = companies[i % companies.length];
      const position = positions[i % positions.length];
      const alumniSkills = skills.slice((i % 6), (i % 6) + 5);
      
      return {
        name,
        email: `${name.toLowerCase().replace(/\s/g, '.')}@gmail.com`,
        passwordHash: hashPassword('Password@123'),
        role: 'alumni',
        status: 'approved',
        branch,
        yearOfPassing,
        headline: `${position} @ ${company}`,
        bio: `Terna Engineering College alumnus (${yearOfPassing}). Currently working as ${position} at ${company}. Passionate about mentoring students and giving back to the community.`,
        skills: JSON.stringify(alumniSkills),
        profileImageUrl: `https://i.pravatar.cc/150?img=${i + 1}`,
        resumeUrl: `https://example.com/resumes/${name.replace(/\s/g, '_')}.pdf`,
        linkedinUrl: `https://linkedin.com/in/${name.toLowerCase().replace(/\s/g, '')}`,
        githubUrl: i % 2 === 0 ? `https://github.com/${name.toLowerCase().replace(/\s/g, '')}` : undefined,
        phone: `+91-8${String(100000000 + i).padStart(9, '0')}`,
        approvedBy: firstAdminId,
        approvedAt: now,
        createdAt: now,
        updatedAt: now
      };
    })
  ).returning();

  const allUsers = [...adminUsers, ...facultyUsers, ...studentUsers, ...alumniUsers];
  console.log(`✅ Seeded ${allUsers.length} users`);

  // 2. SEED 150+ POSTS with images
  console.log('📝 Seeding posts...');
  
  const postTemplates = [
    { content: 'Excited to share that I have been selected for the Google Summer of Code 2024! 🎉 Looking forward to contributing to open source.', category: 'achievement', tags: ['#GSoC', '#OpenSource', '#Achievement'] },
    { content: 'Just completed my internship at Microsoft! It was an amazing learning experience. Thanks to all my mentors! 🙏', category: 'achievement', tags: ['#Internship', '#Microsoft', '#Career'] },
    { content: 'Our team won first prize in the Smart India Hackathon! Hard work pays off! 🏆', category: 'achievement', tags: ['#Hackathon', '#TeamWork', '#Winner'] },
    { content: 'Looking for recommendations on the best courses for learning Machine Learning. Any suggestions?', category: 'question', tags: ['#MachineLearning', '#Learning', '#Help'] },
    { content: 'Organizing a workshop on React and Next.js this Saturday. All students welcome! Register now! 🚀', category: 'announcement', tags: ['#Workshop', '#React', '#NextJS'] },
    { content: 'Just published my first research paper on AI in healthcare! Link in bio. 📄', category: 'achievement', tags: ['#Research', '#AI', '#Healthcare'] },
    { content: 'Can anyone explain the difference between REST and GraphQL APIs? Need help for my project.', category: 'question', tags: ['#APIs', '#WebDev', '#Help'] },
    { content: 'Attending the Tech Summit 2024 next week. Who else is going? Let\'s connect! 🤝', category: 'discussion', tags: ['#TechSummit', '#Networking', '#Event'] },
    { content: 'Our robotics team built an autonomous drone. Check out the demo video! 🤖', category: 'project', tags: ['#Robotics', '#Drone', '#Innovation'] },
    { content: 'Received an offer from Amazon for SDE role! Dreams do come true! 🎊', category: 'achievement', tags: ['#JobOffer', '#Amazon', '#Career'] },
    { content: 'Started learning Kubernetes and Docker. Any good resources you can recommend?', category: 'question', tags: ['#Kubernetes', '#Docker', '#DevOps'] },
    { content: 'Huge shoutout to Prof. Joshi for the amazing AI workshop today! Learned so much! 🙌', category: 'discussion', tags: ['#Workshop', '#AI', '#Gratitude'] },
    { content: 'Working on a mobile app for campus management. Would love to get feedback from the community!', category: 'project', tags: ['#MobileApp', '#Campus', '#Feedback'] },
    { content: 'Terna Engineering College Alumni Meet 2024 - Save the date: March 15th! More details coming soon!', category: 'announcement', tags: ['#AlumniMeet', '#Event', '#TEC'] },
    { content: 'Just crossed 10k followers on LinkedIn! Thank you all for the support! 🙏', category: 'achievement', tags: ['#Milestone', '#LinkedIn', '#Gratitude'] }
  ];

  const imageUrls = [
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800'
  ];

  const postsList = [];
  for (let i = 0; i < 150; i++) {
    const template = postTemplates[i % postTemplates.length];
    const author = allUsers[2 + (i % (allUsers.length - 2))]; // Skip admins
    const hasImage = i % 3 === 0;
    const hasMultipleImages = i % 7 === 0;
    
    postsList.push({
      authorId: author.id,
      content: template.content,
      imageUrl: hasImage && !hasMultipleImages ? imageUrls[i % imageUrls.length] : undefined,
      imageUrls: hasMultipleImages ? JSON.stringify([imageUrls[(i) % 6], imageUrls[(i + 1) % 6], imageUrls[(i + 2) % 6]]) : undefined,
      tags: JSON.stringify(template.tags),
      sharesCount: Math.floor(Math.random() * 50),
      category: template.category,
      branch: author.role === 'student' ? author.branch : undefined,
      visibility: 'public',
      status: 'approved',
      approvedBy: firstAdminId,
      approvedAt: now,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now
    });
  }

  const postsResult = await db.insert(posts).values(postsList).returning();
  console.log(`✅ Seeded ${postsResult.length} posts`);

  // 3. SEED COMMENTS, REACTIONS
  console.log('💬 Seeding comments and reactions...');
  
  const commentTexts = [
    'Congratulations! Well deserved!',
    'This is amazing! Keep up the great work!',
    'Thanks for sharing this!',
    'Very helpful, thanks!',
    'Can you share more details about this?',
    'This is exactly what I was looking for!',
    'Great achievement! Proud of you!',
    'Inspiring story!',
    'Would love to collaborate on this!',
    'Excellent work! Keep it up!'
  ];

  const commentsList = [];
  const reactionsList = [];
  
  for (const post of postsResult.slice(0, 100)) {
    const numComments = Math.floor(Math.random() * 5) + 1;
    const numReactions = Math.floor(Math.random() * 30) + 5;
    
    for (let i = 0; i < numComments; i++) {
      const commenter = allUsers[Math.floor(Math.random() * allUsers.length)];
      commentsList.push({
        postId: post.id,
        authorId: commenter.id,
        content: commentTexts[Math.floor(Math.random() * commentTexts.length)],
        createdAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    const reactors = new Set();
    for (let i = 0; i < numReactions; i++) {
      const reactor = allUsers[Math.floor(Math.random() * allUsers.length)];
      if (!reactors.has(reactor.id)) {
        reactors.add(reactor.id);
        const reactionTypes = ['like', 'heart', 'celebrate'];
        reactionsList.push({
          postId: post.id,
          userId: reactor.id,
          reactionType: reactionTypes[Math.floor(Math.random() * reactionTypes.length)],
          createdAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    }
  }

  await db.insert(comments).values(commentsList);
  await db.insert(postReactions).values(reactionsList);
  console.log(`✅ Seeded ${commentsList.length} comments and ${reactionsList.length} reactions`);

  // 4. SEED CONNECTIONS
  console.log('🤝 Seeding connections...');
  
  const connectionsList = [];
  for (let i = 0; i < 200; i++) {
    const requester = allUsers[2 + Math.floor(Math.random() * (allUsers.length - 2))];
    const responder = allUsers[2 + Math.floor(Math.random() * (allUsers.length - 2))];
    
    if (requester.id !== responder.id) {
      const statuses = ['accepted', 'accepted', 'accepted', 'accepted', 'pending'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      connectionsList.push({
        requesterId: requester.id,
        responderId: responder.id,
        status,
        message: 'Would love to connect and collaborate!',
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        respondedAt: status === 'accepted' ? new Date(Date.now() - Math.random() * 80 * 24 * 60 * 60 * 1000).toISOString() : undefined
      });
    }
  }

  await db.insert(connections).values(connectionsList);
  console.log(`✅ Seeded ${connectionsList.length} connections`);

  // 5. SEED JOBS & APPLICATIONS
  console.log('💼 Seeding jobs and applications...');
  
  const jobsList = [];
  for (let i = 0; i < 50; i++) {
    const poster = alumniUsers[i % alumniUsers.length];
    const jobTypes = ['full-time', 'full-time', 'full-time', 'internship', 'internship'];
    const jobType = jobTypes[i % jobTypes.length];
    
    jobsList.push({
      postedById: poster.id,
      title: jobType === 'internship' ? `${positions[i % positions.length]} Intern` : positions[i % positions.length],
      company: companies[i % companies.length],
      description: `We are looking for a talented ${positions[i % positions.length]} to join our team. This is an exciting opportunity to work on cutting-edge technologies.`,
      location: ['Mumbai', 'Pune', 'Bangalore', 'Hyderabad', 'Delhi', 'Remote'][i % 6],
      jobType,
      salary: jobType === 'internship' ? '₹15,000 - ₹25,000/month' : '₹8 - ₹15 LPA',
      skills: JSON.stringify(skills.slice(i % 5, (i % 5) + 4)),
      status: 'approved',
      branch: branches[i % branches.length],
      approvedBy: firstAdminId,
      approvedAt: now,
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  const jobsResult = await db.insert(jobs).values(jobsList).returning();
  console.log(`✅ Seeded ${jobsResult.length} jobs`);

  const applicationsList = [];
  for (const job of jobsResult) {
    const numApplicants = Math.floor(Math.random() * 15) + 5;
    for (let i = 0; i < numApplicants; i++) {
      const applicant = studentUsers[Math.floor(Math.random() * studentUsers.length)];
      const statuses = ['applied', 'applied', 'screening', 'interview', 'rejected', 'accepted'];
      
      applicationsList.push({
        jobId: job.id,
        applicantId: applicant.id,
        resumeUrl: applicant.resumeUrl || `https://example.com/resumes/${applicant.name.replace(/\s/g, '_')}.pdf`,
        coverLetter: `I am very interested in the ${job.title} position at ${job.company}. My skills and experience make me a strong candidate for this role.`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        appliedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: now
      });
    }
  }

  await db.insert(applications).values(applicationsList);
  console.log(`✅ Seeded ${applicationsList.length} applications`);

  // 6. SEED EVENTS & RSVPs
  console.log('📅 Seeding events...');
  
  const eventsList = [];
  for (let i = 0; i < 30; i++) {
    const organizer = [...facultyUsers, ...alumniUsers][i % (facultyUsers.length + alumniUsers.length)];
    const categories = ['workshop', 'webinar', 'meetup', 'conference', 'social'];
    const isPaid = i % 5 === 0;
    
    eventsList.push({
      organizerId: organizer.id,
      title: `${categories[i % categories.length].charAt(0).toUpperCase() + categories[i % categories.length].slice(1)} on ${['AI/ML', 'Web Development', 'Cloud Computing', 'Cybersecurity', 'Data Science'][i % 5]}`,
      description: `Join us for an exciting session on ${['AI/ML', 'Web Development', 'Cloud Computing', 'Cybersecurity', 'Data Science'][i % 5]}. Learn from industry experts and network with peers.`,
      location: i % 3 === 0 ? 'Terna Engineering College Campus' : 'Online (Zoom)',
      startDate: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
      category: categories[i % categories.length],
      maxAttendees: isPaid ? 50 : 200,
      isPaid,
      price: isPaid ? '₹500' : undefined,
      imageUrl: imageUrls[i % imageUrls.length],
      status: 'approved',
      branch: branches[i % branches.length],
      approvedBy: firstAdminId,
      approvedAt: now,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  const eventsResult = await db.insert(events).values(eventsList).returning();
  console.log(`✅ Seeded ${eventsResult.length} events`);

  const rsvpsList = [];
  for (const event of eventsResult) {
    const numAttendees = Math.floor(Math.random() * 50) + 10;
    for (let i = 0; i < numAttendees; i++) {
      const attendee = [...studentUsers, ...alumniUsers][Math.floor(Math.random() * (studentUsers.length + alumniUsers.length))];
      
      rsvpsList.push({
        eventId: event.id,
        userId: attendee.id,
        status: 'registered',
        paymentStatus: event.isPaid ? (i % 5 === 0 ? 'pending' : 'completed') : 'na',
        rsvpedAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  }

  await db.insert(rsvps).values(rsvpsList);
  console.log(`✅ Seeded ${rsvpsList.length} RSVPs`);

  // 7. SEED MENTORSHIP
  console.log('🎓 Seeding mentorship...');
  
  const mentorshipList = [];
  for (let i = 0; i < 40; i++) {
    const student = studentUsers[i % studentUsers.length];
    const mentor = [...facultyUsers, ...alumniUsers][i % (facultyUsers.length + alumniUsers.length)];
    const statuses = ['accepted', 'accepted', 'completed', 'pending', 'rejected'];
    
    mentorshipList.push({
      studentId: student.id,
      mentorId: mentor.id,
      topic: ['Career Guidance', 'Technical Skills', 'Interview Preparation', 'Project Guidance', 'Research Mentorship'][i % 5],
      message: `Hi, I would like to seek your mentorship on ${['Career Guidance', 'Technical Skills', 'Interview Preparation', 'Project Guidance', 'Research Mentorship'][i % 5]}. Looking forward to learning from your experience.`,
      preferredTime: 'Weekends',
      status: statuses[i % statuses.length],
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      respondedAt: statuses[i % statuses.length] !== 'pending' ? new Date(Date.now() - Math.random() * 50 * 24 * 60 * 60 * 1000).toISOString() : undefined
    });
  }

  const mentorshipResult = await db.insert(mentorshipRequests).values(mentorshipList).returning();
  console.log(`✅ Seeded ${mentorshipResult.length} mentorship requests`);

  // 8. SEED CHATS & MESSAGES
  console.log('💬 Seeding chats and messages...');
  
  const chatsList = [];
  for (let i = 0; i < 30; i++) {
    const user1 = allUsers[2 + i];
    const user2 = allUsers[2 + ((i + 10) % (allUsers.length - 2))];
    
    chatsList.push({
      chatType: i % 5 === 0 ? 'group' : 'direct',
      name: i % 5 === 0 ? `Project Group ${i}` : undefined,
      createdBy: user1.id,
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  const chatsResult = await db.insert(chats).values(chatsList).returning();
  console.log(`✅ Seeded ${chatsResult.length} chats`);

  const chatMembersList = [];
  const messagesList = [];
  
  for (let i = 0; i < chatsResult.length; i++) {
    const chat = chatsResult[i];
    const user1 = allUsers[2 + i];
    const user2 = allUsers[2 + ((i + 10) % (allUsers.length - 2))];
    
    chatMembersList.push(
      {
        chatId: chat.id,
        userId: user1.id,
        joinedAt: chat.createdAt,
        lastReadAt: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        chatId: chat.id,
        userId: user2.id,
        joinedAt: chat.createdAt,
        lastReadAt: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    );
    
    // Add 10-20 messages per chat
    const numMessages = Math.floor(Math.random() * 11) + 10;
    for (let j = 0; j < numMessages; j++) {
      const sender = j % 2 === 0 ? user1 : user2;
      const messageTexts = [
        'Hey! How are you?',
        'Did you complete the assignment?',
        'Let\'s catch up this weekend',
        'Thanks for your help!',
        'Can you share the presentation?',
        'Great work on the project!',
        'When is the deadline?',
        'Let me know if you need any help',
        'See you at the workshop!',
        'Congratulations on your achievement!'
      ];
      
      messagesList.push({
        chatId: chat.id,
        senderId: sender.id,
        content: messageTexts[j % messageTexts.length],
        messageType: j % 15 === 0 ? 'image' : 'text',
        mediaUrl: j % 15 === 0 ? imageUrls[j % imageUrls.length] : undefined,
        isRead: j < numMessages - 3,
        readAt: j < numMessages - 3 ? new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        createdAt: new Date(Date.now() - (numMessages - j) * 60 * 60 * 1000).toISOString()
      });
    }
  }

  await db.insert(chatMembers).values(chatMembersList);
  await db.insert(messages).values(messagesList);
  console.log(`✅ Seeded ${messagesList.length} messages`);

  // 9. SEED CAMPAIGNS & DONATIONS
  console.log('💰 Seeding campaigns and donations...');
  
  const campaignsList = [];
  for (let i = 0; i < 15; i++) {
    const creator = [...facultyUsers, ...alumniUsers][i % (facultyUsers.length + alumniUsers.length)];
    const goalAmount = [50000, 100000, 200000, 500000][i % 4];
    const currentAmount = Math.floor(goalAmount * (0.2 + Math.random() * 0.6));
    
    campaignsList.push({
      creatorId: creator.id,
      title: `${['Scholarship Fund', 'Lab Equipment', 'Library Books', 'Student Welfare'][i % 4]} Campaign 2024`,
      description: `Help us raise funds for ${['student scholarships', 'new lab equipment', 'library expansion', 'student welfare programs'][i % 4]}. Every contribution counts!`,
      goalAmount,
      currentAmount,
      category: ['scholarship', 'infrastructure', 'education', 'emergency'][i % 4],
      imageUrl: imageUrls[i % imageUrls.length],
      status: 'active',
      approvedBy: firstAdminId,
      approvedAt: now,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  const campaignsResult = await db.insert(campaigns).values(campaignsList).returning();
  console.log(`✅ Seeded ${campaignsResult.length} campaigns`);

  const donationsList = [];
  for (const campaign of campaignsResult) {
    const numDonors = Math.floor(Math.random() * 20) + 10;
    for (let i = 0; i < numDonors; i++) {
      const donor = [...alumniUsers, ...facultyUsers][Math.floor(Math.random() * (alumniUsers.length + facultyUsers.length))];
      const amounts = [500, 1000, 2000, 5000, 10000];
      
      donationsList.push({
        campaignId: campaign.id,
        donorId: donor.id,
        amount: amounts[Math.floor(Math.random() * amounts.length)],
        message: ['Happy to support!', 'Great initiative!', 'Proud to contribute!', 'All the best!'][i % 4],
        isAnonymous: i % 7 === 0,
        paymentStatus: i % 10 === 0 ? 'pending' : 'completed',
        transactionId: `TXN${Date.now()}${i}`,
        createdAt: new Date(Date.now() - Math.random() * 25 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  }

  await db.insert(donations).values(donationsList);
  console.log(`✅ Seeded ${donationsList.length} donations`);

  // 10. SEED NOTIFICATIONS
  console.log('🔔 Seeding notifications...');
  
  const notificationsList = [];
  for (let i = 0; i < 100; i++) {
    const user = allUsers[2 + (i % (allUsers.length - 2))];
    const types = ['connection', 'job', 'event', 'mentorship', 'message', 'post'];
    const type = types[i % types.length];
    
    const titles = {
      connection: 'New Connection Request',
      job: 'New Job Posting',
      event: 'Event Invitation',
      mentorship: 'Mentorship Request',
      message: 'New Message',
      post: 'New Post from Connection'
    };
    
    const messages = {
      connection: 'Someone wants to connect with you',
      job: 'A new job opportunity matches your profile',
      event: 'You\'re invited to an upcoming event',
      mentorship: 'You have a new mentorship request',
      message: 'You have unread messages',
      post: 'Your connection posted something new'
    };
    
    notificationsList.push({
      userId: user.id,
      type,
      title: titles[type],
      message: messages[type],
      relatedId: String(i + 1),
      isRead: i % 3 === 0,
      createdAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  await db.insert(notifications).values(notificationsList);
  console.log(`✅ Seeded ${notificationsList.length} notifications`);

  // 11. SEED ACTIVITY LOG
  console.log('📊 Seeding activity log...');
  
  const activityList = [];
  for (let i = 0; i < 200; i++) {
    const user = allUsers[i % allUsers.length];
    const actions = ['login', 'view_profile', 'apply_job', 'post_created', 'comment_added', 'event_rsvp', 'connection_request', 'message_sent'];
    
    activityList.push({
      userId: user.id,
      role: user.role,
      action: actions[i % actions.length],
      metadata: JSON.stringify({ ip: '192.168.1.' + (i % 255), device: 'Chrome' }),
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  await db.insert(activityLog).values(activityList);
  console.log(`✅ Seeded ${activityList.length} activity logs`);

  console.log('✅ Comprehensive seed completed successfully!');
  console.log(`\n📊 Total seeded:\n- ${allUsers.length} users\n- ${postsResult.length} posts\n- ${commentsList.length} comments\n- ${reactionsList.length} reactions\n- ${connectionsList.length} connections\n- ${jobsResult.length} jobs\n- ${applicationsList.length} applications\n- ${eventsResult.length} events\n- ${rsvpsList.length} RSVPs\n- ${mentorshipResult.length} mentorship requests\n- ${chatsResult.length} chats\n- ${messagesList.length} messages\n- ${campaignsResult.length} campaigns\n- ${donationsList.length} donations\n- ${notificationsList.length} notifications\n- ${activityList.length} activity logs`);
}

comprehensiveSeed().catch(console.error);