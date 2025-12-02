"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RoleLayout } from "@/components/layout/role-layout";
import { CheckCircle2, XCircle, Eye, Clock, Shield, AlertTriangle, FileText, Briefcase, Calendar } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface PendingContent {
  id: number;
  type: "post" | "job" | "event";
  title: string;
  content: string;
  author: string;
  authorId: number;
  status: string;
  createdAt: string;
}

export default function ContentModerationPage() {
  const [loading, setLoading] = useState(true);
  const [pendingPosts, setPendingPosts] = useState<PendingContent[]>([]);
  const [pendingJobs, setPendingJobs] = useState<PendingContent[]>([]);
  const [pendingEvents, setPendingEvents] = useState<PendingContent[]>([]);
  const [selectedContent, setSelectedContent] = useState<PendingContent | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | "view" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingContent();
  }, []);

  const fetchPendingContent = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      // Fetch pending posts
      const postsRes = await fetch("/api/posts?status=pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPendingPosts(
          (postsData.posts || []).map((p: any) => ({
            id: p.id,
            type: "post",
            title: p.content.substring(0, 50) + "...",
            content: p.content,
            author: p.authorName || "Unknown",
            authorId: p.authorId,
            status: p.status,
            createdAt: p.createdAt,
          }))
        );
      }

      // Fetch pending jobs
      const jobsRes = await fetch("/api/jobs?status=pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setPendingJobs(
          (jobsData.jobs || []).map((j: any) => ({
            id: j.id,
            type: "job",
            title: j.title,
            content: j.description,
            author: j.postedByName || "Unknown",
            authorId: j.postedById,
            status: j.status,
            createdAt: j.createdAt,
          }))
        );
      }

      // Fetch pending events
      const eventsRes = await fetch("/api/events?status=pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setPendingEvents(
          (eventsData.events || []).map((e: any) => ({
            id: e.id,
            type: "event",
            title: e.title,
            content: e.description,
            author: e.organizerName || "Unknown",
            authorId: e.organizerId,
            status: e.status,
            createdAt: e.createdAt,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching pending content:", error);
      toast.error("Failed to load pending content");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedContent) return;
    setActionLoading(true);

    try {
      const token = localStorage.getItem("auth_token");
      const endpoint = `/api/admin/approve-content`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contentType: selectedContent.type,
          contentId: selectedContent.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to approve content");

      toast.success(`${selectedContent.type} approved successfully!`);
      setSelectedContent(null);
      setActionType(null);
      fetchPendingContent();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve content");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedContent || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const endpoint = `/api/admin/reject-content`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contentType: selectedContent.type,
          contentId: selectedContent.id,
          reason: rejectionReason,
        }),
      });

      if (!response.ok) throw new Error("Failed to reject content");

      toast.success(`${selectedContent.type} rejected`);
      setSelectedContent(null);
      setActionType(null);
      setRejectionReason("");
      fetchPendingContent();
    } catch (error: any) {
      toast.error(error.message || "Failed to reject content");
    } finally {
      setActionLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "post":
        return FileText;
      case "job":
        return Briefcase;
      case "event":
        return Calendar;
      default:
        return FileText;
    }
  };

  const ContentTable = ({ items, type }: { items: PendingContent[]; type: string }) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                No pending {type}
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>{item.author}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(item.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedContent(item);
                        setActionType("view");
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        setSelectedContent(item);
                        setActionType("approve");
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setSelectedContent(item);
                        setActionType("reject");
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  const stats = {
    total: pendingPosts.length + pendingJobs.length + pendingEvents.length,
    posts: pendingPosts.length,
    jobs: pendingJobs.length,
    events: pendingEvents.length,
  };

  return (
    <RoleLayout role="admin">
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Content Moderation</h1>
              <p className="text-muted-foreground">Review and moderate user-generated content</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Posts</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.posts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.jobs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Events</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.events}</div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Content</CardTitle>
            <CardDescription>Review and approve or reject user submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="posts">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="posts">Posts ({stats.posts})</TabsTrigger>
                <TabsTrigger value="jobs">Jobs ({stats.jobs})</TabsTrigger>
                <TabsTrigger value="events">Events ({stats.events})</TabsTrigger>
              </TabsList>
              <TabsContent value="posts" className="mt-6">
                <ContentTable items={pendingPosts} type="posts" />
              </TabsContent>
              <TabsContent value="jobs" className="mt-6">
                <ContentTable items={pendingJobs} type="jobs" />
              </TabsContent>
              <TabsContent value="events" className="mt-6">
                <ContentTable items={pendingEvents} type="events" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* View Dialog */}
        <Dialog open={actionType === "view"} onOpenChange={() => { setActionType(null); setSelectedContent(null); }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedContent && <Badge>{selectedContent.type}</Badge>}
                Content Details
              </DialogTitle>
            </DialogHeader>
            {selectedContent && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Title</Label>
                  <p className="font-medium">{selectedContent.title}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Author</Label>
                  <p>{selectedContent.author}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Content</Label>
                  <p className="text-sm mt-2 whitespace-pre-wrap">{selectedContent.content}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Submitted</Label>
                  <p className="text-sm">{new Date(selectedContent.createdAt).toLocaleString()}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => { setActionType(null); setSelectedContent(null); }}>
                Close
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setActionType("approve")}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => setActionType("reject")}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Approve Dialog */}
        <Dialog open={actionType === "approve"} onOpenChange={() => { setActionType(null); setSelectedContent(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Content</DialogTitle>
              <DialogDescription>
                This content will be published and visible to all users.
              </DialogDescription>
            </DialogHeader>
            {selectedContent && (
              <div className="py-4">
                <p className="font-medium">{selectedContent.title}</p>
                <p className="text-sm text-muted-foreground">by {selectedContent.author}</p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => { setActionType(null); setSelectedContent(null); }} disabled={actionLoading}>
                Cancel
              </Button>
              <Button onClick={handleApprove} disabled={actionLoading} className="bg-green-600 hover:bg-green-700">
                {actionLoading ? "Approving..." : "Approve"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={actionType === "reject"} onOpenChange={() => { setActionType(null); setSelectedContent(null); setRejectionReason(""); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Content</DialogTitle>
              <DialogDescription>
                Provide a reason for rejecting this content. The author will be notified.
              </DialogDescription>
            </DialogHeader>
            {selectedContent && (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-destructive/10">
                  <p className="font-medium">{selectedContent.title}</p>
                  <p className="text-sm text-muted-foreground">by {selectedContent.author}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Rejection Reason *</Label>
                  <Textarea
                    id="reason"
                    placeholder="Explain why this content is being rejected..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                    disabled={actionLoading}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setActionType(null);
                  setSelectedContent(null);
                  setRejectionReason("");
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
              >
                {actionLoading ? "Rejecting..." : "Reject Content"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RoleLayout>
  );
}
