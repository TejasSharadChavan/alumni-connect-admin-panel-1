import { db } from '@/db';
import { users, posts, connections, jobs, events, applications, mentorshipRequests, rsvps, comments, postReactions, chats, chatMembers, messages, activityLog, notifications } from '@/db/schema';
import bcrypt from 'bcrypt';
import { sql } from 'drizzle-orm';

async function clearAllTables() {
    console.log('🗑️  Clearing all existing data...');
    
    await db.run(sql`PRAGMA foreign_keys = OFF`);
    
    await db.delete(notifications);
    await db.delete(activityLog);
    await db.delete(messages);
    await db.delete(chatMembers);
    await db.delete(chats);
    await db.delete(postReactions);
    await db.delete(comments);
    await db.delete(rsvps);
    await db.delete(mentorshipRequests);
    await db.delete(applications);
    await db.delete(jobs);
    await db.delete(events);
    await db.delete(connections);
    await db.delete(posts);
    await db.delete(users);
    
    await db.run(sql`PRAGMA foreign_keys = ON`);
    
    console.log('✅ All tables cleared');
}

async function seedUsers() {
    console.log('👥 Seeding users...');
    const passwordHash = await bcrypt.hash('Password@123', 10);
    
    // 2 Admins
    const adminUsers = [
        { name: 'Dr. Rajesh Kumar', email: 'dean@terna.ac.in', passwordHash, role: 'admin', status: 'active', department: 'Administration', headline: 'Dean of Student Affairs | TSEC', bio: 'Overseeing student welfare and campus activities.', skills: JSON.stringify(['Leadership', 'Educational Administration']), profileImageUrl: 'https://i.pravatar.cc/150?img=12', linkedinUrl: 'https://linkedin.com/in/rajeshkumar', phone: '+91-9876543210', createdAt: new Date('2022-06-01').toISOString(), updatedAt: new Date().toISOString() },
        { name: 'Prof. Anjali Deshmukh', email: 'hod.comp@terna.ac.in', passwordHash, role: 'admin', status: 'active', department: 'Computer Engineering', headline: 'Head of Department - Computer Engineering', bio: 'Leading CS dept with focus on industry collaboration.', skills: JSON.stringify(['Research', 'Computer Science', 'ML']), profileImageUrl: 'https://i.pravatar.cc/150?img=45', linkedinUrl: 'https://linkedin.com/in/anjalideshmukh', phone: '+91-9876543211', createdAt: new Date('2022-07-15').toISOString(), updatedAt: new Date().toISOString() },
    ];
    
    const insertedAdmins = await db.insert(users).values(adminUsers).returning();
    console.log(`✅ Seeded ${insertedAdmins.length} admin users`);
    
    const firstAdminId = insertedAdmins[0].id;
    
    // 5 Faculty
    const facultyUsers = [
        { name: 'Dr. Meera Joshi', email: 'prof.joshi@terna.ac.in', passwordHash, role: 'faculty', status: 'active', department: 'Computer Engineering', headline: 'Associate Professor | Networks Expert', bio: 'Teaching computer networks for 12 years.', skills: JSON.stringify(['Computer Networks', 'IoT', 'Research']), profileImageUrl: 'https://i.pravatar.cc/150?img=47', phone: '+91-9876543220', approvedBy: firstAdminId, approvedAt: new Date('2023-01-20').toISOString(), createdAt: new Date('2023-01-15').toISOString(), updatedAt: new Date().toISOString() },
        { name: 'Prof. Sanjay Nair', email: 'sanjay.nair@terna.ac.in', passwordHash, role: 'faculty', status: 'active', department: 'Computer Engineering', headline: 'Assistant Professor | AI/ML Specialist', bio: 'Passionate about AI and ML. 8 years teaching experience.', skills: JSON.stringify(['Machine Learning', 'Python', 'Deep Learning']), profileImageUrl: 'https://i.pravatar.cc/150?img=56', linkedinUrl: 'https://linkedin.com/in/sanjaynair', phone: '+91-9876543221', approvedBy: firstAdminId, approvedAt: new Date('2023-02-15').toISOString(), createdAt: new Date('2023-02-10').toISOString(), updatedAt: new Date().toISOString() },
        { name: 'Dr. Kavita Reddy', email: 'kavita.reddy@terna.ac.in', passwordHash, role: 'faculty', status: 'active', department: 'Computer Engineering', headline: 'Professor | Database & Cloud', bio: 'Expert in database systems and cloud tech.', skills: JSON.stringify(['Database Management', 'Cloud Computing', 'AWS']), profileImageUrl: 'https://i.pravatar.cc/150?img=38', phone: '+91-9876543222', approvedBy: firstAdminId, approvedAt: new Date('2023-03-10').toISOString(), createdAt: new Date('2023-03-05').toISOString(), updatedAt: new Date().toISOString() },
        { name: 'Mr. Rahul Chopra', email: 'rahul.chopra@terna.ac.in', passwordHash, role: 'faculty', status: 'active', department: 'Computer Engineering', headline: 'Assistant Professor | Web Dev & UI/UX', bio: 'Teaching web technologies. Previously full-stack developer.', skills: JSON.stringify(['Web Development', 'React', 'UI/UX Design']), profileImageUrl: 'https://i.pravatar.cc/150?img=60', linkedinUrl: 'https://linkedin.com/in/rahulchopra', phone: '+91-9876543223', approvedBy: firstAdminId, approvedAt: new Date('2023-04-20').toISOString(), createdAt: new Date('2023-04-15').toISOString(), updatedAt: new Date().toISOString() },
        { name: 'Dr. Sneha Verma', email: 'prof.verma@terna.ac.in', passwordHash, role: 'faculty', status: 'active', department: 'Electronics Engineering', headline: 'Associate Professor | VLSI Design', bio: 'Specialized in VLSI design. Leading chip design research lab.', skills: JSON.stringify(['VLSI Design', 'Digital Electronics', 'Verilog']), profileImageUrl: 'https://i.pravatar.cc/150?img=49', phone: '+91-9876543224', approvedBy: firstAdminId, approvedAt: new Date('2023-05-10').toISOString(), createdAt: new Date('2023-05-05').toISOString(), updatedAt: new Date().toISOString() },
    ];
    
    const insertedFaculty = await db.insert(users).values(facultyUsers).returning();
    console.log(`✅ Seeded ${facultyUsers.length} faculty users`);
    
    // 10 Students
    const studentUsers = Array.from({ length: 10 }, (_, i) => ({
        name: ['Aarav Sharma', 'Diya Patel', 'Arjun Reddy', 'Ananya Singh', 'Vivaan Gupta', 'Isha Mehta', 'Kabir Joshi', 'Myra Nair', 'Reyansh Kumar', 'Saanvi Desai'][i],
        email: ['aarav.sharma', 'diya.patel', 'arjun.reddy', 'ananya.singh', 'vivaan.gupta', 'isha.mehta', 'kabir.joshi', 'myra.nair', 'reyansh.kumar', 'saanvi.desai'][i] + '@terna.ac.in',
        passwordHash,
        role: 'student',
        status: 'active',
        branch: i < 7 ? 'Computer Engineering' : 'Information Technology',
        cohort: i < 5 ? '2024-2025' : '2023-2024',
        headline: `${i < 5 ? 'First' : 'Second'} Year Student | ${['Python Enthusiast', 'UI/UX Learner', 'Android Dev', 'Data Science', 'Competitive Programmer', 'Web Dev', 'Cybersecurity', 'AI/ML Aspirant', 'Full Stack', 'Cloud Computing'][i]}`,
        bio: `Passionate about technology and learning. ${['Learning Python', 'Building websites', 'Mobile apps', 'Data analysis', 'Problem solving', 'Web development', 'Security', 'Machine learning', 'Full stack', 'Cloud tech'][i]}.`,
        skills: JSON.stringify([['Python', 'C++'], ['JavaScript', 'React'], ['Java', 'Android'], ['Python', 'ML'], ['AWS', 'Docker']][i % 5]),
        profileImageUrl: `https://i.pravatar.cc/150?img=${11 + i}`,
        linkedinUrl: i % 3 === 0 ? `https://linkedin.com/in/user${i}` : undefined,
        githubUrl: i % 2 === 0 ? `https://github.com/user${i}` : undefined,
        phone: `+91-912345${String(6701 + i).padStart(4, '0')}`,
        createdAt: new Date(`2024-07-${15 + i}`).toISOString(),
        updatedAt: new Date().toISOString()
    }));
    
    const insertedStudents = await db.insert(users).values(studentUsers).returning();
    console.log(`✅ Seeded ${studentUsers.length} student users`);
    
    // 8 Alumni
    const alumniUsers = Array.from({ length: 8 }, (_, i) => ({
        name: ['Rahul Agarwal', 'Meera Krishnan', 'Vikrant Deshpande', 'Anjali Patil', 'Sandeep Malhotra', 'Divya Srinivasan', 'Varun Kapoor', 'Shreya Bhatt'][i],
        email: ['rahul.agarwal@gmail.com', 'meera.k@microsoft.com', 'vikrant@razorpay.com', 'anjali.patil@swiggy.com', 'sandeep@google.com', 'divya.s@microsoft.com', 'varun@cred.club', 'shreya@zomato.com'][i],
        passwordHash,
        role: 'alumni',
        status: 'active',
        branch: 'Computer Engineering',
        yearOfPassing: 2020 + (i % 3),
        headline: `${['Software Engineer', 'Product Manager', 'Backend Engineer', 'Data Scientist', 'Senior Engineer', 'Tech Lead', 'Engineering Manager', 'Solutions Architect'][i]} at ${['Google', 'Microsoft', 'Amazon', 'Razorpay', 'Swiggy', 'CRED', 'Zomato', 'TCS'][i]}`,
        bio: `Working at ${['Google', 'Microsoft', 'Amazon', 'Razorpay', 'Swiggy', 'CRED', 'Zomato', 'TCS'][i]}. ${i + 2}+ years experience.`,
        skills: JSON.stringify([['Java', 'Python', 'AWS'], ['Product Management', 'Agile'], ['Node.js', 'System Design'], ['Python', 'ML', 'TensorFlow']][i % 4]),
        profileImageUrl: `https://i.pravatar.cc/150?img=${61 + i}`,
        linkedinUrl: `https://linkedin.com/in/alumni${i}`,
        githubUrl: i % 2 === 0 ? `https://github.com/alumni${i}` : undefined,
        phone: `+91-988765${String(4321 + i).padStart(4, '0')}`,
        approvedBy: firstAdminId,
        approvedAt: new Date(`2024-0${6 + (i % 4)}-${10 + i}`).toISOString(),
        createdAt: new Date(`2024-0${6 + (i % 4)}-0${5 + (i % 5)}`).toISOString(),
        updatedAt: new Date().toISOString()
    }));
    
    const insertedAlumni = await db.insert(users).values(alumniUsers).returning();
    console.log(`✅ Seeded ${alumniUsers.length} alumni users`);
    
    console.log(`✅ Total users: ${adminUsers.length + facultyUsers.length + studentUsers.length + alumniUsers.length} (2 admin, 5 faculty, 10 students, 8 alumni)`);
    
    // Collect all user IDs
    const allUserIds = [
        ...insertedAdmins.map(u => u.id),
        ...insertedFaculty.map(u => u.id),
        ...insertedStudents.map(u => u.id),
        ...insertedAlumni.map(u => u.id)
    ];
    
    return {
        firstAdminId,
        firstFacultyId: insertedFaculty[0].id,
        studentIds: insertedStudents.map(u => u.id),
        alumniIds: insertedAlumni.map(u => u.id),
        allUserIds
    };
}

