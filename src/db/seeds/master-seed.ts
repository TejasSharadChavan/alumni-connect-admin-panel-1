import { db } from '@/db';
import { users, posts, connections, jobs, events, applications, mentorshipRequests, rsvps, comments, postReactions, chats, chatMembers, messages, activityLog, notifications } from '@/db/schema';
import bcrypt from 'bcrypt';
import { sql } from 'drizzle-orm';

async function clearAllTables() {
    console.log('🗑️  Clearing all existing data...');
    
    // Disable foreign key checks
    await db.run(sql`PRAGMA foreign_keys = OFF`);
    
    // Delete in any order since FK checks are off
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
    
    // Re-enable foreign key checks
    await db.run(sql`PRAGMA foreign_keys = ON`);
    
    console.log('✅ All tables cleared');
}

async function seedUsers() {
    console.log('👥 Seeding users...');
    const passwordHash = await bcrypt.hash('Password@123', 10);
    
    // Insert admins first (so they get IDs 1-5)
    const adminUsers = [
        { name: 'Dr. Rajesh Kumar', email: 'dean@terna.ac.in', passwordHash, role: 'admin', status: 'active', department: 'Administration', headline: 'Dean of Student Affairs | TSEC', bio: 'Overseeing student welfare and campus activities with 20+ years of experience.', skills: JSON.stringify(['Leadership', 'Educational Administration']), profileImageUrl: 'https://i.pravatar.cc/150?img=12', linkedinUrl: 'https://linkedin.com/in/rajeshkumar', phone: '+91-9876543210', createdAt: new Date('2022-06-01').toISOString(), updatedAt: new Date().toISOString() },
        { name: 'Prof. Anjali Deshmukh', email: 'hod.comp@terna.ac.in', passwordHash, role: 'admin', status: 'active', department: 'Computer Engineering', headline: 'Head of Department - Computer Engineering', bio: 'Leading CS dept with focus on industry collaboration. 50+ research papers.', skills: JSON.stringify(['Research', 'Computer Science', 'ML']), profileImageUrl: 'https://i.pravatar.cc/150?img=45', linkedinUrl: 'https://linkedin.com/in/anjalideshmukh', phone: '+91-9876543211', createdAt: new Date('2022-07-15').toISOString(), updatedAt: new Date().toISOString() },
        { name: 'Mr. Vikram Sharma', email: 'registrar@terna.ac.in', passwordHash, role: 'admin', status: 'active', department: 'Administration', headline: 'Chief Academic Officer', bio: 'Managing academic operations and quality education delivery.', skills: JSON.stringify(['Academic Management', 'Quality Assurance']), profileImageUrl: 'https://i.pravatar.cc/150?img=33', linkedinUrl: 'https://linkedin.com/in/vikramsharma', phone: '+91-9876543212', createdAt: new Date('2022-08-20').toISOString(), updatedAt: new Date().toISOString() },
        { name: 'Dr. Priya Iyer', email: 'hod.electronics@terna.ac.in', passwordHash, role: 'admin', status: 'active', department: 'Electronics Engineering', headline: 'HOD Electronics | VLSI Researcher', bio: 'Expert in VLSI design and embedded systems research.', skills: JSON.stringify(['VLSI Design', 'Embedded Systems', 'Research']), profileImageUrl: 'https://i.pravatar.cc/150?img=48', linkedinUrl: 'https://linkedin.com/in/priyaiyer', phone: '+91-9876543213', createdAt: new Date('2022-09-10').toISOString(), updatedAt: new Date().toISOString() },
        { name: 'Mr. Arjun Patel', email: 'placement.head@terna.ac.in', passwordHash, role: 'admin', status: 'active', department: 'Administration', headline: 'Head of Training & Placement', bio: 'Successfully placed 500+ students in top companies.', skills: JSON.stringify(['Placement Management', 'Career Counseling']), profileImageUrl: 'https://i.pravatar.cc/150?img=52', linkedinUrl: 'https://linkedin.com/in/arjunpatel', phone: '+91-9876543214', createdAt: new Date('2023-01-15').toISOString(), updatedAt: new Date().toISOString() },
    ];
    
    await db.insert(users).values(adminUsers);
    console.log(`✅ Seeded ${adminUsers.length} admin users`);
    
    // Insert 15 faculty members (IDs 6-20)
    const facultyUsers = [
        { name: 'Dr. Meera Joshi', email: 'prof.joshi@terna.ac.in', passwordHash, role: 'faculty', status: 'active', department: 'Computer Engineering', headline: 'Associate Professor | Networks Expert', bio: 'Teaching computer networks for 12 years. Published 30+ papers.', skills: JSON.stringify(['Computer Networks', 'IoT', 'Research']), profileImageUrl: 'https://i.pravatar.cc/150?img=47', linkedinUrl: 'https://linkedin.com/in/meerajoshi', phone: '+91-9876543220', approvedBy: 1, approvedAt: new Date('2023-01-20').toISOString(), createdAt: new Date('2023-01-15').toISOString(), updatedAt: new Date().toISOString() },
        { name: 'Prof. Sanjay Nair', email: 'sanjay.nair@terna.ac.in', passwordHash, role: 'faculty', status: 'active', department: 'Computer Engineering', headline: 'Assistant Professor | AI/ML Specialist', bio: 'Passionate about AI and ML. 8 years teaching experience.', skills: JSON.stringify(['Machine Learning', 'Python', 'Deep Learning']), profileImageUrl: 'https://i.pravatar.cc/150?img=56', linkedinUrl: 'https://linkedin.com/in/sanjaynair', phone: '+91-9876543221', approvedBy: 1, approvedAt: new Date('2023-02-15').toISOString(), createdAt: new Date('2023-02-10').toISOString(), updatedAt: new Date().toISOString() },
        { name: 'Dr. Kavita Reddy', email: 'kavita.reddy@terna.ac.in', passwordHash, role: 'faculty', status: 'active', department: 'Computer Engineering', headline: 'Professor | Database & Cloud', bio: 'Expert in database systems and cloud tech. 15 years experience.', skills: JSON.stringify(['Database Management', 'Cloud Computing', 'AWS']), profileImageUrl: 'https://i.pravatar.cc/150?img=38', phone: '+91-9876543222', approvedBy: 1, approvedAt: new Date('2023-03-10').toISOString(), createdAt: new Date('2023-03-05').toISOString(), updatedAt: new Date().toISOString() },
        { name: 'Mr. Rahul Chopra', email: 'rahul.chopra@terna.ac.in', passwordHash, role: 'faculty', status: 'active', department: 'Computer Engineering', headline: 'Assistant Professor | Web Dev & UI/UX', bio: 'Teaching web technologies. Previously full-stack developer in industry.', skills: JSON.stringify(['Web Development', 'React', 'UI/UX Design']), profileImageUrl: 'https://i.pravatar.cc/150?img=60', linkedinUrl: 'https://linkedin.com/in/rahulchopra', phone: '+91-9876543223', approvedBy: 1, approvedAt: new Date('2023-04-20').toISOString(), createdAt: new Date('2023-04-15').toISOString(), updatedAt: new Date().toISOString() },
        { name: 'Dr. Sneha Verma', email: 'prof.verma@terna.ac.in', passwordHash, role: 'faculty', status: 'active', department: 'Electronics Engineering', headline: 'Associate Professor | VLSI Design', bio: 'Specialized in VLSI design. Leading chip design research lab.', skills: JSON.stringify(['VLSI Design', 'Digital Electronics', 'Verilog']), profileImageUrl: 'https://i.pravatar.cc/150?img=49', phone: '+91-9876543224', approvedBy: 1, approvedAt: new Date('2023-05-10').toISOString(), createdAt: new Date('2023-05-05').toISOString(), updatedAt: new Date().toISOString() },
        { name: 'Prof. Aditya Gupta', email: 'aditya.gupta@terna.ac.in', passwordHash, role: 'faculty', status: 'active', department: 'Electronics Engineering', headline: 'Assistant Professor | Embedded & IoT', bio: 'Teaching embedded systems and IoT. Arduino workshop conductor.', skills: JSON.stringify(['Embedded Systems', 'IoT', 'Arduino']), profileImageUrl: 'https://i.pravatar.cc/150?img=54', linkedinUrl: 'https://linkedin.com/in/adityagupta', phone: '+91-9876543225', approvedBy: 1, approvedAt: new Date('2023-06-15').toISOString(), createdAt: new Date('2023-06-10').toISOString(), updatedAt: new Date().toISOString() },
        { name: 'Dr. Pooja Mehta', email: 'pooja.mehta@terna.ac.in', passwordHash, role: 'faculty', status: 'active', department: 'Electronics Engineering', headline: 'Professor | Signal Processing', bio: 'Expert in DSP and communications. Published research on 5G.', skills: JSON.stringify(['Signal Processing', 'Communications', '5G']), profileImageUrl: 'https://i.pravatar.cc/150?img=44', linkedinUrl: 'https://linkedin.com/in/poojamehta', phone: '+91-9876543226', approvedBy: 1, approvedAt: new Date('2023-07-20').toISOString(), createdAt: new Date('2023-07-15').toISOString(), updatedAt: new Date().toISOString() },
        { name: 'Mr. Karthik Singh', email: 'karthik.singh@terna.ac.in', passwordHash, role: 'faculty', status: 'active', department: 'Mechanical Engineering', headline: 'Assistant Professor | CAD/CAM', bio: 'Teaching CAD/CAM. Previously in automotive industry.', skills: JSON.stringify(['CAD/CAM', 'SolidWorks', 'AutoCAD']), profileImageUrl: 'https://i.pravatar.cc/150?img=58', linkedinUrl: 'https://linkedin.com/in/karthiksingh', phone: '+91-9876543227', approvedBy: 1, approvedAt: new Date('2023-08-10').toISOString(), createdAt: new Date('2023-08-05').toISOString(), updatedAt: new Date().toISOString() },
        { name: 'Dr. Lakshmi Nair', email: 'prof.lakshmi@terna.ac.in', passwordHash, role: 'faculty', status: 'active', department: 'Mechanical Engineering', headline: 'Associate Professor | Thermal Engineering', bio: 'Specialized in thermal engineering and renewable energy.', skills: JSON.stringify(['Thermal Engineering', 'Renewable Energy', 'ANSYS']), profileImageUrl: 'https://i.pravatar.cc/150?img=41', phone: '+91-9876543228', approvedBy: 1, approvedAt: new Date('2023-09-15').toISOString(), createdAt: new Date('2023-09-10').toISOString(), updatedAt: new Date().toISOString() },
        { name: 'Prof. Amit Desai', email: 'amit.desai@terna.ac.in', passwordHash, role: 'faculty', status: 'active', department: 'Mechanical Engineering', headline: 'Assistant Professor | Robotics', bio: 'Teaching robotics and automation. Industry 4.0 expert.', skills: JSON.stringify(['Robotics', 'Automation', 'MATLAB']), profileImageUrl: 'https://i.pravatar.cc/150?img=59', linkedinUrl: 'https://linkedin.com/in/amitdesai', phone: '+91-9876543229', approvedBy: 1, approvedAt: new Date('2023-10-20').toISOString(), createdAt: new Date('2023-10-15').toISOString(), updatedAt: new Date().toISOString() },
        { name: 'Dr. Ravi Kumar', email: 'ravi.kumar@terna.ac.in', passwordHash, role: 'faculty', status: 'active', department: 'Civil Engineering', headline: 'Professor | Structural Engineering', bio: 'Expert in structural analysis. 40+ research papers published.', skills: JSON.stringify(['Structural Engineering', 'STAAD Pro', 'Research']), profileImageUrl: 'https://i.pravatar.cc/150?img=53', linkedinUrl: 'https://linkedin.com/in/ravikumar', phone: '+91-9876543230', approvedBy: 1, approvedAt: new Date('2023-11-10').toISOString(), createdAt: new Date('2023-11-05').toISOString(), updatedAt: new Date().toISOString() },
        { name: 'Mrs. Divya Sharma', email: 'divya.sharma@terna.ac.in', passwordHash, role: 'faculty', status: 'active', department: 'Civil Engineering', headline: 'Assistant Professor | Environmental', bio: 'Teaching environmental engineering and sustainable construction.', skills: JSON.stringify(['Environmental Engineering', 'Water Resources']), profileImageUrl: 'https://i.pravatar.cc/150?img=43', linkedinUrl: 'https://linkedin.com/in/divyasharma', phone: '+91-9876543231', approvedBy: 1, approvedAt: new Date('2024-01-15').toISOString(), createdAt: new Date('2024-01-10').toISOString(), updatedAt: new Date().toISOString() },
        { name: 'Prof. Nikhil Joshi', email: 'nikhil.joshi@terna.ac.in', passwordHash, role: 'faculty', status: 'active', department: 'Information Technology', headline: 'Associate Professor | Cybersecurity', bio: 'Certified ethical hacker. Teaching info security for 9 years.', skills: JSON.stringify(['Cybersecurity', 'Ethical Hacking', 'Network Security']), profileImageUrl: 'https://i.pravatar.cc/150?img=57', linkedinUrl: 'https://linkedin.com/in/nikhiljoshi', phone: '+91-9876543232', approvedBy: 1, approvedAt: new Date('2024-02-20').toISOString(), createdAt: new Date('2024-02-15').toISOString(), updatedAt: new Date().toISOString() },
        { name: 'Dr. Swati Patel', email: 'swati.patel@terna.ac.in', passwordHash, role: 'faculty', status: 'active', department: 'Information Technology', headline: 'Assistant Professor | Software Engineering', bio: 'Previously Scrum Master in IT industry. Agile expert.', skills: JSON.stringify(['Software Engineering', 'Agile', 'Scrum']), profileImageUrl: 'https://i.pravatar.cc/150?img=46', phone: '+91-9876543233', approvedBy: 1, approvedAt: new Date('2024-03-15').toISOString(), createdAt: new Date('2024-03-10').toISOString(), updatedAt: new Date().toISOString() },
        { name: 'Mr. Rohan Verma', email: 'rohan.verma@terna.ac.in', passwordHash, role: 'faculty', status: 'active', department: 'Information Technology', headline: 'Assistant Professor | Mobile Dev', bio: 'Teaching mobile app development. Industry experience in startups.', skills: JSON.stringify(['Android Development', 'Flutter', 'Mobile UI/UX']), profileImageUrl: 'https://i.pravatar.cc/150?img=55', linkedinUrl: 'https://linkedin.com/in/rohanverma', phone: '+91-9876543234', approvedBy: 1, approvedAt: new Date('2024-04-10').toISOString(), createdAt: new Date('2024-04-05').toISOString(), updatedAt: new Date().toISOString() },
    ];
    
    await db.insert(users).values(facultyUsers);
    console.log(`✅ Seeded ${facultyUsers.length} faculty users`);
    
    // Insert 30 students (IDs 21-50)
    const studentUsers = Array.from({ length: 30 }, (_, i) => ({
        name: ['Aarav Sharma', 'Diya Patel', 'Arjun Reddy', 'Ananya Singh', 'Vivaan Gupta', 'Isha Mehta', 'Kabir Joshi', 'Myra Nair', 'Reyansh Kumar', 'Saanvi Desai', 'Advait Chopra', 'Navya Iyer', 'Dhruv Verma', 'Aadhya Sharma', 'Vihaan Patel', 'Aditya Reddy', 'Priya Nair', 'Rohan Deshmukh', 'Sneha Mehta', 'Karan Joshi', 'Tanvi Sharma', 'Ishaan Kumar', 'Riya Patel', 'Aryan Singh', 'Anaya Gupta', 'Aakash Rao', 'Nisha Kulkarni', 'Sameer Jain', 'Pooja Reddy', 'Kshitij Deshmukh'][i],
        email: ['aarav.sharma', 'diya.patel', 'arjun.reddy', 'ananya.singh', 'vivaan.gupta', 'isha.mehta', 'kabir.joshi', 'myra.nair', 'reyansh.kumar', 'saanvi.desai', 'advait.chopra', 'navya.iyer', 'dhruv.verma', 'aadhya.sharma', 'vihaan.patel', 'aditya.reddy', 'priya.nair', 'rohan.deshmukh', 'sneha.mehta', 'karan.joshi', 'tanvi.sharma', 'ishaan.kumar', 'riya.patel', 'aryan.singh', 'anaya.gupta', 'aakash.rao', 'nisha.kulkarni', 'sameer.jain', 'pooja.reddy', 'kshitij.deshmukh'][i] + '@terna.ac.in',
        passwordHash,
        role: 'student',
        status: 'active',
        branch: i < 20 ? 'Computer Engineering' : 'Information Technology',
        cohort: i < 15 ? '2024-2025' : i < 25 ? '2023-2024' : '2022-2023',
        headline: `${i < 15 ? 'First' : i < 25 ? 'Second' : 'Third'} Year Student | ${['Python Enthusiast', 'UI/UX Learner', 'Android Dev', 'Data Science', 'Competitive Programmer', 'Web Dev', 'Cybersecurity', 'AI/ML Aspirant', 'Full Stack', 'Cloud Computing', 'Game Dev', 'IoT', 'Blockchain', 'Backend', 'Flutter'][i % 15]}`,
        bio: `Passionate about technology and learning. ${['Learning Python', 'Building websites', 'Mobile apps', 'Data analysis', 'Problem solving', 'Web development', 'Security', 'Machine learning', 'Full stack', 'Cloud tech', 'Game development', 'IoT projects', 'Blockchain', 'APIs', 'Flutter'][i % 15]}.`,
        skills: JSON.stringify([['Python', 'C++', 'Data Structures'], ['JavaScript', 'React', 'HTML/CSS'], ['Java', 'Android', 'Firebase'], ['Python', 'Machine Learning', 'TensorFlow'], ['AWS', 'Docker', 'Kubernetes']][i % 5]),
        profileImageUrl: `https://i.pravatar.cc/150?img=${11 + i}`,
        linkedinUrl: i % 3 === 0 ? `https://linkedin.com/in/user${i}` : undefined,
        githubUrl: i % 2 === 0 ? `https://github.com/user${i}` : undefined,
        resumeUrl: i % 4 === 0 ? `https://drive.google.com/file/d/sample-${i}/view` : undefined,
        phone: `+91-912345${String(6701 + i).padStart(4, '0')}`,
        createdAt: new Date(`2024-07-${15 + (i % 15)}`).toISOString(),
        updatedAt: new Date().toISOString()
    }));
    
    await db.insert(users).values(studentUsers);
    console.log(`✅ Seeded ${studentUsers.length} student users`);
    
    // Insert 25 alumni (IDs 51-75)
    const alumniUsers = Array.from({ length: 25 }, (_, i) => ({
        name: ['Rahul Agarwal', 'Meera Krishnan', 'Vikrant Deshpande', 'Anjali Patil', 'Sandeep Malhotra', 'Divya Srinivasan', 'Varun Kapoor', 'Shreya Bhatt', 'Aditya Bose', 'Prateek Jain', 'Neha Rao', 'Karthik Menon', 'Swati Kulkarni', 'Rohan Ghosh', 'Anjana Nair', 'Sidharth Patel', 'Kavita Singh', 'Nikhil Shah', 'Ritu Deshmukh', 'Amit Verma', 'Deepika Iyer', 'Gaurav Chopra', 'Nidhi Agarwal', 'Vivek Reddy', 'Simran Joshi'][i],
        email: ['rahul.agarwal@gmail.com', 'meera.k@microsoft.com', 'vikrant@razorpay.com', 'anjali.patil@swiggy.com', 'sandeep@google.com', 'divya.s@microsoft.com', 'varun@cred.club', 'shreya@zomato.com', 'aditya@tcs.com', 'prateek@amazon.com', 'neha@flipkart.com', 'karthik@paytm.com', 'swati@phonepe.com', 'rohan@netflix.com', 'anjana@uber.com', 'sidharth@freshworks.com', 'kavita@cisco.com', 'nikhil@wipro.com', 'ritu@infosys.com', 'amit@accenture.com', 'deepika@adobe.com', 'gaurav@oracle.com', 'nidhi@salesforce.com', 'vivek@shopify.com', 'simran@linkedin.com'][i],
        passwordHash,
        role: 'alumni',
        status: 'active',
        branch: i < 18 ? 'Computer Engineering' : i < 22 ? 'Information Technology' : 'Electronics Engineering',
        yearOfPassing: 2020 + (i % 4),
        headline: `${['Software Engineer', 'Product Manager', 'Backend Engineer', 'Data Scientist', 'Senior Engineer', 'Tech Lead', 'Engineering Manager', 'Solutions Architect', 'DevOps Engineer', 'ML Engineer'][i % 10]} at ${['Google', 'Microsoft', 'Amazon', 'Razorpay', 'Swiggy', 'CRED', 'Zomato', 'TCS', 'Flipkart', 'Paytm'][i % 10]}`,
        bio: `Working at ${['Google', 'Microsoft', 'Amazon', 'Razorpay', 'Swiggy', 'CRED', 'Zomato', 'TCS', 'Flipkart', 'Paytm'][i % 10]}. ${i + 1}+ years experience. Passionate about mentoring.`,
        skills: JSON.stringify([['Java', 'Python', 'AWS'], ['Product Management', 'Agile'], ['Node.js', 'Microservices', 'System Design'], ['Python', 'ML', 'TensorFlow'], ['React', 'TypeScript', 'Next.js']][i % 5]),
        profileImageUrl: `https://i.pravatar.cc/150?img=${61 + i}`,
        linkedinUrl: `https://linkedin.com/in/alumni${i}`,
        githubUrl: i % 2 === 0 ? `https://github.com/alumni${i}` : undefined,
        phone: `+91-988765${String(4321 + i).padStart(4, '0')}`,
        approvedBy: 1,
        approvedAt: new Date(`2024-0${6 + (i % 4)}-${10 + (i % 15)}`).toISOString(),
        createdAt: new Date(`2024-0${6 + (i % 4)}-0${5 + (i % 5)}`).toISOString(),
        updatedAt: new Date().toISOString()
    }));
    
    await db.insert(users).values(alumniUsers);
    console.log(`✅ Seeded ${alumniUsers.length} alumni users`);
    
    console.log(`✅ Total users seeded: ${adminUsers.length + facultyUsers.length + studentUsers.length + alumniUsers.length} (5 admin, 15 faculty, 30 students, 25 alumni)`);
}

