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
  MapPin,
  Building2,
  Clock,
  DollarSign,
  ArrowLeft,
  Briefcase,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
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
import { Input } from "@/components/ui/input";
import { ResumeUpload } from "@/components/resume-upload";

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

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeFilename, setResumeFilename] = useState("");
  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    fetchJobDetails();
    checkApplicationStatus();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        // Parse skills if string
        let parsedSkills = data.skills;
        if (typeof data.skills === "string") {
          try {
            parsedSkills = JSON.parse(data.skills);
          } catch (e) {
            parsedSkills = [];
          }
        }
        setJob({ ...data, skills: parsedSkills });
      } else {
        toast.error("Job not found");
        router.push("/student/jobs");
      }
    } catch (error) {
      console.error("Error fetching job:", error);
      toast.error("Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/jobs/applications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success && data.applications) {
        const applied = data.applications.some(
          (app: any) => app.job.id === parseInt(jobId)
        );
        setHasApplied(applied);
      }
    } catch (error) {
      console.error("Error checking application status:", error);
    }
  };

  const handleApply = async () => {
    if (!resumeUrl) {
      toast.error("Please upload your resume");
      return;
    }

    try {
      setApplying(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coverLetter: coverLetter.trim() || undefined,
          resumeUrl,
          referralCode: referralCode.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Application submitted successfully!");
        setHasApplied(true);
        setDialogOpen(false);
        setCoverLetter("");
        setResumeUrl("");
        setResumeFilename("");
        setReferralCode("");
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
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </RoleLayout>
    );
  }

  if (!job) {
    return (
      <RoleLayout role="student">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Job not found</p>
          <Button onClick={() => router.push("/student/jobs")} className="mt-4">
            Back to Jobs
          </Button>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout role="student">
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>

        {/* Job Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
                  <CardDescription className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {job.company}
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  {job.matchScore !== undefined && job.matchScore > 0 && (
                    <Badge
                      variant="default"
                      className={`text-lg px-4 py-2 ${
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
                      job.jobType === "internship" ? "secondary" : "default"
                    }
                    className="text-base px-3 py-1"
                  >
                    {job.jobType}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Job Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span>{job.location}</span>
                </div>
                {job.salary && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <span>{job.salary}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>Posted {formatDate(job.createdAt)}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xl font-semibold mb-3">Job Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {job.description}
                </p>
              </div>

              {/* Skills */}
              {job.skills && job.skills.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="text-sm px-3 py-1"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Apply Button */}
              <div className="pt-4">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="lg"
                      className="w-full md:w-auto"
                      disabled={hasApplied}
                      variant={hasApplied ? "secondary" : "default"}
                    >
                      <Briefcase className="h-5 w-5 mr-2" />
                      {hasApplied ? "Already Applied" : "Apply Now"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{job.title}</DialogTitle>
                      <DialogDescription>
                        {job.company} • {job.location}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-base font-semibold">
                          Resume *
                        </Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          Upload your resume (PDF, DOC, or DOCX, max 5MB)
                        </p>
                        <ResumeUpload
                          onUpload={(url, filename) => {
                            setResumeUrl(url);
                            setResumeFilename(filename);
                          }}
                          currentResume={resumeUrl}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="referralCode">
                          Referral Code (Optional)
                        </Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          Have a referral code from an alumni? Enter it here
                        </p>
                        <Input
                          id="referralCode"
                          placeholder="e.g., GOOGLE-ABC123"
                          value={referralCode}
                          onChange={(e) =>
                            setReferralCode(e.target.value.toUpperCase())
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="coverLetter">
                          Cover Letter (Optional)
                        </Label>
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
                          onClick={() => setDialogOpen(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleApply}
                          disabled={applying || !resumeUrl}
                          className="flex-1"
                        >
                          {applying ? "Submitting..." : "Submit Application"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </RoleLayout>
  );
}