async function seedPosts(adminId: number, allUserIds: number[]) {
    console.log('📝 Seeding posts...');
    
    // Use students and alumni for posts (skip admins and faculty)
    const postAuthorIds = allUserIds.slice(7); // Skip 2 admins + 5 faculty
    
    const samplePosts = Array.from({ length: 25 }, (_, i) => ({
        authorId: postAuthorIds[i % postAuthorIds.length],
        content: [
            'Just started learning React! Any good resources? #ReactJS',
            '🎉 Selected for Google internship! #GoogleInternship',
            'Working on ML project. Tips on datasets? #MachineLearning',
            'Looking for Flutter teammates! #ProjectCollab',
            'JWT vs session auth for Node.js? #WebDevelopment',
            'Won first place at Hackathon! 🏆 #Hackathon',
            'Attending Web3 conference next week! #Blockchain',
            'Struggling with Dynamic Programming. Help? #DSA',
            'Completed TCS internship! Great experience. #Internship',
            'Happy to mentor students! #CareerAdvice',
            'We\'re hiring Full Stack Developers! #JobOpportunity',
            'Published my first research paper! 🎓 #Research',
            'Startup advice: Market validation matters. #Startup',
            'AutoCAD is essential! #MechEngineering',
            'Workshop on Web Development next month! #Workshop',
            'Congrats on placements! #Placements',
            'Looking for AI/ML research students. #Research',
            'Created my first Chrome extension! #ChromeExtension',
            'How to stay updated with tech? #TechNews',
            'Completed AWS certification! 🎉 #AWS',
            'Building e-commerce with MERN. #WebDev',
            'Data Science bootcamp review. #DataScience',
            'Best practices for API design? #Backend',
            'Mobile development with Flutter. #Mobile',
            'Networking tips for students. #Career'
        ][i],
        imageUrl: i % 5 === 0 ? 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800' : undefined,
        category: ['question', 'achievement', 'project', 'discussion', 'announcement'][i % 5],
        branch: i % 3 === 0 ? 'Computer Engineering' : i % 3 === 1 ? 'Information Technology' : undefined,
        visibility: 'public',
        status: 'approved',
        approvedBy: adminId,
        approvedAt: new Date(`2024-${String((i % 6) + 7).padStart(2, '0')}-${String((i % 25) + 1).padStart(2, '0')}T10:00:00Z`).toISOString(),
        createdAt: new Date(`2024-${String((i % 6) + 7).padStart(2, '0')}-${String((i % 25) + 1).padStart(2, '0')}T09:30:00Z`).toISOString(),
        updatedAt: new Date(`2024-${String((i % 6) + 7).padStart(2, '0')}-${String((i % 25) + 1).padStart(2, '0')}T09:30:00Z`).toISOString()
    }));
    
    const insertedPosts = await db.insert(posts).values(samplePosts).returning();
    console.log(`✅ Seeded ${samplePosts.length} posts`);
    
    return insertedPosts.map(p => p.id);
}