async function seedPosts() {
    console.log('📝 Seeding posts...');
    const samplePosts = Array.from({ length: 60 }, (_, i) => ({
        authorId: 21 + (i % 40), // Mix of students and alumni
        content: [
            'Just started learning React! Any good resources? #ReactJS #WebDev',
            '🎉 Excited to share - selected for Google internship! #GoogleInternship',
            'Working on ML project for disease prediction. Tips on imbalanced datasets? #MachineLearning',
            'Looking for Flutter project teammates! DM if interested 📱 #ProjectCollab',
            'Question about JWT vs session-based auth for Node.js backend? #WebDevelopment',
            'Our team won first place at Smart India Hackathon! 🏆 #Hackathon',
            'Attending Web3 conference next week! #Blockchain #Web3',
            'Struggling with Dynamic Programming. Any good resources? #DSA',
            'Just completed TCS internship! Great learning experience. #Internship',
            'Reflecting on my journey from college to tech. Happy to mentor! #CareerAdvice',
            'We\'re hiring Full Stack Developers! DM for referrals. #JobOpportunity',
            'Published my first research paper on ML! 🎓 #Research #MachineLearning',
            'Startup advice: Market validation > Perfect product. #Startup',
            'AutoCAD and SolidWorks are must-haves for mechanical engineers! #MechEngineering',
            'Workshop on Modern Web Development next month! #Workshop',
            'Congratulations on securing placements! Keep going everyone. #Placements',
            'Looking for AI/ML research project students. Apply now! #Research',
            'Created my first Chrome extension! Feedback appreciated. #ChromeExtension',
            'How do seniors stay updated with rapidly changing tech? #TechNews',
            'Completed AWS Solutions Architect certification! 🎉 #AWS'
        ][i % 20],
        imageUrl: i % 5 === 0 ? `https://images.unsplash.com/photo-${['1573164713988-8665fc963095', '1556761175-4b46a572b786', '1532012197267-da84d127e765', '1556761175-b413da4baf72', '1523050854058-8df90110c9f1'][i % 5]}?w=800` : undefined,
        category: ['question', 'achievement', 'project', 'discussion', 'announcement'][i % 5],
        branch: i % 3 === 0 ? 'Computer Engineering' : i % 3 === 1 ? 'Information Technology' : undefined,
        visibility: 'public',
        status: 'approved',
        approvedBy: 1,
        approvedAt: new Date(`2024-${String((i % 6) + 2).padStart(2, '0')}-${String((i % 25) + 1).padStart(2, '0')}T10:00:00Z`).toISOString(),
        createdAt: new Date(`2024-${String((i % 6) + 2).padStart(2, '0')}-${String((i % 25) + 1).padStart(2, '0')}T09:30:00Z`).toISOString(),
        updatedAt: new Date(`2024-${String((i % 6) + 2).padStart(2, '0')}-${String((i % 25) + 1).padStart(2, '0')}T09:30:00Z`).toISOString()
    }));
    
    await db.insert(posts).values(samplePosts);
    console.log(`✅ Seeded ${samplePosts.length} posts`);
}

