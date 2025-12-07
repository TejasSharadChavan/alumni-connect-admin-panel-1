"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RoleLayout } from "@/components/layout/role-layout";
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

interface MentorshipRequest {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  topic: string;
  message: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

interface MentorshipSession {
  id: number;
  requestId: number;
  studentId: number;
  studentName: string;
  topic: string;
  scheduledAt: string;
  duration: number;
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
  rating?: number;
  feedback?: string;
  createdAt: string;
}

export default function MentorshipPage() {
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [sessions, setSessions] = useState<MentorshipSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<MentorshipRequest | null>(null);
  const [sessionForm, setSessionForm] = useState({
    scheduledAt: "",
    duration: "60",
    notes: "",
  });

  useEffect(() => {
    fetchMentorshipData();
  }, []);

  const fetchMentorshipData = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const requestsRes = await fetch("/api/mentorship", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        console.log("📊 Fetched requests:", requestsData.requests);
        console.log(
          "✅ Accepted requests:",
          requestsData.requests?.filter((r: any) => r.status === "accepted")
        );
        setRequests(requestsData.requests || []);
      } else {
        console.error("Failed to fetch requests:", await requestsRes.text());
      }

      // TODO: Fetch sessions from a separate endpoint when implemented
      setSessions([]);
    } catch (error) {
      console.error("Failed to fetch mentorship data:", error);
      toast.error("Failed to load mentorship data");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (request: MentorshipRequest) => {
    setSelectedRequest(request);
    setSessionDialogOpen(true);
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("Please log in to continue");
        return;
      }

      const response = await fetch(`/api/mentorship/request/${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "rejected" }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject request");
      }

      setRequests(
        requests.map((r) =>
          r.id === requestId ? { ...r, status: "rejected" } : r
        )
      );
      toast.success("Request rejected");
    } catch (error) {
      console.error("Failed to reject request:", error);
      toast.error("Failed to reject request");
    }
  };

  const handleScheduleSession = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRequest) return;

    setScheduling(true);

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("Please log in to continue");
        setScheduling(false);
        return;
      }

      // First, accept the request
      const acceptResponse = await fetch(
        `/api/mentorship/request/${selectedRequest.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "accepted" }),
        }
      );

      if (!acceptResponse.ok) {
        const errorData = await acceptResponse.json();
        throw new Error(errorData.error || "Failed to accept request");
      }

      // Then, create the session
      const sessionResponse = await fetch("/api/mentorship", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          scheduledAt: new Date(sessionForm.scheduledAt).toISOString(),
          duration: parseInt(sessionForm.duration),
          notes: sessionForm.notes,
        }),
      });

      if (!sessionResponse.ok) {
        const errorData = await sessionResponse.json();
        throw new Error(errorData.error || "Failed to create session");
      }

      const sessionData = await sessionResponse.json();

      setRequests(
        requests.map((r) =>
          r.id === selectedRequest.id ? { ...r, status: "accepted" } : r
        )
      );

      toast.success("Session scheduled successfully!");
      setSessionDialogOpen(false);
      setSessionForm({ scheduledAt: "", duration: "60", notes: "" });
      setSelectedRequest(null);
      fetchMentorshipData(); // Refresh data
    } catch (error) {
      console.error("Failed to schedule session:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to schedule session"
      );
    } finally {
      setScheduling(false);
    }
  };

  const handleCompleteSession = async (sessionId: number, notes: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("Please log in to continue");
        return;
      }

      const response = await fetch(`/api/mentorship/${sessionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "completed",
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to complete session");
      }

      setSessions(
        sessions.map((s) =>
          s.id === sessionId ? { ...s, status: "completed", notes } : s
        )
      );
      toast.success("Session marked as completed");
    } catch (error) {
      console.error("Failed to complete session:", error);
      toast.error("Failed to complete session");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "accepted":
      case "scheduled":
        return (
          <Badge className="bg-blue-500">
            <Calendar className="h-3 w-3 mr-1" />
            Scheduled
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "rejected":
      case "cancelled":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const acceptedRequests = requests.filter((r) => r.status === "accepted");
  const scheduledSessions = sessions.filter((s) => s.status === "scheduled");
  const completedSessions = sessions.filter((s) => s.status === "completed");

  console.log("🔍 All requests:", requests);
  console.log("✅ Accepted requests filtered:", acceptedRequests);
  console.log("⏳ Pending requests filtered:", pendingRequests);

  return (
    <RoleLayout role="alumni">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mentorship</h1>
          <p className="text-muted-foreground">
            Manage your mentorship requests and sessions
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Requests</CardDescription>
              <CardTitle className="text-3xl">
                {pendingRequests.length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Accepted Requests</CardDescription>
              <CardTitle className="text-3xl">
                {acceptedRequests.length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-3xl">
                {requests.filter((r) => r.status === "completed").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Mentees</CardDescription>
              <CardTitle className="text-3xl">
                {
                  new Set([
                    ...requests
                      .filter(
                        (r) =>
                          r.status === "accepted" || r.status === "completed"
                      )
                      .map((r) => r.studentId),
                  ]).size
                }
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="requests" className="space-y-4">
          <TabsList>
            <TabsTrigger value="requests">
              Pending
              {pendingRequests.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="accepted">
              Accepted
              {acceptedRequests.length > 0 && (
                <Badge className="ml-2 bg-green-500">
                  {acceptedRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">All Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            {pendingRequests.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Pending Requests
                  </h3>
                  <p className="text-muted-foreground text-center">
                    You don't have any pending mentorship requests at the moment
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pendingRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">
                            {request.studentName}
                          </CardTitle>
                          <CardDescription>
                            {request.studentEmail}
                          </CardDescription>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Topic</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {request.topic}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Message</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {request.message}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Requested{" "}
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          className="flex-1"
                          onClick={() => handleAcceptRequest(request)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Accept & Schedule
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleRejectRequest(request.id)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Accepted Requests Tab */}
          <TabsContent value="accepted" className="space-y-4">
            {acceptedRequests.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Accepted Requests
                  </h3>
                  <p className="text-muted-foreground text-center">
                    Accepted mentorship requests will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {acceptedRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <h3 className="font-semibold">
                            {request.studentName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {request.studentEmail}
                          </p>
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="font-medium">Topic:</span>{" "}
                              {request.topic}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {request.message}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              Requested:{" "}
                              {new Date(request.createdAt).toLocaleDateString()}
                            </span>
                            {request.respondedAt && (
                              <span>
                                Accepted:{" "}
                                {new Date(
                                  request.respondedAt
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge className="bg-green-500">Accepted</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* All Requests Tab */}
          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4">
              {requests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <h3 className="font-semibold">{request.studentName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {request.studentEmail}
                        </p>
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">Topic:</span>{" "}
                            {request.topic}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {request.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            Requested:{" "}
                            {new Date(request.createdAt).toLocaleDateString()}
                          </span>
                          {request.respondedAt && (
                            <span>
                              Responded:{" "}
                              {new Date(
                                request.respondedAt
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant={
                          request.status === "pending"
                            ? "destructive"
                            : request.status === "accepted"
                              ? "default"
                              : request.status === "completed"
                                ? "secondary"
                                : "outline"
                        }
                        className={
                          request.status === "accepted"
                            ? "bg-green-500"
                            : request.status === "completed"
                              ? "bg-blue-500"
                              : ""
                        }
                      >
                        {request.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            {sessions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Sessions Yet
                  </h3>
                  <p className="text-muted-foreground text-center">
                    Accept mentorship requests to schedule sessions
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {sessions.map((session) => (
                  <Card key={session.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">
                            {session.studentName}
                          </CardTitle>
                          <CardDescription>{session.topic}</CardDescription>
                        </div>
                        {getStatusBadge(session.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">
                            Scheduled Date
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(session.scheduledAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Time</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(session.scheduledAt).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">
                            Duration
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {session.duration} minutes
                          </p>
                        </div>
                      </div>

                      {session.notes && (
                        <div>
                          <Label className="text-sm font-medium">
                            Session Notes
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {session.notes}
                          </p>
                        </div>
                      )}

                      {session.feedback && (
                        <div>
                          <Label className="text-sm font-medium">
                            Student Feedback
                          </Label>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  className={`text-lg ${
                                    star <= (session.rating || 0)
                                      ? "text-yellow-500"
                                      : "text-gray-300"
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              ({session.rating}/5)
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            {session.feedback}
                          </p>
                        </div>
                      )}

                      {session.status === "scheduled" && (
                        <Button
                          className="w-full"
                          onClick={() => {
                            const notes = prompt(
                              "Add session notes (optional):"
                            );
                            if (notes !== null) {
                              handleCompleteSession(session.id, notes);
                            }
                          }}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Mark as Completed
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Schedule Session Dialog */}
        <Dialog open={sessionDialogOpen} onOpenChange={setSessionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Mentorship Session</DialogTitle>
              <DialogDescription>
                Set up a session with {selectedRequest?.studentName}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleScheduleSession} className="space-y-4">
              <div className="space-y-2">
                <Label>Topic</Label>
                <Input value={selectedRequest?.topic || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledAt">Date & Time *</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={sessionForm.scheduledAt}
                  onChange={(e) =>
                    setSessionForm({
                      ...sessionForm,
                      scheduledAt: e.target.value,
                    })
                  }
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={sessionForm.duration}
                  onChange={(e) =>
                    setSessionForm({ ...sessionForm, duration: e.target.value })
                  }
                  min="15"
                  step="15"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Initial Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={sessionForm.notes}
                  onChange={(e) =>
                    setSessionForm({ ...sessionForm, notes: e.target.value })
                  }
                  placeholder="Any preparation notes or agenda for the session..."
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1" disabled={scheduling}>
                  {scheduling ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    "Schedule Session"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSessionDialogOpen(false);
                    setSelectedRequest(null);
                  }}
                  disabled={scheduling}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </RoleLayout>
  );
}
