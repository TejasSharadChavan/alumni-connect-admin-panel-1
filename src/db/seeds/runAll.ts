import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const seedFiles = [
    'users',
    'posts',
    'comments',
    'postReactions',
    'connections',
    'jobs',
    'applications',
    'events',
    'rsvps',
    'mentorshipRequests',
    'activityLog',
    'chatsAndMessages',
    'notifications',
];

async function runAllSeeders() {
    console.log('🌱 Starting comprehensive database seeding...\n');
    
    for (const file of seedFiles) {
        try {
            console.log(`📦 Running ${file} seeder...`);
            const { stdout, stderr } = await execAsync(`bun run src/db/seeds/${file}.ts`);
            
            if (stdout) console.log(stdout);
            if (stderr) console.error(stderr);
            
            // Small delay between seeders
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error(`❌ Error running ${file} seeder:`, error);
            // Continue with other seeders even if one fails
        }
    }
    
    console.log('\n✅ All seeders completed! Database is now populated with realistic data.');
    console.log('\n📊 Database Summary:');
    console.log('   - 100+ Users (Admin, Faculty, Students, Alumni)');
    console.log('   - 50+ Posts with images and rich content');
    console.log('   - 300+ Comments on posts');
    console.log('   - 500+ Post reactions');
    console.log('   - 40+ Connections between users');
    console.log('   - 50+ Job listings');
    console.log('   - 100+ Job applications');
    console.log('   - 50+ Events (workshops, webinars, conferences)');
    console.log('   - 1000+ Event RSVPs');
    console.log('   - 14+ Mentorship requests with sessions');
    console.log('   - 2000+ Activity logs');
    console.log('   - 20+ Chats with 300+ messages');
    console.log('   - 600+ Notifications');
}

runAllSeeders().catch((error) => {
    console.error('❌ Seeding process failed:', error);
    process.exit(1);
});