async function seedConnections() {
    console.log('🤝 Seeding connections...');
    const sampleConnections = Array.from({ length: 80 }, (_, i) => ({
        requesterId: 21 + (i % 30),
        responderId: 21 + ((i + 3) % 50),
        status: i % 10 === 0 ? 'pending' : i % 15 === 0 ? 'rejected' : 'accepted',
        message: i % 3 === 0 ? `Hi! Let's connect and collaborate!` : undefined,
        createdAt: new Date(`2024-${String((i % 4) + 9).padStart(2, '0')}-${String((i % 25) + 1).padStart(2, '0')}T10:30:00Z`).toISOString(),
        respondedAt: i % 10 !== 0 ? new Date(`2024-${String((i % 4) + 9).padStart(2, '0')}-${String((i % 25) + 2).padStart(2, '0')}T14:20:00Z`).toISOString() : undefined
    }));
    
    await db.insert(connections).values(sampleConnections);
    console.log(`✅ Seeded ${sampleConnections.length} connections`);
}

async function seedJobs() {
    console.log('💼 Seeding jobs...');
    const companies = ['Amazon', 'Google', 'Microsoft', 'Razorpay', 'Swiggy', 'CRED', 'Zomato', 'TCS', 'Flipkart', 'Paytm', 'PhonePe', 'Freshworks', 'Uber', 'Netflix', 'Infosys'];
    const titles = ['Software Engineer', 'Data Scientist', 'Frontend Developer', 'Backend Developer', 'DevOps Engineer', 'Product Manager', 'Mobile Developer', 'QA Engineer', 'ML Engineer', 'Full Stack Developer'];
    
    const sampleJobs = Array.from({ length: 45 }, (_, i) => ({
        postedById: 51 + (i % 25), // Alumni posting jobs
        title: `${titles[i % 10]}${i < 30 ? '' : i < 40 ? ' Intern' : ' (Part-time)'}`,
        company: companies[i % 15],
        description: `Join our team as ${titles[i % 10]}. Work on exciting projects with cutting-edge technologies. ${i < 30 ? 'Full-time position with great benefits.' : i < 40 ? 'Summer internship program.' : 'Flexible part-time opportunity.'}`,
        location: ['Bangalore', 'Mumbai', 'Pune', 'Hyderabad', 'Chennai', 'Delhi NCR', 'Remote'][i % 7],
        jobType: i < 30 ? 'full-time' : i < 40 ? 'internship' : 'part-time',
        salary: i < 30 ? `₹${10 + (i % 20)}-${18 + (i % 20)} LPA` : `₹${15 + (i % 10)},000-${25 + (i % 10)},000/month`,
        skills: JSON.stringify([['Python', 'Java', 'AWS'], ['React', 'TypeScript', 'Next.js'], ['Node.js', 'MongoDB', 'Express'], ['Machine Learning', 'TensorFlow', 'Python'], ['Docker', 'Kubernetes', 'CI/CD'], ['Product Management', 'Agile'], ['React Native', 'Mobile Development']][i % 7]),
        status: i % 10 === 0 ? 'pending' : 'approved',
        branch: i % 3 === 0 ? 'Computer Engineering' : i % 3 === 1 ? 'Information Technology' : undefined,
        approvedBy: i % 10 !== 0 ? 1 : undefined,
        approvedAt: i % 10 !== 0 ? new Date(`2024-11-${String((i % 25) + 1).padStart(2, '0')}T10:00:00Z`).toISOString() : undefined,
        createdAt: new Date(`2024-11-${String((i % 25) + 1).padStart(2, '0')}T09:00:00Z`).toISOString(),
        expiresAt: new Date(`2025-01-${String((i % 28) + 1).padStart(2, '0')}T23:59:59Z`).toISOString()
    }));
    
    await db.insert(jobs).values(sampleJobs);
    console.log(`✅ Seeded ${sampleJobs.length} jobs`);
}

