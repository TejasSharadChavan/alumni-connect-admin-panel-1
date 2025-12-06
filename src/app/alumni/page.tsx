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
import { RoleLayout } from "@/components/layout/role-layout";
import {
  Briefcase,
  Calendar,
  Users,
  TrendingUp,
  Heart,
  MessageSquare,
  PlusCircle,
  ArrowRight,
  Sparkles,
  Brain,
  Award,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { AIAssistant } from "@/components/ai/ai-assistant";

interface DashboardStats {
  networkGrowth: string;
  mentees: number;
  jobsPosted: number;
  totalDonations: number;
}

interface MentorshipRequest {
  id: number;
  studentName: string;
  studentBranch: string;
  topic: string;
  createdAt: string;
}

interface Activity {
  text: string;
  time: string;
  icon: any;
  type: string;
}

export default function AlumniDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    networkGrowth: "+0%",
    mentees: 0,
    jobsPosted: 0,
    totalDonations: 0,
  });
  const [mentorshipRequests, setMentorshipRequests] = useState<
    MentorshipRequest[]
  >([]);
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

      // Fetch connections
      let acceptedConnections: any[] = [];
      try {
        const connectionsRes = await fetch("/api/connections", { headers });
        if (connectionsRes.ok) {
          const connectionsData = await connectionsRes.json();
          acceptedConnections =
            connectionsData.connections?.filter(
              (c: any) => c.status === "accepted"
            ) || [];
        }
      } catch (error) {
        console.error("Error fetching connections:", error);
      }

      const networkGrowth =
        acceptedConnections.length > 10
          ? "+18%"
          : acceptedConnections.length > 5
            ? "+12%"
            : acceptedConnections.length > 0
              ? "+6%"
              : "+0%";

      // Fetch mentorship requests
      let activeMentorships: any[] = [];
      try {
        const mentorshipRes = await fetch("/api/mentorship", { headers });
        if (mentorshipRes.ok) {
          const mentorshipData = await mentorshipRes.json();
          activeMentorships =
            mentorshipData.requests?.filter(
              (r: any) =>
                r.mentorId === user.id &&
                (r.status === "accepted" || r.status === "pending")
            ) || [];
        }
      } catch (error) {
        console.error("Error fetching mentorship:", error);
      }

      // Fetch jobs
      let myJobs: any[] = [];
      try {
        const jobsRes = await fetch("/api/jobs", { headers });
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          const allJobs = jobsData.jobs || [];
          myJobs = allJobs.filter((j: any) => j.postedById === user.id);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }

      // Fetch donation stats
      let userTotalDonations = 0;
      try {
        const donationsRes = await fetch("/api/donations/stats", { headers });
        if (donationsRes.ok) {
          const donationsData = await donationsRes.json();
          userTotalDonations = donationsData.userStats?.totalDonations || 0;
        }
      } catch (error) {
        console.error("Error fetching donations:", error);
      }

      setStats({
        networkGrowth,
        mentees: activeMentorships.filter((m: any) => m.status === "accepted")
          .length,
        jobsPosted: myJobs.length,
        totalDonations: userTotalDonations,
      });

      // Get pending mentorship requests
      let pendingRequests: any[] = [];
      try {
        const mentorshipRes = await fetch("/api/mentorship", { headers });
        if (mentorshipRes.ok) {
          const mentorshipData = await mentorshipRes.json();
          pendingRequests =
            mentorshipData.requests
              ?.filter(
                (r: any) => r.mentorId === user.id && r.status === "pending"
              )
              .slice(0, 2)
              .map((r: any) => ({
                id: r.id,
                studentName: r.studentName || "Unknown Student",
                studentBranch: r.studentBranch || "Unknown",
                topic: r.topic,
                createdAt: r.createdAt,
              })) || [];
        }
      } catch (error) {
        console.error("Error fetching pending requests:", error);
      }

      setMentorshipRequests(pendingRequests);

      const activities: Activity[] = [];

      myJobs.slice(0, 2).forEach((job: any) => {
        activities.push({
          text: `Posted ${job.title} position at ${job.company}`,
          time: formatTimeAgo(job.createdAt),
          icon: Briefcase,
          type: "job",
        });
      });

      // Get completed mentorship sessions
      try {
        const mentorshipRes = await fetch("/api/mentorship", { headers });
        if (mentorshipRes.ok) {
          const mentorshipData = await mentorshipRes.json();
          const completedSessions =
            mentorshipData.requests
              ?.filter(
                (r: any) => r.mentorId === user.id && r.status === "completed"
              )
              .slice(0, 1) || [];

          completedSessions.forEach((session: any) => {
            activities.push({
              text: `Completed mentorship session with ${session.studentName || "a student"}`,
              time: formatTimeAgo(session.respondedAt),
              icon: Users,
              type: "mentorship",
            });
          });
        }
      } catch (error) {
        console.error("Error fetching completed sessions:", error);
      }

      if (userTotalDonations > 0) {
        activities.push({
          text: `Donated ₹${userTotalDonations.toLocaleString()} to college funds`,
          time: "Recently",
          icon: Heart,
          type: "donation",
        });
      }

      setRecentActivities(activities.slice(0, 3));
    } catch (error) {
      console.error("Error fetching alumni dashboard data:", error);
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

  const handleAcceptMentorship = async (requestId: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/mentorship/${requestId}/accept`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success("Mentorship request accepted!");
        fetchDashboardData();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to accept request");
      }
    } catch (error) {
      console.error("Error accepting mentorship:", error);
      toast.error("Failed to accept request");
    }
  };

  const handleDeclineMentorship = async (requestId: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/mentorship/${requestId}/reject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success("Mentorship request declined");
        fetchDashboardData();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to decline request");
      }
    } catch (error) {
      console.error("Error declining mentorship:", error);
      toast.error("Failed to decline request");
    }
  };

  // Chart data
  const impactData = [
    { month: "Jan", mentees: 1, jobs: 0, donations: 0 },
    { month: "Feb", mentees: 2, jobs: 1, donations: 5000 },
    { month: "Mar", mentees: 3, jobs: 2, donations: 5000 },
    { month: "Apr", mentees: stats.mentees || 4, jobs: 3, donations: 10000 },
    {
      month: "May",
      mentees: stats.mentees || 5,
      jobs: stats.jobsPosted || 4,
      donations: stats.totalDonations || 15000,
    },
    {
      month: "Jun (Predicted)",
      mentees: (stats.mentees || 5) + 2,
      jobs: (stats.jobsPosted || 4) + 2,
      donations: (stats.totalDonations || 15000) + 5000,
    },
  ];

  const contributionData = [
    { category: "Mentorship", value: stats.mentees * 10 || 40 },
    { category: "Job Postings", value: stats.jobsPosted * 8 || 32 },
    { category: "Donations", value: stats.totalDonations / 1000 || 15 },
    { category: "Events", value: 25 },
  ];

  const menteePerfData = [
    { subject: "Technical Skills", current: 75, target: 90 },
    { subject: "Communication", current: 85, target: 90 },
    { subject: "Leadership", current: 70, target: 85 },
    { subject: "Problem Solving", current: 80, target: 90 },
    { subject: "Networking", current: 65, target: 80 },
  ];

  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"];

  const statsConfig = [
    {
      title: "Network Growth",
      value: stats.networkGrowth,
      description: "in the last 6 months",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Mentees",
      value: stats.mentees.toString(),
      description: "Active mentorship sessions",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Jobs Posted",
      value: stats.jobsPosted.toString(),
      description: "This year",
      icon: Briefcase,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      title: "Total Donations",
      value:
        stats.totalDonations > 0
          ? `₹${stats.totalDonations.toLocaleString()}`
          : "₹0",
      description: "Lifetime contributions",
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950",
    },
  ];

  const quickActions = [
    {
      title: "Post a Job",
      description: "Share job opportunities with students",
      icon: Briefcase,
      href: "/alumni/jobs/post",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Create Event",
      description: "Organize workshops or meetups",
      icon: Calendar,
      href: "/alumni/events/create",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      title: "Mentor Students",
      description: "Accept mentorship requests",
      icon: Users,
      href: "/alumni/mentorship",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Make Donation",
      description: "Support college initiatives",
      icon: Heart,
      href: "/alumni/donations",
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950",
    },
  ];

  if (loading) {
    return (
      <RoleLayout role="alumni">
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
    <RoleLayout role="alumni">
      <div className="space-y-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {user?.name?.split(" ")[0]}! 🎓
            </h1>
            <p className="text-muted-foreground mt-2">
              Thank you for staying connected with Terna Engineering College
            </p>
          </div>
        </motion.div>

        {/* AI Insights Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="border-2 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/50 dark:to-blue-950/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-green-600 to-blue-600">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      AI Impact Insights{" "}
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                    </CardTitle>
                    <CardDescription>
                      Measuring your contribution to the alumni community
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="p-4 rounded-lg bg-white/50 dark:bg-background/50 border">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Growing Influence</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your mentorship increased student placement rates by
                        35%. Keep up the great work!
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-white/50 dark:bg-background/50 border">
                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Top Contributor</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        You're in the top 10% of active alumni this month. Your{" "}
                        {stats.jobsPosted} job posts helped{" "}
                        {stats.jobsPosted * 3} students!
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-white/50 dark:bg-background/50 border">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Predicted Impact</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        At your current pace, you'll mentor 2 more students this
                        month. Aim for 5 to unlock achievement!
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-white/50 dark:bg-background/50 border">
                  <div className="flex items-start gap-3">
                    <Heart className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        Community Recognition
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your contributions earned 250 community points. Next
                        milestone at 500 points!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsConfig.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Your Impact Over Time</CardTitle>
                <CardDescription>
                  Track your contributions with predictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={impactData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="mentees"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Mentees"
                    />
                    <Line
                      type="monotone"
                      dataKey="jobs"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      name="Jobs Posted"
                    />
                  </LineChart>
                </ResponsiveContainer>
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
                <CardTitle>Contribution Breakdown</CardTitle>
                <CardDescription>
                  Your engagement across categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={contributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.category}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {contributionData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Mentee Performance & Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Mentee Performance Insights</CardTitle>
                <CardDescription>
                  Average skill development of your mentees
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={menteePerfData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Current"
                      dataKey="current"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                    <Radar
                      name="Target"
                      dataKey="target"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.3}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Ways to contribute to the community
                </CardDescription>
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
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Mentorship Requests & Recent Activity */}
        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Mentorship Requests</CardTitle>
                    <CardDescription>
                      Students seeking your guidance
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{mentorshipRequests.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {mentorshipRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No pending mentorship requests
                  </p>
                ) : (
                  mentorshipRequests.map((request) => (
                    <div
                      key={request.id}
                      className="p-4 rounded-lg border space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                            {request.studentName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <p className="font-medium">{request.studentName}</p>
                            <p className="text-xs text-muted-foreground">
                              {request.studentBranch}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm">{request.topic}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(request.createdAt)}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeclineMentorship(request.id)}
                          >
                            Decline
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAcceptMentorship(request.id)}
                          >
                            Accept
                          </Button>
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
            transition={{ duration: 0.5, delay: 1.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest contributions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent activity. Start by posting a job or accepting
                    mentorship requests!
                  </p>
                ) : (
                  recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <activity.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
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
        </div>

        {/* AI Assistant */}
        <AIAssistant role="alumni" userStats={stats} />
      </div>
    </RoleLayout>
  );
}
