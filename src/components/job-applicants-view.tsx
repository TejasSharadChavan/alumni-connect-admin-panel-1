"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  Star,
  TrendingUp,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  ExternalLink,
  Mail,
  Calendar,
  Award,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Applicant {
  id: number;
  jobId: number;
  applicantId: number;
  resumeUrl?: string;
  coverLetter?: string;
  resumeSummary?: string;
  matchingScore?: number;
  skillsMatch: string[];
  experienceMatch?: string;
  strengthsWeaknesses: {
    strengths: string[];
    weaknesses: string[];
  };
  aiAnalysis?: any;
  referralCode?: string;
  status: string;
  appliedAt: string;
  applicant: {
    id: number;
    name: string;
    email: string;
    profileImageUrl?: string;
    headline?: string;
    branch?: string;
    cohort?: string;
    yearOfPassing?: number;
    skills: string[];
    linkedinUrl?: string;
    githubUrl?: string;
  };
}

interface JobApplicantsViewProps {
  jobId: number;
  jobTitle: string;
}

export function JobApplicantsView({ jobId, jobTitle }: JobApplicantsViewProps) {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [filters, setFilters] = useState({
    status: "all",
    minScore: 0,
    maxScore: 100,
    sortBy: "appliedAt",
    sortOrder: "desc",
  });
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(
    null
  );
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  useEffect(() => {
    fetchApplicants();
  }, [jobId, filters]);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      const queryParams = new URLSearchParams({
        status: filters.status,
        minScore: filters.minScore.toString(),
        maxScore: filters.maxScore.toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      const response = await fetch(
        `/api/jobs/${jobId}/applicants?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (response.ok && data.success) {
        setApplicants(data.applicants);
        setStats(data.stats);
      } else {
        toast.error(data.error || "Failed to load applicants");
      }
    } catch (error) {
      console.error("Error fetching applicants:", error);
      toast.error("Failed to load applicants");
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (
    applicationId: number,
    newStatus: string
  ) => {
    try {
      setUpdatingStatus(applicationId);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/jobs/${jobId}/applicants`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId,
          status: newStatus,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setApplicants((prev) =>
          prev.map((app) =>
            app.id === applicationId ? { ...app, status: newStatus } : app
          )
        );
        toast.success("Application status updated successfully");
        fetchApplicants(); // Refresh to update stats
      } else {
        toast.error(data.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-blue-600 bg-blue-50";
    if (score >= 40) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied":
        return "bg-blue-50 text-blue-700";
      case "screening":
        return "bg-yellow-50 text-yellow-700";
      case "interview":
        return "bg-purple-50 text-purple-700";
      case "accepted":
        return "bg-green-50 text-green-700";
      case "rejected":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Applicants for "{jobTitle}"
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">
                  Total Applications
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.scoreDistribution.excellent}
                </div>
                <div className="text-sm text-muted-foreground">
                  Excellent (80%+)
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.scoreDistribution.good}
                </div>
                <div className="text-sm text-muted-foreground">
                  Good (60-79%)
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.averageScore}%</div>
                <div className="text-sm text-muted-foreground">
                  Average Score
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Sorting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="screening">Screening</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Min Score</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={filters.minScore}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    minScore: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div>
              <Label>Max Score</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={filters.maxScore}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    maxScore: parseInt(e.target.value) || 100,
                  }))
                }
              />
            </div>
            <div>
              <Label>Sort By</Label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, sortBy: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appliedAt">Application Date</SelectItem>
                  <SelectItem value="matchingScore">Match Score</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Order</Label>
              <Select
                value={filters.sortOrder}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, sortOrder: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applicants List */}
      {applicants.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No applicants found matching your criteria
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {applicants.map((applicant, index) => (
            <motion.div
              key={applicant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={applicant.applicant.profileImageUrl}
                        />
                        <AvatarFallback>
                          {applicant.applicant.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">
                            {applicant.applicant.name}
                          </h3>
                          {applicant.matchingScore !== undefined && (
                            <Badge
                              className={`${getScoreColor(applicant.matchingScore)} border-0`}
                            >
                              <Star className="h-3 w-3 mr-1" />
                              {applicant.matchingScore}%
                            </Badge>
                          )}
                          <Badge
                            className={`${getStatusColor(applicant.status)} border-0`}
                          >
                            {applicant.status}
                          </Badge>
                        </div>

                        {applicant.applicant.headline && (
                          <p className="text-sm text-muted-foreground">
                            {applicant.applicant.headline}
                          </p>
                        )}

                        {applicant.resumeSummary && (
                          <p className="text-sm">{applicant.resumeSummary}</p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Applied {formatDate(applicant.appliedAt)}
                          </div>
                          {applicant.applicant.branch && (
                            <div className="flex items-center gap-1">
                              <Award className="h-4 w-4" />
                              {applicant.applicant.branch}
                            </div>
                          )}
                          {applicant.referralCode && (
                            <Badge variant="outline" className="text-xs">
                              Referral: {applicant.referralCode}
                            </Badge>
                          )}
                        </div>

                        {applicant.skillsMatch.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {applicant.skillsMatch
                              .slice(0, 5)
                              .map((skill, i) => (
                                <Badge
                                  key={i}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            {applicant.skillsMatch.length > 5 && (
                              <Badge variant="secondary" className="text-xs">
                                +{applicant.skillsMatch.length - 5} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedApplicant(applicant)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              {applicant.applicant.name}
                            </DialogTitle>
                            <DialogDescription>
                              Application for {jobTitle}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedApplicant && (
                            <div className="space-y-6">
                              {/* Detailed view content would go here */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Contact Info */}
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">
                                      Contact Information
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Mail className="h-4 w-4" />
                                      <span className="text-sm">
                                        {selectedApplicant.applicant.email}
                                      </span>
                                    </div>
                                    {selectedApplicant.applicant
                                      .linkedinUrl && (
                                      <div className="flex items-center gap-2">
                                        <ExternalLink className="h-4 w-4" />
                                        <a
                                          href={
                                            selectedApplicant.applicant
                                              .linkedinUrl
                                          }
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm text-blue-600 hover:underline"
                                        >
                                          LinkedIn Profile
                                        </a>
                                      </div>
                                    )}
                                    {selectedApplicant.resumeUrl && (
                                      <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            // Open resume in new tab with proper error handling
                                            try {
                                              window.open(
                                                selectedApplicant.resumeUrl,
                                                "_blank",
                                                "noopener,noreferrer"
                                              );
                                            } catch (error) {
                                              toast.error(
                                                "Unable to open resume. Please check the URL."
                                              );
                                            }
                                          }}
                                          className="text-sm"
                                        >
                                          <ExternalLink className="h-3 w-3 mr-1" />
                                          View Resume
                                        </Button>
                                      </div>
                                    )}
                                    {!selectedApplicant.resumeUrl && (
                                      <div className="flex items-center gap-2 text-muted-foreground">
                                        <FileText className="h-4 w-4" />
                                        <span className="text-sm">
                                          No resume uploaded
                                        </span>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>

                                {/* AI Analysis */}
                                {selectedApplicant.matchingScore !==
                                  undefined && (
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-lg flex items-center gap-2">
                                        <Target className="h-5 w-5" />
                                        AI Match Analysis
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="space-y-4">
                                        <div>
                                          <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">
                                              Overall Match
                                            </span>
                                            <span className="text-lg font-bold">
                                              {selectedApplicant.matchingScore}%
                                            </span>
                                          </div>
                                          <Progress
                                            value={
                                              selectedApplicant.matchingScore
                                            }
                                          />
                                        </div>
                                        {selectedApplicant.experienceMatch && (
                                          <div>
                                            <span className="text-sm font-medium">
                                              Experience Match:
                                            </span>
                                            <p className="text-sm text-muted-foreground mt-1">
                                              {
                                                selectedApplicant.experienceMatch
                                              }
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </CardContent>
                                  </Card>
                                )}
                              </div>

                              {/* Cover Letter */}
                              {selectedApplicant.coverLetter && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">
                                      Cover Letter
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <p className="text-sm whitespace-pre-wrap">
                                      {selectedApplicant.coverLetter}
                                    </p>
                                  </CardContent>
                                </Card>
                              )}

                              {/* Strengths and Weaknesses */}
                              {(selectedApplicant.strengthsWeaknesses.strengths
                                .length > 0 ||
                                selectedApplicant.strengthsWeaknesses.weaknesses
                                  .length > 0) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {selectedApplicant.strengthsWeaknesses
                                    .strengths.length > 0 && (
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg text-green-600">
                                          Strengths
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <ul className="space-y-1">
                                          {selectedApplicant.strengthsWeaknesses.strengths.map(
                                            (strength, i) => (
                                              <li
                                                key={i}
                                                className="text-sm flex items-start gap-2"
                                              >
                                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                                {strength}
                                              </li>
                                            )
                                          )}
                                        </ul>
                                      </CardContent>
                                    </Card>
                                  )}

                                  {selectedApplicant.strengthsWeaknesses
                                    .weaknesses.length > 0 && (
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg text-orange-600">
                                          Areas for Improvement
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <ul className="space-y-1">
                                          {selectedApplicant.strengthsWeaknesses.weaknesses.map(
                                            (weakness, i) => (
                                              <li
                                                key={i}
                                                className="text-sm flex items-start gap-2"
                                              >
                                                <XCircle className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                                                {weakness}
                                              </li>
                                            )
                                          )}
                                        </ul>
                                      </CardContent>
                                    </Card>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Select
                        value={applicant.status}
                        onValueChange={(value) =>
                          updateApplicationStatus(applicant.id, value)
                        }
                        disabled={updatingStatus === applicant.id}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="applied">Applied</SelectItem>
                          <SelectItem value="screening">Screening</SelectItem>
                          <SelectItem value="interview">Interview</SelectItem>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
