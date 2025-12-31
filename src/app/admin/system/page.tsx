"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Settings,
  Database,
  Server,
  Shield,
  HardDrive,
  Cpu,
  MemoryStick,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface SystemStats {
  server: {
    status: "online" | "offline" | "maintenance";
    uptime: string;
    responseTime: number;
  };
  database: {
    status: "healthy" | "warning" | "error";
    responseTime: number;
    connections: number;
    size: string;
  };
  performance: {
    cpuUsage: number;
    memoryUsage: number;
    memoryTotal: string;
    diskUsage: number;
    diskTotal: string;
  };
  security: {
    sslStatus: "valid" | "expiring" | "expired";
    sslExpiry: string;
    firewallStatus: "active" | "inactive";
    lastBackup: string;
    twoFactorEnabled: boolean;
  };
  recentEvents: Array<{
    id: number;
    type: "info" | "warning" | "error" | "success";
    message: string;
    timestamp: string;
  }>;
  stats?: {
    totalUsers: number;
    totalPosts: number;
    totalJobs: number;
    totalEvents: number;
    totalApplications: number;
  };
}

export default function SystemPage() {
  const [loading, setLoading] = useState(true);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchSystemStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSystemStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemStats = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch("/api/admin/system-stats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch system stats");
      }

      const data = await response.json();
      setSystemStats(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching system stats:", error);
      toast.error("Failed to load system statistics");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
      case "healthy":
      case "valid":
      case "active":
        return "bg-green-500";
      case "warning":
      case "expiring":
        return "bg-yellow-500";
      case "offline":
      case "error":
      case "expired":
      case "inactive":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return `${diffDays} days ago`;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">System Management</h1>
            <p className="text-muted-foreground">
              Loading system information...
            </p>
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

  if (!systemStats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">System Management</h1>
            <p className="text-red-500">Failed to load system data</p>
          </div>
        </div>
        <Button onClick={fetchSystemStats} className="flex items-center gap-2">
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
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">System Management</h1>
            <p className="text-muted-foreground">
              Monitor system health and manage platform settings
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSystemStats}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Status */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Server Status</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${getStatusColor(systemStats.server.status)}`}
              />
              <Badge variant="outline" className="capitalize">
                {systemStats.server.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Uptime: {systemStats.server.uptime}
            </p>
            <p className="text-xs text-muted-foreground">
              Response: {systemStats.server.responseTime}ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${getStatusColor(systemStats.database.status)}`}
              />
              <Badge variant="outline" className="capitalize">
                {systemStats.database.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Response: {systemStats.database.responseTime}ms
            </p>
            <p className="text-xs text-muted-foreground">
              Connections: {systemStats.database.connections}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemStats.performance.cpuUsage}%
            </div>
            <Progress
              value={systemStats.performance.cpuUsage}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {systemStats.performance.cpuUsage < 50
                ? "Normal load"
                : systemStats.performance.cpuUsage < 80
                  ? "High load"
                  : "Critical load"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory</CardTitle>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemStats.performance.memoryUsage}%
            </div>
            <Progress
              value={systemStats.performance.memoryUsage}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((systemStats.performance.memoryUsage / 100) * 12)} GB
              / {systemStats.performance.memoryTotal}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Statistics */}
      {systemStats.stats && (
        <Card>
          <CardHeader>
            <CardTitle>Platform Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {systemStats.stats.totalUsers}
                </div>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {systemStats.stats.totalPosts}
                </div>
                <p className="text-sm text-muted-foreground">Posts</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {systemStats.stats.totalJobs}
                </div>
                <p className="text-sm text-muted-foreground">Jobs</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {systemStats.stats.totalEvents}
                </div>
                <p className="text-sm text-muted-foreground">Events</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">
                  {systemStats.stats.totalApplications}
                </div>
                <p className="text-sm text-muted-foreground">Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Controls */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Two-Factor Authentication</span>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${systemStats.security.twoFactorEnabled ? "bg-green-500" : "bg-red-500"}`}
                />
                <Badge
                  variant={
                    systemStats.security.twoFactorEnabled
                      ? "default"
                      : "destructive"
                  }
                >
                  {systemStats.security.twoFactorEnabled
                    ? "Enabled"
                    : "Disabled"}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">SSL Certificate</span>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${getStatusColor(systemStats.security.sslStatus)}`}
                />
                <Badge variant="outline" className="capitalize">
                  {systemStats.security.sslStatus}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Firewall Status</span>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${getStatusColor(systemStats.security.firewallStatus)}`}
                />
                <Badge variant="outline" className="capitalize">
                  {systemStats.security.firewallStatus}
                </Badge>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              Security Audit
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Storage Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Database Size</span>
              <span className="text-sm font-medium">
                {systemStats.database.size}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Disk Usage</span>
              <span className="text-sm font-medium">
                {systemStats.performance.diskUsage}%
              </span>
            </div>
            <Progress
              value={systemStats.performance.diskUsage}
              className="mt-2"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm">Last Backup</span>
              <span className="text-sm font-medium">
                {formatTimestamp(systemStats.security.lastBackup)}
              </span>
            </div>
            <Button variant="outline" className="w-full">
              Create Backup
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent System Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemStats.recentEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-4">
                {getEventIcon(event.type)}
                <div className="flex-1">
                  <p className="text-sm font-medium">{event.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(event.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
