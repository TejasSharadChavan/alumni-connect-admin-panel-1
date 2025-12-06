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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  TrendingUp,
  Award,
  Briefcase,
  Calendar,
  MessageSquare,
  Target,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Loader2,
  ArrowLeft,
  BarChart3,
  UserCheck,
  Heart,
  Star,
  Eye,
  ThumbsUp,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [profileRating, setProfileRating] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        toast.error("Please login to view analytics");
        router.push("/login");
        return;
      }
      fetchAnalytics();
    }
  }, [user, authLoading, router]);

  const fetchAnalytics = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const userId = user.id;

      // Fetch analytics with error handling
      const [analyticsRes, ratingRes, recsRes] = await Promise.all([
        fetch(`/api/analytics/dashboard?userId=${userId}&range=30`).catch(
          (e) => {
            console.error("Analytics API error:", e);
            return null;
          }
        ),
        fetch(`/api/ml/profile-rating?userId=${userId}`).catch((e) => {
          console.error("Rating API error:", e);
          return null;
        }),
        fetch(`/api/ml/recommendations?userId=${userId}&type=all`).catch(
          (e) => {
            console.error("Recommendations API error:", e);
            return null;
          }
        ),
      ]);

      // Parse responses safely
      if (analyticsRes && analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        if (analyticsData.success) {
          setAnalytics(analyticsData.analytics);
        } else {
          console.error("Analytics data error:", analyticsData.error);
        }
      }

      if (ratingRes && ratingRes.ok) {
        const ratingData = await ratingRes.json();
        if (ratingData.success) {
          setProfileRating(ratingData.rating);
        } else {
          console.error("Rating data error:", ratingData.error);
        }
      }

      if (recsRes && recsRes.ok) {
        const recsData = await recsRes.json();
        if (recsData.success) {
          setRecommendations(recsData.recommendations);
        } else {
          console.error("Recommendations data error:", recsData.error);
        }
      }

      // Check if we got at least some data
      if (!analyticsRes && !ratingRes && !recsRes) {
        setError("Failed to load analytics data. Please try again.");
        toast.error("Failed to load analytics");
      }
    } catch (error) {
      console.error("Analytics error:", error);
      setError("An unexpected error occurred. Please try again.");
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">
              Error Loading Analytics
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchAnalytics} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please login to view analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/login")}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get dashboard route based on role
  const getDashboardRoute = () => {
    switch (user.role) {
      case "student":
        return "/student";
      case "alumni":
        return "/alumni";
      case "faculty":
        return "/faculty";
      case "admin":
        return "/admin";
      default:
        return "/";
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(getDashboardRoute())}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights powered by machine learning
          </p>
        </div>
        <Button onClick={fetchAnalytics} variant="outline" size="sm">
          <TrendingUp className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Profile Rating Overview */}
      {profileRating && (
        <Card className="mb-6 border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Profile Score
            </CardTitle>
            <CardDescription>
              Your profile strength and engagement metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-5">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {profileRating.overallScore}
                </div>
                <div className="text-sm text-muted-foreground">
                  Overall Score
                </div>
                <Progress value={profileRating.overallScore} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold mb-2">
                  {profileRating.completeness}
                </div>
                <div className="text-sm text-muted-foreground">
                  Completeness
                </div>
                <Progress
                  value={profileRating.completeness * 4}
                  className="mt-2"
                />
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold mb-2">
                  {profileRating.engagement}
                </div>
                <div className="text-sm text-muted-foreground">Engagement</div>
                <Progress
                  value={profileRating.engagement * 4}
                  className="mt-2"
                />
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold mb-2">
                  {profileRating.expertise}
                </div>
                <div className="text-sm text-muted-foreground">Expertise</div>
                <Progress
                  value={profileRating.expertise * 4}
                  className="mt-2"
                />
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold mb-2">
                  {profileRating.networkStrength}
                </div>
                <div className="text-sm text-muted-foreground">Network</div>
                <Progress
                  value={profileRating.networkStrength * 4}
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {analytics && (
            <>
              {/* Main Stats Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Connections"
                  value={analytics.network.totalConnections}
                  change={analytics.network.connectionGrowth}
                  icon={<Users className="h-4 w-4" />}
                />
                <StatCard
                  title="Posts"
                  value={analytics.content.totalPosts}
                  change={analytics.content.recentPosts}
                  icon={<MessageSquare className="h-4 w-4" />}
                />
                <StatCard
                  title="Skills"
                  value={analytics.skills.total}
                  icon={<Target className="h-4 w-4" />}
                />
                <StatCard
                  title="Engagement"
                  value={analytics.engagement.level}
                  icon={<TrendingUp className="h-4 w-4" />}
                  isText
                />
              </div>

              {/* Alumni-Specific Metrics */}
              {user.role === "alumni" && analytics.jobs && (
                <div className="grid gap-6 md:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Jobs Posted
                      </CardTitle>
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analytics.jobs.jobsPosted || 0}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {analytics.jobs.activeJobs || 0} currently active
                      </p>
                      <Progress
                        value={
                          analytics.jobs.jobsPosted
                            ? (analytics.jobs.activeJobs /
                                analytics.jobs.jobsPosted) *
                              100
                            : 0
                        }
                        className="mt-2"
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Applications Received
                      </CardTitle>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analytics.jobs.applicationsReceived || 0}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Avg{" "}
                        {analytics.jobs.jobsPosted
                          ? Math.round(
                              analytics.jobs.applicationsReceived /
                                analytics.jobs.jobsPosted
                            )
                          : 0}{" "}
                        per job
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <ThumbsUp className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-500">
                          High interest
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Impact Score
                      </CardTitle>
                      <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {Math.min(
                          Math.round(
                            (analytics.jobs.applicationsReceived || 0) * 2 +
                              (analytics.mentorship?.activeStudents || 0) * 5 +
                              (analytics.events?.totalAttendees || 0) * 1
                          ),
                          100
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Community contribution
                      </p>
                      <Progress
                        value={Math.min(
                          Math.round(
                            (analytics.jobs.applicationsReceived || 0) * 2 +
                              (analytics.mentorship?.activeStudents || 0) * 5 +
                              (analytics.events?.totalAttendees || 0) * 1
                          ),
                          100
                        )}
                        className="mt-2"
                      />
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Mentorship Impact for Alumni */}
              {user.role === "alumni" && analytics.mentorship && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5" />
                      Mentorship Impact
                    </CardTitle>
                    <CardDescription>
                      Your contribution to student development
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Requests Received
                          </span>
                          <Badge variant="secondary">
                            {analytics.mentorship.requestsReceived || 0}
                          </Badge>
                        </div>
                        <Progress
                          value={
                            analytics.mentorship.requestsReceived
                              ? (analytics.mentorship.requestsReceived / 10) *
                                100
                              : 0
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Active Students
                          </span>
                          <Badge variant="default">
                            {analytics.mentorship.activeStudents || 0}
                          </Badge>
                        </div>
                        <Progress
                          value={
                            analytics.mentorship.activeStudents
                              ? (analytics.mentorship.activeStudents / 5) * 100
                              : 0
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Completed Sessions
                          </span>
                          <Badge variant="outline">
                            {analytics.mentorship.completedSessions || 0}
                          </Badge>
                        </div>
                        <Progress
                          value={
                            analytics.mentorship.completedSessions
                              ? (analytics.mentorship.completedSessions / 10) *
                                100
                              : 0
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Events Impact for Alumni */}
              {user.role === "alumni" && analytics.events && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Events & Community
                    </CardTitle>
                    <CardDescription>
                      Your event organization and reach
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-3xl font-bold text-primary">
                          {analytics.events.eventsOrganized || 0}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Events Organized
                        </div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-3xl font-bold text-blue-600">
                          {analytics.events.totalAttendees || 0}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Total Attendees
                        </div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-3xl font-bold text-green-600">
                          {analytics.events.upcomingEvents || 0}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Upcoming Events
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Student-Specific Metrics */}
              {user.role === "student" && analytics.jobs && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Job Application Progress
                    </CardTitle>
                    <CardDescription>
                      Track your job search journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Applications Submitted
                          </span>
                          <Badge variant="secondary">
                            {analytics.jobs.applicationsSubmitted || 0}
                          </Badge>
                        </div>
                        <Progress
                          value={
                            analytics.jobs.applicationsSubmitted
                              ? (analytics.jobs.applicationsSubmitted / 20) *
                                100
                              : 0
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            In Review
                          </span>
                          <Badge variant="default">
                            {analytics.jobs.applicationsInReview || 0}
                          </Badge>
                        </div>
                        <Progress
                          value={
                            analytics.jobs.applicationsSubmitted
                              ? (analytics.jobs.applicationsInReview /
                                  analytics.jobs.applicationsSubmitted) *
                                100
                              : 0
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Interviews Scheduled
                          </span>
                          <Badge variant="outline">
                            {analytics.jobs.interviewsScheduled || 0}
                          </Badge>
                        </div>
                        <Progress
                          value={
                            analytics.jobs.applicationsSubmitted
                              ? (analytics.jobs.interviewsScheduled /
                                  analytics.jobs.applicationsSubmitted) *
                                100
                              : 0
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="network" className="space-y-6">
          {analytics ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Network Overview</CardTitle>
                  <CardDescription>
                    Your professional network statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Total Connections
                      </span>
                      <Badge variant="secondary">
                        {analytics.network?.totalConnections || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Pending Requests
                      </span>
                      <Badge variant="outline">
                        {analytics.network?.pendingRequests || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        New This Month
                      </span>
                      <Badge variant="default">
                        {analytics.network?.connectionGrowth || 0}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {recommendations?.connections?.topMatches &&
              recommendations.connections.topMatches.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Suggested Connections
                    </CardTitle>
                    <CardDescription>
                      AI-powered recommendations based on your profile
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recommendations.connections.topMatches.map(
                        (match: any) => (
                          <div
                            key={match.userId}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                          >
                            <div className="flex-1">
                              <div className="font-medium">
                                {match.user?.name || "Unknown User"}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {match.user?.headline || "No headline"}
                              </div>
                              {match.reasons && match.reasons.length > 0 && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {match.reasons.join(" • ")}
                                </div>
                              )}
                            </div>
                            <Badge>{match.score}% match</Badge>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Suggested Connections
                    </CardTitle>
                    <CardDescription>
                      AI-powered recommendations based on your profile
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No connection recommendations available yet.</p>
                      <p className="text-sm mt-2">
                        Complete your profile to get personalized suggestions.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Loading network data...</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          {analytics ? (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Posts</span>
                      <span className="font-semibold">
                        {analytics.content?.totalPosts || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Recent Posts (30d)</span>
                      <span className="font-semibold">
                        {analytics.content?.recentPosts || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Avg Posts/Week</span>
                      <span className="font-semibold">
                        {analytics.content?.avgPostsPerWeek || "0.0"}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Skills Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analytics.skills?.byLevel &&
                    Object.keys(analytics.skills.byLevel).length > 0 ? (
                      Object.entries(analytics.skills.byLevel).map(
                        ([level, count]: [string, any]) => (
                          <div key={level} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="capitalize">{level}</span>
                              <span className="font-semibold">{count}</span>
                            </div>
                            <Progress
                              value={
                                analytics.skills.total > 0
                                  ? (count / analytics.skills.total) * 100
                                  : 0
                              }
                            />
                          </div>
                        )
                      )
                    ) : (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        No skills data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Top Skills</CardTitle>
                  <CardDescription>Your most endorsed skills</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics.skills?.topSkills &&
                  analytics.skills.topSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {analytics.skills.topSkills.map((skill: any) => (
                        <Badge
                          key={skill.name}
                          variant="secondary"
                          className="text-sm"
                        >
                          {skill.name} ({skill.endorsements || 0} endorsements)
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No skills added yet.</p>
                      <p className="text-sm mt-2">
                        Add skills to your profile to showcase your expertise.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Loading engagement data...</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          {recommendations ? (
            <>
              {recommendations.jobs && recommendations.jobs.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Recommended Jobs
                    </CardTitle>
                    <CardDescription>
                      Jobs matching your skills and interests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recommendations.jobs.map((job: any) => (
                        <div
                          key={job.id}
                          className="p-4 border rounded-lg hover:bg-accent transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-semibold">{job.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {job.company}
                              </div>
                            </div>
                            <Badge>{job.matchScore}% match</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {job.location}
                          </div>
                          {job.matchingSkills &&
                            job.matchingSkills.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {job.matchingSkills.map((skill: string) => (
                                  <Badge
                                    key={skill}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                user.role === "student" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Recommended Jobs
                      </CardTitle>
                      <CardDescription>
                        Jobs matching your skills and interests
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No job recommendations available yet.</p>
                        <p className="text-sm mt-2">
                          Add skills to your profile to get personalized job
                          suggestions.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              )}

              {recommendations.events && recommendations.events.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Recommended Events
                    </CardTitle>
                    <CardDescription>
                      Events you might be interested in
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recommendations.events.map((event: any) => (
                        <div
                          key={event.id}
                          className="p-4 border rounded-lg hover:bg-accent transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold">{event.title}</div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {new Date(event.startDate).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {event.location}
                              </div>
                            </div>
                            <Badge variant="secondary">{event.category}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Recommended Events
                    </CardTitle>
                    <CardDescription>
                      Events you might be interested in
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No event recommendations available yet.</p>
                      <p className="text-sm mt-2">
                        Check back later for upcoming events.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {recommendations.skills?.trending &&
              recommendations.skills.trending.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Trending Skills
                    </CardTitle>
                    <CardDescription>
                      Popular skills in your network
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recommendations.skills.trending.map((skill: any) => (
                        <div
                          key={skill.skill}
                          className="flex justify-between items-center"
                        >
                          <span className="capitalize">{skill.skill}</span>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={skill.percentage}
                              className="w-24"
                            />
                            <span className="text-sm text-muted-foreground">
                              {skill.percentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Trending Skills
                    </CardTitle>
                    <CardDescription>
                      Popular skills in your network
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No trending skills data available yet.</p>
                      <p className="text-sm mt-2">
                        Connect with more people to see trending skills.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Loading recommendations...</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  icon,
  isText = false,
}: {
  title: string;
  value: number | string;
  change?: number;
  icon: React.ReactNode;
  isText?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && !isText && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            {change > 0 ? (
              <ArrowUp className="h-3 w-3 text-green-500" />
            ) : (
              <ArrowDown className="h-3 w-3 text-red-500" />
            )}
            {change > 0 ? "+" : ""}
            {change} this month
          </p>
        )}
      </CardContent>
    </Card>
  );
}