async function seedEvents() {
    console.log('🎉 Seeding events...');
    const eventTypes = ['Technical Workshop', 'Hackathon', 'Alumni Meetup', 'Placement Drive', 'Cultural Fest', 'Tech Talk', 'Career Fair', 'Sports Day'];
    
    const sampleEvents = Array.from({ length: 35 }, (_, i) => ({
        organizerId: 6 + (i % 15), // Faculty organizing
        title: `${eventTypes[i % 8]} ${2025}`,
        description: `Join us for an exciting ${eventTypes[i % 8].toLowerCase()}. Great opportunity to learn, network, and have fun!`,
        location: ['Main Auditorium', 'Computer Lab', 'Sports Ground', 'Seminar Hall', 'College Campus', 'Online'][i % 6],
        startDate: new Date(`2025-0${(i % 2) + 1}-${String((i % 28) + 1).padStart(2, '0')}T${10 + (i % 8)}:00:00Z`).toISOString(),
        endDate: new Date(`2025-0${(i % 2) + 1}-${String((i % 28) + 1).padStart(2, '0')}T${14 + (i % 6)}:00:00Z`).toISOString(),
        category: ['technical', 'social', 'academic', 'sports'][i % 4],
        branch: i % 3 === 0 ? 'Computer Engineering' : i % 3 === 1 ? 'Information Technology' : undefined,
        isPaid: i % 5 === 0,
        price: i % 5 === 0 ? '500' : '0',
        maxAttendees: 50 + (i * 10),
        imageUrl: `https://images.unsplash.com/photo-${['1540575467063-178a50c2df87', '1523580846011-d3a5bc25702b', '1511578314322-4e6ae25ba3af', '1475721027785-f74eccf877e2'][i % 4]}?w=800`,
        status: 'approved',
        approvedBy: 1,
        approvedAt: new Date(`2024-${String((i % 2) + 11).padStart(2, '0')}-${String((i % 25) + 1).padStart(2, '0')}T09:00:00Z`).toISOString(),
        createdAt: new Date(`2024-${String((i % 2) + 11).padStart(2, '0')}-${String((i % 25) + 1).padStart(2, '0')}T09:00:00Z`).toISOString()
    }));
    
    await db.insert(events).values(sampleEvents);
    console.log(`✅ Seeded ${sampleEvents.length} events`);
}

