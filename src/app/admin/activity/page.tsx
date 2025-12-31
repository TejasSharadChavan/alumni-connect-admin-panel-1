"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  Clock,
  Users,
  TrendingUp,
  RefreshCw,
  Eye,
  MousePointer,
  UserPlus,
  LogIn,
  FileText,
  MessageSquare,
  Calendar,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";

interface ActivityStats {
  realTime: {
    activeUsers: number;
    pageViews: number;
    avgSessionTime: string;
    actionsPerMinute: number;
  };
  trends: {
    userGrowth: number;
    engagementRate: number;
    bounceRate: number;
    conversionRate: number;
  };
  recentActivity: Array<{
    id: number;
    type:
      | "login"
      | "registration"
      | "post"
      | "job"
      | "event"
      | "message"
      | "connection";
    user: string;
    action: string;
    timestamp: string;
    metadata?: any;
  }>;
  topPages: Array<{
    path: string;
    views: number;
    uniqueVisitors: number;
    avgTime: string;
  }>;
  userActivity: {
    hourlyData: Array<{
      hour: string;
      users: number;
      actions: number;
    }>;
  };
}

export default function ActivityPage() {
  const [loading, setLoading] = useState(true);
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(
    null
  );
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchActivityStats();
    // Auto-refresh every 10 seconds for real-time data
    const interval = setInterval(fetchActivityStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchActivityStats = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch("/api/admin/activity-stats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch activity stats");
      }

      const data = await response.json();
      setActivityStats(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching activity stats:", error);
      toast.error("Failed to load activity statistics");
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "login":
        return <LogIn className="h-4 w-4 text-blue-500" />;
      case "registration":
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case "post":
        return <FileText className="h-4 w-4 text-purple-500" />;
      case "job":
        return <Briefcase className="h-4 w-4 text-orange-500" />;
      case "event":
        return <Calendar className="h-4 w-4 text-pink-500" />;
      case "message":
        return <MessageSquare className="h-4 w-4 text-cyan-500" />;
      case "connection":
        return <Users className="h-4 w-4 text-indigo-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Activity Monitor</h1>
            <p className="text-muted-foreground">Loading activity data...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!activityStats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Activity Monitor</h1>
            <p className="text-red-500">Failed to load activity data</p>
          </div>
        </div>
        <Button
          onClick={fetchActivityStats}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Activity Monitor</h1>
            <p className="text-muted-foreground">
              Monitor platform activity and user engagement
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">Live</span>
          </div>
          <span className="text-sm text-muted-foreground">
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchActivityStats}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activityStats.realTime.activeUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +{activityStats.trends.userGrowth}% from last hour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activityStats.realTime.pageViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activityStats.realTime.avgSessionTime}
            </div>
            <p className="text-xs text-muted-foreground">Session duration</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actions/Min</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activityStats.realTime.actionsPerMinute}
            </div>
            <p className="text-xs text-muted-foreground">User interactions</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="pages">Top Pages</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Engagement Rate</span>
                  <span className="text-sm font-medium">
                    {activityStats.trends.engagementRate}%
                  </span>
                </div>
                <Progress value={activityStats.trends.engagementRate} />

                <div className="flex items-center justify-between">
                  <span className="text-sm">Bounce Rate</span>
                  <span className="text-sm font-medium">
                    {activityStats.trends.bounceRate}%
                  </span>
                </div>
                <Progress value={activityStats.trends.bounceRate} />

                <div className="flex items-center justify-between">
                  <span className="text-sm">Conversion Rate</span>
                  <span className="text-sm font-medium">
                    {activityStats.trends.conversionRate}%
                  </span>
                </div>
                <Progress value={activityStats.trends.conversionRate} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">User Growth</span>
                  <Badge variant="outline" className="text-green-600">
                    +{activityStats.trends.userGrowth}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Sessions</span>
                  <span className="text-sm font-medium">
                    {activityStats.realTime.activeUsers}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Peak Activity</span>
                  <span className="text-sm font-medium">
                    {Math.max(
                      ...activityStats.userActivity.hourlyData.map(
                        (d) => d.users
                      )
                    )}{" "}
                    users
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityStats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        by {activity.user} •{" "}
                        {formatTimestamp(activity.timestamp)}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {activity.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityStats.topPages.map((page, index) => (
                  <div
                    key={page.path}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{page.path}</p>
                        <p className="text-xs text-muted-foreground">
                          {page.uniqueVisitors} unique visitors • Avg:{" "}
                          {page.avgTime}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {page.views.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">views</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>24-Hour Activity Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4">
                  Hourly user activity and interactions
                </div>
                {activityStats.userActivity.hourlyData
                  .slice(0, 12)
                  .map((data) => (
                    <div key={data.hour} className="flex items-center gap-4">
                      <span className="text-sm font-medium w-12">
                        {data.hour}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">
                            Users
                          </span>
                          <span className="text-xs font-medium">
                            {data.users}
                          </span>
                        </div>
                        <Progress
                          value={(data.users / 250) * 100}
                          className="h-2"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">
                            Actions
                          </span>
                          <span className="text-xs font-medium">
                            {data.actions}
                          </span>
                        </div>
                        <Progress
                          value={(data.actions / 600) * 100}
                          className="h-2"
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
