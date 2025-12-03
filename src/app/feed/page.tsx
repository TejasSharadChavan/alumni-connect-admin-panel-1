"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, MessageCircle, Send, Loader2, PlusCircle, Filter, ThumbsUp, Award, Lightbulb, Share2, Image as ImageIcon, X, ChevronLeft, ChevronRight, Hash, AtSign, MoreHorizontal, Flag, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EmojiPicker from "emoji-picker-react";

interface Post {
  id: number;
  userId: number;
  userName: string;
  userRole: string;
  content: string;
  category: string;
  imageUrls?: string[];
  likes: number;
  commentsCount: number;
  hasLiked: boolean;
  reactions?: {
    like: number;
    celebrate: number;
    support: number;
    insightful: number;
  };
  userReaction?: string | null;
  createdAt: string;
}

interface Comment {
  id: number;
  postId: number;
  userId: number;
  userName: string;
  userRole: string;
  content: string;
  likes: number;
  hasLiked: boolean;
  replies?: Comment[];
  createdAt: string;
}

const REACTIONS = [
  { type: "like", icon: ThumbsUp, label: "Like", color: "text-blue-600" },
  { type: "celebrate", icon: Award, label: "Celebrate", color: "text-yellow-600" },
  { type: "support", icon: Heart, label: "Support", color: "text-red-600" },
  { type: "insightful", icon: Lightbulb, label: "Insightful", color: "text-purple-600" },
];

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [postForm, setPostForm] = useState({
    content: "",
    category: "",
    images: [] as File[],
  });

  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

  useEffect(() => {
    fetchPosts();
  }, [filterCategory]);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const url = filterCategory === "all" 
        ? "/api/posts"
        : `/api/posts?category=${filterCategory}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + postForm.images.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    setPostForm({ ...postForm, images: [...postForm.images, ...files] });
  };

  const removeImage = (index: number) => {
    setPostForm({
      ...postForm,
      images: postForm.images.filter((_, i) => i !== index),
    });
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("Please log in to continue");
        return;
      }

      // Simulate image upload - in real app, upload to storage first
      const imageUrls = postForm.images.length > 0 
        ? [`https://picsum.photos/800/600?random=${Date.now()}`]
        : [];

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: postForm.content,
          category: postForm.category,
          imageUrls,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      const data = await response.json();
      setPosts([data.post, ...posts]);
      toast.success("Post created successfully!");
      setCreateDialogOpen(false);
      setPostForm({ content: "", category: "", images: [] });
    } catch (error) {
      console.error("Failed to create post:", error);
      toast.error("Failed to create post");
    }
  };

  const handleReaction = async (postId: number, reactionType: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("Please log in to continue");
        return;
      }

      const response = await fetch(`/api/posts/${postId}/react`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: reactionType }),
      });

      if (!response.ok) {
        throw new Error("Failed to react");
      }

      const data = await response.json();
      
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            userReaction: data.action === "added" ? reactionType : null,
            reactions: data.reactions || post.reactions,
          };
        }
        return post;
      }));
    } catch (error) {
      console.error("Failed to react:", error);
      toast.error("Failed to react");
    }
  };

  const handleViewComments = async (post: Post) => {
    setSelectedPost(post);
    setCommentsDialogOpen(true);

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch(`/api/posts/${post.id}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      toast.error("Failed to load comments");
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPost || !commentText.trim()) return;

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("Please log in to continue");
        return;
      }

      const response = await fetch(`/api/posts/${selectedPost.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          content: commentText,
          parentId: replyingTo?.id || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      const data = await response.json();
      setComments([...comments, data.comment]);
      setPosts(posts.map(post => 
        post.id === selectedPost.id 
          ? { ...post, commentsCount: post.commentsCount + 1 }
          : post
      ));
      setCommentText("");
      setReplyingTo(null);
      toast.success(replyingTo ? "Reply added!" : "Comment added!");
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast.error("Failed to add comment");
    }
  };

  const handleSharePost = (post: Post) => {
    setSelectedPost(post);
    setShareDialogOpen(true);
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/feed?post=${selectedPost?.id}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard!");
  };

  const openImageViewer = (images: string[], index: number) => {
    setSelectedImages(images);
    setSelectedImageIndex(index);
    setImageDialogOpen(true);
  };

  const handleEmojiClick = (emojiData: any) => {
    setPostForm({ ...postForm, content: postForm.content + emojiData.emoji });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      general: "bg-gray-500",
      career: "bg-blue-500",
      events: "bg-purple-500",
      academic: "bg-green-500",
      achievements: "bg-yellow-500",
      announcements: "bg-red-500",
    };
    return colors[category] || "bg-gray-500";
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      student: "text-blue-600",
      alumni: "text-purple-600",
      faculty: "text-green-600",
      admin: "text-red-600",
    };
    return colors[role] || "text-gray-600";
  };

  const getTotalReactions = (reactions?: Post['reactions']) => {
    if (!reactions) return 0;
    return Object.values(reactions).reduce((sum, count) => sum + count, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold">Community Feed</h1>
          <p className="text-muted-foreground">Connect and share with the community</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="shadow-lg">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
              <DialogDescription>Share something with the community</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Textarea
                    placeholder="What's on your mind? Use #hashtags and @mentions"
                    value={postForm.content}
                    onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                    rows={5}
                    required
                    className="resize-none"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute bottom-2 right-2"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    😊
                  </Button>
                  {showEmojiPicker && (
                    <div className="absolute bottom-12 right-0 z-50">
                      <EmojiPicker onEmojiClick={handleEmojiClick} />
                    </div>
                  )}
                </div>
              </div>

              {/* Image Preview */}
              {postForm.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {postForm.images.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3">
                <Select
                  value={postForm.category}
                  onValueChange={(value) => setPostForm({ ...postForm, category: value })}
                  required
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="career">Career</SelectItem>
                    <SelectItem value="events">Events</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="achievements">Achievements</SelectItem>
                    <SelectItem value="announcements">Announcements</SelectItem>
                  </SelectContent>
                </Select>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageSelect}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={postForm.images.length >= 5}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Add Images ({postForm.images.length}/5)
                </Button>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">Post</Button>
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Filter */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="career">Career</SelectItem>
                <SelectItem value="events">Events</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="achievements">Achievements</SelectItem>
                <SelectItem value="announcements">Announcements</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      {posts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Posts Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Be the first to share something with the community
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.userName}`} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                          {post.userName.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{post.userName}</h4>
                          <Badge variant="outline" className={getRoleColor(post.userRole)}>
                            {post.userRole}
                          </Badge>
                          <Badge className={getCategoryColor(post.category)}>
                            {post.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(post.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Flag className="h-4 w-4 mr-2" />
                          Report Post
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Post
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Post
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{post.content}</p>
                  
                  {/* Image Carousel */}
                  {post.imageUrls && post.imageUrls.length > 0 && (
                    <div className="relative rounded-lg overflow-hidden bg-muted">
                      <img
                        src={post.imageUrls[0]}
                        alt="Post image"
                        className="w-full h-96 object-cover cursor-pointer"
                        onClick={() => openImageViewer(post.imageUrls!, 0)}
                      />
                      {post.imageUrls.length > 1 && (
                        <Badge className="absolute top-4 right-4 bg-black/60">
                          +{post.imageUrls.length - 1}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {/* Reactions Summary */}
                  {post.reactions && getTotalReactions(post.reactions) > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <div className="flex -space-x-1">
                        {REACTIONS.filter(r => (post.reactions as any)[r.type] > 0).map(reaction => {
                          const Icon = reaction.icon;
                          return (
                            <div key={reaction.type} className={`w-5 h-5 rounded-full bg-background border-2 flex items-center justify-center ${reaction.color}`}>
                              <Icon className="h-3 w-3" />
                            </div>
                          );
                        })}
                      </div>
                      <span>{getTotalReactions(post.reactions)} reactions</span>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={post.userReaction ? "text-primary" : ""}
                        >
                          {post.userReaction ? (
                            <>
                              {REACTIONS.find(r => r.type === post.userReaction)?.icon && 
                                React.createElement(REACTIONS.find(r => r.type === post.userReaction)!.icon, {
                                  className: `h-4 w-4 mr-1 fill-current`
                                })
                              }
                              {REACTIONS.find(r => r.type === post.userReaction)?.label}
                            </>
                          ) : (
                            <>
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              React
                            </>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {REACTIONS.map((reaction) => {
                          const Icon = reaction.icon;
                          return (
                            <DropdownMenuItem
                              key={reaction.type}
                              onClick={() => handleReaction(post.id, reaction.type)}
                            >
                              <Icon className={`h-4 w-4 mr-2 ${reaction.color}`} />
                              {reaction.label}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewComments(post)}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {post.commentsCount}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSharePost(post)}
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Comments Dialog */}
      <Dialog open={commentsDialogOpen} onOpenChange={setCommentsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
            <DialogDescription>
              {selectedPost?.commentsCount} {selectedPost?.commentsCount === 1 ? "comment" : "comments"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userName}`} />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-green-400 to-blue-500 text-white">
                      {comment.userName.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{comment.userName}</span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {comment.userRole}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{comment.content}</p>
                    <div className="flex items-center gap-3">
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        <Heart className="h-3 w-3 mr-1" />
                        Like
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs"
                        onClick={() => setReplyingTo(comment)}
                      >
                        Reply
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {replyingTo && (
            <div className="px-4 py-2 bg-muted/50 rounded-lg flex items-center justify-between">
              <span className="text-sm">
                Replying to <strong>{replyingTo.userName}</strong>
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setReplyingTo(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <form onSubmit={handleAddComment} className="flex gap-2 pt-4 border-t">
            <Input
              placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Post</DialogTitle>
            <DialogDescription>Share this post with others</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button className="w-full" onClick={copyShareLink}>
              Copy Link
            </Button>
            <div className="text-sm text-muted-foreground text-center">
              Share on social media coming soon!
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Viewer Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-4xl">
          <div className="relative">
            <img
              src={selectedImages[selectedImageIndex]}
              alt={`Image ${selectedImageIndex + 1}`}
              className="w-full h-auto max-h-[70vh] object-contain"
            />
            {selectedImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                  disabled={selectedImageIndex === 0}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={() => setSelectedImageIndex(Math.min(selectedImages.length - 1, selectedImageIndex + 1))}
                  disabled={selectedImageIndex === selectedImages.length - 1}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {selectedImageIndex + 1} / {selectedImages.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}