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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoleLayout } from "@/components/layout/role-layout";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Search,
  Filter,
  Building2,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
  matchScore?: number;
}

export default function StudentJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [appliedFilter, setAppliedFilter] = useState("all"); // all, applied, not-applied
  const [appliedJobIds, setAppliedJobIds] = useState<Set<number>>(new Set());
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null);

  useEffect(() => {
    fetchJobs();
    fetchAppliedJobs();
    fetchJobMatches();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [
    jobs,
    searchQuery,
    jobTypeFilter,
    branchFilter,
    appliedFilter,
    appliedJobIds,
  ]);

  const fetchAppliedJobs = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/jobs/applications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success && data.applications) {
        const appliedIds = new Set(
          data.applications.map((app: any) => app.job.id)
        );
        setAppliedJobIds(appliedIds);
      }
    } catch (error) {
      console.error("Error fetching applied jobs:", error);
    }
  };

  const fetchJobMatches = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/ml/job-match", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success && data.matches) {
        const matchMap = new Map(
          data.matches.map((m: any) => [m.jobId, m.matchScore])
        );
        setJobs((prevJobs) =>
          prevJobs.map((job) => ({
            ...job,
            matchScore: matchMap.get(job.id) || 0,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching job matches:", error);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        // Only show approved jobs and parse skills
        const approvedJobs =
          data.jobs
            ?.filter((j: any) => j.status === "approved")
            .map((job: any) => {
              // Parse skills if it's a string
              let parsedSkills = job.skills;
              if (typeof job.skills === "string") {
                try {
                  parsedSkills = JSON.parse(job.skills);
                } catch (e) {
                  parsedSkills = [];
                }
              }
              if (!Array.isArray(parsedSkills)) {
                parsedSkills = [];
              }
              return { ...job, skills: parsedSkills, matchScore: 0 };
            }) || [];
        setJobs(approvedJobs);

        // Fetch match scores after jobs are loaded
        fetchJobMatchesForJobs(approvedJobs);
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

  const fetchJobMatchesForJobs = async (jobsList: Job[]) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/ml/job-match", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success && data.matches) {
        const matchMap = new Map(
          data.matches.map((m: any) => [m.jobId, m.matchScore])
        );
        const updatedJobs = jobsList.map((job) => ({
          ...job,
          matchScore: matchMap.get(job.id) || 0,
        }));
        setJobs(updatedJobs);
      }
    } catch (error) {
      console.error("Error fetching job matches:", error);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    // Applied filter
    if (appliedFilter === "applied") {
      filtered = filtered.filter((job) => appliedJobIds.has(job.id));
    } else if (appliedFilter === "not-applied") {
      filtered = filtered.filter((job) => !appliedJobIds.has(job.id));
    }

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
      filtered = filtered.filter(
        (job) => job.branch === branchFilter || !job.branch
      );
    }

    setFilteredJobs(filtered);
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
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
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
            <h1 className="text-3xl font-bold tracking-tight">
              Job Opportunities
            </h1>
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
              <div className="grid gap-4 md:grid-cols-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={appliedFilter} onValueChange={setAppliedFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Application Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Jobs</SelectItem>
                    <SelectItem value="not-applied">Not Applied</SelectItem>
                    <SelectItem value="applied">Already Applied</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="computer">
                      Computer Engineering
                    </SelectItem>
                    <SelectItem value="electronics">
                      Electronics Engineering
                    </SelectItem>
                    <SelectItem value="mechanical">
                      Mechanical Engineering
                    </SelectItem>
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
                  <p className="text-sm text-muted-foreground">
                    Available Jobs
                  </p>
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
                  <p className="text-2xl font-bold">
                    {new Set(filteredJobs.map((j) => j.company)).size}
                  </p>
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
                    {
                      filteredJobs.filter((j) => j.jobType === "internship")
                        .length
                    }
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
                <p className="text-muted-foreground">
                  No jobs found matching your criteria
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card
                  className={`h-full hover:shadow-lg transition-all cursor-pointer ${
                    expandedJobId === job.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() =>
                    setExpandedJobId(expandedJobId === job.id ? null : job.id)
                  }
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-xl line-clamp-1">
                          {job.title}
                        </CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {job.company}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {job.matchScore !== undefined && job.matchScore > 0 && (
                          <Badge
                            variant="default"
                            className={`${
                              job.matchScore >= 80
                                ? "bg-green-600"
                                : job.matchScore >= 60
                                  ? "bg-blue-600"
                                  : "bg-orange-600"
                            }`}
                          >
                            {job.matchScore}% Match
                          </Badge>
                        )}
                        <Badge
                          variant={
                            job.jobType === "internship"
                              ? "secondary"
                              : "default"
                          }
                        >
                          {job.jobType}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div
                      className="cursor-pointer"
                      onClick={() =>
                        setExpandedJobId(
                          expandedJobId === job.id ? null : job.id
                        )
                      }
                    >
                      <p
                        className={`text-sm text-muted-foreground ${
                          expandedJobId === job.id ? "" : "line-clamp-3"
                        }`}
                      >
                        {job.description}
                      </p>
                      {job.description.length > 150 && (
                        <button className="text-xs text-primary mt-1 hover:underline">
                          {expandedJobId === job.id ? "Show less" : "Show more"}
                        </button>
                      )}
                    </div>

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
                      {expandedJobId === job.id && job.branch && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Filter className="h-4 w-4" />
                          {job.branch}
                        </div>
                      )}
                    </div>

                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {(expandedJobId === job.id
                          ? job.skills
                          : job.skills.slice(0, 3)
                        ).map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {expandedJobId !== job.id && job.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <Button
                      className="w-full"
                      onClick={() => router.push(`/student/jobs/${job.id}`)}
                    >
                      View Details
                    </Button>
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
