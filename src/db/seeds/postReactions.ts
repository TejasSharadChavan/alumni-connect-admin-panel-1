import { db } from '@/db';
import { postReactions } from '@/db/schema';

async function main() {
    // Helper function to get random element from array
    const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    
    // Helper function to get random number in range
    const getRandomInt = (min: number, max: number): number => 
        Math.floor(Math.random() * (max - min + 1)) + min;
    
    // Helper function to add hours to date
    const addHours = (date: Date, hours: number): Date => {
        const newDate = new Date(date);
        newDate.setHours(newDate.getHours() + hours);
        return newDate;
    };
    
    // Helper function to add days to date
    const addDays = (date: Date, days: number): Date => {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + days);
        return newDate;
    };

    // Define user groups with their IDs
    const students = Array.from({ length: 50 }, (_, i) => i + 2);
    const alumni = Array.from({ length: 40 }, (_, i) => i + 52);
    const faculty = Array.from({ length: 15 }, (_, i) => i + 92);
    
    // All users combined
    const allUsers = [...students, ...alumni, ...faculty];

    // Post categories and their typical reaction patterns
    const postPatterns = {
        achievement: {
            reactionRange: [10, 20],
            reactionWeights: {
                like: 0.25,
                heart: 0.35,
                celebrate: 0.40
            }
        },
        announcement: {
            reactionRange: [8, 15],
            reactionWeights: {
                like: 0.60,
                heart: 0.25,
                celebrate: 0.15
            }
        },
        question: {
            reactionRange: [3, 8],
            reactionWeights: {
                like: 0.80,
                heart: 0.15,
                celebrate: 0.05
            }
        },
        discussion: {
            reactionRange: [5, 12],
            reactionWeights: {
                like: 0.70,
                heart: 0.20,
                celebrate: 0.10
            }
        },
        project: {
            reactionRange: [7, 15],
            reactionWeights: {
                like: 0.50,
                heart: 0.25,
                celebrate: 0.25
            }
        }
    };

    // Sample posts distribution (assuming 150+ posts exist, ID 1-200)
    const postsWithCategories = [
        // Achievement posts (IDs 1-30) - High engagement
        ...Array.from({ length: 30 }, (_, i) => ({ id: i + 1, category: 'achievement', baseDate: new Date('2024-01-01') })),
        // Announcement posts (IDs 31-60) - Medium-high engagement
        ...Array.from({ length: 30 }, (_, i) => ({ id: i + 31, category: 'announcement', baseDate: new Date('2024-01-08') })),
        // Question posts (IDs 61-100) - Lower engagement
        ...Array.from({ length: 40 }, (_, i) => ({ id: i + 61, category: 'question', baseDate: new Date('2024-01-15') })),
        // Discussion posts (IDs 101-150) - Medium engagement
        ...Array.from({ length: 50 }, (_, i) => ({ id: i + 101, category: 'discussion', baseDate: new Date('2024-01-20') })),
        // Project posts (IDs 151-200) - Medium-high engagement
        ...Array.from({ length: 50 }, (_, i) => ({ id: i + 151, category: 'project', baseDate: new Date('2024-01-25') }))
    ];

    const reactions: typeof postReactions.$inferInsert[] = [];
    const reactedPostUsers = new Map<number, Set<number>>(); // Track user-post combinations

    // Generate reactions for each post
    for (const post of postsWithCategories) {
        const pattern = postPatterns[post.category as keyof typeof postPatterns];
        const reactionCount = getRandomInt(pattern.reactionRange[0], pattern.reactionRange[1]);
        
        if (!reactedPostUsers.has(post.id)) {
            reactedPostUsers.set(post.id, new Set());
        }
        
        const postReactedUsers = reactedPostUsers.get(post.id)!;
        let attemptsLeft = reactionCount * 3; // Allow multiple attempts to find unique users

        for (let i = 0; i < reactionCount && attemptsLeft > 0; i++) {
            attemptsLeft--;
            
            // Select user based on distribution (55% students, 35% alumni, 10% faculty)
            let userId: number;
            const userTypeRoll = Math.random();
            
            if (userTypeRoll < 0.55) {
                userId = getRandomElement(students);
            } else if (userTypeRoll < 0.90) {
                userId = getRandomElement(alumni);
            } else {
                userId = getRandomElement(faculty);
            }
            
            // Skip if user already reacted to this post
            if (postReactedUsers.has(userId)) {
                i--; // Don't count this iteration
                continue;
            }
            
            // Determine reaction type based on weights
            const reactionRoll = Math.random();
            let reactionType: 'like' | 'heart' | 'celebrate';
            
            if (reactionRoll < pattern.reactionWeights.like) {
                reactionType = 'like';
            } else if (reactionRoll < pattern.reactionWeights.like + pattern.reactionWeights.heart) {
                reactionType = 'heart';
            } else {
                reactionType = 'celebrate';
            }
            
            // Generate realistic timestamp (within hours to days after post)
            const isEarlyReaction = Math.random() < 0.4; // 40% are early reactions
            let createdAt: Date;
            
            if (isEarlyReaction) {
                // Early reaction: 1-6 hours after post
                createdAt = addHours(post.baseDate, getRandomInt(1, 6));
            } else {
                // Later reaction: 1-7 days after post
                const daysDelay = getRandomInt(1, 7);
                const hoursDelay = getRandomInt(0, 23);
                createdAt = addDays(post.baseDate, daysDelay);
                createdAt = addHours(createdAt, hoursDelay);
            }
            
            reactions.push({
                postId: post.id,
                userId: userId,
                reactionType: reactionType,
                createdAt: createdAt.toISOString()
            });
            
            postReactedUsers.add(userId);
        }
    }

    // Shuffle reactions to make insertion order realistic
    for (let i = reactions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [reactions[i], reactions[j]] = [reactions[j], reactions[i]];
    }

    // Insert reactions in batches for better performance
    const batchSize = 100;
    for (let i = 0; i < reactions.length; i += batchSize) {
        const batch = reactions.slice(i, i + batchSize);
        await db.insert(postReactions).values(batch);
    }
    
    console.log(`✅ Post reactions seeder completed successfully - ${reactions.length} reactions created`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});