"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  FileCheck,
  Download,
  Loader2,
  PieChart,
  Activity,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

interface AnalyticsData {
  studentMetrics: {
    totalStudents: number;
    activeStudents: number;
    engagementRate: number;
    averageGrade: number;
  };
  projectMetrics: {
    totalProjects: number;
    approvedProjects: number;
    pendingProjects: number;
    approvalRate: number;
  };
  eventMetrics: {
    totalEvents: number;
    upcomingEvents: number;
    totalAttendees: number;
    averageAttendance: number;
  };
  performanceMetrics: {
    monthlyGrowth: number;
    qualityScore: number;
    responseTime: number;
    satisfactionRate: number;
  };
}

export default function FacultyAnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    studentMetrics: {
      totalStudents: 0,
      activeStudents: 0,
      engagementRate: 0,
      averageGrade: 0,
    },
    projectMetrics: {
      totalProjects: 0,
      approvedProjects: 0,
      pendingProjects: 0,
      approvalRate: 0,
    },
    eventMetrics: {
      totalEvents: 0,
      upcomingEvents: 0,
      totalAttendees: 0,
      averageAttendance: 0,
    },
    performanceMetrics: {
      monthlyGrowth: 0,
      qualityScore: 0,
      responseTime: 0,
      satisfactionRate: 0,
    },
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [user]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch data from multiple endpoints
      const [usersRes, projectsRes, eventsRes] = await Promise.all([
        fetch("/api/users?role=student", { headers }).catch(() => null),
        fetch("/api/project-submissions", { headers }).catch(() => null),
        fetch("/api/events", { headers }).catch(() => null),
      ]);

      const [usersData, projectsData, eventsData] = await Promise.all([
        usersRes?.ok ? usersRes.json() : { users: [] },
        projectsRes?.ok ? projectsRes.json() : { submissions: [] },
        eventsRes?.ok ? eventsRes.json() : { events: [] },
      ]);

      // Filter data for faculty's branch
      const students = (usersData.users || []).filter(
        (student: any) =>
          student.role === "student" &&
          student.branch === user?.branch &&
          student.status === "active"
      );

      const projects = (projectsData.submissions || []).filter(
        (project: any) => project.submitterBranch === user?.branch
      );

      const events = (eventsData.events || []).filter(
        (event: any) =>
          event.organizerId === user?.id || event.branch === user?.branch
      );

      // Calculate student metrics
      const activeStudents = students.filter((student: any) => {
        const lastSeen = student.lastSeen ? new Date(student.lastSeen) : null;
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return lastSeen && lastSeen > weekAgo;
      });

      const engagementRate =
        students.length > 0
          ? Math.round((activeStudents.length / students.length) * 100)
          : 0;

      // Calculate project metrics
      const approvedProjects = projects.filter((p) => p.status === "approved");
      const pendingProjects = projects.filter((p) => p.status === "pending");
      const approvalRate =
        projects.length > 0
          ? Math.round((approvedProjects.length / projects.length) * 100)
          : 0;

      // Calculate event metrics
      const now = new Date();
      const upcomingEvents = events.filter((e) => new Date(e.startDate) > now);
      const totalAttendees = events.reduce(
        (sum, e) => sum + (e.rsvpCount || 0),
        0
      );
      const averageAttendance =
        events.length > 0 ? Math.round(totalAttendees / events.length) : 0;

      // Calculate performance metrics
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const currentMonthProjects = projects.filter((p) => {
        const date = new Date(p.submittedAt);
        return (
          date.getMonth() === currentMonth && date.getFullYear() === currentYear
        );
      }).length;

      const lastMonthProjects = projects.filter((p) => {
        const date = new Date(p.submittedAt);
        return (
          date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear
        );
      }).length;

      const monthlyGrowth =
        lastMonthProjects > 0
          ? Math.round(
              ((currentMonthProjects - lastMonthProjects) / lastMonthProjects) *
                100
            )
          : currentMonthProjects > 0
            ? 100
            : 0;

      setAnalytics({
        studentMetrics: {
          totalStudents: students.length,
          activeStudents: activeStudents.length,
          engagementRate,
          averageGrade: 85, // This would come from actual grade data
        },
        projectMetrics: {
          totalProjects: projects.length,
          approvedProjects: approvedProjects.length,
          pendingProjects: pendingProjects.length,
          approvalRate,
        },
        eventMetrics: {
          totalEvents: events.length,
          upcomingEvents: upcomingEvents.length,
          totalAttendees,
          averageAttendance,
        },
        performanceMetrics: {
          monthlyGrowth,
          qualityScore: approvalRate,
          responseTime: 24, // This would come from actual response time data
          satisfactionRate: 92, // This would come from feedback data
        },
      });
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const data = {
      generatedAt: new Date().toISOString(),
      faculty: user?.name,
      branch: user?.branch,
      analytics,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `faculty-analytics-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Analytics data exported successfully!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your faculty performance and student
            engagement
          </p>
        </div>
        <Button onClick={exportData} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Performance Indicators */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Students
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.studentMetrics.totalStudents}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analytics.studentMetrics.activeStudents} active this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Engagement Rate
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.studentMetrics.engagementRate}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Student participation rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Approval Rate
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.projectMetrics.approvalRate}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Project approval success rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Monthly Growth
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.performanceMetrics.monthlyGrowth > 0 ? "+" : ""}
                  {analytics.performanceMetrics.monthlyGrowth}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Compared to last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Summary */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
                <CardDescription>Key metrics overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Quality Score</span>
                  <Badge variant="default">
                    {analytics.performanceMetrics.qualityScore}/100
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Response Time</span>
                  <Badge variant="secondary">
                    {analytics.performanceMetrics.responseTime}h
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Satisfaction Rate</span>
                  <Badge variant="outline">
                    {analytics.performanceMetrics.satisfactionRate}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Average Grade</span>
                  <Badge variant="default">
                    {analytics.studentMetrics.averageGrade}/100
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity Breakdown</CardTitle>
                <CardDescription>
                  Distribution of your activities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm">Project Reviews</span>
                  </div>
                  <span className="text-sm font-medium">
                    {analytics.projectMetrics.totalProjects}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm">Events Organized</span>
                  </div>
                  <span className="text-sm font-medium">
                    {analytics.eventMetrics.totalEvents}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-sm">Students Mentored</span>
                  </div>
                  <span className="text-sm font-medium">
                    {analytics.studentMetrics.totalStudents}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-sm">Event Attendees</span>
                  </div>
                  <span className="text-sm font-medium">
                    {analytics.eventMetrics.totalAttendees}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Students</CardDescription>
                <CardTitle className="text-3xl">
                  {analytics.studentMetrics.totalStudents}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Active Students</CardDescription>
                <CardTitle className="text-3xl">
                  {analytics.studentMetrics.activeStudents}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Engagement Rate</CardDescription>
                <CardTitle className="text-3xl">
                  {analytics.studentMetrics.engagementRate}%
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Projects</CardDescription>
                <CardTitle className="text-3xl">
                  {analytics.projectMetrics.totalProjects}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Approved</CardDescription>
                <CardTitle className="text-3xl">
                  {analytics.projectMetrics.approvedProjects}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Pending</CardDescription>
                <CardTitle className="text-3xl">
                  {analytics.projectMetrics.pendingProjects}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Approval Rate</CardDescription>
                <CardTitle className="text-3xl">
                  {analytics.projectMetrics.approvalRate}%
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Events</CardDescription>
                <CardTitle className="text-3xl">
                  {analytics.eventMetrics.totalEvents}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Upcoming</CardDescription>
                <CardTitle className="text-3xl">
                  {analytics.eventMetrics.upcomingEvents}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Attendees</CardDescription>
                <CardTitle className="text-3xl">
                  {analytics.eventMetrics.totalAttendees}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Avg Attendance</CardDescription>
                <CardTitle className="text-3xl">
                  {analytics.eventMetrics.averageAttendance}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
