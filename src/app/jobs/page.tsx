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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  Search,
  Filter,
  ChevronRight,
  Upload,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  postedById: number;
  postedByName: string;
  postedByRole: string;
  applicationsCount: number;
  hasApplied: boolean;
  createdAt: string;
}

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    coverLetter: "",
    resumeUrl: "",
  });

  useEffect(() => {
    checkAuth();
    fetchJobs();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      try {
        const response = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch("/api/jobs", { headers });
      if (response.ok) {
        const data = await response.json();
        // Parse skills if they're strings
        const jobsWithParsedSkills = (data.jobs || []).map((job: any) => ({
          ...job,
          skills:
            typeof job.skills === "string"
              ? job.skills
                ? JSON.parse(job.skills)
                : []
              : Array.isArray(job.skills)
                ? job.skills
                : [],
        }));
        setJobs(jobsWithParsedSkills);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = (job: Job) => {
    if (!isAuthenticated) {
      toast.error("Please login to apply");
      router.push("/login");
      return;
    }
    setSelectedJob(job);
    setApplyDialogOpen(true);
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedJob) return;

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/jobs/${selectedJob.id}/apply`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationForm),
      });

      if (response.ok) {
        toast.success("Application submitted successfully!");
        setApplyDialogOpen(false);
        setApplicationForm({ coverLetter: "", resumeUrl: "" });
        fetchJobs();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to submit application");
      }
    } catch (error) {
      console.error("Error applying to job:", error);
      toast.error("Failed to submit application");
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
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      "full-time": "bg-blue-500",
      "part-time": "bg-green-500",
      internship: "bg-purple-500",
      contract: "bg-yellow-500",
      remote: "bg-pink-500",
    };
    return colors[type] || "bg-gray-500";
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || job.type === filterType;
    const matchesLocation =
      filterLocation === "all" ||
      job.location.toLowerCase().includes(filterLocation.toLowerCase());
    return matchesSearch && matchesType && matchesLocation;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Skeleton className="h-12 w-64 mb-6" />
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="shrink-0"
            >
              <ChevronRight className="h-5 w-5 rotate-180" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Briefcase className="h-8 w-8" />
                Job Opportunities
              </h1>
              <p className="text-muted-foreground mt-1">
                Discover career opportunities posted by alumni and companies
              </p>
            </div>
            {!isAuthenticated && (
              <Button asChild>
                <Link href="/login">Login to Apply</Link>
              </Button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs, companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Job type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterLocation} onValueChange={setFilterLocation}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="mumbai">Mumbai</SelectItem>
                <SelectItem value="bangalore">Bangalore</SelectItem>
                <SelectItem value="pune">Pune</SelectItem>
                <SelectItem value="delhi">Delhi</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Jobs Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterType !== "all" || filterLocation !== "all"
                  ? "Try adjusting your search or filters"
                  : "Check back later for new opportunities"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="h-full flex flex-col hover:shadow-lg transition-shadow border-2">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">
                          {job.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <Building2 className="h-4 w-4" />
                          <span className="font-medium">{job.company}</span>
                        </div>
                      </div>
                      <Badge className={getTypeColor(job.type)}>
                        {job.type}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {job.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{job.location}</span>
                      </div>
                      {job.salary && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>{job.salary}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Posted {formatDate(job.createdAt)}</span>
                      </div>

                      {job.requirements && job.requirements.length > 0 && (
                        <div className="pt-2">
                          <p className="text-xs font-semibold mb-2">
                            Requirements:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {job.requirements.slice(0, 3).map((req, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs"
                              >
                                {req}
                              </Badge>
                            ))}
                            {job.requirements.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{job.requirements.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground pt-2 border-t">
                        Posted by {job.postedByName} ({job.postedByRole}) •{" "}
                        {job.applicationsCount} applicants
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      {job.hasApplied ? (
                        <Button disabled className="w-full">
                          Already Applied
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleApplyClick(job)}
                          className="w-full"
                        >
                          Apply Now
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Apply Dialog */}
      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
            <DialogDescription>
              at {selectedJob?.company} • {selectedJob?.location}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleApply} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="coverLetter">Cover Letter</Label>
              <Textarea
                id="coverLetter"
                placeholder="Tell us why you're a great fit for this role..."
                value={applicationForm.coverLetter}
                onChange={(e) =>
                  setApplicationForm({
                    ...applicationForm,
                    coverLetter: e.target.value,
                  })
                }
                rows={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume">Resume URL (optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="resume"
                  placeholder="https://... or upload below"
                  value={applicationForm.resumeUrl}
                  onChange={(e) =>
                    setApplicationForm({
                      ...applicationForm,
                      resumeUrl: e.target.value,
                    })
                  }
                />
                <Button type="button" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Paste a link to your resume or upload a file
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Submit Application
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setApplyDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
