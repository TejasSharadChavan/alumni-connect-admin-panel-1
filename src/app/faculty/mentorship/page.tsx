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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GraduationCap,
  Users,
  CheckCircle,
  Clock,
  Loader2,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

interface MentorshipRequest {
  id: number;
  studentId: number;
  studentName: string;
  studentBranch: string;
  studentCohort: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function FacultyMentorshipPage() {
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchMentorshipRequests();
  }, []);

  const fetchMentorshipRequests = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch("/api/mentorship", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error("Failed to fetch mentorship requests:", error);
      toast.error("Failed to load mentorship requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: number) => {
    try {
      setActionLoading(requestId);
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch(`/api/mentorship/${requestId}/accept`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success("Mentorship request accepted");
        await fetchMentorshipRequests();
      } else {
        toast.error("Failed to accept request");
      }
    } catch (error) {
      console.error("Failed to accept request:", error);
      toast.error("Failed to accept request");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (requestId: number) => {
    try {
      setActionLoading(requestId);
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch(`/api/mentorship/${requestId}/decline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success("Mentorship request declined");
        await fetchMentorshipRequests();
      } else {
        toast.error("Failed to decline request");
      }
    } catch (error) {
      console.error("Failed to decline request:", error);
      toast.error("Failed to decline request");
    } finally {
      setActionLoading(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const activeRequests = requests.filter((r) => r.status === "accepted");
  const declinedRequests = requests.filter((r) => r.status === "declined");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mentorship</h1>
        <p className="text-muted-foreground">
          Manage student mentorship requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending
            </CardDescription>
            <CardTitle className="text-3xl">{pendingRequests.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Active
            </CardDescription>
            <CardTitle className="text-3xl">{activeRequests.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Requests</CardDescription>
            <CardTitle className="text-3xl">{requests.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Acceptance Rate</CardDescription>
            <CardTitle className="text-3xl">
              {requests.length > 0
                ? Math.round((activeRequests.length / requests.length) * 100)
                : 0}
              %
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Active ({activeRequests.length})
          </TabsTrigger>
          <TabsTrigger value="declined">
            Declined ({declinedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Pending Requests
                </h3>
                <p className="text-muted-foreground text-center">
                  No students have requested mentorship at this time.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingRequests.map((request) => (
                <Card
                  key={request.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {getInitials(request.studentName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {request.studentName}
                            </CardTitle>
                            <CardDescription>
                              {request.studentBranch} • {request.studentCohort}
                            </CardDescription>
                          </div>
                          <Badge variant="outline">
                            {formatDate(request.createdAt)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {request.message}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex gap-2">
                    <Button
                      onClick={() => handleAccept(request.id)}
                      disabled={actionLoading === request.id}
                      className="flex-1"
                    >
                      {actionLoading === request.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDecline(request.id)}
                      disabled={actionLoading === request.id}
                      className="flex-1"
                    >
                      Decline
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Active Mentorships
                </h3>
                <p className="text-muted-foreground text-center">
                  Accept pending requests to start mentoring students.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeRequests.map((request) => (
                <Card
                  key={request.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {getInitials(request.studentName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <CardTitle className="text-lg">
                          {request.studentName}
                        </CardTitle>
                        <CardDescription>
                          {request.studentBranch} • {request.studentCohort}
                        </CardDescription>
                        <Badge className="bg-green-500">Active</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {request.message}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        asChild
                      >
                        <a
                          href={`mailto:student${request.studentId}@terna.ac.in`}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Email
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="declined" className="space-y-4">
          {declinedRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <h3 className="text-lg font-semibold mb-2">
                  No Declined Requests
                </h3>
                <p className="text-muted-foreground text-center">
                  Requests you decline will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {declinedRequests.map((request) => (
                <Card key={request.id} className="opacity-75">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {getInitials(request.studentName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {request.studentName}
                        </CardTitle>
                        <CardDescription>
                          {request.studentBranch} • {request.studentCohort}
                        </CardDescription>
                        <Badge variant="secondary" className="mt-2">
                          Declined on {formatDate(request.createdAt)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
