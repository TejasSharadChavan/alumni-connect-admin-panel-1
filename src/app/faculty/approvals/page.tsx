"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileCheck,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  Github,
  ExternalLink,
  FileText,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface ProjectSubmission {
  id: number;
  teamId: number;
  teamName: string;
  title: string;
  description: string;
  repositoryUrl?: string;
  demoUrl?: string;
  documentUrl?: string;
  technologies: string[];
  status: "pending" | "approved" | "rejected" | "revision_requested";
  submittedBy: number;
  submitterName: string;
  submitterEmail: string;
  submitterBranch?: string;
  reviewComments?: string;
  grade?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export default function FacultyApprovalsPage() {
  const [pendingContent, setPendingContent] = useState<ContentItem[]>([]);
  const [reviewedContent, setReviewedContent] = useState<ContentItem[]>([]);
  const [projectSubmissions, setProjectSubmissions] = useState<
    ProjectSubmission[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [selectedProject, setSelectedProject] =
    useState<ProjectSubmission | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [reviewAction, setReviewAction] = useState<
    "approve" | "reject" | "request_revision"
  >("approve");
  const [reviewComments, setReviewComments] = useState("");
  const [grade, setGrade] = useState("");

  useEffect(() => {
    fetchContent();
    fetchProjectSubmissions();
  }, []);

  const fetchContent = async () => {
    try {
      const token = localStorage.getItem("auth_token");
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

  const fetchProjectSubmissions = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch("/api/project-submissions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProjectSubmissions(data.submissions || []);
      }
    } catch (error) {
      console.error("Failed to fetch project submissions:", error);
      toast.error("Failed to load project submissions");
    }
  };

  const handleReviewProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      setActionLoading(selectedProject.id);
      const token = localStorage.getItem("auth_token");

      const response = await fetch(
        `/api/project-submissions/${selectedProject.id}/review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: reviewAction,
            comments: reviewComments,
            grade: grade || undefined,
          }),
        }
      );

      if (response.ok) {
        const actionMessages = {
          approve: "Project approved successfully!",
          reject: "Project rejected",
          request_revision: "Revision requested",
        };
        toast.success(actionMessages[reviewAction]);
        await fetchProjectSubmissions();
        setReviewDialogOpen(false);
        setProjectDialogOpen(false);
        setReviewComments("");
        setGrade("");
        setReviewAction("approve");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to review project");
      }
    } catch (error) {
      console.error("Failed to review project:", error);
      toast.error("Failed to review project");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (contentId: number) => {
    try {
      setActionLoading(contentId);
      const token = localStorage.getItem("auth_token");
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

  const handleReject = async (
    contentId: number,
    reason: string = "Does not meet quality standards"
  ) => {
    try {
      setActionLoading(contentId);
      const token = localStorage.getItem("auth_token");
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

  const pendingProjects = projectSubmissions.filter(
    (p) => p.status === "pending"
  );
  const reviewedProjects = projectSubmissions.filter(
    (p) => p.status !== "pending"
  );

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
        <h1 className="text-3xl font-bold">Approvals</h1>
        <p className="text-muted-foreground">
          Review content and project submissions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Content
            </CardDescription>
            <CardTitle className="text-3xl">{pendingContent.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Pending Projects
            </CardDescription>
            <CardTitle className="text-3xl">{pendingProjects.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Approved
            </CardDescription>
            <CardTitle className="text-3xl">
              {reviewedContent.filter((c) => c.status === "approved").length +
                reviewedProjects.filter((p) => p.status === "approved").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Submissions</CardDescription>
            <CardTitle className="text-3xl">
              {pendingContent.length +
                reviewedContent.length +
                projectSubmissions.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Projects ({pendingProjects.length})
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Content ({pendingContent.length})
          </TabsTrigger>
          <TabsTrigger value="reviewed" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Reviewed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          {pendingProjects.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Pending Project Submissions
                </h3>
                <p className="text-muted-foreground text-center">
                  All projects have been reviewed. Check back later for new
                  submissions.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingProjects.map((project) => (
                <Card
                  key={project.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-500">Project</Badge>
                          <Badge variant="outline">
                            {project.submitterBranch || "N/A"}
                          </Badge>
                          <Badge variant="secondary">
                            Team: {project.teamName}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl">
                          {project.title}
                        </CardTitle>
                        <CardDescription>
                          By {project.submitterName} ({project.submitterEmail})
                          • {new Date(project.submittedAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {project.description}
                    </p>

                    {project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, i) => (
                          <Badge key={i} variant="secondary">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {project.repositoryUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={project.repositoryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Github className="h-4 w-4 mr-2" />
                            Repository
                          </a>
                        </Button>
                      )}
                      {project.demoUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={project.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Demo
                          </a>
                        </Button>
                      )}
                      {project.documentUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={project.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Docs
                          </a>
                        </Button>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProject(project);
                          setProjectDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Review Project
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          {pendingContent.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileCheck className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Pending Approvals
                </h3>
                <p className="text-muted-foreground text-center">
                  All content has been reviewed. Check back later for new
                  submissions.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingContent.map((item) => (
                <Card
                  key={item.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className={getTypeColor(item.type)}>
                            {item.type}
                          </Badge>
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
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {item.content}
                    </p>
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
          {reviewedProjects.length === 0 && reviewedContent.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileCheck className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Reviewed Items
                </h3>
                <p className="text-muted-foreground text-center">
                  Items you review will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {reviewedProjects.map((project) => (
                <Card key={`project-${project.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-500">Project</Badge>
                          <Badge
                            variant={
                              project.status === "approved"
                                ? "default"
                                : project.status === "rejected"
                                  ? "destructive"
                                  : "outline"
                            }
                          >
                            {project.status.replace("_", " ").toUpperCase()}
                          </Badge>
                          {project.grade && (
                            <Badge variant="outline">
                              Grade: {project.grade}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl">
                          {project.title}
                        </CardTitle>
                        <CardDescription>
                          By {project.submitterName} • Reviewed{" "}
                          {project.reviewedAt
                            ? new Date(project.reviewedAt).toLocaleDateString()
                            : ""}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                    {project.reviewComments && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <p className="text-sm">
                          <strong>Review Note:</strong> {project.reviewComments}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {reviewedContent.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                  {reviewedContent.map((item) => (
                    <Card key={item.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge className={getTypeColor(item.type)}>
                                {item.type}
                              </Badge>
                              <Badge
                                variant={
                                  item.status === "approved"
                                    ? "default"
                                    : "destructive"
                                }
                              >
                                {item.status}
                              </Badge>
                            </div>
                            <CardTitle className="text-xl">
                              {item.title}
                            </CardTitle>
                            <CardDescription>
                              By {item.authorName} • Reviewed{" "}
                              {formatDate(item.moderatedAt || "")}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.content}
                        </p>
                        {item.moderatorComments && (
                          <div className="mt-3 p-3 bg-muted rounded-lg">
                            <p className="text-sm">
                              <strong>Review Note:</strong>{" "}
                              {item.moderatorComments}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Project Review Dialog */}
      <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Project Submission Details</DialogTitle>
            <DialogDescription>
              Review the complete project submission
            </DialogDescription>
          </DialogHeader>

          {selectedProject && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500">Project</Badge>
                <Badge variant="outline">
                  {selectedProject.submitterBranch || "N/A"}
                </Badge>
                <Badge variant="secondary">
                  Team: {selectedProject.teamName}
                </Badge>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-2">
                  {selectedProject.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Submitted by {selectedProject.submitterName} (
                  {selectedProject.submitterEmail}) on{" "}
                  {new Date(selectedProject.submittedAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedProject.description}
                </p>
              </div>

              {selectedProject.technologies.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Technologies Used</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.technologies.map((tech, i) => (
                      <Badge key={i} variant="secondary">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">Project Links</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.repositoryUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={selectedProject.repositoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="h-4 w-4 mr-2" />
                        Repository
                      </a>
                    </Button>
                  )}
                  {selectedProject.demoUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={selectedProject.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Live Demo
                      </a>
                    </Button>
                  )}
                  {selectedProject.documentUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={selectedProject.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Documentation
                      </a>
                    </Button>
                  )}
                  {!selectedProject.repositoryUrl &&
                    !selectedProject.demoUrl &&
                    !selectedProject.documentUrl && (
                      <p className="text-sm text-muted-foreground">
                        No links provided
                      </p>
                    )}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  className="flex-1"
                  onClick={() => setReviewDialogOpen(true)}
                >
                  Provide Review
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Form Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Project</DialogTitle>
            <DialogDescription>
              Provide your feedback and grade for this project submission
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleReviewProject} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="action">Action *</Label>
              <Select
                value={reviewAction}
                onValueChange={(
                  value: "approve" | "reject" | "request_revision"
                ) => setReviewAction(value)}
                required
              >
                <SelectTrigger id="action">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Approve Project
                    </div>
                  </SelectItem>
                  <SelectItem value="request_revision">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-orange-600" />
                      Request Revision
                    </div>
                  </SelectItem>
                  <SelectItem value="reject">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      Reject Project
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">Grade (Optional)</Label>
              <Input
                id="grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="e.g., A+, 95/100, Excellent"
              />
              <p className="text-xs text-muted-foreground">
                Provide a grade or score for this project
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments">Comments & Feedback *</Label>
              <Textarea
                id="comments"
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                placeholder="Provide detailed feedback on the project..."
                rows={5}
                required
              />
              <p className="text-xs text-muted-foreground">
                {reviewAction === "approve"
                  ? "Highlight strengths and what was done well"
                  : reviewAction === "request_revision"
                    ? "Specify what needs to be improved or corrected"
                    : "Explain why the project doesn't meet requirements"}
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={actionLoading === selectedProject?.id}
                className="flex-1"
              >
                {actionLoading === selectedProject?.id ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setReviewDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Content Details</DialogTitle>
            <DialogDescription>
              Review the complete submission
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={getTypeColor(selectedItem.type)}>
                  {selectedItem.type}
                </Badge>
                <Badge variant="outline">{selectedItem.authorBranch}</Badge>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-2">{selectedItem.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Submitted by {selectedItem.authorName} on{" "}
                  {formatDate(selectedItem.createdAt)}
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
