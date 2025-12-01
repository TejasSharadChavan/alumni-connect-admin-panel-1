import { db } from '@/db';
import { notifications } from '@/db/schema';

async function main() {
    const sampleNotifications = [];
    
    // Generate notifications for students (users 10-70)
    for (let userId = 10; userId <= 70; userId++) {
        const numNotifications = 5 + Math.floor(Math.random() * 11); // 5-15 notifications per student
        
        for (let i = 0; i < numNotifications; i++) {
            const types = ['connection', 'job', 'event', 'mentorship', 'message', 'post'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            let title, message, relatedId;
            
            switch (type) {
                case 'connection':
                    title = 'New Connection Request';
                    message = 'You have a new connection request from a fellow student.';
                    relatedId = Math.floor(Math.random() * 50).toString();
                    break;
                case 'job':
                    title = 'New Job Opportunity';
                    message = 'A new job matching your profile has been posted.';
                    relatedId = Math.floor(Math.random() * 50).toString();
                    break;
                case 'event':
                    title = 'Upcoming Event';
                    message = 'Don\'t forget about the workshop you registered for tomorrow!';
                    relatedId = Math.floor(Math.random() * 40).toString();
                    break;
                case 'mentorship':
                    title = 'Mentorship Request Accepted';
                    message = 'Your mentorship request has been accepted! Check your dashboard.';
                    relatedId = Math.floor(Math.random() * 15).toString();
                    break;
                case 'message':
                    title = 'New Message';
                    message = 'You have received a new message.';
                    relatedId = Math.floor(Math.random() * 20).toString();
                    break;
                case 'post':
                    title = 'New Comment on Your Post';
                    message = 'Someone commented on your recent post.';
                    relatedId = Math.floor(Math.random() * 50).toString();
                    break;
            }
            
            sampleNotifications.push({
                userId,
                type,
                title,
                message,
                relatedId,
                isRead: Math.random() > 0.4, // 60% read rate
                createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            });
        }
    }
    
    // Generate notifications for alumni (users 52-95)
    for (let userId = 52; userId <= 95; userId++) {
        const numNotifications = 3 + Math.floor(Math.random() * 8); // 3-10 notifications per alumni
        
        for (let i = 0; i < numNotifications; i++) {
            const types = ['connection', 'mentorship', 'message', 'event'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            let title, message, relatedId;
            
            switch (type) {
                case 'connection':
                    title = 'New Connection Request';
                    message = 'A student wants to connect with you for career guidance.';
                    relatedId = Math.floor(Math.random() * 50).toString();
                    break;
                case 'mentorship':
                    title = 'New Mentorship Request';
                    message = 'A student has requested mentorship from you.';
                    relatedId = Math.floor(Math.random() * 15).toString();
                    break;
                case 'message':
                    title = 'New Message';
                    message = 'You have received a new message.';
                    relatedId = Math.floor(Math.random() * 20).toString();
                    break;
                case 'event':
                    title = 'Event Invitation';
                    message = 'You\'ve been invited to speak at an upcoming event.';
                    relatedId = Math.floor(Math.random() * 40).toString();
                    break;
            }
            
            sampleNotifications.push({
                userId,
                type,
                title,
                message,
                relatedId,
                isRead: Math.random() > 0.5, // 50% read rate
                createdAt: new Date(Date.now() - Math.random() * 40 * 24 * 60 * 60 * 1000).toISOString(),
            });
        }
    }
    
    // Generate notifications for faculty (users 100-106)
    for (let userId = 100; userId <= 106; userId++) {
        const numNotifications = 8 + Math.floor(Math.random() * 13); // 8-20 notifications per faculty
        
        for (let i = 0; i < numNotifications; i++) {
            const types = ['post', 'event', 'message', 'mentorship'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            let title, message, relatedId;
            
            switch (type) {
                case 'post':
                    title = 'Post Awaiting Approval';
                    message = 'A student post is awaiting your approval.';
                    relatedId = Math.floor(Math.random() * 50).toString();
                    break;
                case 'event':
                    title = 'Event Registration Update';
                    message = '15 new students registered for your workshop.';
                    relatedId = Math.floor(Math.random() * 40).toString();
                    break;
                case 'message':
                    title = 'New Message';
                    message = 'A student has sent you a message.';
                    relatedId = Math.floor(Math.random() * 20).toString();
                    break;
                case 'mentorship':
                    title = 'Research Interest';
                    message: 'A student expressed interest in joining your research lab.';
                    relatedId = Math.floor(Math.random() * 15).toString();
                    break;
            }
            
            sampleNotifications.push({
                userId,
                type,
                title,
                message,
                relatedId,
                isRead: Math.random() > 0.3, // 70% read rate
                createdAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString(),
            });
        }
    }

    await db.insert(notifications).values(sampleNotifications);
    
    console.log(`✅ Notifications seeder completed - ${sampleNotifications.length} notifications created`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});
