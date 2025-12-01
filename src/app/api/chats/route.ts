import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { chats, chatMembers, messages, users, sessions } from "@/db/schema";
import { eq, or, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Get current user from token
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all chats where user is a member
    const userChats = await db
      .select({
        chatId: chatMembers.chatId,
        chatType: chats.chatType,
        chatName: chats.name,
        createdAt: chats.createdAt,
      })
      .from(chatMembers)
      .innerJoin(chats, eq(chatMembers.chatId, chats.id))
      .where(eq(chatMembers.userId, currentUser.id));

    // For each chat, get the other user and last message
    const chatsWithDetails = await Promise.all(
      userChats.map(async (chat) => {
        // Get last message
        const [lastMessage] = await db
          .select()
          .from(messages)
          .where(eq(messages.chatId, chat.chatId))
          .orderBy(desc(messages.createdAt))
          .limit(1);

        // Get other chat members
        const otherMembers = await db
          .select({
            userId: chatMembers.userId,
            userName: users.name,
            userEmail: users.email,
            userRole: users.role,
            userProfileImage: users.profileImageUrl,
          })
          .from(chatMembers)
          .innerJoin(users, eq(chatMembers.userId, users.id))
          .where(
            and(
              eq(chatMembers.chatId, chat.chatId),
              eq(users.id, chatMembers.userId)
            )
          );

        const otherUser = otherMembers.find((m) => m.userId !== currentUser.id);

        // Count unread messages
        const userMember = await db
          .select()
          .from(chatMembers)
          .where(
            and(
              eq(chatMembers.chatId, chat.chatId),
              eq(chatMembers.userId, currentUser.id)
            )
          )
          .limit(1);

        let unreadCount = 0;
        if (userMember[0]?.lastReadAt) {
          const unreadMessages = await db
            .select()
            .from(messages)
            .where(
              and(
                eq(messages.chatId, chat.chatId),
                eq(messages.senderId, otherUser?.userId || 0)
              )
            );
          
          unreadCount = unreadMessages.filter(
            (msg) => new Date(msg.createdAt) > new Date(userMember[0].lastReadAt!)
          ).length;
        } else {
          // If never read, count all messages from others
          const allMessages = await db
            .select()
            .from(messages)
            .where(
              and(
                eq(messages.chatId, chat.chatId),
                eq(messages.senderId, otherUser?.userId || 0)
              )
            );
          unreadCount = allMessages.length;
        }

        return {
          id: chat.chatId,
          chatType: chat.chatType,
          name: chat.chatName,
          lastMessage: lastMessage?.content,
          lastMessageTime: lastMessage?.createdAt,
          unreadCount,
          otherUser: otherUser
            ? {
                id: otherUser.userId,
                name: otherUser.userName,
                email: otherUser.userEmail,
                role: otherUser.userRole,
                profileImageUrl: otherUser.userProfileImage,
              }
            : undefined,
        };
      })
    );

    return NextResponse.json({
      chats: chatsWithDetails.sort((a, b) => {
        const aTime = new Date(a.lastMessageTime || a.createdAt || 0);
        const bTime = new Date(b.lastMessageTime || b.createdAt || 0);
        return bTime.getTime() - aTime.getTime();
      }),
    });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Get current user from token
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, chatType = "direct", name } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if chat already exists between these users
    const existingChats = await db
      .select({ chatId: chatMembers.chatId })
      .from(chatMembers)
      .where(eq(chatMembers.userId, session.userId));

    const otherUserChats = await db
      .select({ chatId: chatMembers.chatId })
      .from(chatMembers)
      .where(eq(chatMembers.userId, userId));

    const commonChatIds = existingChats
      .filter((c1) => otherUserChats.some((c2) => c2.chatId === c1.chatId))
      .map((c) => c.chatId);

    if (commonChatIds.length > 0) {
      // Return existing chat
      const [existingChat] = await db
        .select()
        .from(chats)
        .where(eq(chats.id, commonChatIds[0]))
        .limit(1);

      return NextResponse.json({ chat: existingChat });
    }

    // Create new chat
    const now = new Date().toISOString();
    const [newChat] = await db
      .insert(chats)
      .values({
        chatType,
        name,
        createdBy: session.userId,
        createdAt: now,
      })
      .returning();

    // Add both users as members
    await db.insert(chatMembers).values([
      {
        chatId: newChat.id,
        userId: session.userId,
        joinedAt: now,
      },
      {
        chatId: newChat.id,
        userId,
        joinedAt: now,
      },
    ]);

    return NextResponse.json({ chat: newChat }, { status: 201 });
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    );
  }
}
