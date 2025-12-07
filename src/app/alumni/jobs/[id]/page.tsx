"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { RoleLayout } from "@/components/layout/role-layout";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Calendar,
} from "lucide-react";
import Link from "next/link";
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
  postedById: number;
  postedByName: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

export default function AlumniJobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchJobDetails();
    fetchCurrentUser();
  }, [jobId]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUserId(data.user.id);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const jobData = {
          ...data.job,
          skills:
            typeof data.job.skills === "string"
              ? data.job.skills
                ? JSON.parse(data.job.skills)
                : []
              : Array.isArray(data.job.skills)
                ? data.job.skills
                : [],
        };
        setJob(jobData);
      } else {
        toast.error("Failed to load job details");
        router.push("/alumni/jobs");
      }
    } catch (error) {
      console.error("Error fetching job details:", error);
      toast.error("Failed to load job details");
      router.push("/alumni/jobs");
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

  const isJobOwner = job && currentUserId && job.postedById === currentUserId;

  if (loading) {
    return (
      <RoleLayout role="alumni">
        <div className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </RoleLayout>
    );
  }

  if (!job) {
    return (
      <RoleLayout role="alumni">
        <div className="text-center py-12">
          <p>Job not found</p>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout role="alumni">
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-6 w-6 text-primary" />
                  <CardTitle className="text-3xl">{job.title}</CardTitle>
                </div>
                <CardDescription className="text-xl font-medium">
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
          <CardContent className="space-y-6">
            {/* Job Meta Info */}
            <div className="flex flex-wrap gap-6 text-muted-foreground border-b pb-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>{job.location}</span>
              </div>
              {job.salary && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  <span>{job.salary}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>Posted {formatTimeAgo(job.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>Posted by {job.postedByName}</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xl font-semibold mb-3">Job Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {job.description}
              </p>
            </div>

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, idx) => (
                    <Badge key={idx} variant="outline" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Branch */}
            {job.branch && (
              <div>
                <h3 className="text-xl font-semibold mb-3">
                  Branch/Department
                </h3>
                <p className="text-muted-foreground">{job.branch}</p>
              </div>
            )}

            {/* Action Buttons */}
            {isJobOwner && (
              <div className="pt-4 border-t">
                <Button asChild className="w-full sm:w-auto">
                  <Link href={`/alumni/jobs/${job.id}/applicants`}>
                    <Users className="h-4 w-4 mr-2" />
                    View Applicants
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleLayout>
  );
}
