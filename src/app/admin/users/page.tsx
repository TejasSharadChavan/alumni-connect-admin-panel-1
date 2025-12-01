"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users as UsersIcon } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  branch?: string;
  cohort?: string;
  yearOfPassing?: number;
  department?: string;
}

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      
      // For now, we'll create a simple placeholder
      // In a real app, you'd have a GET /api/admin/users endpoint
      setUsers([
        {
          id: 1,
          name: "Dr. Rajesh Kumar",
          email: "admin@terna.ac.in",
          role: "admin",
          status: "active",
          department: "Administration",
        },
        {
          id: 2,
          name: "Priya Sharma",
          email: "priya.sharma@terna.ac.in",
          role: "student",
          status: "active",
          branch: "Computer Engineering",
          cohort: "2023-2024",
        },
        {
          id: 3,
          name: "Arjun Patel",
          email: "arjun.patel@terna.ac.in",
          role: "student",
          status: "active",
          branch: "Electronics Engineering",
          cohort: "2024-2025",
        },
        {
          id: 5,
          name: "Rahul Kapoor",
          email: "rahul.kapoor@gmail.com",
          role: "alumni",
          status: "active",
          branch: "Computer Engineering",
          yearOfPassing: 2020,
        },
        {
          id: 6,
          name: "Meera Joshi",
          email: "meera.joshi@yahoo.com",
          role: "alumni",
          status: "active",
          branch: "Electronics Engineering",
          yearOfPassing: 2018,
        },
        {
          id: 7,
          name: "Prof. Amit Verma",
          email: "amit.verma@terna.ac.in",
          role: "faculty",
          status: "active",
          department: "Computer Engineering",
        },
      ]);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500 hover:bg-red-600";
      case "student":
        return "bg-blue-500 hover:bg-blue-600";
      case "alumni":
        return "bg-green-500 hover:bg-green-600";
      case "faculty":
        return "bg-purple-500 hover:bg-purple-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: users.length,
    students: users.filter((u) => u.role === "student").length,
    alumni: users.filter((u) => u.role === "alumni").length,
    faculty: users.filter((u) => u.role === "faculty").length,
    active: users.filter((u) => u.status === "active").length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-2">View and manage all registered users</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <UsersIcon className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">{stats.active} active</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <div className="h-4 w-4 rounded bg-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.students}</div>
              <p className="text-xs text-muted-foreground">Enrolled students</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alumni</CardTitle>
              <div className="h-4 w-4 rounded bg-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.alumni}</div>
              <p className="text-xs text-muted-foreground">Registered alumni</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faculty</CardTitle>
              <div className="h-4 w-4 rounded bg-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.faculty}</div>
              <p className="text-xs text-muted-foreground">Faculty members</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Users Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Users ({filteredUsers.length})</CardTitle>
                <CardDescription>Complete list of registered users</CardDescription>
              </div>
              <div className="relative w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-sm">{user.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusBadgeColor(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.branch && `Branch: ${user.branch}`}
                        {user.cohort && `, ${user.cohort}`}
                        {user.yearOfPassing && `Year: ${user.yearOfPassing}`}
                        {user.department && `Dept: ${user.department}`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
