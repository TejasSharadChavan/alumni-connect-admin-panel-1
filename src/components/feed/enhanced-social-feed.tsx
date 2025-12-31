"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MessageCircle,
  Share2,
  ThumbsUp,
  Award,
  Send,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    headline: string;
  };
  content: string;
  images?: string[];
  tags: string[];
  reactions: {
    like: number;
    heart: number;
    celebrate: number;
  };
  commentsCount: number;
  sharesCount: number;
  timestamp: Date;
}

interface EnhancedSocialFeedProps {
  posts: Post[];
  onCreatePost: (content: string, images: string[]) => Promise<void>;
  onReact: (postId: string, type: string) => Promise<void>;
  onComment: (postId: string, content: string) => Promise<void>;
  onShare: (postId: string) => Promise<void>;
}

export function EnhancedSocialFeed({
  posts,
  onCreatePost,
  onReact,
  onComment,
  onShare,
}: EnhancedSocialFeedProps) {
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [imagePreviewIndex, setImagePreviewIndex] = useState<number | null>(
    null
  );
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState("");

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      toast.error("Please write something");
      return;
    }

    try {
      await onCreatePost(newPostContent, selectedImages);
      setNewPostContent("");
      setSelectedImages([]);
      toast.success("Post created successfully!");
    } catch (error) {
      toast.error("Failed to create post");
    }
  };

  const handleReaction = async (postId: string, type: string) => {
    try {
      await onReact(postId, type);
    } catch (error) {
      toast.error("Failed to react");
    }
  };

  const handleComment = async (postId: string) => {
    if (!commentContent.trim()) return;

    try {
      await onComment(postId, commentContent);
      setCommentContent("");
      setActiveCommentId(null);
      toast.success("Comment added!");
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  const reactionIcons = {
    like: ThumbsUp,
    heart: Heart,
    celebrate: Award,
  };

  return (
    <div className="space-y-6">
      {/* Create Post */}
      <Card className="border-2">
        <CardContent className="pt-6 space-y-4">
          <Textarea
            placeholder="What's on your mind? Share your achievements, questions, or projects..."
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            className="min-h-24"
          />

          {selectedImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {selectedImages.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={img}
                    alt={`Preview ${idx}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() =>
                      setSelectedImages(
                        selectedImages.filter((_, i) => i !== idx)
                      )
                    }
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center">
            <Button variant="ghost" size="sm">
              <ImageIcon className="h-4 w-4 mr-2" />
              Add Images
            </Button>
            <Button
              onClick={handleCreatePost}
              disabled={!newPostContent.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              Post
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        <AnimatePresence>
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold">{post.author.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {post.author.headline}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.timestamp).toLocaleDateString()} at{" "}
                        {new Date(post.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="whitespace-pre-wrap">{post.content}</p>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Image Carousel */}
                  {post.images && post.images.length > 0 && (
                    <div className="relative">
                      {post.images.length === 1 ? (
                        <img
                          src={post.images[0]}
                          alt="Post image"
                          className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setImagePreviewIndex(0)}
                        />
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {post.images.slice(0, 4).map((img, idx) => (
                            <div key={idx} className="relative">
                              <img
                                src={img}
                                alt={`Post image ${idx + 1}`}
                                className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setImagePreviewIndex(idx)}
                              />
                              {idx === 3 && post.images!.length > 4 && (
                                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                                  +{post.images!.length - 4}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reactions Summary */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-b py-2">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        {post.reactions.like}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {post.reactions.heart}
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        {post.reactions.celebrate}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>{post.commentsCount} comments</span>
                      <span>{post.sharesCount} shares</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReaction(post.id, "like")}
                      className="flex-1"
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Like
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReaction(post.id, "heart")}
                      className="flex-1"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Love
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReaction(post.id, "celebrate")}
                      className="flex-1"
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Celebrate
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setActiveCommentId(
                          activeCommentId === post.id ? null : post.id
                        )
                      }
                      className="flex-1"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Comment
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onShare(post.id)}
                      className="flex-1"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>

                  {/* Comment Input */}
                  <AnimatePresence>
                    {activeCommentId === post.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex gap-2 pt-2 border-t"
                      >
                        <Textarea
                          placeholder="Write a comment..."
                          value={commentContent}
                          onChange={(e) => setCommentContent(e.target.value)}
                          className="min-h-20"
                        />
                        <Button
                          onClick={() => handleComment(post.id)}
                          disabled={!commentContent.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