async function seedComments(postIds: number[], allUserIds: number[]) {
    console.log('💬 Seeding comments...');
    const commentTexts = ['Great post!', 'Very helpful!', 'Thanks for sharing!', 'Interesting perspective.', 'Can you share more?'];
    const sampleComments = Array.from({ length: 30 }, (_, i) => ({
        postId: postIds[i % postIds.length],
        authorId: allUserIds[7 + (i % (allUserIds.length - 7))], // Skip admins and faculty
        content: commentTexts[i % 5],
        createdAt: new Date(`2024-${String((i % 5) + 8).padStart(2, '0')}-${String((i % 25) + 2).padStart(2, '0')}T10:00:00Z`).toISOString()
    }));
    
    await db.insert(comments).values(sampleComments);
    console.log(`✅ Seeded ${sampleComments.length} comments`);
}

async function seedPostReactions(postIds: number[], allUserIds: number[]) {
    console.log('👍 Seeding post reactions...');
    const sampleReactions = Array.from({ length: 30 }, (_, i) => ({
        postId: postIds[i % postIds.length],
        userId: allUserIds[7 + (i % (allUserIds.length - 7))],
        reactionType: ['like', 'heart', 'celebrate'][i % 3],
        createdAt: new Date(`2024-${String((i % 5) + 8).padStart(2, '0')}-${String((i % 25) + 1).padStart(2, '0')}T11:00:00Z`).toISOString()
    }));
    
    await db.insert(postReactions).values(sampleReactions);
    console.log(`✅ Seeded ${sampleReactions.length} post reactions`);
}

