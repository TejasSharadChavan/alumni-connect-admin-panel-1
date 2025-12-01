"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCheck, UserX, Eye, Clock, CheckCircle2, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface PendingUser {
  id: number;
  name: string;
  email: string;
  requestedRole: string;
  submittedData: any;
  status: string;
  submittedAt: string;
}

export default function ApprovalsPage() {
  const [loading, setLoading] = useState(true);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | "view" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch("/api/admin/pending-users?status=pending", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch pending users");
      }

      const data = await response.json();
      setPendingUsers(Array.isArray(data.pendingUsers) ? data.pendingUsers : []);
    } catch (error: any) {
      console.error("Error fetching pending users:", error);
      toast.error(error.message || "Failed to load pending users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApprove = async (pendingUser: PendingUser) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/admin/pending-users/${pendingUser.id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to approve user");
      }

      toast.success(`${pendingUser.name} has been approved successfully!`);
      setSelectedUser(null);
      setActionType(null);
      fetchPendingUsers();
    } catch (error: any) {
      console.error("Error approving user:", error);
      toast.error(error.message || "Failed to approve user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (pendingUser: PendingUser) => {
    if (!rejectionReason.trim() || rejectionReason.trim().length < 10) {
      toast.error("Please provide a detailed reason for rejection (min 10 characters)");
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/admin/pending-users/${pendingUser.id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reject user");
      }

      toast.success(`${pendingUser.name}'s registration has been rejected`);
      setSelectedUser(null);
      setActionType(null);
      setRejectionReason("");
      fetchPendingUsers();
    } catch (error: any) {
      console.error("Error rejecting user:", error);
      toast.error(error.message || "Failed to reject user");
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const stats = {
    total: pendingUsers.length,
    students: pendingUsers.filter((u) => u.requestedRole === "student").length,
    alumni: pendingUsers.filter((u) => u.requestedRole === "alumni").length,
    faculty: pendingUsers.filter((u) => u.requestedRole === "faculty").length,
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Approvals</h1>
            <p className="text-muted-foreground mt-2">Review and approve pending user registrations</p>
          </div>
          <Button onClick={fetchPendingUsers} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
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
              <p className="text-xs text-muted-foreground">Student registrations</p>
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
              <p className="text-xs text-muted-foreground">Alumni registrations</p>
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
              <p className="text-xs text-muted-foreground">Faculty registrations</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Pending Users Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle>Pending Registrations ({pendingUsers.length})</CardTitle>
            <CardDescription>Review user details before approving or rejecting their registration</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingUsers.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-semibold">All caught up!</p>
                <p className="text-muted-foreground">No pending registrations to review</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="text-sm">{user.email}</TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(user.requestedRole)}>
                            {user.requestedRole}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.submittedData?.branch && `Branch: ${user.submittedData.branch}`}
                          {user.submittedData?.cohort && `, ${user.submittedData.cohort}`}
                          {user.submittedData?.yearOfPassing && `Year: ${user.submittedData.yearOfPassing}`}
                          {user.submittedData?.department && `Dept: ${user.submittedData.department}`}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(user.submittedAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(user);
                                setActionType("view");
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => {
                                setSelectedUser(user);
                                setActionType("approve");
                              }}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedUser(user);
                                setActionType("reject");
                              }}
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* View Details Dialog */}
      <Dialog open={actionType === "view"} onOpenChange={() => { setActionType(null); setSelectedUser(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Registration Details</DialogTitle>
            <DialogDescription>Review the complete registration information</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Name</Label>
                  <p className="font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Requested Role</Label>
                  <Badge className={getRoleBadgeColor(selectedUser.requestedRole)}>
                    {selectedUser.requestedRole}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Submitted</Label>
                  <p className="text-sm">{formatDate(selectedUser.submittedAt)}</p>
                </div>
              </div>

              {selectedUser.submittedData && (
                <div className="border-t pt-4 space-y-3">
                  <h4 className="font-medium">Additional Information</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {selectedUser.submittedData.branch && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Branch</Label>
                        <p>{selectedUser.submittedData.branch}</p>
                      </div>
                    )}
                    {selectedUser.submittedData.cohort && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Cohort</Label>
                        <p>{selectedUser.submittedData.cohort}</p>
                      </div>
                    )}
                    {selectedUser.submittedData.yearOfPassing && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Year of Passing</Label>
                        <p>{selectedUser.submittedData.yearOfPassing}</p>
                      </div>
                    )}
                    {selectedUser.submittedData.department && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Department</Label>
                        <p>{selectedUser.submittedData.department}</p>
                      </div>
                    )}
                    {selectedUser.submittedData.phone && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Phone</Label>
                        <p>{selectedUser.submittedData.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setActionType(null); setSelectedUser(null); }}>
              Close
            </Button>
            <Button
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                setActionType("approve");
              }}
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setActionType("reject");
              }}
            >
              <UserX className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Dialog */}
      <Dialog open={actionType === "approve"} onOpenChange={() => { setActionType(null); setSelectedUser(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve User Registration</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this user's registration? They will be granted access to the platform.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-2 py-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">{selectedUser.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200">
                  ✓ User will receive an email notification about their approval
                </p>
                <p className="text-sm text-green-800 dark:text-green-200">
                  ✓ They can immediately log in with their credentials
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setActionType(null); setSelectedUser(null); }} disabled={actionLoading}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedUser && handleApprove(selectedUser)}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {actionLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Approve User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={actionType === "reject"} onOpenChange={() => { setActionType(null); setSelectedUser(null); setRejectionReason(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject User Registration</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this registration. The user will receive this explanation.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="font-medium">{selectedUser.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Rejection Reason *</Label>
                <Textarea
                  id="reason"
                  placeholder="Please provide a detailed reason for rejection (minimum 10 characters)..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  disabled={actionLoading}
                />
                <p className="text-xs text-muted-foreground">
                  {rejectionReason.length}/10 characters minimum
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionType(null);
                setSelectedUser(null);
                setRejectionReason("");
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedUser && handleReject(selectedUser)}
              disabled={actionLoading || rejectionReason.length < 10}
            >
              {actionLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <UserX className="mr-2 h-4 w-4" />
                  Reject User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
