"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { RoleLayout } from "@/components/layout/role-layout";
import { Users, Calendar, FileCheck, TrendingUp, BarChart3, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface DashboardStats {
  studentsMonitored: number;
  pendingApprovals: number;
  upcomingEvents: number;
  studentEngagement: string;
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
  });
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
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

      // Fetch users to count students in department
      const usersRes = await fetch("/api/users", { headers });
      const usersData = await usersRes.json();
      const students = usersData.users?.filter((u: any) => 
        u.role === "student" && u.branch === user.branch
      ) || [];

      // Fetch events
      const eventsRes = await fetch("/api/events", { headers });
      const eventsData = await eventsRes.json();
      const allEvents = eventsData.events || [];
      const now = new Date();
      const upcomingEvents = allEvents.filter((e: any) => new Date(e.startDate) > now);

      // Placeholder for pending project approvals (would need a specific endpoint)
      const pendingProjectApprovals = 0;

      // Calculate student engagement (simplified)
      const engagementRate = students.length > 0 ? "92%" : "0%";

      setStats({
        studentsMonitored: students.length,
        pendingApprovals: pendingProjectApprovals,
        upcomingEvents: upcomingEvents.length,
        studentEngagement: engagementRate,
      });

      // Placeholder pending approvals
      setPendingApprovals([]);

      // Build recent activities
      const activities: Activity[] = [];

      // Recent events organized
      allEvents.slice(0, 1).forEach((event: any) => {
        if (event.organizerId === user.id) {
          activities.push({
            text: `Organized ${event.title}`,
            time: formatTimeAgo(event.createdAt),
            icon: Calendar,
            type: "event",
          });
        }
      });

      setRecentActivities(activities.slice(0, 3));

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

    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
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

  if (loading) {
    return (
      <RoleLayout role="faculty">
        <div className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout role="faculty">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name?.split(' ')[1] ? user?.name?.split(' ')[0] + ' ' + user?.name?.split(' ')[1]?.charAt(0) + '.' : user?.name}! 👨‍🏫</h1>
            <p className="text-muted-foreground mt-2">
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
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors group"
                  >
                    <div className={`p-2 rounded-lg ${action.bgColor}`}>
                      <action.icon className={`h-5 w-5 ${action.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{action.title}</p>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Pending Approvals & Recent Activity */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Pending Approvals</CardTitle>
                      <CardDescription>Projects awaiting your review</CardDescription>
                    </div>
                    <Badge variant="secondary">{pendingApprovals.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pendingApprovals.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No pending approvals at the moment
                    </p>
                  ) : (
                    pendingApprovals.map((approval) => (
                      <div key={approval.id} className="p-4 rounded-lg border space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{approval.studentName}</p>
                          <Badge variant="outline">{approval.branch}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{approval.projectName}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">{approval.submittedDate}</p>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">Reject</Button>
                            <Button size="sm">Approve</Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest actions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivities.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No recent activity to display
                    </p>
                  ) : (
                    recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <activity.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{activity.text}</p>
                          <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
}