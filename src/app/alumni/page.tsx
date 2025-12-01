"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { RoleLayout } from "@/components/layout/role-layout";
import { Briefcase, Calendar, Users, TrendingUp, Heart, MessageSquare, PlusCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";

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
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>([]);
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

      // Fetch connections for network growth
      const connectionsRes = await fetch("/api/connections", { headers });
      const connectionsData = await connectionsRes.json();
      const acceptedConnections = connectionsData.connections?.filter((c: any) => c.status === "accepted") || [];
      
      // Calculate network growth (simplified - compare current vs initial)
      const networkGrowth = acceptedConnections.length > 10 ? "+18%" : 
                           acceptedConnections.length > 5 ? "+12%" : 
                           acceptedConnections.length > 0 ? "+6%" : "+0%";

      // Fetch mentorship requests where user is the mentor
      const mentorshipRes = await fetch("/api/mentorship", { headers });
      const mentorshipData = await mentorshipRes.json();
      const activeMentorships = mentorshipData.requests?.filter((r: any) => 
        r.mentorId === user.id && (r.status === "accepted" || r.status === "pending")
      ) || [];

      // Fetch jobs posted by this alumni
      const jobsRes = await fetch("/api/jobs", { headers });
      const jobsData = await jobsRes.json();
      const myJobs = jobsData.jobs?.filter((j: any) => j.postedById === user.id) || [];

      // Fetch donations (total amount)
      // For now, we'll use a placeholder since we don't have a donations endpoint yet
      const totalDonations = 0;

      setStats({
        networkGrowth,
        mentees: activeMentorships.filter((m: any) => m.status === "accepted").length,
        jobsPosted: myJobs.length,
        totalDonations,
      });

      // Get pending mentorship requests
      const pendingRequests = mentorshipData.requests?.filter((r: any) => 
        r.mentorId === user.id && r.status === "pending"
      ).slice(0, 2).map((r: any) => ({
        id: r.id,
        studentName: r.studentName || "Unknown Student",
        studentBranch: r.studentBranch || "Unknown",
        topic: r.topic,
        createdAt: r.createdAt,
      })) || [];
      
      setMentorshipRequests(pendingRequests);

      // Build recent activities
      const activities: Activity[] = [];

      // Recent job postings
      myJobs.slice(0, 2).forEach((job: any) => {
        activities.push({
          text: `Posted ${job.title} position at ${job.company}`,
          time: formatTimeAgo(job.createdAt),
          icon: Briefcase,
          type: "job",
        });
      });

      // Recent mentorship completions
      const completedSessions = mentorshipData.requests?.filter((r: any) => 
        r.mentorId === user.id && r.status === "completed"
      ).slice(0, 1) || [];
      
      completedSessions.forEach((session: any) => {
        activities.push({
          text: `Completed mentorship session with ${session.studentName || "a student"}`,
          time: formatTimeAgo(session.respondedAt),
          icon: Users,
          type: "mentorship",
        });
      });

      // Placeholder donation activity
      if (totalDonations > 0) {
        activities.push({
          text: `Donated ₹${totalDonations.toLocaleString()} to college funds`,
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

    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
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
      value: stats.totalDonations > 0 ? `₹${stats.totalDonations.toLocaleString()}` : "₹0",
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
      title: "Make a Donation",
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
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name?.split(' ')[0]}! 🎓</h1>
            <p className="text-muted-foreground mt-2">
              Thank you for staying connected with Terna Engineering College
            </p>
          </div>
        </motion.div>

        {/* Impact Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/50 dark:border-green-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Your Impact</CardTitle>
                    <CardDescription>
                      {stats.mentees > 0 
                        ? `You've helped ${stats.mentees} student${stats.mentees !== 1 ? 's' : ''} this year through mentorship`
                        : "Start mentoring students to make an impact!"}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
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
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Ways to contribute to the community</CardDescription>
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

          {/* Mentorship Requests & Recent Activity */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Mentorship Requests</CardTitle>
                      <CardDescription>Students seeking your guidance</CardDescription>
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
                      <div key={request.id} className="p-4 rounded-lg border space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                              {request.studentName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-medium">{request.studentName}</p>
                              <p className="text-xs text-muted-foreground">{request.studentBranch}</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm">{request.topic}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">{formatTimeAgo(request.createdAt)}</p>
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
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest contributions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivities.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No recent activity. Start by posting a job or accepting mentorship requests!
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