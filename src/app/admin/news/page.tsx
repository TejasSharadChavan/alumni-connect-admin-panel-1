"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoleLayout } from "@/components/layout/role-layout";
import {
  FileText,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ViewPostDetailsDialog } from "@/components/admin/ViewPostDetailsDialog";

interface Post {
  id: number;
  content: string;
  author: string;
  category: string;
  status: string;
  createdAt: string;
  reactions?: {
    like: number;
    celebrate: number;
    support: number;
    insightful: number;
  };
  commentsCount?: number;
  userId?: number;
  userName?: string;
}

export default function NewsManagementPage() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewDetailsDialogOpen, setViewDetailsDialogOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  const handleViewDetails = (postId: number) => {
    setSelectedPostId(postId);
    setViewDetailsDialogOpen(true);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/posts", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        // Map the API response to our Post interface
        const mappedPosts = (data.posts || []).map((post: any) => ({
          id: post.id,
          content: post.content,
          author: post.userName || "Unknown",
          category: post.category || "general",
          status: post.status || "approved",
          createdAt: post.createdAt,
          reactions: post.reactions || {
            like: 0,
            celebrate: 0,
            support: 0,
            insightful: 0,
          },
          commentsCount: post.commentsCount || 0,
          userId: post.userId,
          userName: post.userName,
        }));
        setPosts(mappedPosts);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this post? This action cannot be undone."
      )
    )
      return;

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete post");

      toast.success("Post deleted successfully");
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  const handleApprove = async (postId: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/admin/approve-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contentType: "post", contentId: postId }),
      });

      if (response.ok) {
        toast.success("Post approved successfully");
        fetchPosts();
      }
    } catch (error) {
      toast.error("Failed to approve post");
    }
  };

  const handleReject = async (postId: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/admin/reject-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contentType: "post",
          contentId: postId,
          reason: "Does not meet community guidelines",
        }),
      });

      if (response.ok) {
        toast.success("Post rejected");
        fetchPosts();
      }
    } catch (error) {
      toast.error("Failed to reject post");
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.content
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || post.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || post.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = Array.from(
    new Set(posts.map((p) => p.category).filter(Boolean))
  );

  const stats = {
    total: posts.length,
    pending: posts.filter((p) => p.status === "pending").length,
    approved: posts.filter((p) => p.status === "approved").length,
    totalEngagement: posts.reduce(
      (acc, p) => acc + (p.reactionsCount || 0) + (p.commentsCount || 0),
      0
    ),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <RoleLayout role="admin">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">News & Posts Management</h1>
              <p className="text-muted-foreground">
                Manage news articles and user posts
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Review
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Engagement
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEngagement}</div>
            </CardContent>
          </Card>
        </div>

        {/* Posts Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Posts</CardTitle>
            <CardDescription>Review and manage news posts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Posted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Loading posts...
                      </TableCell>
                    </TableRow>
                  ) : filteredPosts.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No posts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium max-w-md">
                          <p className="truncate">
                            {post.content.substring(0, 100)}...
                          </p>
                        </TableCell>
                        <TableCell className="text-sm">{post.author}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{post.category}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          <button
                            onClick={() => handleViewDetails(post.id)}
                            className="flex flex-col gap-1 hover:bg-muted/50 p-2 rounded transition-colors text-left w-full"
                          >
                            <div className="flex items-center gap-2">
                              <span title="Likes">
                                {post.reactions?.like || 0} 👍
                              </span>
                              <span title="Celebrate">
                                {post.reactions?.celebrate || 0} 🎉
                              </span>
                              <span title="Support">
                                {post.reactions?.support || 0} 💪
                              </span>
                              <span title="Insightful">
                                {post.reactions?.insightful || 0} 💡
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {post.commentsCount || 0} comments • Click to view
                            </div>
                          </button>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(post.status)}>
                            {post.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {post.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleApprove(post.id)}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReject(post.id)}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(post.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <ViewPostDetailsDialog
        postId={selectedPostId}
        open={viewDetailsDialogOpen}
        onClose={() => {
          setViewDetailsDialogOpen(false);
          setSelectedPostId(null);
        }}
      />
    </RoleLayout>
  );
}
