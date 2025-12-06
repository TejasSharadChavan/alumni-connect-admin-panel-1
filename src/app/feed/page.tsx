"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Heart,
  MessageCircle,
  Send,
  Loader2,
  PlusCircle,
  Filter,
  ThumbsUp,
  Award,
  Lightbulb,
  Share2,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Hash,
  AtSign,
  MoreHorizontal,
  Flag,
  Trash2,
  Edit,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
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
  {
    type: "celebrate",
    icon: Award,
    label: "Celebrate",
    color: "text-yellow-600",
  },
  { type: "support", icon: Heart, label: "Support", color: "text-red-600" },
  {
    type: "insightful",
    icon: Lightbulb,
    label: "Insightful",
    color: "text-purple-600",
  },
];

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
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

  // Loading states to prevent duplicate submissions
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [postForm, setPostForm] = useState({
    content: "",
    category: "",
    images: [] as File[],
  });

  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

  // Ads and Events data - Updated with 20+ real opportunities
  const techEvents = [
    // Hackathons
    {
      id: 1,
      title: "MLH Hackathons 2024-25",
      description:
        "Join 200+ student hackathons worldwide. Win prizes & network!",
      date: "Year-round",
      image:
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=200&fit=crop",
      link: "https://mlh.io/seasons/2025/events",
      type: "hackathon",
    },
    {
      id: 2,
      title: "Devpost Hackathons",
      description:
        "Find virtual & in-person hackathons. $1M+ in prizes monthly",
      date: "Ongoing",
      image:
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=200&fit=crop",
      link: "https://devpost.com/hackathons",
      type: "hackathon",
    },
    {
      id: 3,
      title: "HackerEarth Challenges",
      description: "Compete in coding challenges. Win cash prizes & jobs",
      date: "Weekly",
      image:
        "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=200&fit=crop",
      link: "https://www.hackerearth.com/challenges/",
      type: "hackathon",
    },

    // Internships & Programs
    {
      id: 4,
      title: "Google Summer of Code 2025",
      description: "Contribute to open source. Get stipend & mentorship",
      date: "Applications: Feb 2025",
      image:
        "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&h=200&fit=crop",
      link: "https://summerofcode.withgoogle.com/",
      type: "program",
    },
    {
      id: 5,
      title: "MLH Fellowship",
      description: "12-week remote internship. Work on real projects",
      date: "Applications Open",
      image:
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=200&fit=crop",
      link: "https://fellowship.mlh.io/",
      type: "program",
    },
    {
      id: 6,
      title: "Outreachy Internships",
      description: "Paid remote internships in open source. $7,000 stipend",
      date: "Next: Jan 2025",
      image:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop",
      link: "https://www.outreachy.org/",
      type: "program",
    },
    {
      id: 7,
      title: "GitHub Campus Experts",
      description: "Build tech communities. Get GitHub swag & training",
      date: "Rolling Applications",
      image:
        "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=400&h=200&fit=crop",
      link: "https://education.github.com/experts",
      type: "program",
    },

    // Conferences & Events
    {
      id: 8,
      title: "AWS re:Invent 2024",
      description: "Largest cloud computing conference. 50K+ attendees",
      date: "Dec 2-6, 2024",
      image:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop",
      link: "https://reinvent.awsevents.com/",
      type: "conference",
    },
    {
      id: 9,
      title: "Google I/O Extended",
      description: "Community-led events worldwide. Learn latest tech",
      date: "Throughout 2024",
      image:
        "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=200&fit=crop",
      link: "https://io.google/",
      type: "conference",
    },
    {
      id: 10,
      title: "Microsoft Build",
      description: "Developer conference. AI, Cloud, and more",
      date: "May 2025",
      image:
        "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&h=200&fit=crop",
      link: "https://build.microsoft.com/",
      type: "conference",
    },

    // Learning & Certifications
    {
      id: 11,
      title: "AWS Free Tier",
      description: "Learn cloud computing. 12 months free access",
      date: "Always Available",
      image:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=200&fit=crop",
      link: "https://aws.amazon.com/free/",
      type: "learning",
    },
    {
      id: 12,
      title: "Microsoft Learn",
      description: "Free courses & certifications. Azure, AI, Power Platform",
      date: "Self-paced",
      image:
        "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=200&fit=crop",
      link: "https://learn.microsoft.com/",
      type: "learning",
    },
    {
      id: 13,
      title: "Google Cloud Skills Boost",
      description: "Hands-on labs & certifications. Free credits available",
      date: "Ongoing",
      image:
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=200&fit=crop",
      link: "https://www.cloudskillsboost.google/",
      type: "learning",
    },
    {
      id: 14,
      title: "freeCodeCamp",
      description: "Learn to code for free. 3,000+ hours of content",
      date: "Self-paced",
      image:
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop",
      link: "https://www.freecodecamp.org/",
      type: "learning",
    },

    // Competitions
    {
      id: 15,
      title: "Kaggle Competitions",
      description: "Data science competitions. Win prizes & build portfolio",
      date: "Ongoing",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop",
      link: "https://www.kaggle.com/competitions",
      type: "competition",
    },
    {
      id: 16,
      title: "Google Code Jam",
      description: "Algorithmic coding competition. Global leaderboard",
      date: "Annual - Q1",
      image:
        "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=200&fit=crop",
      link: "https://codingcompetitions.withgoogle.com/codejam",
      type: "competition",
    },
    {
      id: 17,
      title: "Meta Hacker Cup",
      description: "Annual programming competition by Meta",
      date: "Aug-Nov 2024",
      image:
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=200&fit=crop",
      link: "https://www.facebook.com/codingcompetitions/hacker-cup",
      type: "competition",
    },

    // Scholarships & Resources
    {
      id: 18,
      title: "GitHub Education Pack",
      description: "Free developer tools worth $200K+ for students",
      date: "Always Available",
      image:
        "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=200&fit=crop",
      link: "https://education.github.com/pack",
      type: "scholarship",
    },
    {
      id: 19,
      title: "Google Developer Student Clubs",
      description: "Join/start a club. Get resources & mentorship",
      date: "Applications Open",
      image:
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=200&fit=crop",
      link: "https://developers.google.com/community/gdsc",
      type: "program",
    },
    {
      id: 20,
      title: "AWS Educate",
      description: "Free cloud training & credits for students",
      date: "Ongoing",
      image:
        "https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=400&h=200&fit=crop",
      link: "https://aws.amazon.com/education/awseducate/",
      type: "learning",
    },
  ];

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsAuthenticated(!!token);
    if (token) {
      fetchCurrentUser();
    }
    fetchPosts();
  }, [filterCategory]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUserId(data.user.id);
      }
    } catch (error) {
      console.error("Failed to fetch current user:", error);
    }
  };

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("auth_token");

      const url =
        filterCategory === "all"
          ? "/api/posts"
          : `/api/posts?category=${filterCategory}`;

      console.log("Fetching posts with filter:", filterCategory);
      console.log("API URL:", url);

      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, { headers });

      if (response.ok) {
        const data = await response.json();
        console.log(
          `Received ${data.posts?.length || 0} posts for category: ${filterCategory}`
        );
        console.log(
          "Posts categories:",
          data.posts?.map((p: any) => p.category)
        );
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

  const requireAuth = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to continue");
      return false;
    }
    return true;
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth()) return;

    // Prevent duplicate submissions
    if (isSubmittingPost) {
      console.log(
        "Post submission already in progress, ignoring duplicate click"
      );
      return;
    }

    setIsSubmittingPost(true);

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("Please log in to continue");
        setIsSubmittingPost(false);
        return;
      }

      const isEditing = !!selectedPost;

      console.log(isEditing ? "Editing post:" : "Creating post:", {
        content: postForm.content,
        category: postForm.category,
        hasImages: postForm.images.length > 0,
      });

      // Convert images to base64 data URLs
      const imageUrls: string[] = [];
      for (const file of postForm.images) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        imageUrls.push(base64);
      }

      // If editing and no new images, keep existing images
      const finalImageUrls =
        imageUrls.length > 0
          ? imageUrls
          : isEditing && selectedPost.imageUrls
            ? selectedPost.imageUrls
            : [];

      const requestBody = {
        content: postForm.content,
        category: postForm.category,
        imageUrls: finalImageUrls,
      };

      console.log("Request body:", requestBody);

      const url = isEditing ? `/api/posts/${selectedPost.id}` : "/api/posts";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Post response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Post error:", errorData);
        toast.error(
          errorData.error || `Failed to ${isEditing ? "update" : "create"} post`
        );
        return;
      }

      const data = await response.json();
      console.log("Post response data:", data);

      if (isEditing) {
        // Update existing post in list
        setPosts(posts.map((p) => (p.id === selectedPost.id ? data.post : p)));
        toast.success("Post updated successfully!");
      } else {
        // Add new post to list
        setPosts([data.post, ...posts]);
        toast.success("Post created successfully!");
      }

      setCreateDialogOpen(false);
      setPostForm({ content: "", category: "", images: [] });
      setSelectedPost(null);
    } catch (error) {
      console.error("Failed to save post:", error);
      toast.error("Failed to save post: " + (error as Error).message);
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleReaction = async (postId: number, reactionType: string) => {
    if (!requireAuth()) return;

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("Please log in to continue");
        return;
      }

      console.log("Sending reaction:", { postId, reactionType });

      const response = await fetch(`/api/posts/${postId}/react`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reactionType: reactionType }),
      });

      console.log("Reaction response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Reaction error:", errorData);
        toast.error(errorData.error || "Failed to react");
        return;
      }

      const data = await response.json();
      console.log("Reaction response data:", data);

      setPosts(
        posts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              userReaction: data.action === "added" ? reactionType : null,
              reactions: data.reactions || post.reactions,
            };
          }
          return post;
        })
      );

      toast.success("Reaction added!");
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
    if (!requireAuth()) return;

    if (!selectedPost || !commentText.trim()) return;

    // Prevent duplicate submissions
    if (isSubmittingComment) {
      console.log(
        "Comment submission already in progress, ignoring duplicate click"
      );
      return;
    }

    setIsSubmittingComment(true);

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("Please log in to continue");
        setIsSubmittingComment(false);
        return;
      }

      console.log("Sending comment:", {
        postId: selectedPost.id,
        content: commentText,
      });

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

      console.log("Comment response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Comment error:", errorData);
        toast.error(errorData.error || "Failed to add comment");
        return;
      }

      const data = await response.json();
      console.log("Comment response data:", data);
      setComments([...comments, data.comment]);
      setPosts(
        posts.map((post) =>
          post.id === selectedPost.id
            ? { ...post, commentsCount: post.commentsCount + 1 }
            : post
        )
      );
      setCommentText("");
      setReplyingTo(null);
      toast.success(replyingTo ? "Reply added!" : "Comment added!");
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmittingComment(false);
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

  const handleDeletePost = async (postId: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("Please log in to continue");
        return;
      }

      console.log("Deleting post:", postId);

      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Delete response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Delete error:", errorData);
        toast.error(errorData.error || "Failed to delete post");
        return;
      }

      // Remove post from UI
      setPosts(posts.filter((p) => p.id !== postId));
      toast.success("Post deleted successfully!");
    } catch (error) {
      console.error("Failed to delete post:", error);
      toast.error("Failed to delete post");
    }
  };

  const handleEditPost = (post: Post) => {
    setPostForm({
      content: post.content,
      category: post.category,
      images: [],
    });
    setSelectedPost(post);
    setCreateDialogOpen(true);
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

  const getTotalReactions = (reactions?: Post["reactions"]) => {
    if (!reactions) return 0;
    return Object.values(reactions).reduce((sum, count) => sum + count, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Navigation Bar */}
        <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Alumni Connect</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/feed"
                className="text-sm hover:text-primary transition-colors font-medium"
              >
                Feed
              </Link>
              <Link
                href="/jobs"
                className="text-sm hover:text-primary transition-colors"
              >
                Jobs
              </Link>
              <Link
                href="/events"
                className="text-sm hover:text-primary transition-colors"
              >
                Events
              </Link>
              <Link
                href="/rankings"
                className="text-sm hover:text-primary transition-colors"
              >
                Rankings
              </Link>
              <Button asChild variant="outline" size="sm">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Register</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Back Button */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Community Feed</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6 pb-20">
          {/* Left Sidebar - Filters */}
          <div className="col-span-12 lg:col-span-3">
            <div
              className="sticky top-24 space-y-4 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#cbd5e0 transparent",
              }}
            >
              <Card>
                <CardHeader>
                  <h3 className="font-semibold flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filter Posts
                  </h3>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={filterCategory}
                    onValueChange={setFilterCategory}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="all" />
                      <Label htmlFor="all" className="cursor-pointer">
                        All Posts
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="general" id="general" />
                      <Label htmlFor="general" className="cursor-pointer">
                        General
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="career" id="career" />
                      <Label htmlFor="career" className="cursor-pointer">
                        Career
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="events" id="events" />
                      <Label htmlFor="events" className="cursor-pointer">
                        Events
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="academic" id="academic" />
                      <Label htmlFor="academic" className="cursor-pointer">
                        Academic
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="achievements" id="achievements" />
                      <Label htmlFor="achievements" className="cursor-pointer">
                        Achievements
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="announcements"
                        id="announcements"
                      />
                      <Label htmlFor="announcements" className="cursor-pointer">
                        Announcements
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Center - Feed */}
          <div className="col-span-12 lg:col-span-6 space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-between items-center"
            >
              <div>
                <h1 className="text-3xl font-bold">Community Feed</h1>
                <p className="text-muted-foreground">
                  Connect and share with the community
                </p>
              </div>
              {isAuthenticated && (
                <Dialog
                  open={createDialogOpen}
                  onOpenChange={setCreateDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button size="lg" className="shadow-lg">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Post
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {selectedPost ? "Edit Post" : "Create New Post"}
                      </DialogTitle>
                      <DialogDescription>
                        {selectedPost
                          ? "Update your post"
                          : "Share something with the community"}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreatePost} className="space-y-4">
                      <div className="space-y-2">
                        <div className="relative">
                          <Textarea
                            placeholder="What's on your mind? Use #hashtags and @mentions"
                            value={postForm.content}
                            onChange={(e) =>
                              setPostForm({
                                ...postForm,
                                content: e.target.value,
                              })
                            }
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
                          onValueChange={(value) =>
                            setPostForm({ ...postForm, category: value })
                          }
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
                            <SelectItem value="achievements">
                              Achievements
                            </SelectItem>
                            <SelectItem value="announcements">
                              Announcements
                            </SelectItem>
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
                        <Button
                          type="submit"
                          className="flex-1"
                          disabled={isSubmittingPost}
                        >
                          {isSubmittingPost ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              {selectedPost ? "Updating..." : "Posting..."}
                            </>
                          ) : selectedPost ? (
                            "Update"
                          ) : (
                            "Post"
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCreateDialogOpen(false)}
                          disabled={isSubmittingPost}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </motion.div>

            {/* Posts Feed */}
            {posts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Posts Yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {isAuthenticated
                      ? "Be the first to share something with the community"
                      : "Sign in to create posts and engage with the community"}
                  </p>
                  {isAuthenticated ? (
                    <Button
                      onClick={() => {
                        setSelectedPost(null);
                        setPostForm({ content: "", category: "", images: [] });
                        setCreateDialogOpen(true);
                      }}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Post
                    </Button>
                  ) : (
                    <Button asChild>
                      <Link href="/login">Sign In</Link>
                    </Button>
                  )}
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
                              <AvatarImage
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.userName}`}
                              />
                              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                                {post.userName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">
                                  {post.userName}
                                </h4>
                                <Badge
                                  variant="outline"
                                  className={getRoleColor(post.userRole)}
                                >
                                  {post.userRole}
                                </Badge>
                                <Badge
                                  className={getCategoryColor(post.category)}
                                >
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
                              {post.userId === currentUserId ? (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleEditPost(post)}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Post
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDeletePost(post.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Post
                                  </DropdownMenuItem>
                                </>
                              ) : (
                                <DropdownMenuItem>
                                  <Flag className="h-4 w-4 mr-2" />
                                  Report Post
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {post.content}
                        </p>

                        {/* Image Carousel */}
                        {post.imageUrls && post.imageUrls.length > 0 && (
                          <div className="relative rounded-lg overflow-hidden bg-muted">
                            <img
                              src={post.imageUrls[0]}
                              alt="Post image"
                              className="w-full h-96 object-cover cursor-pointer"
                              onClick={() =>
                                openImageViewer(post.imageUrls!, 0)
                              }
                            />
                            {post.imageUrls.length > 1 && (
                              <Badge className="absolute top-4 right-4 bg-black/60">
                                +{post.imageUrls.length - 1}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Reactions Summary */}
                        {post.reactions &&
                          getTotalReactions(post.reactions) > 0 && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <div className="flex -space-x-1">
                                {REACTIONS.filter(
                                  (r) => (post.reactions as any)[r.type] > 0
                                ).map((reaction) => {
                                  const Icon = reaction.icon;
                                  return (
                                    <div
                                      key={reaction.type}
                                      className={`w-5 h-5 rounded-full bg-background border-2 flex items-center justify-center ${reaction.color}`}
                                    >
                                      <Icon className="h-3 w-3" />
                                    </div>
                                  );
                                })}
                              </div>
                              <span>
                                {getTotalReactions(post.reactions)} reactions
                              </span>
                            </div>
                          )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={
                                  post.userReaction ? "text-primary" : ""
                                }
                              >
                                {post.userReaction ? (
                                  <>
                                    {REACTIONS.find(
                                      (r) => r.type === post.userReaction
                                    )?.icon &&
                                      React.createElement(
                                        REACTIONS.find(
                                          (r) => r.type === post.userReaction
                                        )!.icon,
                                        {
                                          className: `h-4 w-4 mr-1 fill-current`,
                                        }
                                      )}
                                    {
                                      REACTIONS.find(
                                        (r) => r.type === post.userReaction
                                      )?.label
                                    }
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
                                    onClick={() =>
                                      handleReaction(post.id, reaction.type)
                                    }
                                  >
                                    <Icon
                                      className={`h-4 w-4 mr-2 ${reaction.color}`}
                                    />
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
            <Dialog
              open={commentsDialogOpen}
              onOpenChange={setCommentsDialogOpen}
            >
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle>Comments</DialogTitle>
                  <DialogDescription>
                    {selectedPost?.commentsCount}{" "}
                    {selectedPost?.commentsCount === 1 ? "comment" : "comments"}
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
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userName}`}
                          />
                          <AvatarFallback className="text-xs bg-gradient-to-br from-green-400 to-blue-500 text-white">
                            {comment.userName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">
                              {comment.userName}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-xs capitalize"
                            >
                              {comment.userRole}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm mb-2">{comment.content}</p>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                            >
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

                <form
                  onSubmit={handleAddComment}
                  className="flex gap-2 pt-4 border-t"
                >
                  <Input
                    placeholder={
                      replyingTo ? "Write a reply..." : "Write a comment..."
                    }
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    required
                    disabled={isSubmittingComment}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={isSubmittingComment}
                  >
                    {isSubmittingComment ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Share Dialog */}
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share Post</DialogTitle>
                  <DialogDescription>
                    Share this post with others
                  </DialogDescription>
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
                        onClick={() =>
                          setSelectedImageIndex(
                            Math.max(0, selectedImageIndex - 1)
                          )
                        }
                        disabled={selectedImageIndex === 0}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                        onClick={() =>
                          setSelectedImageIndex(
                            Math.min(
                              selectedImages.length - 1,
                              selectedImageIndex + 1
                            )
                          )
                        }
                        disabled={
                          selectedImageIndex === selectedImages.length - 1
                        }
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

          {/* Right Sidebar - Ads & Events */}
          <div className="col-span-12 lg:col-span-3">
            <div
              className="sticky top-24 space-y-4 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#cbd5e0 transparent",
              }}
            >
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">
                    🚀 Tech Events & Opportunities
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {techEvents.map((event) => (
                    <motion.a
                      key={event.id}
                      href={event.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative h-32 overflow-hidden">
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="bg-white/90">
                              {event.type === "hackathon" && "🏆 Hackathon"}
                              {event.type === "conference" && "🎤 Conference"}
                              {event.type === "program" && "💼 Program"}
                              {event.type === "learning" && "📚 Learning"}
                              {event.type === "competition" && "🏅 Competition"}
                              {event.type === "scholarship" && "🎓 Scholarship"}
                            </Badge>
                          </div>
                        </div>
                        <div className="p-3 space-y-1">
                          <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                            {event.title}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {event.description}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>📅</span>
                            <span>{event.date}</span>
                          </div>
                        </div>
                      </div>
                    </motion.a>
                  ))}
                </CardContent>
              </Card>

              {/* Additional Ad Card */}
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    <div className="text-4xl">🎯</div>
                    <h4 className="font-bold">Boost Your Career</h4>
                    <p className="text-sm text-muted-foreground">
                      Connect with alumni working at top tech companies
                    </p>
                    <Button size="sm" className="w-full" asChild>
                      <Link href="/student/connections">Find Mentors</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