async function seedConnections(studentIds: number[], alumniIds: number[]) {
    console.log('🤝 Seeding connections...');
    const allIds = [...studentIds, ...alumniIds];
    const sampleConnections = Array.from({ length: 20 }, (_, i) => ({
        requesterId: allIds[i % Math.min(10, allIds.length)],
        responderId: allIds[(i + 3) % allIds.length],
        status: i % 8 === 0 ? 'pending' : 'accepted',
        message: i % 3 === 0 ? `Hi! Let's connect!` : undefined,
        createdAt: new Date(`2024-${String((i % 4) + 9).padStart(2, '0')}-${String((i % 25) + 1).padStart(2, '0')}T10:00:00Z`).toISOString(),
        respondedAt: i % 8 !== 0 ? new Date(`2024-${String((i % 4) + 9).padStart(2, '0')}-${String((i % 25) + 2).padStart(2, '0')}T14:00:00Z`).toISOString() : undefined
    }));
    
    await db.insert(connections).values(sampleConnections);
    console.log(`✅ Seeded ${sampleConnections.length} connections`);
}

async function seedJobs(adminId: number, alumniIds: number[]) {
    console.log('💼 Seeding jobs...');
    const companies = ['Amazon', 'Google', 'Microsoft', 'Razorpay', 'Swiggy', 'CRED', 'Zomato', 'TCS'];
    const titles = ['Software Engineer', 'Data Scientist', 'Frontend Developer', 'Backend Developer', 'DevOps Engineer'];
    
    const sampleJobs = Array.from({ length: 20 }, (_, i) => ({
        postedById: alumniIds[i % alumniIds.length],
        title: `${titles[i % 5]}${i < 15 ? '' : ' Intern'}`,
        company: companies[i % 8],
        description: `Join our team as ${titles[i % 5]}. Work on exciting projects with cutting-edge technologies.`,
        location: ['Bangalore', 'Mumbai', 'Pune', 'Hyderabad', 'Remote'][i % 5],
        jobType: i < 15 ? 'full-time' : 'internship',
        salary: i < 15 ? `₹${10 + (i % 10)}-${18 + (i % 10)} LPA` : `₹${15 + (i % 5)},000/month`,
        skills: JSON.stringify([['Python', 'Java', 'AWS'], ['React', 'TypeScript'], ['Node.js', 'MongoDB'], ['ML', 'TensorFlow'], ['Docker', 'Kubernetes']][i % 5]),
        status: 'approved',
        branch: i % 3 === 0 ? 'Computer Engineering' : undefined,
        approvedBy: adminId,
        approvedAt: new Date(`2024-11-${String((i % 25) + 1).padStart(2, '0')}T10:00:00Z`).toISOString(),
        createdAt: new Date(`2024-11-${String((i % 25) + 1).padStart(2, '0')}T09:00:00Z`).toISOString(),
        expiresAt: new Date(`2025-01-${String((i % 28) + 1).padStart(2, '0')}T23:59:59Z`).toISOString()
    }));
    
    const insertedJobs = await db.insert(jobs).values(sampleJobs).returning();
    console.log(`✅ Seeded ${sampleJobs.length} jobs`);
    
    return insertedJobs.map(j => j.id);
}

