import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { messages, chatMembers, users, sessions } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const chatId = parseInt(id);

    // Verify user is a member of this chat
    const [membership] = await db
      .select()
      .from(chatMembers)
      .where(
        and(
          eq(chatMembers.chatId, chatId),
          eq(chatMembers.userId, session.userId)
        )
      )
      .limit(1);

    if (!membership) {
      return NextResponse.json(
        { error: "Not a member of this chat" },
        { status: 403 }
      );
    }

    // Get messages
    const chatMessages = await db
      .select({
        id: messages.id,
        content: messages.content,
        senderId: messages.senderId,
        senderName: users.name,
        messageType: messages.messageType,
        fileUrl: messages.fileUrl,
        createdAt: messages.createdAt,
        editedAt: messages.editedAt,
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.chatId, chatId))
      .orderBy(messages.createdAt);

    // Update last read time
    await db
      .update(chatMembers)
      .set({ lastReadAt: new Date().toISOString() })
      .where(
        and(
          eq(chatMembers.chatId, chatId),
          eq(chatMembers.userId, session.userId)
        )
      );

    return NextResponse.json({ messages: chatMessages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const chatId = parseInt(id);

    // Verify user is a member of this chat
    const [membership] = await db
      .select()
      .from(chatMembers)
      .where(
        and(
          eq(chatMembers.chatId, chatId),
          eq(chatMembers.userId, session.userId)
        )
      )
      .limit(1);

    if (!membership) {
      return NextResponse.json(
        { error: "Not a member of this chat" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { content, messageType = "text", fileUrl } = body;

    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    // Create message
    const [newMessage] = await db
      .insert(messages)
      .values({
        chatId,
        senderId: session.userId,
        content: content.trim(),
        messageType,
        fileUrl,
        createdAt: new Date().toISOString(),
      })
      .returning();

    // Get sender info
    const [sender] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    return NextResponse.json(
      {
        message: {
          ...newMessage,
          senderName: sender.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}