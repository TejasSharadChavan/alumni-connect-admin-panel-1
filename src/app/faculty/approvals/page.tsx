"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCheck, Clock, CheckCircle, XCircle, Loader2, Eye } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ContentItem {
  id: number;
  type: string;
  title: string;
  content: string;
  authorId: number;
  authorName: string;
  authorBranch: string;
  status: string;
  createdAt: string;
  moderatedAt?: string;
  moderatorName?: string;
  moderatorComments?: string;
}

export default function FacultyApprovalsPage() {
  const [pendingContent, setPendingContent] = useState<ContentItem[]>([]);
  const [reviewedContent, setReviewedContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      if (!token) return;

      // Fetch pending content
      const pendingRes = await fetch("/api/admin/pending-content", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        setPendingContent(pendingData.content || []);
      }

      // For now, we'll simulate reviewed content
      // In a real app, you'd have a separate endpoint for this
      setReviewedContent([]);
    } catch (error) {
      console.error("Failed to fetch content:", error);
      toast.error("Failed to load content approvals");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (contentId: number) => {
    try {
      setActionLoading(contentId);
      const token = localStorage.getItem("bearer_token");
      if (!token) return;

      const response = await fetch("/api/admin/approve-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contentId }),
      });

      if (response.ok) {
        toast.success("Content approved successfully");
        await fetchContent();
        setDetailsDialogOpen(false);
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to approve content");
      }
    } catch (error) {
      console.error("Failed to approve content:", error);
      toast.error("Failed to approve content");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (contentId: number, reason: string = "Does not meet quality standards") => {
    try {
      setActionLoading(contentId);
      const token = localStorage.getItem("bearer_token");
      if (!token) return;

      const response = await fetch("/api/admin/reject-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contentId, reason }),
      });

      if (response.ok) {
        toast.success("Content rejected");
        await fetchContent();
        setDetailsDialogOpen(false);
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to reject content");
      }
    } catch (error) {
      console.error("Failed to reject content:", error);
      toast.error("Failed to reject content");
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (item: ContentItem) => {
    setSelectedItem(item);
    setDetailsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      post: "bg-blue-500",
      job: "bg-green-500",
      event: "bg-purple-500",
      project: "bg-orange-500",
    };
    return colors[type] || "bg-gray-500";
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
      <div>
        <h1 className="text-3xl font-bold">Content Approvals</h1>
        <p className="text-muted-foreground">Review and approve student-submitted content</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Review
            </CardDescription>
            <CardTitle className="text-3xl">{pendingContent.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Approved
            </CardDescription>
            <CardTitle className="text-3xl">
              {reviewedContent.filter((c) => c.status === "approved").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Rejected
            </CardDescription>
            <CardTitle className="text-3xl">
              {reviewedContent.filter((c) => c.status === "rejected").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Submissions</CardDescription>
            <CardTitle className="text-3xl">
              {pendingContent.length + reviewedContent.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingContent.length})
          </TabsTrigger>
          <TabsTrigger value="reviewed" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Reviewed ({reviewedContent.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingContent.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileCheck className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pending Approvals</h3>
                <p className="text-muted-foreground text-center">
                  All content has been reviewed. Check back later for new submissions.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingContent.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className={getTypeColor(item.type)}>{item.type}</Badge>
                          <Badge variant="outline">{item.authorBranch}</Badge>
                        </div>
                        <CardTitle className="text-xl">{item.title}</CardTitle>
                        <CardDescription>
                          By {item.authorName} • {formatDate(item.createdAt)}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">{item.content}</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(item)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleApprove(item.id)}
                        disabled={actionLoading === item.id}
                      >
                        {actionLoading === item.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(item.id)}
                        disabled={actionLoading === item.id}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviewed" className="space-y-4">
          {reviewedContent.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileCheck className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Reviewed Content</h3>
                <p className="text-muted-foreground text-center">
                  Content you review will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {reviewedContent.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getTypeColor(item.type)}>{item.type}</Badge>
                          <Badge
                            variant={item.status === "approved" ? "default" : "destructive"}
                          >
                            {item.status}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl">{item.title}</CardTitle>
                        <CardDescription>
                          By {item.authorName} • Reviewed {formatDate(item.moderatedAt || "")}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.content}</p>
                    {item.moderatorComments && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <p className="text-sm">
                          <strong>Review Note:</strong> {item.moderatorComments}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Content Details</DialogTitle>
            <DialogDescription>Review the complete submission</DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={getTypeColor(selectedItem.type)}>{selectedItem.type}</Badge>
                <Badge variant="outline">{selectedItem.authorBranch}</Badge>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-2">{selectedItem.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Submitted by {selectedItem.authorName} on {formatDate(selectedItem.createdAt)}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Content</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedItem.content}
                </p>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  className="flex-1"
                  onClick={() => handleApprove(selectedItem.id)}
                  disabled={actionLoading === selectedItem.id}
                >
                  {actionLoading === selectedItem.id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleReject(selectedItem.id)}
                  disabled={actionLoading === selectedItem.id}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