async function seedApplications(jobIds: number[], studentIds: number[]) {
    console.log('📄 Seeding job applications...');
    const sampleApplications = Array.from({ length: 20 }, (_, i) => ({
        jobId: jobIds[i % jobIds.length],
        applicantId: studentIds[i % studentIds.length],
        status: ['applied', 'screening', 'interview', 'accepted'][i % 4],
        coverLetter: `I am interested in this position.`,
        appliedAt: new Date(`2024-${String((i % 2) + 11).padStart(2, '0')}-${String((i % 25) + 5).padStart(2, '0')}T10:00:00Z`).toISOString(),
        updatedAt: new Date().toISOString()
    }));
    
    await db.insert(applications).values(sampleApplications);
    console.log(`✅ Seeded ${sampleApplications.length} job applications`);
}

async function seedEvents(adminId: number, facultyIds: number[]) {
    console.log('🎉 Seeding events...');
    const eventTypes = ['Technical Workshop', 'Hackathon', 'Alumni Meetup', 'Placement Drive', 'Tech Talk'];
    
    const facultyId = facultyIds[0]; // Use first faculty member
    const sampleEvents = Array.from({ length: 20 }, (_, i) => ({
        organizerId: facultyIds[i % facultyIds.length],
        title: `${eventTypes[i % 5]} 2025`,
        description: `Join us for an exciting ${eventTypes[i % 5].toLowerCase()}. Great opportunity to learn!`,
        location: ['Main Auditorium', 'Computer Lab', 'Seminar Hall', 'Online'][i % 4],
        startDate: new Date(`2025-0${(i % 2) + 1}-${String((i % 28) + 1).padStart(2, '0')}T10:00:00Z`).toISOString(),
        endDate: new Date(`2025-0${(i % 2) + 1}-${String((i % 28) + 1).padStart(2, '0')}T14:00:00Z`).toISOString(),
        category: ['technical', 'social', 'academic'][i % 3],
        branch: i % 3 === 0 ? 'Computer Engineering' : undefined,
        isPaid: i % 5 === 0,
        price: i % 5 === 0 ? '500' : '0',
        maxAttendees: 50 + (i * 5),
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        status: 'approved',
        approvedBy: adminId,
        approvedAt: new Date(`2024-${String((i % 2) + 11).padStart(2, '0')}-${String((i % 25) + 1).padStart(2, '0')}T09:00:00Z`).toISOString(),
        createdAt: new Date(`2024-${String((i % 2) + 11).padStart(2, '0')}-${String((i % 25) + 1).padStart(2, '0')}T09:00:00Z`).toISOString()
    }));
    
    const insertedEvents = await db.insert(events).values(sampleEvents).returning();
    console.log(`✅ Seeded ${sampleEvents.length} events`);
    
    return insertedEvents.map(e => e.id);
}

