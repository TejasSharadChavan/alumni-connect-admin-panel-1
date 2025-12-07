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
import {
  Users,
  TrendingUp,
  Briefcase,
  Calendar,
  MessageSquare,
  Award,
  Target,
  Activity,
} from "lucide-react";
import {
  AreaChart,
  Area,
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

const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function AdminPlatformAnalytics() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/admin/platform-analytics", {
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

  if (loading) {
    return <div className="p-6">Loading platform analytics...</div>;
  }

  if (!analytics) {
    return <div className="p-6">No analytics data available</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive platform health and success metrics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 1. Mentorship Ratio */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-purple-600" />
              <Badge variant="secondary">
                {analytics.mentorshipRatio.coverage}%
              </Badge>
            </div>
            <h3 className="font-semibold text-sm text-muted-foreground">
              Mentorship Coverage
            </h3>
            <p className="text-2xl font-bold">
              {analytics.mentorshipRatio.activeMentorships}
            </p>
            <p className="text-xs text-muted-foreground">
              {analytics.mentorshipRatio.students} students :{" "}
              {analytics.mentorshipRatio.alumni} alumni
            </p>
          </CardContent>
        </Card>

        {/* 2. Engagement Score */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-8 w-8 text-blue-600" />
              <Badge variant="secondary">{analytics.engagement.score}%</Badge>
            </div>
            <h3 className="font-semibold text-sm text-muted-foreground">
              Platform Engagement
            </h3>
            <p className="text-2xl font-bold">{analytics.engagement.perUser}</p>
            <p className="text-xs text-muted-foreground">Actions per user</p>
          </CardContent>
        </Card>

        {/* 3. Referral Success */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-8 w-8 text-green-600" />
              <Badge variant="secondary">
                {analytics.referralSuccess.ratio}%
              </Badge>
            </div>
            <h3 className="font-semibold text-sm text-muted-foreground">
              Referral Success
            </h3>
            <p className="text-2xl font-bold">
              {analytics.referralSuccess.used}/{analytics.referralSuccess.total}
            </p>
            <p className="text-xs text-muted-foreground">Referrals utilized</p>
          </CardContent>
        </Card>

        {/* 4. Job Applications */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Briefcase className="h-8 w-8 text-yellow-600" />
              <Badge variant="secondary">
                {analytics.jobApplicationRatio.avgApplicationsPerJob}
              </Badge>
            </div>
            <h3 className="font-semibold text-sm text-muted-foreground">
              Avg Applications/Job
            </h3>
            <p className="text-2xl font-bold">
              {analytics.jobApplicationRatio.applications}
            </p>
            <p className="text-xs text-muted-foreground">Total applications</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 - Growth */}
      <Card>
        <CardHeader>
          <CardTitle>Student & Alumni Growth (6 Months)</CardTitle>
          <CardDescription>New user registrations over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.growthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="students"
                stackId="1"
                stroke="#3b82f6"
                fill="#3b82f6"
                name="Students"
              />
              <Area
                type="monotone"
                dataKey="alumni"
                stackId="1"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                name="Alumni"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Engagement Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Engagement Heatmap</CardTitle>
            <CardDescription>Platform activity by day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.engagement.heatmap}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="activity" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Event Participation */}
        <Card>
          <CardHeader>
            <CardTitle>Event Participation</CardTitle>
            <CardDescription>Recent events and attendance</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.eventParticipation.recentEvents.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics.eventParticipation.recentEvents}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="attendees" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Average {analytics.eventParticipation.avgAttendance}{" "}
                    attendees per event
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {analytics.eventParticipation.totalEvents} total events
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No events yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trending Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Trending Skills (Campus-wide)</CardTitle>
            <CardDescription>Top 10 most common skills</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.trendingSkills} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="skill" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alumni Influence Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Alumni Influence Distribution</CardTitle>
            <CardDescription>Alumni engagement quality</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.influenceDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percentage }) =>
                    `${category}: ${percentage}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.influenceDistribution.map(
                    (entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    )
                  )}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {analytics.influenceDistribution.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="text-sm">{item.category}</span>
                  </div>
                  <span className="text-sm font-medium">
                    {item.count} alumni
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Content Engagement */}
        <Card>
          <CardHeader>
            <CardTitle>Content Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-6">
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
                    stroke="#10b981"
                    strokeWidth="8"
                    strokeDasharray={`${(analytics.contentEngagement.ratio / 100) * 352} 352`}
                    strokeLinecap="round"
                    transform="rotate(-90 64 64)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-green-600 mb-1" />
                  <span className="text-3xl font-bold">
                    {analytics.contentEngagement.ratio}%
                  </span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {analytics.contentEngagement.engagedPosts} of{" "}
                {analytics.contentEngagement.totalPosts} posts engaged
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mentorship Health */}
        <Card>
          <CardHeader>
            <CardTitle>Mentorship Ecosystem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Students</span>
                  <span className="text-sm font-medium">
                    {analytics.mentorshipRatio.students}
                  </span>
                </div>
                <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600"
                    style={{ width: "70%" }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Alumni</span>
                  <span className="text-sm font-medium">
                    {analytics.mentorshipRatio.alumni}
                  </span>
                </div>
                <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600"
                    style={{ width: "30%" }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Active Mentorships</span>
                  <span className="text-sm font-medium">
                    {analytics.mentorshipRatio.activeMentorships}
                  </span>
                </div>
                <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600"
                    style={{ width: `${analytics.mentorshipRatio.coverage}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-4">
                Ratio: {analytics.mentorshipRatio.ratio}:1 (Students:Alumni)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Job Market Health */}
        <Card>
          <CardHeader>
            <CardTitle>Job Market Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Jobs
                </span>
                <span className="text-2xl font-bold">
                  {analytics.jobApplicationRatio.jobs}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Applications
                </span>
                <span className="text-2xl font-bold">
                  {analytics.jobApplicationRatio.applications}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Avg per Job
                </span>
                <span className="text-2xl font-bold text-green-600">
                  {analytics.jobApplicationRatio.avgApplicationsPerJob}
                </span>
              </div>
              <div className="pt-4 border-t">
                <p className="text-xs text-center text-muted-foreground">
                  {analytics.jobApplicationRatio.avgApplicationsPerJob > 5
                    ? "Healthy job market activity"
                    : "Encourage more applications"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Health Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Award className="h-12 w-12 text-green-600 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold mb-2">
                Platform Health: Excellent 🎉
              </h3>
              <p className="text-muted-foreground mb-4">
                The platform is showing strong engagement across all metrics.
                {analytics.engagement.score >= 70
                  ? " Users are highly active and engaged."
                  : " Continue encouraging user participation."}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {analytics.engagement.score}%
                  </p>
                  <p className="text-xs text-muted-foreground">Engagement</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {analytics.mentorshipRatio.coverage}%
                  </p>
                  <p className="text-xs text-muted-foreground">Mentorship</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {analytics.referralSuccess.ratio}%
                  </p>
                  <p className="text-xs text-muted-foreground">Referrals</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {analytics.contentEngagement.ratio}%
                  </p>
                  <p className="text-xs text-muted-foreground">Content</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