async function seedApplications() {
    console.log('📄 Seeding job applications...');
    const sampleApplications = Array.from({ length: 50 }, (_, i) => ({
        jobId: 1 + (i % 30),
        applicantId: 21 + (i % 30), // Students applying
        status: ['applied', 'screening', 'interview', 'rejected', 'accepted'][i % 5],
        coverLetter: `I am very interested in this position and believe my skills would be a great fit.`,
        appliedAt: new Date(`2024-${String((i % 2) + 11).padStart(2, '0')}-${String((i % 25) + 5).padStart(2, '0')}T10:00:00Z`).toISOString(),
        updatedAt: new Date().toISOString()
    }));
    
    await db.insert(applications).values(sampleApplications);
    console.log(`✅ Seeded ${sampleApplications.length} job applications`);
}

async function seedMentorshipRequests() {
    console.log('🎓 Seeding mentorship requests...');
    const topics = ['Web Development', 'Machine Learning', 'System Design', 'Career Planning', 'Data Science', 'Mobile Development'];
    
    const sampleRequests = Array.from({ length: 35 }, (_, i) => ({
        studentId: 21 + (i % 30), // Students
        mentorId: 51 + (i % 20), // Alumni
        topic: topics[i % 6],
        message: `Hi! I would love to learn from your experience in ${topics[i % 6].toLowerCase()}.`,
        preferredTime: `${['Morning', 'Afternoon', 'Evening'][i % 3]} on ${['Weekdays', 'Weekends'][i % 2]}`,
        status: ['pending', 'accepted', 'rejected', 'completed'][i % 4],
        createdAt: new Date(`2024-${String((i % 6) + 7).padStart(2, '0')}-${String((i % 25) + 1).padStart(2, '0')}T10:00:00Z`).toISOString(),
        respondedAt: i % 4 !== 0 ? new Date(`2024-${String((i % 6) + 7).padStart(2, '0')}-${String((i % 25) + 3).padStart(2, '0')}T14:00:00Z`).toISOString() : undefined
    }));
    
    await db.insert(mentorshipRequests).values(sampleRequests);
    console.log(`✅ Seeded ${sampleRequests.length} mentorship requests`);
}