async function seedRsvps(eventIds: number[], allUserIds: number[]) {
    console.log('✅ Seeding RSVPs...');
    const sampleRsvps = Array.from({ length: 25 }, (_, i) => ({
        eventId: eventIds[i % eventIds.length],
        userId: allUserIds[7 + (i % (allUserIds.length - 7))],
        status: ['registered', 'attended'][i % 2],
        paymentStatus: i % 5 === 0 ? 'completed' : 'na',
        rsvpedAt: new Date(`2024-${String((i % 2) + 11).padStart(2, '0')}-${String((i % 25) + 3).padStart(2, '0')}T10:00:00Z`).toISOString()
    }));
    
    await db.insert(rsvps).values(sampleRsvps);
    console.log(`✅ Seeded ${sampleRsvps.length} RSVPs`);
}

async function seedMentorshipRequests(studentIds: number[], alumniIds: number[]) {
    console.log('🎓 Seeding mentorship requests...');
    const topics = ['Web Development', 'Machine Learning', 'System Design', 'Career Planning'];
    
    const sampleRequests = Array.from({ length: 15 }, (_, i) => ({
        studentId: studentIds[i % studentIds.length],
        mentorId: alumniIds[i % alumniIds.length],
        topic: topics[i % 4],
        message: `Hi! I would love to learn from your experience in ${topics[i % 4].toLowerCase()}.`,
        preferredTime: `${['Morning', 'Afternoon', 'Evening'][i % 3]}`,
        status: ['pending', 'accepted', 'completed'][i % 3],
        createdAt: new Date(`2024-${String((i % 6) + 7).padStart(2, '0')}-${String((i % 25) + 1).padStart(2, '0')}T10:00:00Z`).toISOString(),
        respondedAt: i % 3 !== 0 ? new Date(`2024-${String((i % 6) + 7).padStart(2, '0')}-${String((i % 25) + 3).padStart(2, '0')}T14:00:00Z`).toISOString() : undefined
    }));
    
    await db.insert(mentorshipRequests).values(sampleRequests);
    console.log(`✅ Seeded ${sampleRequests.length} mentorship requests`);
}

async function seedChatsAndMessages(allUserIds: number[]) {
    console.log('💬 Seeding chats and messages...');
    
    const activeUserIds = allUserIds.slice(7); // Skip admins and faculty
    
    const sampleChats = Array.from({ length: 10 }, (_, i) => ({
        chatType: i % 4 === 0 ? 'group' : 'direct',
        name: i % 4 === 0 ? `Study Group ${i + 1}` : undefined,
        createdBy: activeUserIds[i % activeUserIds.length],
        createdAt: new Date(`2024-${String((i % 4) + 9).padStart(2, '0')}-01T10:00:00Z`).toISOString()
    }));
    
    const insertedChats = await db.insert(chats).values(sampleChats).returning();
    console.log(`✅ Seeded ${sampleChats.length} chats`);
    
    const chatIds = insertedChats.map(c => c.id);
    
    const sampleMembers = Array.from({ length: 20 }, (_, i) => ({
        chatId: chatIds[i % chatIds.length],
        userId: activeUserIds[i % activeUserIds.length],
        joinedAt: new Date(`2024-${String((i % 4) + 9).padStart(2, '0')}-01T10:00:00Z`).toISOString(),
        lastReadAt: i % 3 !== 0 ? new Date(`2024-12-${String((i % 15) + 1).padStart(2, '0')}T10:00:00Z`).toISOString() : undefined
    }));
    
    await db.insert(chatMembers).values(sampleMembers);
    console.log(`✅ Seeded ${sampleMembers.length} chat members`);
    
    const messageTexts = ['Hey! How are you?', 'Did you complete the assignment?', 'Thanks for the help!', 'See you at the event!', 'Great work!'];
    const sampleMessages = Array.from({ length: 30 }, (_, i) => ({
        chatId: chatIds[i % chatIds.length],
        senderId: activeUserIds[i % activeUserIds.length],
        content: messageTexts[i % 5],
        messageType: 'text',
        createdAt: new Date(`2024-12-${String((i % 15) + 1).padStart(2, '0')}T${String(9 + (i % 12)).padStart(2, '0')}:00:00Z`).toISOString()
    }));
    
    await db.insert(messages).values(sampleMessages);
    console.log(`✅ Seeded ${sampleMessages.length} messages`);
}

