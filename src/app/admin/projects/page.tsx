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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FolderKanban,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Code,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface ProjectSubmission {
  id: number;
  title: string;
  teamName: string;
  submittedBy: string;
  technologies: string[];
  status: string;
  submittedAt: string;
  repositoryUrl?: string;
  demoUrl?: string;
}

export default function ProjectsManagementPage() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<ProjectSubmission[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProject, setSelectedProject] =
    useState<ProjectSubmission | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/project-submissions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.submissions || []);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (projectId: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `/api/project-submissions/${projectId}/review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "approved",
            comments: "Great work! Project approved.",
          }),
        }
      );

      if (response.ok) {
        toast.success("Project approved successfully");
        fetchProjects();
      }
    } catch (error) {
      toast.error("Failed to approve project");
    }
  };

  const handleReject = async (projectId: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `/api/project-submissions/${projectId}/review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "rejected",
            comments: "Project needs improvements",
          }),
        }
      );

      if (response.ok) {
        toast.success("Project rejected");
        fetchProjects();
      }
    } catch (error) {
      toast.error("Failed to reject project");
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: projects.length,
    pending: projects.filter((p) => p.status === "pending").length,
    approved: projects.filter((p) => p.status === "approved").length,
    rejected: projects.filter((p) => p.status === "rejected").length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      case "revision_requested":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <FolderKanban className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Projects Management</h1>
            <p className="text-muted-foreground">
              Review and manage student project submissions
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Submissions
            </CardTitle>
            <FolderKanban className="h-4 w-4 text-blue-600" />
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
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Project Submissions</CardTitle>
          <CardDescription>Review student project submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="revision_requested">
                  Revision Requested
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Title</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Technologies</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading projects...
                    </TableCell>
                  </TableRow>
                ) : filteredProjects.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No projects found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">
                        {project.title}
                      </TableCell>
                      <TableCell>{project.teamName}</TableCell>
                      <TableCell className="text-sm">
                        {project.submittedBy}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {project.technologies
                            ?.slice(0, 3)
                            .map((tech, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tech}
                              </Badge>
                            ))}
                          {(project.technologies?.length || 0) > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{project.technologies.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(project.submittedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedProject(project);
                              setViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {project.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleApprove(project.id)}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(project.id)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
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

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">
                  {selectedProject.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Team: {selectedProject.teamName} • Submitted by{" "}
                  {selectedProject.submittedBy}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Technologies Used
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.technologies?.map((tech, idx) => (
                    <Badge key={idx} variant="secondary">
                      <Code className="h-3 w-3 mr-1" />
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                {selectedProject.repositoryUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={selectedProject.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
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
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge
                  variant={getStatusColor(selectedProject.status)}
                  className="mt-1"
                >
                  {selectedProject.status}
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