async function seedRsvps() {
    console.log('✅ Seeding RSVPs...');
    const sampleRsvps = Array.from({ length: 70 }, (_, i) => ({
        eventId: 1 + (i % 35),
        userId: 21 + (i % 50),
        status: ['registered', 'attended', 'cancelled'][i % 3],
        paymentStatus: i % 5 === 0 ? 'completed' : 'na',
        rsvpedAt: new Date(`2024-${String((i % 2) + 11).padStart(2, '0')}-${String((i % 25) + 3).padStart(2, '0')}T10:00:00Z`).toISOString()
    }));
    
    await db.insert(rsvps).values(sampleRsvps);
    console.log(`✅ Seeded ${sampleRsvps.length} RSVPs`);
}

async function seedComments() {
    console.log('💬 Seeding comments...');
    const commentTexts = [
        'Great post! Thanks for sharing.',
        'I had the same question. Looking forward to answers!',
        'Congratulations! Well deserved.',
        'This is really helpful. Thank you!',
        'Completely agree with this perspective.',
        'Can you share more details about this?',
        'Inspiring journey! Thanks for mentoring us.',
        'Count me in! Let\'s collaborate.',
        'This is exactly what I needed to hear today.',
        'Bookmarking this for future reference!'
    ];
    
    const sampleComments = Array.from({ length: 80 }, (_, i) => ({
        postId: 1 + (i % 60),
        authorId: 21 + (i % 50),
        content: commentTexts[i % 10],
        createdAt: new Date(`2024-${String((i % 6) + 3).padStart(2, '0')}-${String((i % 25) + 2).padStart(2, '0')}T${10 + (i % 10)}:${30 + (i % 30)}:00Z`).toISOString()
    }));
    
    await db.insert(comments).values(sampleComments);
    console.log(`✅ Seeded ${sampleComments.length} comments`);
}

