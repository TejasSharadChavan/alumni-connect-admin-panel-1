import { db } from '@/db';
import { auditLog } from '@/db/schema';

async function main() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const fortyFiveDaysAgo = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const sampleAuditLogs = [
        {
            actorId: 1,
            actorRole: 'admin',
            action: 'approve_user',
            entityType: 'pending_user',
            entityId: '1',
            details: JSON.stringify({
                pendingUserEmail: 'rahul.kapoor@gmail.com',
                approvedRole: 'alumni',
                timestamp: thirtyDaysAgo.toISOString(),
            }),
            ipAddress: '103.68.90.12',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            timestamp: thirtyDaysAgo.toISOString(),
        },
        {
            actorId: 1,
            actorRole: 'admin',
            action: 'approve_user',
            entityType: 'pending_user',
            entityId: '2',
            details: JSON.stringify({
                pendingUserEmail: 'meera.joshi@yahoo.com',
                approvedRole: 'alumni',
                timestamp: fortyFiveDaysAgo.toISOString(),
            }),
            ipAddress: '103.68.90.12',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            timestamp: fortyFiveDaysAgo.toISOString(),
        },
        {
            actorId: 1,
            actorRole: 'admin',
            action: 'approve_user',
            entityType: 'pending_user',
            entityId: '3',
            details: JSON.stringify({
                pendingUserEmail: 'amit.verma@terna.ac.in',
                approvedRole: 'faculty',
                timestamp: sixtyDaysAgo.toISOString(),
            }),
            ipAddress: '103.68.90.12',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            timestamp: sixtyDaysAgo.toISOString(),
        },
    ];

    await db.insert(auditLog).values(sampleAuditLogs);
    
    console.log('✅ Audit log seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});