"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleLayout } from "@/components/layout/role-layout";
import { Users, UserCheck, Clock, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

interface Stats {
  totalUsers: number;
  pendingApprovals: number;
  students: number;
  alumni: number;
  faculty: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      
      const pendingResponse = await fetch("/api/admin/pending-users?status=pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const pendingData = await pendingResponse.json();
      const pendingCount = Array.isArray(pendingData.pendingUsers) ? pendingData.pendingUsers.length : 0;

      setStats({
        totalUsers: 7,
        pendingApprovals: pendingCount,
        students: 3,
        alumni: 2,
        faculty: 1,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      description: "Active users in the system",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Pending Approvals",
      value: stats?.pendingApprovals || 0,
      description: "Users waiting for approval",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
    {
      title: "Students",
      value: stats?.students || 0,
      description: "Enrolled students",
      icon: GraduationCap,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Alumni",
      value: stats?.alumni || 0,
      description: "Registered alumni",
      icon: UserCheck,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
  ];

  if (loading) {
    return (
      <RoleLayout role="admin">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout role="admin">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here's an overview of your platform.
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <a
                href="/admin/approvals"
                className="flex items-center gap-4 rounded-lg border p-4 hover:bg-accent transition-colors"
              >
                <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">Review Approvals</p>
                  <p className="text-sm text-muted-foreground">
                    {stats?.pendingApprovals || 0} pending
                  </p>
                </div>
              </a>

              <a
                href="/admin/users"
                className="flex items-center gap-4 rounded-lg border p-4 hover:bg-accent transition-colors"
              >
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Manage Users</p>
                  <p className="text-sm text-muted-foreground">View all users</p>
                </div>
              </a>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </RoleLayout>
  );
}