async function seedActivityLog(allUserIds: number[]) {
    console.log('📊 Seeding activity logs...');
    const activities = ['login', 'post_created', 'connection_made', 'job_applied', 'event_rsvp'];
    
    const activeUserIds = allUserIds.slice(7);
    const sampleLogs = Array.from({ length: 25 }, (_, i) => ({
        userId: activeUserIds[i % activeUserIds.length],
        role: i % 2 === 0 ? 'student' : 'alumni',
        action: activities[i % 5],
        metadata: JSON.stringify({ action: activities[i % 5], timestamp: Date.now() }),
        timestamp: new Date(`2024-${String((i % 2) + 11).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}T10:00:00Z`).toISOString()
    }));
    
    await db.insert(activityLog).values(sampleLogs);
    console.log(`✅ Seeded ${sampleLogs.length} activity logs`);
}

async function seedNotifications(allUserIds: number[]) {
    console.log('🔔 Seeding notifications...');
    const notifTypes = ['connection', 'job', 'event', 'mentorship', 'message'];
    
    const activeUserIds = allUserIds.slice(7);
    const sampleNotifications = Array.from({ length: 25 }, (_, i) => ({
        userId: activeUserIds[i % activeUserIds.length],
        type: notifTypes[i % 5],
        title: `${['New connection request', 'Job application update', 'Event tomorrow', 'Mentorship request', 'New message'][i % 5]}`,
        message: `${['Someone wants to connect', 'Application status updated', 'Event reminder', 'New mentorship request', 'You have a message'][i % 5]}`,
        relatedId: String(1 + (i % 10)),
        isRead: i % 3 !== 0,
        createdAt: new Date(`2024-12-${String((i % 15) + 1).padStart(2, '0')}T10:00:00Z`).toISOString()
    }));
    
    await db.insert(notifications).values(sampleNotifications);
    console.log(`✅ Seeded ${sampleNotifications.length} notifications`);
}

async function main() {
    try {
        console.log('🚀 Starting safe database seeding (20-30 records per table)...\n');
        
        await clearAllTables();
        const userIds = await seedUsers();
        const facultyIds = [userIds.firstFacultyId, userIds.firstFacultyId + 1, userIds.firstFacultyId + 2, userIds.firstFacultyId + 3, userIds.firstFacultyId + 4];
        const postIds = await seedPosts(userIds.firstAdminId, userIds.allUserIds);
        await seedComments(postIds, userIds.allUserIds);
        await seedPostReactions(postIds, userIds.allUserIds);
        await seedConnections(userIds.studentIds, userIds.alumniIds);
        const jobIds = await seedJobs(userIds.firstAdminId, userIds.alumniIds);
        await seedApplications(jobIds, userIds.studentIds);
        const eventIds = await seedEvents(userIds.firstAdminId, facultyIds);
        await seedRsvps(eventIds, userIds.allUserIds);
        await seedMentorshipRequests(userIds.studentIds, userIds.alumniIds);
        await seedChatsAndMessages(userIds.allUserIds);
        await seedActivityLog(userIds.allUserIds);
        await seedNotifications(userIds.allUserIds);
        
        console.log('\n✨ Database seeding completed successfully!');
        console.log('📊 Safe Data Summary:');
        console.log('   - 25 Users (2 admin, 5 faculty, 10 students, 8 alumni)');
        console.log('   - 25 Posts with realistic content');
        console.log('   - 30 Comments on posts');
        console.log('   - 30 Post reactions');
        console.log('   - 20 Connections between users');
        console.log('   - 20 Job listings (15 full-time, 5 internships)');
        console.log('   - 20 Job applications');
        console.log('   - 20 Events');
        console.log('   - 25 Event RSVPs');
        console.log('   - 15 Mentorship requests');
        console.log('   - 10 Chats with 20 members and 30 messages');
        console.log('   - 25 Activity logs');
        console.log('   - 25 Notifications');
        console.log('\n✅ Total: ~290 records - Safe and efficient!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
}

main();