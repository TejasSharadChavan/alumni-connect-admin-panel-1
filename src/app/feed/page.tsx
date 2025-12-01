"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, MessageCircle, Send, Loader2, PlusCircle, Filter } from "lucide-react";
import { toast } from "sonner";

interface Post {
  id: number;
  userId: number;
  userName: string;
  userRole: string;
  content: string;
  category: string;
  likes: number;
  commentsCount: number;
  hasLiked: boolean;
  createdAt: string;
}

interface Comment {
  id: number;
  postId: number;
  userId: number;
  userName: string;
  content: string;
  createdAt: string;
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const [postForm, setPostForm] = useState({
    content: "",
    category: "",
  });

  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    fetchPosts();
  }, [filterCategory]);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
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

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("bearer_token");
      if (!token) {
        toast.error("Please log in to continue");
        return;
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: postForm.content,
          category: postForm.category,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      const data = await response.json();
      setPosts([data.post, ...posts]);
      toast.success("Post created successfully!");
      setCreateDialogOpen(false);
      setPostForm({ content: "", category: "" });
    } catch (error) {
      console.error("Failed to create post:", error);
      toast.error("Failed to create post");
    }
  };

  const handleLikePost = async (postId: number) => {
    try {
      const token = localStorage.getItem("bearer_token");
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
        body: JSON.stringify({ type: "like" }),
      });

      if (!response.ok) {
        throw new Error("Failed to like post");
      }

      const data = await response.json();
      
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            hasLiked: data.action === "added",
            likes: data.action === "added" ? post.likes + 1 : post.likes - 1,
          };
        }
        return post;
      }));
    } catch (error) {
      console.error("Failed to like post:", error);
      toast.error("Failed to like post");
    }
  };

  const handleViewComments = async (post: Post) => {
    setSelectedPost(post);
    setCommentsDialogOpen(true);

    try {
      const token = localStorage.getItem("bearer_token");
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
      const token = localStorage.getItem("bearer_token");
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
        body: JSON.stringify({ content: commentText }),
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
      toast.success("Comment added!");
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast.error("Failed to add comment");
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Community Feed</h1>
          <p className="text-muted-foreground">Connect and share with the community</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
              <DialogDescription>Share something with the community</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="What's on your mind?"
                  value={postForm.content}
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                  rows={5}
                  required
                />
              </div>
              <div className="space-y-2">
                <Select
                  value={postForm.category}
                  onValueChange={(value) => setPostForm({ ...postForm, category: value })}
                  required
                >
                  <SelectTrigger>
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
      </div>

      {/* Filter */}
      <Card>
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
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback>
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
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                
                {/* Actions */}
                <div className="flex items-center gap-6 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLikePost(post.id)}
                    className={post.hasLiked ? "text-red-500" : ""}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${post.hasLiked ? "fill-current" : ""}`} />
                    {post.likes} {post.likes === 1 ? "Like" : "Likes"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewComments(post)}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {post.commentsCount} {post.commentsCount === 1 ? "Comment" : "Comments"}
                  </Button>
                </div>
              </CardContent>
            </Card>
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
                <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {comment.userName.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{comment.userName}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2 pt-4 border-t">
            <Input
              placeholder="Write a comment..."
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
    </div>
  );
}