async function seedPostReactions() {
    console.log('👍 Seeding post reactions...');
    const sampleReactions = Array.from({ length: 120 }, (_, i) => ({
        postId: 1 + (i % 60),
        userId: 21 + (i % 50),
        reactionType: ['like', 'heart', 'celebrate'][i % 3],
        createdAt: new Date(`2024-${String((i % 6) + 3).padStart(2, '0')}-${String((i % 25) + 1).padStart(2, '0')}T${11 + (i % 10)}:00:00Z`).toISOString()
    }));
    
    await db.insert(postReactions).values(sampleReactions);
    console.log(`✅ Seeded ${sampleReactions.length} post reactions`);
}

async function seedChats() {
    console.log('💬 Seeding chats...');
    const sampleChats = Array.from({ length: 25 }, (_, i) => ({
        chatType: i % 5 === 0 ? 'group' : 'direct',
        name: i % 5 === 0 ? `Study Group ${i + 1}` : undefined,
        createdBy: 21 + (i % 30),
        createdAt: new Date(`2024-${String((i % 4) + 9).padStart(2, '0')}-01T10:00:00Z`).toISOString()
    }));
    
    await db.insert(chats).values(sampleChats);
    console.log(`✅ Seeded ${sampleChats.length} chats`);
}

async function seedChatMembers() {
    console.log('👥 Seeding chat members...');
    const sampleMembers = Array.from({ length: 60 }, (_, i) => ({
        chatId: 1 + (i % 25),
        userId: 21 + (i % 40),
        joinedAt: new Date(`2024-${String((i % 4) + 9).padStart(2, '0')}-01T10:00:00Z`).toISOString(),
        lastReadAt: i % 3 !== 0 ? new Date(`2024-12-${String((i % 20) + 1).padStart(2, '0')}T${10 + (i % 12)}:00:00Z`).toISOString() : undefined
    }));
    
    await db.insert(chatMembers).values(sampleMembers);
    console.log(`✅ Seeded ${sampleMembers.length} chat members`);
}

