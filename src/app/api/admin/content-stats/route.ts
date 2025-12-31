import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, posts, jobs, events } from "@/db/schema";
import { count, desc, eq } from "drizzle-orm";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get content data from database
    const [allPosts, allJobs, allEvents] = await Promise.all([
      db
        .select({
          id: posts.id,
          title: posts.title,
          content: posts.content,
          authorId: posts.authorId,
          status: posts.status,
          createdAt: posts.createdAt,
        })
        .from(posts)
        .orderBy(desc(posts.createdAt))
        .limit(50),

      db
        .select({
          id: jobs.id,
          title: jobs.title,
          description: jobs.description,
          companyName: jobs.companyName,
          status: jobs.status,
          createdAt: jobs.createdAt,
        })
        .from(jobs)
        .orderBy(desc(jobs.createdAt))
        .limit(50),

      db
        .select({
          id: events.id,
          title: events.title,
          description: events.description,
          organizerId: events.organizerId,
          status: events.status,
          createdAt: events.createdAt,
        })
        .from(events)
        .orderBy(desc(events.createdAt))
        .limit(50),
    ]);

    // Get user names for content items
    const userIds = [
      ...new Set(
        [
          ...allPosts.map((p) => p.authorId),
          ...allEvents.map((e) => e.organizerId),
        ].filter(Boolean)
      ),
    ];

    const usersMap = new Map();
    if (userIds.length > 0) {
      const usersData = await db
        .select({
          id: users.id,
          name: users.name,
        })
        .from(users)
        .where(eq(users.id, userIds[0])); // Simplified query

      usersData.forEach((user) => {
        usersMap.set(user.id, user.name);
      });
    }

    // Build content items array
    const contentItems = [];

    // Add posts
    allPosts.forEach((post) => {
      contentItems.push({
        id: post.id,
        type: "post" as const,
        title: post.title || "Untitled Post",
        author: usersMap.get(post.authorId) || "Unknown User",
        status: post.status || "pending",
        createdAt: post.createdAt,
        content: (post.content || "").substring(0, 200) + "...",
      });
    });

    // Add jobs
    allJobs.forEach((job) => {
      contentItems.push({
        id: job.id,
        type: "job" as const,
        title: job.title || "Untitled Job",
        author: job.companyName || "Unknown Company",
        status: job.status || "pending",
        createdAt: job.createdAt,
        content: (job.description || "").substring(0, 200) + "...",
      });
    });

    // Add events
    allEvents.forEach((event) => {
      contentItems.push({
        id: event.id,
        type: "event" as const,
        title: event.title || "Untitled Event",
        author: "Event Organizer",
        status: event.status || "pending",
        createdAt: event.createdAt,
        content: (event.description || "").substring(0, 200) + "...",
      });
    });

    // Sort by creation date
    contentItems.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Calculate statistics
    const stats = {
      total: contentItems.length,
      pending: contentItems.filter((item) => item.status === "pending").length,
      approved: contentItems.filter((item) => item.status === "approved")
        .length,
      rejected: contentItems.filter((item) => item.status === "rejected")
        .length,
    };

    const contentStats = {
      content: contentItems,
      stats,
    };

    return NextResponse.json(contentStats);
  } catch (error) {
    console.error("Error fetching content stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch content statistics" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { contentId, contentType, action } = await request.json();

    if (!contentId || !contentType || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newStatus = action === "approve" ? "approved" : "rejected";

    // Update content status based on type
    switch (contentType) {
      case "post":
        await db
          .update(posts)
          .set({
            status: newStatus,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(posts.id, contentId));
        break;

      case "job":
        await db
          .update(jobs)
          .set({
            status: newStatus,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(jobs.id, contentId));
        break;

      case "event":
        await db
          .update(events)
          .set({
            status: newStatus,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(events.id, contentId));
        break;

      default:
        return NextResponse.json(
          { error: "Invalid content type" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Content ${action}d successfully`,
    });
  } catch (error) {
    console.error("Error updating content status:", error);
    return NextResponse.json(
      { error: "Failed to update content status" },
      { status: 500 }
    );
  }
}
