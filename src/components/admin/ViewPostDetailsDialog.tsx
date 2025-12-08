"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ThumbsUp,
  PartyPopper,
  Heart,
  Lightbulb,
  MessageSquare,
} from "lucide-react";

interface Reaction {
  id: number;
  userId: number;
  userName: string;
  reactionType: string;
  createdAt: string;
}

interface Comment {
  id: number;
  userId: number;
  userName: string;
  content: string;
  createdAt: string;
}

interface ViewPostDetailsDialogProps {
  postId: number | null;
  open: boolean;
  onClose: () => void;
}

export function ViewPostDetailsDialog({
  postId,
  open,
  onClose,
}: ViewPostDetailsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (open && postId) {
      fetchPostDetails();
    }
  }, [open, postId]);

  const fetchPostDetails = async () => {
    if (!postId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");

      // Fetch reactions
      const reactionsResponse = await fetch(`/api/posts/${postId}/reactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (reactionsResponse.ok) {
        const reactionsData = await reactionsResponse.json();
        setReactions(reactionsData.reactions || []);
      }

      // Fetch comments
      const commentsResponse = await fetch(`/api/posts/${postId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json();
        setComments(commentsData.comments || []);
      }
    } catch (error) {
      console.error("Error fetching post details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getReactionIcon = (type: string) => {
    switch (type) {
      case "like":
        return <ThumbsUp className="h-4 w-4 text-blue-600" />;
      case "celebrate":
        return <PartyPopper className="h-4 w-4 text-yellow-600" />;
      case "support":
        return <Heart className="h-4 w-4 text-red-600" />;
      case "insightful":
        return <Lightbulb className="h-4 w-4 text-purple-600" />;
      default:
        return null;
    }
  };

  const groupedReactions = reactions.reduce(
    (acc, reaction) => {
      if (!acc[reaction.reactionType]) {
        acc[reaction.reactionType] = [];
      }
      acc[reaction.reactionType].push(reaction);
      return acc;
    },
    {} as Record<string, Reaction[]>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Post Engagement Details</DialogTitle>
          <DialogDescription>
            View who reacted and commented on this post
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-6">
              {/* Reactions Section */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <ThumbsUp className="h-5 w-5" />
                  Reactions ({reactions.length})
                </h3>
                {reactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No reactions yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(groupedReactions).map(
                      ([type, typeReactions]) => (
                        <div key={type} className="space-y-2">
                          <div className="flex items-center gap-2">
                            {getReactionIcon(type)}
                            <span className="font-medium capitalize">
                              {type}
                            </span>
                            <Badge variant="secondary">
                              {typeReactions.length}
                            </Badge>
                          </div>
                          <div className="ml-6 space-y-1">
                            {typeReactions.map((reaction) => (
                              <div
                                key={reaction.id}
                                className="text-sm flex items-center justify-between py-1"
                              >
                                <span>{reaction.userName}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(
                                    reaction.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              <Separator />

              {/* Comments Section */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Comments ({comments.length})
                </h3>
                {comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No comments yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="border rounded-lg p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">
                            {comment.userName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