async function seedMessages() {
    console.log('💌 Seeding messages...');
    const messageTexts = [
        'Hey! How are you doing?',
        'Did you complete the assignment?',
        'Let\'s meet for coffee tomorrow',
        'Thanks for the help with the project!',
        'Are you attending the workshop?',
        'Check out this cool resource',
        'What time works for you?',
        'Great work on your presentation!',
        'Can you share your notes?',
        'See you at the event!'
    ];
    
    const sampleMessages = Array.from({ length: 100 }, (_, i) => ({
        chatId: 1 + (i % 25),
        senderId: 21 + (i % 40),
        content: messageTexts[i % 10],
        messageType: 'text',
        createdAt: new Date(`2024-12-${String((i % 20) + 1).padStart(2, '0')}T${9 + (i % 12)}:${(i * 5) % 60}:00Z`).toISOString()
    }));
    
    await db.insert(messages).values(sampleMessages);
    console.log(`✅ Seeded ${sampleMessages.length} messages`);
}

async function seedActivityLog() {
    console.log('📊 Seeding activity logs...');
    const activities = ['login', 'post_created', 'connection_made', 'job_applied', 'event_rsvp', 'comment_added', 'profile_updated'];
    
    const sampleLogs = Array.from({ length: 80 }, (_, i) => ({
        userId: 21 + (i % 50),
        role: i % 2 === 0 ? 'student' : 'alumni',
        action: activities[i % 7],
        metadata: JSON.stringify({ action: activities[i % 7], timestamp: Date.now() }),
        timestamp: new Date(`2024-${String((i % 2) + 11).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}T${10 + (i % 12)}:00:00Z`).toISOString()
    }));
    
    await db.insert(activityLog).values(sampleLogs);
    console.log(`✅ Seeded ${sampleLogs.length} activity logs`);
}

async function seedNotifications() {
    console.log('🔔 Seeding notifications...');
    const notifTypes = ['connection', 'job', 'event', 'mentorship', 'message', 'post'];
    
    const sampleNotifications = Array.from({ length: 60 }, (_, i) => ({
        userId: 21 + (i % 50),
        type: notifTypes[i % 6],
        title: `${['New connection request', 'Job application update', 'Event tomorrow', 'Mentorship request', 'New message', 'New comment on your post'][i % 6]}`,
        message: `${['Someone wants to connect with you', 'Your application status has been updated', 'Don\'t forget the event tomorrow', 'New mentorship request received', 'You have a new message', 'New comment on your post'][i % 6]}`,
        relatedId: String(1 + (i % 20)),
        isRead: i % 4 !== 0,
        createdAt: new Date(`2024-12-${String((i % 27) + 1).padStart(2, '0')}T${10 + (i % 10)}:00:00Z`).toISOString()
    }));
    
    await db.insert(notifications).values(sampleNotifications);
    console.log(`✅ Seeded ${sampleNotifications.length} notifications`);
}

async function main() {
    try {
        console.log('🚀 Starting comprehensive database seeding...\n');
        
        await clearAllTables();
        await seedUsers();
        await seedPosts();
        await seedConnections();
        await seedJobs();
        await seedEvents();
        await seedApplications();
        await seedMentorshipRequests();
        await seedRsvps();
        await seedComments();
        await seedPostReactions();
        await seedChats();
        await seedChatMembers();
        await seedMessages();
        await seedActivityLog();
        await seedNotifications();
        
        console.log('\n✨ Database seeding completed successfully!');
        console.log('📊 Total records: 900+');
        console.log('👥 Users: 75 | 📝 Posts: 60 | 🤝 Connections: 80');
        console.log('💼 Jobs: 45 | 🎉 Events: 35 | 📄 Applications: 50');
        console.log('🎓 Mentorship: 35 | ✅ RSVPs: 70 | 💬 Comments: 80');
        console.log('👍 Reactions: 120 | 💬 Chats: 25 | 👥 Members: 60');
        console.log('💌 Messages: 100 | 📊 Activity Logs: 80 | 🔔 Notifications: 60');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
}

main();