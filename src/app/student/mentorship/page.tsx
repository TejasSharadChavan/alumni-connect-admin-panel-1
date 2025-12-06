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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Clock,
  CheckCircle2,
  Calendar,
  Loader2,
  MessageSquare,
  Star,
  Send,
  Briefcase,
  GraduationCap,
  Search,
} from "lucide-react";
import { toast } from "sonner";

interface Mentor {
  id: number;
  name: string;
  email: string;
  role: "alumni" | "faculty";
  headline?: string;
  bio?: string;
  branch?: string;
  department?: string;
  company?: string;
  skills?: string[];
}

interface MentorshipRequest {
  id: number;
  mentorId: number;
  mentorName: string;
  topic: string;
  message: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  respondedAt?: string;
}

interface MentorshipSession {
  id: number;
  requestId: number;
  mentorName: string;
  topic: string;
  scheduledAt: string;
  duration: number;
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
  studentRating?: number;
  studentFeedback?: string;
}

export default function StudentMentorshipPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [sessions, setSessions] = useState<MentorshipSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "alumni" | "faculty">(
    "all"
  );
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] =
    useState<MentorshipSession | null>(null);

  const [requestForm, setRequestForm] = useState({
    topic: "",
    message: "",
    preferredTime: "",
  });

  const [feedbackForm, setFeedbackForm] = useState({
    rating: 5,
    feedback: "",
  });

  useEffect(() => {
    fetchMentorshipData();
  }, []);

  const fetchMentorshipData = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const [mentorsRes, requestsRes, sessionsRes] = await Promise.all([
        fetch("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/mentorship/request", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/mentorship", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (mentorsRes.ok) {
        const mentorsData = await mentorsRes.json();
        const availableMentors = mentorsData.users
          .filter(
            (user: any) => user.role === "alumni" || user.role === "faculty"
          )
          .map((user: any) => ({
            ...user,
            skills:
              typeof user.skills === "string"
                ? JSON.parse(user.skills)
                : user.skills,
          }));
        setMentors(availableMentors);
      }

      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        setRequests(requestsData.requests || []);
      }

      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        setSessions(sessionsData.sessions || []);
      }
    } catch (error) {
      console.error("Failed to fetch mentorship data:", error);
      toast.error("Failed to load mentorship data");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestMentorship = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMentor) return;

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("Please log in to continue");
        return;
      }

      const response = await fetch("/api/mentorship/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mentorId: selectedMentor.id,
          topic: requestForm.topic,
          message: requestForm.message,
          preferredTime: requestForm.preferredTime || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send request");
      }

      toast.success("Mentorship request sent successfully!");
      setRequestDialogOpen(false);
      setRequestForm({ topic: "", message: "", preferredTime: "" });
      setSelectedMentor(null);
      await fetchMentorshipData();
    } catch (error) {
      console.error("Failed to send mentorship request:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to send request"
      );
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSession) return;

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("Please log in to continue");
        return;
      }

      const response = await fetch(
        `/api/mentorship/${selectedSession.id}/feedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating: feedbackForm.rating,
            feedback: feedbackForm.feedback,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      toast.success("Feedback submitted successfully!");
      setFeedbackDialogOpen(false);
      setFeedbackForm({ rating: 5, feedback: "" });
      setSelectedSession(null);
      await fetchMentorshipData();
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      toast.error("Failed to submit feedback");
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
        return <Badge variant="destructive">Declined</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch =
      mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.headline?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.skills?.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesRole = roleFilter === "all" || mentor.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const activeRequests = requests.filter((r) => r.status === "accepted");
  const upcomingSessions = sessions.filter((s) => s.status === "scheduled");
  const completedSessions = sessions.filter((s) => s.status === "completed");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mentorship</h1>
        <p className="text-muted-foreground">
          Connect with alumni and faculty mentors for guidance and support
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Available Mentors</CardDescription>
            <CardTitle className="text-3xl">{mentors.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending Requests</CardDescription>
            <CardTitle className="text-3xl">{pendingRequests.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Mentorships</CardDescription>
            <CardTitle className="text-3xl">{activeRequests.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed Sessions</CardDescription>
            <CardTitle className="text-3xl">
              {completedSessions.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="find" className="space-y-4">
        <TabsList>
          <TabsTrigger value="find">
            <Search className="h-4 w-4 mr-2" />
            Find Mentors
          </TabsTrigger>
          <TabsTrigger value="requests">
            My Requests
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="find" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, skills, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={roleFilter}
              onValueChange={(value: any) => setRoleFilter(value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Mentors</SelectItem>
                <SelectItem value="alumni">Alumni Only</SelectItem>
                <SelectItem value="faculty">Faculty Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mentors Grid */}
          {filteredMentors.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Mentors Found</h3>
                <p className="text-muted-foreground text-center">
                  Try adjusting your search or filters
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMentors.map((mentor) => (
                <Card
                  key={mentor.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarFallback className="bg-primary/10 text-primary text-lg">
                          {getInitials(mentor.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">
                          {mentor.name}
                        </CardTitle>
                        <CardDescription className="truncate">
                          {mentor.headline || mentor.department || "Mentor"}
                        </CardDescription>
                        <Badge variant="outline" className="mt-2">
                          {mentor.role === "alumni" ? (
                            <>
                              <Briefcase className="h-3 w-3 mr-1" />
                              Alumni
                            </>
                          ) : (
                            <>
                              <GraduationCap className="h-3 w-3 mr-1" />
                              Faculty
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mentor.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {mentor.bio}
                      </p>
                    )}
                    {mentor.skills && mentor.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {mentor.skills.slice(0, 3).map((skill, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {mentor.skills.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{mentor.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    <Button
                      className="w-full"
                      onClick={() => {
                        setSelectedMentor(mentor);
                        setRequestDialogOpen(true);
                      }}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Request Mentorship
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {requests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Requests Yet</h3>
                <p className="text-muted-foreground text-center">
                  Send your first mentorship request to connect with a mentor
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {requests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          Request to {request.mentorName}
                        </CardTitle>
                        <CardDescription>{request.topic}</CardDescription>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Message</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {request.message}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Sent {new Date(request.createdAt).toLocaleDateString()}
                      {request.respondedAt &&
                        ` • Responded ${new Date(request.respondedAt).toLocaleDateString()}`}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          {sessions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Sessions Yet</h3>
                <p className="text-muted-foreground text-center">
                  Your mentorship sessions will appear here once scheduled
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
                          Session with {session.mentorName}
                        </CardTitle>
                        <CardDescription>{session.topic}</CardDescription>
                      </div>
                      {getStatusBadge(session.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Date</Label>
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
                        <Label className="text-sm font-medium">Duration</Label>
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

                    {session.studentRating && (
                      <div>
                        <Label className="text-sm font-medium">
                          Your Rating
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= session.studentRating!
                                    ? "fill-yellow-500 text-yellow-500"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {session.studentFeedback && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {session.studentFeedback}
                          </p>
                        )}
                      </div>
                    )}

                    {session.status === "completed" &&
                      !session.studentRating && (
                        <Button
                          className="w-full"
                          onClick={() => {
                            setSelectedSession(session);
                            setFeedbackDialogOpen(true);
                          }}
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Leave Feedback
                        </Button>
                      )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Request Mentorship Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Mentorship</DialogTitle>
            <DialogDescription>
              Send a mentorship request to {selectedMentor?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRequestMentorship} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic *</Label>
              <Input
                id="topic"
                value={requestForm.topic}
                onChange={(e) =>
                  setRequestForm({ ...requestForm, topic: e.target.value })
                }
                placeholder="e.g., Career guidance in software engineering"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={requestForm.message}
                onChange={(e) =>
                  setRequestForm({ ...requestForm, message: e.target.value })
                }
                placeholder="Introduce yourself and explain what you hope to learn..."
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferredTime">Preferred Time (Optional)</Label>
              <Input
                id="preferredTime"
                value={requestForm.preferredTime}
                onChange={(e) =>
                  setRequestForm({
                    ...requestForm,
                    preferredTime: e.target.value,
                  })
                }
                placeholder="e.g., Weekday evenings after 6 PM"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                <Send className="h-4 w-4 mr-2" />
                Send Request
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setRequestDialogOpen(false);
                  setSelectedMentor(null);
                  setRequestForm({ topic: "", message: "", preferredTime: "" });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Session Feedback</DialogTitle>
            <DialogDescription>
              Share your feedback about the session with{" "}
              {selectedSession?.mentorName}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div className="space-y-2">
              <Label>Rating *</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setFeedbackForm({ ...feedbackForm, rating: star })
                    }
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= feedbackForm.rating
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback *</Label>
              <Textarea
                id="feedback"
                value={feedbackForm.feedback}
                onChange={(e) =>
                  setFeedbackForm({ ...feedbackForm, feedback: e.target.value })
                }
                placeholder="Share your thoughts about the session..."
                rows={4}
                required
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Submit Feedback
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFeedbackDialogOpen(false);
                  setSelectedSession(null);
                  setFeedbackForm({ rating: 5, feedback: "" });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
