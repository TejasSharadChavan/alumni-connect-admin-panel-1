import { db } from '@/db';
import { activityLog } from '@/db/schema';

async function main() {
    const now = new Date();
    
    const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

    const sampleActivityLogs = [
        {
            userId: 1,
            role: 'admin',
            action: 'login',
            metadata: JSON.stringify({
                loginTime: oneDayAgo.toISOString(),
                ipAddress: '103.68.90.12'
            }),
            timestamp: oneDayAgo.toISOString(),
        },
        {
            userId: 2,
            role: 'student',
            action: 'login',
            metadata: JSON.stringify({
                loginTime: twoDaysAgo.toISOString(),
                ipAddress: '49.36.158.22'
            }),
            timestamp: twoDaysAgo.toISOString(),
        },
        {
            userId: 3,
            role: 'student',
            action: 'login',
            metadata: JSON.stringify({
                loginTime: threeDaysAgo.toISOString(),
                ipAddress: '49.36.158.45'
            }),
            timestamp: threeDaysAgo.toISOString(),
        },
        {
            userId: 5,
            role: 'alumni',
            action: 'login',
            metadata: JSON.stringify({
                loginTime: fiveDaysAgo.toISOString(),
                ipAddress: '202.88.234.11'
            }),
            timestamp: fiveDaysAgo.toISOString(),
        },
        {
            userId: 7,
            role: 'faculty',
            action: 'login',
            metadata: JSON.stringify({
                loginTime: fourDaysAgo.toISOString(),
                ipAddress: '103.68.90.15'
            }),
            timestamp: fourDaysAgo.toISOString(),
        },
        {
            userId: 2,
            role: 'student',
            action: 'view_profile',
            metadata: JSON.stringify({
                viewedProfileId: 5,
                viewedProfileName: 'Rahul Kapoor'
            }),
            timestamp: twoDaysAgo.toISOString(),
        },
        {
            userId: 5,
            role: 'alumni',
            action: 'view_profile',
            metadata: JSON.stringify({
                viewedProfileId: 2,
                viewedProfileName: 'Priya Sharma'
            }),
            timestamp: threeDaysAgo.toISOString(),
        },
        {
            userId: 1,
            role: 'admin',
            action: 'view_pending_users',
            metadata: JSON.stringify({
                count: 5
            }),
            timestamp: oneDayAgo.toISOString(),
        }
    ];

    await db.insert(activityLog).values(sampleActivityLogs);
    
    console.log('✅ Activity log seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});