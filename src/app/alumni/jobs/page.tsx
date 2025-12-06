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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleLayout } from "@/components/layout/role-layout";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Search,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";
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
  postedById: number;
  postedByName: string;
  status: string;
  createdAt: string;
}

export default function AlumniJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });

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

  const formatTimeAgo = (dateString: string) => {
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

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === "all" || job.jobType === filterType;

    return matchesSearch && matchesType && job.status === "approved";
  });

  const getJobTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "full-time":
        return "bg-green-500";
      case "part-time":
        return "bg-blue-500";
      case "internship":
        return "bg-purple-500";
      case "contract":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <RoleLayout role="alumni">
        <div className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout role="alumni">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Briefcase className="h-8 w-8" />
                Job Opportunities
              </h1>
              <p className="text-muted-foreground mt-2">
                Browse and manage job postings
              </p>
            </div>
            <Button asChild>
              <Link href="/alumni/jobs/post">
                <PlusCircle className="h-4 w-4 mr-2" />
                Post a Job
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Jobs Found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchQuery
                  ? "No jobs match your search criteria"
                  : "Be the first to post a job opportunity!"}
              </p>
              <Button asChild>
                <Link href="/alumni/jobs/post">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Post a Job
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        <CardDescription className="text-base font-medium">
                          {job.company}
                        </CardDescription>
                      </div>
                      <Badge
                        className={`${getJobTypeColor(job.jobType)} text-white capitalize`}
                      >
                        {job.jobType}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground line-clamp-2">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                      {job.salary && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {job.salary}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTimeAgo(job.createdAt)}
                      </div>
                    </div>

                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {job.skills.slice(0, 5).map((skill, idx) => (
                          <Badge key={idx} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills.length > 5 && (
                          <Badge variant="outline">
                            +{job.skills.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <p className="text-sm text-muted-foreground">
                        Posted by {job.postedByName}
                      </p>
                      <div className="flex gap-2">
                        <Link href={`/alumni/jobs/${job.id}/applicants`}>
                          <Button variant="outline" size="sm">
                            View Applicants
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
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
