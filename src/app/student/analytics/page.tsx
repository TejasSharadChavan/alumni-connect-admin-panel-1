"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Users,
  Briefcase,
  Target,
  Award,
  Activity,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
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

export default function StudentAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/student/analytics", {
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
    return <div className="p-6">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="p-6">No analytics data available</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Your Progress & Opportunities</h1>
        <p className="text-muted-foreground">
          Track your growth and discover new opportunities
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 1. Engagement Ratio */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-8 w-8 text-purple-600" />
              <Badge variant="secondary">
                {analytics.engagementRatio.value}%
              </Badge>
            </div>
            <h3 className="font-semibold text-sm text-muted-foreground">
              Engagement Score
            </h3>
            <p className="text-2xl font-bold">
              {analytics.engagementRatio.myEngagement}
            </p>
            <p className="text-xs text-muted-foreground">
              vs avg {analytics.engagementRatio.avgEngagement}
            </p>
            <Progress
              value={analytics.engagementRatio.value}
              className="mt-2"
            />
          </CardContent>
        </Card>

        {/* 2. Referral Support */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-blue-600" />
              <Badge variant="secondary">
                {analytics.referralSupportRatio.value}%
              </Badge>
            </div>
            <h3 className="font-semibold text-sm text-muted-foreground">
              Referral Support
            </h3>
            <p className="text-2xl font-bold">
              {analytics.referralSupportRatio.withReferral}/
              {analytics.referralSupportRatio.total}
            </p>
            <p className="text-xs text-muted-foreground">
              Applications with referrals
            </p>
            <Progress
              value={analytics.referralSupportRatio.value}
              className="mt-2"
            />
          </CardContent>
        </Card>

        {/* 3. Network Strength */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-8 w-8 text-green-600" />
              <Badge variant="secondary">
                +{analytics.connectionRatio.recentGrowth}
              </Badge>
            </div>
            <h3 className="font-semibold text-sm text-muted-foreground">
              Network Connections
            </h3>
            <p className="text-2xl font-bold">
              {analytics.connectionRatio.total}
            </p>
            <p className="text-xs text-muted-foreground">This month growth</p>
          </CardContent>
        </Card>

        {/* 4. Benefit Ratio */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Sparkles className="h-8 w-8 text-yellow-600" />
              <Badge variant="secondary">{analytics.benefitRatio.value}%</Badge>
            </div>
            <h3 className="font-semibold text-sm text-muted-foreground">
              Opportunity Usage
            </h3>
            <p className="text-2xl font-bold">
              {analytics.benefitRatio.taken}/{analytics.benefitRatio.total}
            </p>
            <p className="text-xs text-muted-foreground">Opportunities taken</p>
            <Progress value={analytics.benefitRatio.value} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Engagement Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement Trend (6 Months)</CardTitle>
            <CardDescription>Your activity over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.engagementRatio.trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: "#8b5cf6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Job Application Ratio */}
        <Card>
          <CardHeader>
            <CardTitle>Job Application Activity</CardTitle>
            <CardDescription>Jobs available vs applied</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={[
                  {
                    name: "Available",
                    value: analytics.jobApplicationRatio.available,
                  },
                  {
                    name: "Applied",
                    value: analytics.jobApplicationRatio.applied,
                  },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-center text-sm text-muted-foreground mt-2">
              {analytics.jobApplicationRatio.available -
                analytics.jobApplicationRatio.applied}{" "}
              more jobs to explore!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skill Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Skill Adoption Growth</CardTitle>
            <CardDescription>Your skill development journey</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.skillAdoption.growth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="skills" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">
                Current Skills ({analytics.skillAdoption.current}):
              </p>
              <div className="flex flex-wrap gap-2">
                {analytics.skillAdoption.skills
                  .slice(0, 8)
                  .map((skill: string, idx: number) => (
                    <Badge key={idx} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                {analytics.skillAdoption.skills.length > 8 && (
                  <Badge variant="secondary">
                    +{analytics.skillAdoption.skills.length - 8} more
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connection Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Network Growth (6 Months)</CardTitle>
            <CardDescription>New connections per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.connectionRatio.growth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="connections"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mentor Availability */}
        <Card>
          <CardHeader>
            <CardTitle>Mentor Availability</CardTitle>
            <CardDescription>Support system strength</CardDescription>
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
                    stroke="#8b5cf6"
                    strokeWidth="12"
                    strokeDasharray={`${(analytics.mentorAvailability.ratio / 100) * 440} 440`}
                    strokeLinecap="round"
                    transform="rotate(-90 80 80)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold">
                    {analytics.mentorAvailability.ratio}%
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Coverage
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {analytics.mentorAvailability.totalAlumni}
                </p>
                <p className="text-sm text-muted-foreground">Alumni Mentors</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {analytics.mentorAvailability.hasMentor ? (
                    <CheckCircle className="inline h-8 w-8 text-green-600" />
                  ) : (
                    "0"
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Your Mentors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefit Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Opportunity Utilization</CardTitle>
            <CardDescription>
              How you're benefiting from the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analytics.benefitRatio.breakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, value }) => `${category}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.benefitRatio.breakdown.map(
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
              {analytics.benefitRatio.breakdown.map(
                (item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      <span className="text-sm">{item.category}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {item.value}/{item.max}
                    </span>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Motivational Message */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Award className="h-12 w-12 text-purple-600 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold mb-2">Keep Growing! 🚀</h3>
              <p className="text-muted-foreground">
                You're making great progress!{" "}
                {analytics.benefitRatio.value >= 70
                  ? "You're utilizing the platform excellently!"
                  : analytics.benefitRatio.value >= 40
                    ? "Keep exploring more opportunities to maximize your growth."
                    : "There are many opportunities waiting for you - start exploring!"}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {analytics.benefitRatio.value < 100 && (
                  <>
                    {analytics.benefitRatio.breakdown[0].value <
                      analytics.benefitRatio.breakdown[0].max && (
                      <Badge variant="outline">Find a mentor</Badge>
                    )}
                    {analytics.benefitRatio.breakdown[1].value <
                      analytics.benefitRatio.breakdown[1].max && (
                      <Badge variant="outline">Apply to more jobs</Badge>
                    )}
                    {analytics.benefitRatio.breakdown[2].value <
                      analytics.benefitRatio.breakdown[2].max && (
                      <Badge variant="outline">Attend events</Badge>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
