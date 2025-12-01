import { db } from '@/db';
import { chats, chatMembers, messages } from '@/db/schema';

async function main() {
    // Create direct chats between connected users
    const directChats = [
        // Student-Student chats
        { createdBy: 11, member1: 11, member2: 12, messages: 15 },
        { createdBy: 13, member1: 13, member2: 14, messages: 8 },
        { createdBy: 15, member1: 15, member2: 16, messages: 12 },
        { createdBy: 17, member1: 17, member2: 18, messages: 20 },
        { createdBy: 19, member1: 19, member2: 20, messages: 10 },
        
        // Student-Alumni chats
        { createdBy: 11, member1: 11, member2: 52, messages: 18 },
        { createdBy: 23, member1: 23, member2: 58, messages: 12 },
        { createdBy: 34, member1: 34, member2: 67, messages: 15 },
        { createdBy: 47, member1: 47, member2: 73, messages: 10 },
        { createdBy: 25, member1: 25, member2: 61, messages: 8 },
        
        // Student-Faculty chats
        { createdBy: 15, member1: 15, member2: 100, messages: 14 },
        { createdBy: 28, member1: 28, member2: 102, messages: 10 },
        { createdBy: 19, member1: 19, member2: 105, messages: 12 },
        
        // Alumni-Alumni chats
        { createdBy: 52, member1: 52, member2: 58, messages: 7 },
        { createdBy: 67, member1: 67, member2: 73, messages: 9 },
    ];
    
    const sampleMessages = [
        "Hey! How's it going?",
        "Did you complete the assignment?",
        "I'm working on the project. Want to collaborate?",
        "Thanks for your help yesterday!",
        "Can we discuss this over a call?",
        "Sure, that works for me.",
        "What time is convenient for you?",
        "I'm free after 5 PM today.",
        "Great! Let's meet in the library.",
        "Did you see the latest announcement?",
        "Yes, sounds interesting!",
        "We should definitely participate.",
        "I'll send you the details.",
        "Perfect, thanks!",
        "Talk to you soon!",
        "Looking forward to working together.",
        "This is really helpful, appreciate it!",
        "No problem, happy to help!",
        "Let me know if you need anything else.",
        "Will do, thanks again!",
    ];
    
    let messageId = 1;
    
    for (const chat of directChats) {
        // Create chat
        const [insertedChat] = await db.insert(chats).values({
            chatType: 'direct',
            name: null,
            createdBy: chat.createdBy,
            createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        }).returning();
        
        // Add chat members
        await db.insert(chatMembers).values([
            {
                chatId: insertedChat.id,
                userId: chat.member1,
                joinedAt: insertedChat.createdAt,
                lastReadAt: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
                chatId: insertedChat.id,
                userId: chat.member2,
                joinedAt: insertedChat.createdAt,
                lastReadAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
            },
        ]);
        
        // Add messages
        const chatMessages = [];
        const startTime = new Date(insertedChat.createdAt).getTime();
        
        for (let i = 0; i < chat.messages; i++) {
            const senderId = i % 2 === 0 ? chat.member1 : chat.member2;
            const messageTime = startTime + (i * 2 * 60 * 60 * 1000) + Math.random() * 60 * 60 * 1000;
            
            chatMessages.push({
                chatId: insertedChat.id,
                senderId,
                content: sampleMessages[Math.floor(Math.random() * sampleMessages.length)],
                messageType: 'text',
                fileUrl: null,
                createdAt: new Date(messageTime).toISOString(),
                editedAt: null,
            });
        }
        
        await db.insert(messages).values(chatMessages);
        messageId += chat.messages;
    }
    
    // Create some group chats
    const groupChats = [
        {
            name: 'CS 2024 Batch',
            createdBy: 11,
            members: [11, 12, 13, 14, 15, 16, 17, 18],
            messages: 30,
        },
        {
            name: 'Hackathon Team Alpha',
            createdBy: 23,
            members: [23, 24, 25, 26],
            messages: 25,
        },
        {
            name: 'ML Research Group',
            createdBy: 100,
            members: [100, 15, 23, 28, 36],
            messages: 20,
        },
        {
            name: 'Placement Prep Squad',
            createdBy: 34,
            members: [34, 35, 36, 37, 38, 39],
            messages: 35,
        },
    ];
    
    const groupMessages = [
        "Hey everyone!",
        "Did anyone complete the assignment?",
        "I'm stuck on problem 3, any hints?",
        "Check the lecture notes from last week.",
        "Thanks! That helped.",
        "When's our next meeting?",
        "How about this Saturday at 10 AM?",
        "Works for me!",
        "Same here.",
        "Great, see you all then!",
        "Don't forget to bring your laptops.",
        "Anyone wants to grab lunch after?",
        "I'm in!",
        "Count me in too.",
        "Perfect, let's meet at the cafeteria.",
        "Did you guys see the latest announcement?",
        "Yes! Very exciting opportunity.",
        "We should definitely apply.",
        "Agreed! Let's prepare together.",
        "I'll create a shared doc for collaboration.",
    ];
    
    for (const group of groupChats) {
        // Create group chat
        const [insertedChat] = await db.insert(chats).values({
            chatType: 'group',
            name: group.name,
            createdBy: group.createdBy,
            createdAt: new Date(Date.now() - Math.random() * 45 * 24 * 60 * 60 * 1000).toISOString(),
        }).returning();
        
        // Add chat members
        const memberInserts = group.members.map(userId => ({
            chatId: insertedChat.id,
            userId,
            joinedAt: insertedChat.createdAt,
            lastReadAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
        }));
        
        await db.insert(chatMembers).values(memberInserts);
        
        // Add messages
        const chatMessages = [];
        const startTime = new Date(insertedChat.createdAt).getTime();
        
        for (let i = 0; i < group.messages; i++) {
            const senderId = group.members[Math.floor(Math.random() * group.members.length)];
            const messageTime = startTime + (i * 60 * 60 * 1000) + Math.random() * 30 * 60 * 1000;
            
            chatMessages.push({
                chatId: insertedChat.id,
                senderId,
                content: groupMessages[Math.floor(Math.random() * groupMessages.length)],
                messageType: 'text',
                fileUrl: null,
                createdAt: new Date(messageTime).toISOString(),
                editedAt: null,
            });
        }
        
        await db.insert(messages).values(chatMessages);
        messageId += group.messages;
    }
    
    console.log(`✅ Chats and messages seeder completed - ${directChats.length + groupChats.length} chats and ${messageId - 1} messages created`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});
