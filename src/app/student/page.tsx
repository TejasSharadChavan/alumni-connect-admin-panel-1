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
  Briefcase,
  Calendar,
  Users,
  TrendingUp,
  Award,
  BookOpen,
  Target,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface DashboardStats {
  connections: number;
  applications: number;
  upcomingEvents: number;
  skillsEndorsed: number;
}

interface Connection {
  id: number;
  name: string;
  role: string;
  expertise?: string;
  profileImageUrl?: string;
}

interface Activity {
  text: string;
  time: string;
  icon: any;
  type: string;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    connections: 0,
    applications: 0,
    upcomingEvents: 0,
    skillsEndorsed: 0,
  });
  const [recommendedMentors, setRecommendedMentors] = useState<Connection[]>(
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
      const [connectionsRes, applicationsRes, eventsRes, suggestionsRes] =
        await Promise.all([
          fetch("/api/connections", { headers }),
          fetch("/api/jobs/applications", { headers }),
          fetch("/api/events", { headers }),
          fetch("/api/connections/suggestions", { headers }),
        ]);

      // Parse all responses in parallel
      const [connectionsData, applicationsData, eventsData, suggestionsData] =
        await Promise.all([
          connectionsRes.json(),
          applicationsRes.json(),
          eventsRes.json(),
          suggestionsRes.json(),
        ]);

      const acceptedConnections =
        connectionsData.connections?.filter(
          (c: any) => c.status === "accepted"
        ) || [];
      const myApplications = applicationsData.applications || [];
      const allEvents = eventsData.events || [];
      const now = new Date();
      const upcomingEvents = allEvents.filter(
        (e: any) => new Date(e.startDate) > now
      );

      // Update stats
      setStats({
        connections: acceptedConnections.length,
        applications: myApplications.length,
        upcomingEvents: upcomingEvents.length,
        skillsEndorsed: user.skills?.length || 0,
      });

      // Set recommended mentors
      const alumniSuggestions =
        suggestionsData.suggestions
          ?.filter((s: any) => s.role === "alumni")
          .slice(0, 2) || [];
      setRecommendedMentors(alumniSuggestions);

      // Build recent activities from applications and events
      const activities: Activity[] = [];

      // Recent applications
      myApplications.slice(0, 2).forEach((app: any) => {
        activities.push({
          text: `Applied for ${app.jobTitle || app.job?.title || "a job position"}`,
          time: formatTimeAgo(app.appliedAt),
          icon: Briefcase,
          type: "application",
        });
      });

      // Recent event RSVPs (from events that user has RSVPed to)
      const myRsvps = allEvents.filter((e: any) => e.hasRSVPed).slice(0, 1);
      myRsvps.forEach((event: any) => {
        activities.push({
          text: `Registered for ${event.title}`,
          time: formatTimeAgo(event.createdAt),
          icon: Calendar,
          type: "event",
        });
      });

      // Recent connections
      acceptedConnections.slice(0, 1).forEach((conn: any) => {
        activities.push({
          text: `Connected with ${conn.connectedUser?.name || "someone"}`,
          time: formatTimeAgo(conn.respondedAt),
          icon: Users,
          type: "connection",
        });
      });

      setRecentActivities(
        activities
          .sort((a, b) => {
            // Sort by most recent first
            return 0; // simplified for now
          })
          .slice(0, 3)
      );
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
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
      title: "Network Connections",
      value: stats.connections.toString(),
      change: loading ? "Loading..." : `${stats.connections} total`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Job Applications",
      value: stats.applications.toString(),
      change: loading ? "Loading..." : `${stats.applications} submitted`,
      icon: Briefcase,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Events Registered",
      value: stats.upcomingEvents.toString(),
      change: loading ? "Loading..." : `${stats.upcomingEvents} upcoming`,
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      title: "Skills Listed",
      value: stats.skillsEndorsed.toString(),
      change: loading ? "Loading..." : `${stats.skillsEndorsed} skills`,
      icon: Award,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
  ];

  const quickActions = [
    {
      title: "Browse Jobs",
      description: "Find internships and job opportunities",
      icon: Briefcase,
      href: "/student/jobs",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Upcoming Events",
      description: "Register for workshops and seminars",
      icon: Calendar,
      href: "/student/events",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      title: "Connect with Alumni",
      description: "Expand your professional network",
      icon: Users,
      href: "/student/network",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "AI Analytics",
      description: "View your profile insights and recommendations",
      icon: TrendingUp,
      href: "/analytics",
      color: "text-pink-600",
      bgColor: "bg-pink-50 dark:bg-pink-950",
    },
  ];

  if (loading) {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's what's happening with your profile today
          </p>
        </div>
      </motion.div>

      {/* Profile Completion Banner */}
      {(() => {
        const calculateProfileCompletion = () => {
          if (!user) return 20;
          let score = 20; // Base score for having an account
          if (user.headline) score += 15;
          if (user.bio) score += 20;
          if (user.skills && user.skills.length > 0) {
            score += 10 * Math.min(user.skills.length, 3);
          }
          if (user.linkedinUrl) score += 10;
          if (user.githubUrl) score += 10;
          if (user.profileImageUrl) score += 15;
          return Math.min(100, score);
        };

        const completionScore = calculateProfileCompletion();

        // Only show banner if profile is not 100% complete
        if (completionScore >= 100) return null;

        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/50 dark:border-blue-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-500/10">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        Complete Your Profile
                      </CardTitle>
                      <CardDescription>
                        Your profile is {completionScore}% complete. Add more
                        details to stand out!
                      </CardDescription>
                    </div>
                  </div>
                  <Button asChild>
                    <Link href="/student/profile">Complete Profile</Link>
                  </Button>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        );
      })()}

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
                  {stat.change}
                </p>
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
              <CardDescription>
                Get started with these common tasks
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

        {/* Recommended Mentors & Recent Activity */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Recommended Mentors</CardTitle>
                <CardDescription>
                  Alumni who can guide your career
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendedMentors.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No mentor recommendations available yet
                  </p>
                ) : (
                  recommendedMentors.map((mentor) => (
                    <div
                      key={mentor.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                          {mentor.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="font-medium">{mentor.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {mentor.role}
                          </p>
                          {mentor.expertise && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              {mentor.expertise}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link href="/student/network">Connect</Link>
                      </Button>
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
                <CardDescription>Your latest actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent activity yet. Start by exploring jobs or events!
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
      </div>
    </div>
  );
}
