"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Award,
  Users,
  TrendingUp,
  Target,
  CheckCircle,
  Calendar,
  MessageSquare,
  Sparkles,
  Star,
  AlertCircle,
  Briefcase,
  Send,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import Link from "next/link";

const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

interface Student {
  id: number;
  name: string;
  email: string;
  branch: string;
  cohort: string;
  skills: string[];
  matchScore?: number;
  profileImageUrl?: string;
  headline?: string;
  needScore?: number;
  weaknesses?: string[];
}

export default function AlumniAnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [recommendedStudents, setRecommendedStudents] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
    fetchRecommendations();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/alumni/analytics-enhanced", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      } else {
        toast.error("Failed to load analytics");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/alumni/recommended-students", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendedStudents(data.recommendations);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  const StudentCard = ({ student }: { student: Student }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={student.profileImageUrl} />
            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{student.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {student.branch} • {student.cohort}
                </p>
              </div>
              {student.matchScore && (
                <Badge variant="secondary">{student.matchScore}% Match</Badge>
              )}
            </div>
            {student.headline && (
              <p className="text-sm text-muted-foreground mt-2">
                {student.headline}
              </p>
            )}
            {student.skills && student.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {student.skills.slice(0, 4).map((skill, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {student.skills.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{student.skills.length - 4}
                  </Badge>
                )}
              </div>
            )}
            {student.weaknesses && student.weaknesses.length > 0 && (
              <div className="mt-2 space-y-1">
                {student.weaknesses.map((weakness, idx) => (
                  <p
                    key={idx}
                    className="text-xs text-orange-600 flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {weakness}
                  </p>
                ))}
              </div>
            )}
            <div className="mt-3 flex gap-2">
              <Button size="sm" asChild>
                <Link href={`/alumni/mentorship?student=${student.id}`}>
                  <Send className="w-3 h-3 mr-1" />
                  Offer Mentorship
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div className="p-6">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="p-6">No analytics data available</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Alumni Impact Dashboard</h1>
        <p className="text-muted-foreground">
          Track your influence, view analytics, and discover students to help
        </p>
      </div>

      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="metrics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Impact Metrics
          </TabsTrigger>
          <TabsTrigger value="students">
            <Users className="w-4 h-4 mr-2" />
            Student Recommendations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-6">
          {/* 1. Influence Score Badge */}
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <svg className="w-32 h-32">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="8"
                        strokeDasharray={`${(analytics.influenceScore.total / 100) * 352} 352`}
                        strokeLinecap="round"
                        transform="rotate(-90 64 64)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Award className="w-8 h-8 text-purple-600 mb-1" />
                      <span className="text-3xl font-bold">
                        {analytics.influenceScore.total}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Your Influence Score</h2>
                    <p className="text-muted-foreground">
                      Top {100 - analytics.influenceScore.percentile}% of Alumni
                    </p>
                    <Badge className="mt-2" variant="secondary">
                      {analytics.influenceScore.percentile}th Percentile
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-5 gap-3">
                {Object.entries(analytics.influenceScore.breakdown).map(
                  ([key, value]: [string, any]) => (
                    <div
                      key={key}
                      className="bg-white/50 dark:bg-background/50 rounded-lg p-3"
                    >
                      <p className="text-xs font-medium capitalize mb-1">
                        {key}
                      </p>
                      <p className="text-2xl font-bold">{value.score}</p>
                      <p className="text-xs text-muted-foreground">
                        {value.count} activities
                      </p>
                      <Progress
                        value={(value.score / 30) * 100}
                        className="h-1 mt-2"
                      />
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Users className="h-8 w-8 text-blue-600" />
                  <Badge variant="secondary">
                    {analytics.recommendedStudents}
                  </Badge>
                </div>
                <h3 className="font-semibold text-sm text-muted-foreground">
                  Students to Help
                </h3>
                <p className="text-2xl font-bold">
                  {analytics.recommendedStudents}
                </p>
                <p className="text-xs text-muted-foreground">Smart matches</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <Badge variant="secondary">
                    {analytics.participationRatio.value}%
                  </Badge>
                </div>
                <h3 className="font-semibold text-sm text-muted-foreground">
                  Weekly Activity
                </h3>
                <p className="text-2xl font-bold">
                  {analytics.participationRatio.weeklyTotal}
                </p>
                <p className="text-xs text-muted-foreground">
                  Actions this week
                </p>
                <Progress
                  value={analytics.participationRatio.value}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Target className="h-8 w-8 text-purple-600" />
                  <Badge variant="secondary">
                    {analytics.mentorEngagement.ratio}%
                  </Badge>
                </div>
                <h3 className="font-semibold text-sm text-muted-foreground">
                  Mentor Impact
                </h3>
                <p className="text-2xl font-bold">
                  {analytics.mentorEngagement.studentsHelped}
                </p>
                <p className="text-xs text-muted-foreground">
                  vs avg {analytics.mentorEngagement.avgPerMentor}
                </p>
                <Progress
                  value={analytics.mentorEngagement.ratio}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <Badge variant="secondary">
                    {analytics.referralSuccess.successRate}%
                  </Badge>
                </div>
                <h3 className="font-semibold text-sm text-muted-foreground">
                  Referral Success
                </h3>
                <p className="text-2xl font-bold">
                  {analytics.referralSuccess.successful}/
                  {analytics.referralSuccess.total}
                </p>
                <p className="text-xs text-muted-foreground">Referrals used</p>
                <Progress
                  value={analytics.referralSuccess.successRate}
                  className="mt-2"
                />
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Participation Trend</CardTitle>
                <CardDescription>
                  Your activity over the last 7 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics.participationRatio.weeklyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="activity" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Referral Performance</CardTitle>
                <CardDescription>Success vs pending referrals</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Successful",
                          value: analytics.referralSuccess.successful,
                        },
                        {
                          name: "Pending",
                          value: analytics.referralSuccess.pending,
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#f59e0b" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    {analytics.referralSuccess.successRate}% success rate
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Engagement</CardTitle>
                <CardDescription>Posts receiving interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-8">
                  <div className="relative">
                    <svg className="w-40 h-40">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="12"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="12"
                        strokeDasharray={`${(analytics.contentEngagement.ratio / 100) * 440} 440`}
                        strokeLinecap="round"
                        transform="rotate(-90 80 80)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <MessageSquare className="w-8 h-8 text-blue-600 mb-1" />
                      <span className="text-4xl font-bold">
                        {analytics.contentEngagement.ratio}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {analytics.contentEngagement.totalPosts}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Posts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {analytics.contentEngagement.engagedPosts}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      With Engagement
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event Participation</CardTitle>
                <CardDescription>
                  Attendance at your hosted events
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.eventParticipation.events.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={analytics.eventParticipation.events}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="attendees" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        Average {analytics.eventParticipation.avgAttendance}{" "}
                        attendees per event
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No events hosted yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          {recommendedStudents && (
            <>
              {/* High Priority Matches */}
              {recommendedStudents.highPriority &&
                recommendedStudents.highPriority.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <h2 className="text-xl font-semibold">
                        High Priority Matches (70%+ Match)
                      </h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {recommendedStudents.highPriority.map(
                        (student: Student) => (
                          <StudentCard key={student.id} student={student} />
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Good Matches */}
              {recommendedStudents.goodMatch &&
                recommendedStudents.goodMatch.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <h2 className="text-xl font-semibold">
                        Good Matches (50-69% Match)
                      </h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {recommendedStudents.goodMatch.map((student: Student) => (
                        <StudentCard key={student.id} student={student} />
                      ))}
                    </div>
                  </div>
                )}

              {/* Students Needing Help */}
              {recommendedStudents.needingHelp &&
                recommendedStudents.needingHelp.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      <h2 className="text-xl font-semibold">
                        Students Needing Your Help
                      </h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {recommendedStudents.needingHelp.map(
                        (student: Student) => (
                          <StudentCard key={student.id} student={student} />
                        )
                      )}
                    </div>
                  </div>
                )}

              {(!recommendedStudents.highPriority ||
                recommendedStudents.highPriority.length === 0) &&
                (!recommendedStudents.goodMatch ||
                  recommendedStudents.goodMatch.length === 0) &&
                (!recommendedStudents.needingHelp ||
                  recommendedStudents.needingHelp.length === 0) && (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No student recommendations available yet
                      </p>
                    </CardContent>
                  </Card>
                )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Motivational Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Sparkles className="h-12 w-12 text-purple-600 shrink-0" />
            <div>
              <h3 className="text-xl font-bold mb-2">
                Keep Making an Impact! 🌟
              </h3>
              <p className="text-muted-foreground mb-4">
                {analytics.influenceScore.total >= 70
                  ? "You're a top contributor! Your efforts are making a real difference in students' lives."
                  : analytics.influenceScore.total >= 40
                    ? "Great work! Keep engaging with students to increase your impact."
                    : "Start your journey by mentoring students, posting jobs, or sharing your experiences!"}
              </p>
              <div className="flex flex-wrap gap-2">
                {analytics.mentorEngagement.studentsHelped < 5 && (
                  <Badge variant="outline">Mentor more students</Badge>
                )}
                {analytics.referralSuccess.total < 3 && (
                  <Badge variant="outline">Create referral codes</Badge>
                )}
                {analytics.contentEngagement.ratio < 50 && (
                  <Badge variant="outline">Share more engaging content</Badge>
                )}
                {analytics.eventParticipation.totalEvents === 0 && (
                  <Badge variant="outline">Host an event</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
