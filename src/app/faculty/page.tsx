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
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import {
  Users,
  Calendar,
  FileCheck,
  TrendingUp,
  BarChart3,
  FileText,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface DashboardStats {
  studentsMonitored: number;
  pendingApprovals: number;
  upcomingEvents: number;
  studentEngagement: string;
  approvalRate?: string;
  avgReviewTime?: string;
  monthlyProjects?: number;
  qualityScore?: string;
}

interface PendingApproval {
  id: number;
  studentName: string;
  projectName: string;
  branch: string;
  submittedDate: string;
}

interface Activity {
  text: string;
  time: string;
  icon: any;
  type: string;
}

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    studentsMonitored: 0,
    pendingApprovals: 0,
    upcomingEvents: 0,
    studentEngagement: "0%",
    approvalRate: "0%",
    avgReviewTime: "N/A",
    monthlyProjects: 0,
    qualityScore: "N/A",
  });
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>(
    []
  );
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all data in parallel for faster loading
      const [usersRes, eventsRes, projectsRes] = await Promise.all([
        fetch("/api/users?role=student", { headers }).catch(() => null),
        fetch("/api/events", { headers }).catch(() => null),
        fetch("/api/project-submissions", { headers }).catch(() => null),
      ]);

      // Parse responses in parallel
      const [usersData, eventsData, projectsData] = await Promise.all([
        usersRes?.ok ? usersRes.json() : { users: [] },
        eventsRes?.ok ? eventsRes.json() : { events: [] },
        projectsRes?.ok ? projectsRes.json() : { submissions: [] },
      ]);

      // Filter students by faculty branch and validate data
      const students = (usersData.users || []).filter((student: any) => {
        return (
          student.role === "student" &&
          student.branch === user.branch &&
          student.status === "active" &&
          student.name &&
          student.email &&
          student.branch &&
          student.cohort
        );
      });

      const allEvents = eventsData.events || [];
      const now = new Date();
      const upcomingEvents = allEvents.filter(
        (e: any) => new Date(e.startDate) > now
      );

      // Filter project submissions for faculty's branch students
      const allSubmissions = projectsData.submissions || [];
      const branchSubmissions = allSubmissions.filter(
        (submission: any) => submission.submitterBranch === user.branch
      );

      // Get pending project approvals for faculty's branch
      const pendingProjectApprovals = branchSubmissions.filter(
        (submission: any) => submission.status === "pending"
      ).length;

      // Calculate student engagement based on recent activity
      const activeStudents = students.filter((student: any) => {
        const lastSeen = student.lastSeen ? new Date(student.lastSeen) : null;
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return lastSeen && lastSeen > weekAgo;
      });

      const engagementRate =
        students.length > 0
          ? Math.round((activeStudents.length / students.length) * 100) + "%"
          : "0%";

      // Calculate KPI metrics
      const approvedSubmissions = branchSubmissions.filter(
        (s) => s.status === "approved"
      );
      const rejectedSubmissions = branchSubmissions.filter(
        (s) => s.status === "rejected"
      );
      const totalReviewed =
        approvedSubmissions.length + rejectedSubmissions.length;

      const approvalRate =
        totalReviewed > 0
          ? Math.round((approvedSubmissions.length / totalReviewed) * 100) + "%"
          : "0%";

      // Calculate average review time
      const reviewedWithTime = branchSubmissions.filter(
        (s) => s.reviewedAt && s.submittedAt
      );

      let avgReviewTime = "N/A";
      if (reviewedWithTime.length > 0) {
        const totalHours = reviewedWithTime.reduce(
          (sum: number, submission: any) => {
            const submitted = new Date(submission.submittedAt);
            const reviewed = new Date(submission.reviewedAt);
            const hours =
              (reviewed.getTime() - submitted.getTime()) / (1000 * 60 * 60);
            return sum + hours;
          },
          0
        );
        const avgHours = Math.round(totalHours / reviewedWithTime.length);
        avgReviewTime =
          avgHours < 24 ? `${avgHours}h` : `${Math.round(avgHours / 24)}d`;
      }

      // Monthly projects count
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyProjects = branchSubmissions.filter((submission: any) => {
        const submittedDate = new Date(submission.submittedAt);
        return (
          submittedDate.getMonth() === currentMonth &&
          submittedDate.getFullYear() === currentYear
        );
      }).length;

      // Quality score based on approval rate and student feedback
      const qualityScore =
        totalReviewed > 0
          ? `${Math.round((approvedSubmissions.length / totalReviewed) * 100)}/100`
          : "N/A";

      setStats({
        studentsMonitored: students.length,
        pendingApprovals: pendingProjectApprovals,
        upcomingEvents: upcomingEvents.length,
        studentEngagement: engagementRate,
        approvalRate,
        avgReviewTime,
        monthlyProjects,
        qualityScore,
      });

      // Set pending approvals with actual data from project submissions
      const approvals = branchSubmissions
        .filter((submission: any) => submission.status === "pending")
        .slice(0, 5)
        .map((submission: any) => ({
          id: submission.id,
          studentName: submission.submitterName || "Unknown Student",
          projectName: submission.title || "Untitled Project",
          branch: submission.submitterBranch || user.branch,
          submittedDate: submission.submittedAt
            ? formatTimeAgo(submission.submittedAt)
            : "Recently",
        }));

      setPendingApprovals(approvals);

      // Build recent activities with more comprehensive data
      const activities: Activity[] = [];

      // Recent events organized by faculty
      allEvents
        .filter((event: any) => event.organizerId === user.id)
        .slice(0, 2)
        .forEach((event: any) => {
          activities.push({
            text: `Organized ${event.title}`,
            time: formatTimeAgo(event.createdAt),
            icon: Calendar,
            type: "event",
          });
        });

      // Recent project approvals
      if (approvals.length > 0) {
        activities.push({
          text: `${approvals.length} projects awaiting approval`,
          time: "Pending",
          icon: FileCheck,
          type: "approval",
        });
      }

      // Recent approvals given
      const recentApprovals = branchSubmissions
        .filter((s) => s.reviewedAt && s.reviewedBy === user.id)
        .sort(
          (a, b) =>
            new Date(b.reviewedAt).getTime() - new Date(a.reviewedAt).getTime()
        )
        .slice(0, 2);

      recentApprovals.forEach((approval: any) => {
        activities.push({
          text: `${approval.status === "approved" ? "Approved" : "Reviewed"} "${approval.title}"`,
          time: formatTimeAgo(approval.reviewedAt),
          icon: FileCheck,
          type: "review",
        });
      });

      // Student engagement activity
      if (activeStudents.length > 0) {
        activities.push({
          text: `${activeStudents.length} students active this week`,
          time: "This week",
          icon: Users,
          type: "engagement",
        });
      }

      setRecentActivities(activities.slice(0, 4));
    } catch (error) {
      console.error("Error fetching faculty dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return "Recently";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60)
      return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
    if (diffHours < 24)
      return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    if (diffDays < 7)
      return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
    return date.toLocaleDateString();
  };

  const statsConfig = [
    {
      title: "Students Monitored",
      value: stats.studentsMonitored.toString(),
      description: "In your department",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingApprovals.toString(),
      description: "Project showcases",
      icon: FileCheck,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
    {
      title: "Upcoming Events",
      value: stats.upcomingEvents.toString(),
      description: "This month",
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      title: "Student Engagement",
      value: stats.studentEngagement,
      description: "Active participation",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
  ];

  const quickActions = [
    {
      title: "View Students",
      description: "Monitor student progress and activities",
      icon: Users,
      href: "/faculty/students",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Review Approvals",
      description: "Approve student project showcases",
      icon: FileCheck,
      href: "/faculty/approvals",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
    {
      title: "Manage Events",
      description: "Organize workshops and seminars",
      icon: Calendar,
      href: "/faculty/events",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      title: "Generate Reports",
      description: "Export analytics for reviews",
      icon: BarChart3,
      href: "/faculty/reports",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
  ];

  const handleApproveProject = async (projectId: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `/api/project-submissions/${projectId}/review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: "approve",
            comments: "Project approved by faculty",
          }),
        }
      );

      if (response.ok) {
        toast.success("Project approved successfully!");
        fetchDashboardData(); // Refresh data
      } else {
        toast.error("Failed to approve project");
      }
    } catch (error) {
      console.error("Error approving project:", error);
      toast.error("Failed to approve project");
    }
  };

  const handleRejectProject = async (projectId: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `/api/project-submissions/${projectId}/review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: "reject",
            comments: "Project needs improvement",
          }),
        }
      );

      if (response.ok) {
        toast.success("Project rejected");
        fetchDashboardData(); // Refresh data
      } else {
        toast.error("Failed to reject project");
      }
    } catch (error) {
      console.error("Error rejecting project:", error);
      toast.error("Failed to reject project");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-80 lg:col-span-1" />
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.name}! 👨‍🏫
          </h1>
          <p className="text-muted-foreground mt-1">
            Overview of your department and student activities
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsConfig.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Quick Actions - Takes 1 column */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-1"
        >
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors group"
                >
                  <div className={`p-2 rounded-lg ${action.bgColor}`}>
                    <action.icon className={`h-4 w-4 ${action.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{action.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          {/* Pending Approvals */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pending Approvals</CardTitle>
                    <CardDescription>
                      Projects awaiting your review
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{pendingApprovals.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingApprovals.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No pending approvals at the moment
                  </p>
                ) : (
                  pendingApprovals.map((approval) => (
                    <div
                      key={approval.id}
                      className="p-3 rounded-lg border space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">
                          {approval.studentName}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {approval.branch}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {approval.projectName}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {approval.submittedDate}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectProject(approval.id)}
                            className="h-7 px-3 text-xs"
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApproveProject(approval.id)}
                            className="h-7 px-3 text-xs"
                          >
                            Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Bottom Row - Recent Activity and KPI Metrics */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Card className="h-fit">
                <CardHeader className="pb-4">
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest actions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentActivities.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No recent activity to display
                    </p>
                  ) : (
                    recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-muted shrink-0">
                          <activity.icon className="h-3 w-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">{activity.text}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* KPI Metrics */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Card className="h-fit">
                <CardHeader className="pb-4">
                  <CardTitle>Approval KPIs</CardTitle>
                  <CardDescription>
                    Performance metrics for approvals
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Approval Rate</span>
                    <span className="text-sm font-semibold text-green-600">
                      {stats.approvalRate || "0%"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Avg Review Time</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {stats.avgReviewTime || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Projects This Month
                    </span>
                    <span className="text-sm font-semibold text-purple-600">
                      {stats.monthlyProjects || "0"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Quality Score</span>
                    <span className="text-sm font-semibold text-orange-600">
                      {stats.qualityScore || "N/A"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
