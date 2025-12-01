"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RoleLayout } from "@/components/layout/role-layout";
import { Briefcase, MapPin, Clock, DollarSign, Search, Filter, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Job {
  id: number;
  title: string;
  company: string;
  description: string;
  location: string;
  jobType: string;
  salary?: string;
  skills: string[];
  branch?: string;
  createdAt: string;
  postedBy: string;
  status: string;
}

export default function StudentJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchQuery, jobTypeFilter, branchFilter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        // Only show approved jobs
        const approvedJobs = data.jobs?.filter((j: any) => j.status === "approved") || [];
        setJobs(approvedJobs);
      } else {
        toast.error("Failed to load jobs");
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Job type filter
    if (jobTypeFilter !== "all") {
      filtered = filtered.filter((job) => job.jobType === jobTypeFilter);
    }

    // Branch filter
    if (branchFilter !== "all") {
      filtered = filtered.filter((job) => job.branch === branchFilter || !job.branch);
    }

    setFilteredJobs(filtered);
  };

  const handleApply = async () => {
    if (!selectedJob) return;

    try {
      setApplying(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/jobs/${selectedJob.id}/apply`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coverLetter: coverLetter.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Application submitted successfully!");
        setDialogOpen(false);
        setCoverLetter("");
        setSelectedJob(null);
      } else {
        toast.error(data.error || "Failed to submit application");
      }
    } catch (error) {
      console.error("Error applying to job:", error);
      toast.error("Failed to submit application");
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <RoleLayout role="student">
        <div className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout role="student">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Job Opportunities</h1>
            <p className="text-muted-foreground mt-2">
              Browse and apply to internships and full-time positions
            </p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={branchFilter} onValueChange={setBranchFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    <SelectItem value="computer">Computer Engineering</SelectItem>
                    <SelectItem value="electronics">Electronics Engineering</SelectItem>
                    <SelectItem value="mechanical">Mechanical Engineering</SelectItem>
                    <SelectItem value="civil">Civil Engineering</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{filteredJobs.length}</p>
                  <p className="text-sm text-muted-foreground">Available Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{new Set(filteredJobs.map(j => j.company)).size}</p>
                  <p className="text-sm text-muted-foreground">Companies</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {filteredJobs.filter(j => j.jobType === "internship").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Internships</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Job Listings */}
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No jobs found matching your criteria</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-xl line-clamp-1">{job.title}</CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {job.company}
                        </CardDescription>
                      </div>
                      <Badge variant={job.jobType === "internship" ? "secondary" : "default"}>
                        {job.jobType}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {job.description}
                    </p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                      {job.salary && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          {job.salary}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Posted {formatDate(job.createdAt)}
                      </div>
                    </div>

                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {job.skills.slice(0, 3).map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <Dialog open={dialogOpen && selectedJob?.id === job.id} onOpenChange={(open) => {
                      setDialogOpen(open);
                      if (!open) {
                        setSelectedJob(null);
                        setCoverLetter("");
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full" 
                          onClick={() => setSelectedJob(job)}
                        >
                          Apply Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{job.title}</DialogTitle>
                          <DialogDescription>{job.company} • {job.location}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Job Description</h4>
                            <p className="text-sm text-muted-foreground">{job.description}</p>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">Job Details</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Type:</span>
                                <Badge>{job.jobType}</Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Location:</span>
                                <span>{job.location}</span>
                              </div>
                              {job.salary && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Salary:</span>
                                  <span>{job.salary}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {job.skills && job.skills.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2">Required Skills</h4>
                              <div className="flex flex-wrap gap-2">
                                {job.skills.map((skill, i) => (
                                  <Badge key={i} variant="secondary">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
                            <Textarea
                              id="coverLetter"
                              placeholder="Tell the employer why you're a great fit for this role..."
                              value={coverLetter}
                              onChange={(e) => setCoverLetter(e.target.value)}
                              rows={6}
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setDialogOpen(false);
                                setSelectedJob(null);
                                setCoverLetter("");
                              }}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleApply} 
                              disabled={applying}
                              className="flex-1"
                            >
                              {applying ? "Submitting..." : "Submit Application"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </RoleLayout>
  );
}
