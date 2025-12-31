"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart3,
  Users,
  TrendingUp,
  Activity,
  Calendar,
  Briefcase,
  MessageSquare,
  Heart,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d");

  // Mock data - replace with real API calls
  const userGrowthData = [
    { date: "Jan 1", users: 120, newUsers: 15, activeUsers: 95 },
    { date: "Jan 8", users: 145, newUsers: 25, activeUsers: 115 },
    { date: "Jan 15", users: 180, newUsers: 35, activeUsers: 145 },
    { date: "Jan 22", users: 220, newUsers: 40, activeUsers: 180 },
    { date: "Jan 29", users: 265, newUsers: 45, activeUsers: 215 },
    { date: "Feb 5", users: 310, newUsers: 45, activeUsers: 250 },
  ];

  const engagementData = [
    { activity: "Posts", count: 450 },
    { activity: "Comments", count: 1250 },
    { activity: "Connections", count: 680 },
    { activity: "Job Views", count: 2100 },
    { activity: "Event RSVPs", count: 320 },
  ];

  const roleDistribution = [
    { name: "Students", value: 145, color: "#3b82f6" },
    { name: "Alumni", value: 98, color: "#10b981" },
    { name: "Faculty", value: 35, color: "#8b5cf6" },
    { name: "Admin", value: 2, color: "#f59e0b" },
  ];

  const featureUsage = [
    { feature: "Feed", usage: 95 },
    { feature: "Jobs", usage: 78 },
    { feature: "Events", usage: 65 },
    { feature: "Messages", usage: 88 },
    { feature: "Mentorship", usage: 45 },
    { feature: "Projects", usage: 52 },
  ];

  const stats = [
    {
      title: "Total Users",
      value: "280",
      change: "+18%",
      trend: "up",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Active Today",
      value: "165",
      change: "+12%",
      trend: "up",
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Events This Month",
      value: "24",
      change: "+8%",
      trend: "up",
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      title: "Job Postings",
      value: "67",
      change: "+15%",
      trend: "up",
      icon: Briefcase,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
              <p className="text-muted-foreground">
                Comprehensive platform insights and metrics
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
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
                <p
                  className={`text-xs ${stat.trend === "up" ? "text-green-600" : "text-red-600"} flex items-center gap-1 mt-1`}
                >
                  <TrendingUp className="h-3 w-3" />
                  {stat.change} from last period
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* User Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>User Growth Trends</CardTitle>
          <CardDescription>
            Total users, new registrations, and active users over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={userGrowthData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorUsers)"
                name="Total Users"
              />
              <Area
                type="monotone"
                dataKey="activeUsers"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorActive)"
                name="Active Users"
              />
              <Line
                type="monotone"
                dataKey="newUsers"
                stroke="#f59e0b"
                strokeWidth={2}
                name="New Users"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Engagement Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Engagement</CardTitle>
            <CardDescription>
              User activity across different features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="activity" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>User Role Distribution</CardTitle>
            <CardDescription>Breakdown by user type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Feature Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Adoption Rates</CardTitle>
          <CardDescription>
            Percentage of users actively using each feature
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {featureUsage.map((feature) => (
              <div key={feature.feature} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{feature.feature}</span>
                  <span className="text-sm text-muted-foreground">
                    {feature.usage}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${feature.usage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Avg. Session Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18m 42s</div>
            <p className="text-xs text-muted-foreground mt-1">
              ↑ 12% from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,547</div>
            <p className="text-xs text-muted-foreground mt-1">
              ↑ 23% from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Total Donations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹2,45,000</div>
            <p className="text-xs text-muted-foreground mt-1">
              ↑ 8% from last month
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
