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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserCheck,
  Search,
  Eye,
  Briefcase,
  GraduationCap,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Link from "next/link";
import { EditUserDialog } from "@/components/admin/EditUserDialog";

interface Alumni {
  id: number;
  name: string;
  email: string;
  branch: string;
  yearOfPassing: number;
  headline?: string;
  status: string;
}

export default function AlumniManagementPage() {
  const [loading, setLoading] = useState(true);
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState<Alumni | null>(null);

  const handleEditAlumni = (alumnus: Alumni) => {
    setSelectedAlumni(alumnus);
    setEditDialogOpen(true);
  };

  const handleDeleteAlumni = async (alumniId: number, alumniName: string) => {
    if (
      !confirm(
        `Are you sure you want to deactivate ${alumniName}? This will set their status to inactive.`
      )
    )
      return;

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/admin/users/${alumniId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to deactivate alumni");

      toast.success("Alumni deactivated successfully");
      fetchAlumni();
    } catch (error) {
      console.error("Error deactivating alumni:", error);
      toast.error("Failed to deactivate alumni");
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/users?role=alumni", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAlumni(data.users || []);
      }
    } catch (error) {
      console.error("Error fetching alumni:", error);
      toast.error("Failed to load alumni");
    } finally {
      setLoading(false);
    }
  };

  const filteredAlumni = alumni.filter((alumnus) => {
    const matchesSearch =
      alumnus.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alumnus.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch =
      branchFilter === "all" || alumnus.branch === branchFilter;
    const matchesYear =
      yearFilter === "all" || alumnus.yearOfPassing?.toString() === yearFilter;
    return matchesSearch && matchesBranch && matchesYear;
  });

  const branches = Array.from(
    new Set(alumni.map((a) => a.branch).filter(Boolean))
  );
  const years = Array.from(
    new Set(alumni.map((a) => a.yearOfPassing).filter(Boolean))
  ).sort((a, b) => b - a);

  const stats = {
    total: alumni.length,
    active: alumni.filter((a) => a.status === "active").length,
    branches: branches.length,
    recentYear: years[0] || new Date().getFullYear(),
  };

  return (
    <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <UserCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Alumni Management</h1>
              <p className="text-muted-foreground">
                View and manage registered alumni
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Alumni
              </CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Branches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.branches}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Most Recent Batch
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentYear}</div>
            </CardContent>
          </Card>
        </div>

        {/* Alumni Directory */}
        <Card>
          <CardHeader>
            <CardTitle>Alumni Directory</CardTitle>
            <CardDescription>
              Search and filter alumni by branch, year, or name
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch} value={branch}>
                      {branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Headline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Loading alumni...
                      </TableCell>
                    </TableRow>
                  ) : filteredAlumni.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No alumni found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAlumni.map((alumnus) => (
                      <TableRow key={alumnus.id}>
                        <TableCell className="font-medium">
                          {alumnus.name}
                        </TableCell>
                        <TableCell className="text-sm">
                          {alumnus.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {alumnus.branch || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {alumnus.yearOfPassing || "N/A"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {alumnus.headline || "No headline"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              alumnus.status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {alumnus.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditAlumni(alumnus)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleDeleteAlumni(alumnus.id, alumnus.name)
                              }
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <EditUserDialog
        user={selectedAlumni}
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedAlumni(null);
        }}
        onSuccess={fetchAlumni}
      />
  );
}
