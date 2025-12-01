import { db } from '@/db';
import { pendingUsers } from '@/db/schema';
import bcrypt from 'bcrypt';

async function main() {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('Pending@123', saltRounds);

    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString();
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString();

    const samplePendingUsers = [
        {
            name: 'Ananya Rao',
            email: 'ananya.rao@terna.ac.in',
            passwordHash: passwordHash,
            requestedRole: 'student',
            submittedData: {
                branch: 'Computer Engineering',
                cohort: '2024-2025',
                phone: '+91-9789012345'
            },
            status: 'pending',
            submittedAt: twoDaysAgo,
            rejectionReason: null,
            reviewedBy: null,
            reviewedAt: null,
        },
        {
            name: 'Vikram Singh',
            email: 'vikram.singh@terna.ac.in',
            passwordHash: passwordHash,
            requestedRole: 'student',
            submittedData: {
                branch: 'Electronics Engineering',
                cohort: '2023-2024',
                phone: '+91-9890123456'
            },
            status: 'pending',
            submittedAt: oneDayAgo,
            rejectionReason: null,
            reviewedBy: null,
            reviewedAt: null,
        },
        {
            name: 'Kavita Nair',
            email: 'kavita.nair@gmail.com',
            passwordHash: passwordHash,
            requestedRole: 'alumni',
            submittedData: {
                branch: 'Mechanical Engineering',
                yearOfPassing: 2019,
                phone: '+91-9901234567',
                headline: 'Product Manager at Microsoft',
                linkedinUrl: 'https://linkedin.com/in/kavitanair'
            },
            status: 'pending',
            submittedAt: threeDaysAgo,
            rejectionReason: null,
            reviewedBy: null,
            reviewedAt: null,
        },
        {
            name: 'Rohan Malhotra',
            email: 'rohan.malhotra@outlook.com',
            passwordHash: passwordHash,
            requestedRole: 'alumni',
            submittedData: {
                branch: 'Computer Engineering',
                yearOfPassing: 2021,
                phone: '+91-9012345678',
                headline: 'Data Scientist at Amazon',
                linkedinUrl: 'https://linkedin.com/in/rohanmalhotra',
                githubUrl: 'https://github.com/rohanmalhotra'
            },
            status: 'pending',
            submittedAt: fiveDaysAgo,
            rejectionReason: null,
            reviewedBy: null,
            reviewedAt: null,
        },
        {
            name: 'Dr. Sunita Iyer',
            email: 'sunita.iyer@terna.ac.in',
            passwordHash: passwordHash,
            requestedRole: 'faculty',
            submittedData: {
                department: 'Electronics Engineering',
                phone: '+91-9123456780',
                headline: 'PhD in Signal Processing',
                bio: 'Specialization in digital signal processing and communication systems'
            },
            status: 'pending',
            submittedAt: fourDaysAgo,
            rejectionReason: null,
            reviewedBy: null,
            reviewedAt: null,
        }
    ];

    await db.insert(pendingUsers).values(samplePendingUsers);
    
    console.log('✅ Pending users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});