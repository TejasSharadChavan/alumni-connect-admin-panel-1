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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RoleLayout } from "@/components/layout/role-layout";
import {
  Award,
  TrendingUp,
  Users,
  Briefcase,
  Heart,
  MessageSquare,
  Target,
  Sparkles,
  ArrowRight,
  Star,
  Send,
  CheckCircle,
  AlertCircle,
  UserPlus,
  FileText,
  Loader2,
  XCircle,
  Clock,
  Copy,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";

interface InfluenceScore {
  total: number;
  percentile: number;
  breakdown: {
    mentorship: { score: number; count: number; maxScore: number };
    jobs: { score: number; count: number; maxScore: number };
    referrals: { score: number; count: number; maxScore: number };
    posts: { score: number; count: number; maxScore: number };
    engagement: { score: number; count: number; maxScore: number };
  };
  nextMilestone: number;
  nextMilestoneLabel: string;
  pointsToNext: number;
}

interface Student {
  id: number;
  name: string;
  email: string;
  branch: string;
  cohort: string;
  skills: string[];
  matchScore?: number;
  readinessScore?: number;
  profileImageUrl?: string;
  headline?: string;
  bio?: string;
  resumeUrl?: string;
  stats?: {
    projectCount: number;
    applicationCount: number;
  };
}

export default function AlumniAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [influenceScore, setInfluenceScore] = useState<InfluenceScore | null>(
    null
  );
  const [recommendedStudents, setRecommendedStudents] = useState<{
    highPriority: Student[];
    goodMatch: Student[];
    potentialMatch: Student[];
    needingHelp: any[];
  }>({
    highPriority: [],
    goodMatch: [],
    potentialMatch: [],
    needingHelp: [],
  });
  const [referralReady, setReferralReady] = useState<{
    highlyReady: Student[];
    ready: Student[];
    emerging: Student[];
    potential: Student[];
    total: number;
  }>({
    highlyReady: [],
    ready: [],
    emerging: [],
    potential: [],
    total: 0,
  });
  const [referralDialogOpen, setReferralDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [generatedReferral, setGeneratedReferral] = useState<any>(null);
  const [referralForm, setReferralForm] = useState({
    company: "",
    position: "",
    description: "",
    maxUses: "10",
    expiresInDays: "30",
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");

      if (!token) {
        toast.error("Please log in to view analytics");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all data with individual error handling
      const [influenceRes, recommendationsRes, referralRes] = await Promise.all(
        [
          fetch("/api/alumni/influence-score", { headers }).catch((err) => {
            console.error("Influence score API failed:", err);
            return null;
          }),
          fetch("/api/alumni/recommended-students", { headers }).catch(
            (err) => {
              console.error("Recommendations API failed:", err);
              return null;
            }
          ),
          fetch("/api/alumni/referral-ready", { headers }).catch((err) => {
            console.error("Referral ready API failed:", err);
            return null;
          }),
        ]
      );

      // Handle influence score
      if (influenceRes && influenceRes.ok) {
        const data = await influenceRes.json();
        setInfluenceScore(data.influenceScore);
      } else if (influenceRes) {
        console.error("Influence score failed:", await influenceRes.text());
        toast.error("Failed to load influence score");
      }

      // Handle recommendations
      if (recommendationsRes && recommendationsRes.ok) {
        const data = await recommendationsRes.json();
        console.log("📊 Recommended Students:", data.recommendations);
        setRecommendedStudents(data.recommendations);
      } else if (recommendationsRes) {
        console.error(
          "Recommendations failed:",
          await recommendationsRes.text()
        );
        toast.error("Failed to load student recommendations");
      }

      // Handle referral ready
      if (referralRes && referralRes.ok) {
        const data = await referralRes.json();
        console.log("📊 Referral Ready Data:", data.referralReady);
        console.log("  - Highly Ready:", data.referralReady.highlyReady.length);
        console.log("  - Ready:", data.referralReady.ready.length);
        console.log("  - Emerging:", data.referralReady.emerging.length);
        setReferralReady(data.referralReady);
      } else if (referralRes) {
        console.error("Referral ready failed:", await referralRes.text());
        toast.error("Failed to load referral-ready students");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMentorshipRequest = async (studentId: number) => {
    toast.info("Redirecting to mentorship page...");
    window.location.href = `/alumni/mentorship?student=${studentId}`;
  };

  const handleAcceptRequest = async (requestId: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/mentorship/request/${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "accepted" }),
      });

      if (!response.ok) {
        throw new Error("Failed to accept request");
      }

      toast.success("Mentorship request accepted!");
      fetchAnalyticsData(); // Refresh data
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("Failed to accept request");
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/mentorship/request/${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "rejected" }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject request");
      }

      toast.success("Request declined");
      fetchAnalyticsData(); // Refresh data
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request");
    }
  };

  const handleReferStudent = async (student: Student) => {
    setSelectedStudent(student);
    setReferralDialogOpen(true);
    setGeneratedReferral(null);
  };

  const handleGenerateReferral = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent) return;

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/alumni/referrals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          company: referralForm.company,
          position: referralForm.position,
          description: referralForm.description,
          maxUses: parseInt(referralForm.maxUses),
          expiresInDays: parseInt(referralForm.expiresInDays),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate referral");
      }

      const data = await response.json();
      setGeneratedReferral(data.referral);
      toast.success("Referral code generated successfully!");
    } catch (error) {
      console.error("Error generating referral:", error);
      toast.error("Failed to generate referral");
    }
  };

  const handleCopyReferral = () => {
    if (!generatedReferral) return;

    const referralText = `🎉 Referral Code for ${referralForm.company}

Position: ${referralForm.position}
Referral Code: ${generatedReferral.code}

${referralForm.description ? `Details: ${referralForm.description}\n\n` : ""}Use this code when applying for the position. Good luck! 🚀`;

    navigator.clipboard.writeText(referralText);
    toast.success("Referral copied to clipboard!");
  };

  const handleCloseReferralDialog = () => {
    setReferralDialogOpen(false);
    setSelectedStudent(null);
    setGeneratedReferral(null);
    setReferralForm({
      company: "",
      position: "",
      description: "",
      maxUses: "10",
      expiresInDays: "30",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-gray-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-50 dark:bg-green-950";
    if (score >= 60) return "bg-blue-50 dark:bg-blue-950";
    if (score >= 40) return "bg-yellow-50 dark:bg-yellow-950";
    return "bg-gray-50 dark:bg-gray-950";
  };

  if (loading) {
    return (
      <RoleLayout role="alumni">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout role="alumni">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Alumni Analytics & Engagement</h1>
          <p className="text-muted-foreground mt-2">
            Track your impact and discover meaningful ways to help students
          </p>
        </div>

        {/* Influence Score Section */}
        {influenceScore && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-2 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/50 dark:to-blue-950/50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        Your Influence Score: {influenceScore.total}
                        <Sparkles className="h-5 w-5 text-yellow-500" />
                      </CardTitle>
                      <CardDescription className="text-base mt-1">
                        You are in the Top {100 - influenceScore.percentile}% of
                        Alumni Helpers!
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-lg px-4 py-2 bg-white/50"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    {influenceScore.percentile}th Percentile
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress to Next Milestone */}
                <div className="p-4 rounded-lg bg-white/50 dark:bg-background/50 border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">
                        Next Milestone: {influenceScore.nextMilestoneLabel}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {influenceScore.pointsToNext} points to go
                    </span>
                  </div>
                  <Progress
                    value={
                      (influenceScore.total / influenceScore.nextMilestone) *
                      100
                    }
                    className="h-3"
                  />
                </div>

                {/* Score Breakdown */}
                <div className="grid gap-3 md:grid-cols-5">
                  {Object.entries(influenceScore.breakdown).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="p-4 rounded-lg bg-white/50 dark:bg-background/50 border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium capitalize">
                            {key}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {value.count}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold">
                            {value.score}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            /{value.maxScore}
                          </span>
                        </div>
                        <Progress
                          value={(value.score / value.maxScore) * 100}
                          className="h-1.5 mt-2"
                        />
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recommendations">
              <Users className="h-4 w-4 mr-2" />
              Smart Recommendations
            </TabsTrigger>
            <TabsTrigger value="help-needed">
              <AlertCircle className="h-4 w-4 mr-2" />
              Students Needing Help
            </TabsTrigger>
            <TabsTrigger value="referrals">
              <Briefcase className="h-4 w-4 mr-2" />
              Referral Center
            </TabsTrigger>
          </TabsList>

          {/* Smart Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Students You Can Meaningfully Help</CardTitle>
                <CardDescription>
                  AI-powered matches based on skills, branch, and career
                  interests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* High Priority Matches */}
                {recommendedStudents.highPriority.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <h3 className="text-lg font-semibold">
                        High Priority Matches (70%+ Match)
                      </h3>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {recommendedStudents.highPriority.map((student) => (
                        <StudentCard
                          key={student.id}
                          student={student}
                          onAction={handleSendMentorshipRequest}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Good Matches */}
                {recommendedStudents.goodMatch.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <h3 className="text-lg font-semibold">
                        Good Matches (50-70% Match)
                      </h3>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {recommendedStudents.goodMatch
                        .slice(0, 4)
                        .map((student) => (
                          <StudentCard
                            key={student.id}
                            student={student}
                            onAction={handleSendMentorshipRequest}
                          />
                        ))}
                    </div>
                  </div>
                )}

                {recommendedStudents.highPriority.length === 0 &&
                  recommendedStudents.goodMatch.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No Recommendations Yet
                      </h3>
                      <p className="text-muted-foreground">
                        Update your profile skills to get better student matches
                      </p>
                    </div>
                  )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Help Needed Tab */}
          <TabsContent value="help-needed" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Students Needing Help</CardTitle>
                <CardDescription>
                  Students who are struggling academically and could benefit
                  from your guidance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recommendedStudents.needingHelp.length > 0 ? (
                  <div className="space-y-4">
                    {recommendedStudents.needingHelp.map((student: any) => (
                      <div
                        key={student.id}
                        className="p-4 rounded-lg border space-y-3 hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarImage src={student.profileImageUrl} />
                            <AvatarFallback>
                              {student.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {student.branch} • {student.cohort}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {student.email}
                            </p>
                          </div>
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Needs Help
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          {student.weaknesses &&
                            student.weaknesses.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-1">
                                  Areas of Concern:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {student.weaknesses.map(
                                    (weakness: string, idx: number) => (
                                      <Badge
                                        key={idx}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {weakness}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          {student.skills && student.skills.length > 0 ? (
                            <div>
                              <p className="text-sm font-medium mb-1">
                                Current Skills:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {student.skills.map(
                                  (skill: string, idx: number) => (
                                    <Badge
                                      key={idx}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {skill}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">
                              No skills listed yet - needs guidance
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Target className="h-3 w-3" />
                              <span>Help Score: {student.needScore}/100</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleSendMentorshipRequest(student.id)
                            }
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Offer Help
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      All Students Doing Well!
                    </h3>
                    <p className="text-muted-foreground">
                      No students currently need urgent academic support
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Referral Center Tab */}
          <TabsContent value="referrals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Referral-Ready Students</CardTitle>
                <CardDescription>
                  Students with strong profiles ready for job referrals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Highly Ready */}
                {referralReady.highlyReady.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Award className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-semibold">
                        Highly Ready (75%+ Score)
                      </h3>
                      <Badge variant="default" className="text-xs bg-green-600">
                        Immediate referral
                      </Badge>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {referralReady.highlyReady.map((student) => (
                        <ReferralCard
                          key={student.id}
                          student={student}
                          onRefer={handleReferStudent}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Ready */}
                {referralReady.ready.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold">
                        Ready (60-75% Score)
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        Good candidates
                      </Badge>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {referralReady.ready.slice(0, 4).map((student) => (
                        <ReferralCard
                          key={student.id}
                          student={student}
                          onRefer={handleReferStudent}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Emerging Students */}
                {referralReady.emerging.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="h-5 w-5 text-orange-600" />
                      <h3 className="text-lg font-semibold">
                        Emerging (50-60% Score)
                      </h3>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {referralReady.emerging.slice(0, 4).map((student) => (
                        <ReferralCard
                          key={student.id}
                          student={student}
                          onRefer={handleReferStudent}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Potential Students */}
                {referralReady.potential &&
                  referralReady.potential.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        <h3 className="text-lg font-semibold">
                          Potential (40-50% Score)
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          Needs guidance
                        </Badge>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        {referralReady.potential.slice(0, 4).map((student) => (
                          <ReferralCard
                            key={student.id}
                            student={student}
                            onRefer={handleReferStudent}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                {referralReady.total === 0 && (
                  <div className="text-center py-12">
                    <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Referral-Ready Students Yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Students are still building their profiles
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Students need: 5+ skills, complete profile, projects, and
                      job applications to be referral-ready
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Referral Generation Dialog */}
      <Dialog open={referralDialogOpen} onOpenChange={setReferralDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate Referral Code</DialogTitle>
            <DialogDescription>
              Create a referral code for {selectedStudent?.name} to use when
              applying for jobs
            </DialogDescription>
          </DialogHeader>

          {!generatedReferral ? (
            <form onSubmit={handleGenerateReferral} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company Name *</Label>
                <Input
                  id="company"
                  value={referralForm.company}
                  onChange={(e) =>
                    setReferralForm({
                      ...referralForm,
                      company: e.target.value,
                    })
                  }
                  placeholder="e.g., Google, Microsoft, Amazon"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position *</Label>
                <Input
                  id="position"
                  value={referralForm.position}
                  onChange={(e) =>
                    setReferralForm({
                      ...referralForm,
                      position: e.target.value,
                    })
                  }
                  placeholder="e.g., Software Engineer, Data Analyst"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={referralForm.description}
                  onChange={(e) =>
                    setReferralForm({
                      ...referralForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Add any additional details or instructions..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxUses">Max Uses</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    value={referralForm.maxUses}
                    onChange={(e) =>
                      setReferralForm({
                        ...referralForm,
                        maxUses: e.target.value,
                      })
                    }
                    min="1"
                    max="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiresInDays">Expires In (Days)</Label>
                  <Input
                    id="expiresInDays"
                    type="number"
                    value={referralForm.expiresInDays}
                    onChange={(e) =>
                      setReferralForm({
                        ...referralForm,
                        expiresInDays: e.target.value,
                      })
                    }
                    min="1"
                    max="365"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleCloseReferralDialog}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Referral
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded-lg border-2 border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <h3 className="text-lg font-semibold">Referral Generated!</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Referral Code
                    </Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 px-4 py-3 bg-white dark:bg-gray-900 rounded-lg text-2xl font-bold tracking-wider border">
                        {generatedReferral.code}
                      </code>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={handleCopyReferral}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Company</Label>
                      <p className="font-medium">{referralForm.company}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Position</Label>
                      <p className="font-medium">{referralForm.position}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Max Uses</Label>
                      <p className="font-medium">{generatedReferral.maxUses}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Expires</Label>
                      <p className="font-medium">
                        {generatedReferral.expiresAt
                          ? new Date(
                              generatedReferral.expiresAt
                            ).toLocaleDateString()
                          : "Never"}
                      </p>
                    </div>
                  </div>

                  {referralForm.description && (
                    <div>
                      <Label className="text-muted-foreground">
                        Description
                      </Label>
                      <p className="text-sm mt-1">{referralForm.description}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Next Steps:</strong> Copy this referral code and send
                  it to {selectedStudent?.name} via messaging. They can use it
                  when applying for the {referralForm.position} position at{" "}
                  {referralForm.company}.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCopyReferral}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Referral
                </Button>
                <Button className="flex-1" onClick={handleCloseReferralDialog}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </RoleLayout>
  );
}

// Student Card Component
function StudentCard({
  student,
  onAction,
}: {
  student: Student;
  onAction: (id: number) => void;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <Avatar>
              <AvatarImage src={student.profileImageUrl} />
              <AvatarFallback>
                {student.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{student.name}</p>
              <p className="text-sm text-muted-foreground">{student.branch}</p>
              {student.headline && (
                <p className="text-xs text-muted-foreground mt-1">
                  {student.headline}
                </p>
              )}
            </div>
          </div>
          {student.matchScore && (
            <Badge
              className={`${student.matchScore >= 70 ? "bg-green-500" : "bg-blue-500"}`}
            >
              {student.matchScore}% Match
            </Badge>
          )}
        </div>

        {student.skills && student.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {student.skills.slice(0, 4).map((skill, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {student.skills.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{student.skills.length - 4}
              </Badge>
            )}
          </div>
        )}

        <Button
          className="w-full"
          size="sm"
          onClick={() => onAction(student.id)}
        >
          <Send className="h-4 w-4 mr-2" />
          Offer Mentorship
        </Button>
      </CardContent>
    </Card>
  );
}

// Referral Card Component
function ReferralCard({
  student,
  onRefer,
}: {
  student: Student;
  onRefer: (student: Student) => void;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <Avatar>
              <AvatarImage src={student.profileImageUrl} />
              <AvatarFallback>
                {student.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{student.name}</p>
              <p className="text-sm text-muted-foreground">{student.branch}</p>
              <p className="text-xs text-muted-foreground">
                Batch {student.cohort}
              </p>
            </div>
          </div>
          {student.readinessScore && (
            <Badge
              className={`${student.readinessScore >= 80 ? "bg-green-500" : "bg-blue-500"}`}
            >
              {student.readinessScore}% Ready
            </Badge>
          )}
        </div>

        {student.stats && (
          <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3 text-muted-foreground" />
              <span>{student.stats.projectCount} Projects</span>
            </div>
            <div className="flex items-center gap-1">
              <Briefcase className="h-3 w-3 text-muted-foreground" />
              <span>{student.stats.applicationCount} Applications</span>
            </div>
          </div>
        )}

        {student.skills && student.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {student.skills.slice(0, 4).map((skill, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          {student.resumeUrl && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => window.open(student.resumeUrl, "_blank")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Resume
            </Button>
          )}
          <Button size="sm" className="flex-1" onClick={() => onRefer(student)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Refer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
