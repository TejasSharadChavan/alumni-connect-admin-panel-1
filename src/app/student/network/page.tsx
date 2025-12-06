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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleLayout } from "@/components/layout/role-layout";
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Check,
  X,
  Linkedin,
  Github,
  MessageSquare,
  Brain,
  Sparkles,
  TrendingUp,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  branch?: string;
  cohort?: string;
  yearOfPassing?: number;
  headline?: string;
  bio?: string;
  skills?: string[];
  profileImageUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  currentCompany?: string;
  currentPosition?: string;
  connectionStatus?: "none" | "pending" | "accepted";
  connectionId?: number;
  isRequester?: boolean; // true if current user sent the request
}

interface MLRecommendation {
  alumni_id: number;
  match_score: number;
  breakdown: {
    skills_overlap: number;
    branch_match: number;
    experience_match: number;
    activity_score: number;
  };
  alumni: User;
  explanation: string;
}

export default function StudentNetworkPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [connections, setConnections] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<User[]>([]);
  const [mlRecommendations, setMlRecommendations] = useState<
    MLRecommendation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [mlLoading, setMlLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("ai-matches");
  const [connectingUserId, setConnectingUserId] = useState<number | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchNetworkData();
    fetchMLRecommendations();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter, branchFilter]);

  const fetchMLRecommendations = async () => {
    try {
      setMlLoading(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/ml/recommend-alumni?limit=10", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("ML Recommendations Response:", data);
        setMlRecommendations(data.recommendations || []);

        // Show message if no recommendations
        if (!data.recommendations || data.recommendations.length === 0) {
          if (data.message) {
            toast.info(data.message);
          }
        }
      } else {
        const errorData = await response.json();
        console.error("ML Recommendations Error:", errorData);
        toast.error(errorData.message || "Failed to load recommendations");
      }
    } catch (error) {
      console.error("Error fetching ML recommendations:", error);
      toast.error("Failed to load AI recommendations");
    } finally {
      setMlLoading(false);
    }
  };

  const fetchNetworkData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      const headers = { Authorization: `Bearer ${token}` };

      const usersRes = await fetch("/api/users", { headers });
      const usersData = await usersRes.json();

      const connectionsRes = await fetch("/api/connections", { headers });
      const connectionsData = await connectionsRes.json();
      console.log("Connections API Response:", connectionsData);

      const suggestionsRes = await fetch("/api/connections/suggestions", {
        headers,
      });
      const suggestionsData = await suggestionsRes.json();

      if (usersData.users) {
        // Fix: Extract connections array from response object
        const allConnections =
          connectionsData.success && Array.isArray(connectionsData.connections)
            ? connectionsData.connections
            : [];

        console.log("All Connections Count:", allConnections.length);

        const usersWithStatus = usersData.users.map((user: User) => {
          const connection = allConnections.find((c: any) => {
            const otherUserId = c.connectedUser?.id;
            return otherUserId === user.id;
          });

          let parsedSkills = user.skills;
          if (typeof user.skills === "string") {
            try {
              parsedSkills = JSON.parse(user.skills);
            } catch (e) {
              parsedSkills = [];
            }
          }
          if (!Array.isArray(parsedSkills)) {
            parsedSkills = [];
          }

          return {
            ...user,
            skills: parsedSkills,
            connectionStatus: connection
              ? connection.status === "accepted"
                ? "accepted"
                : "pending"
              : "none",
            connectionId: connection?.id,
            isRequester: connection?.isRequester || false, // Track if current user is the requester
          };
        });

        setUsers(usersWithStatus);

        const acceptedConnections = usersWithStatus.filter(
          (u: User) => u.connectionStatus === "accepted"
        );
        setConnections(acceptedConnections);

        const pending = usersWithStatus.filter(
          (u: User) => u.connectionStatus === "pending"
        );
        setPendingRequests(pending);
      }
    } catch (error) {
      console.error("Error fetching network data:", error);
      toast.error("Failed to load network data");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (Array.isArray(user.skills) &&
            user.skills.some((s) =>
              s.toLowerCase().includes(searchQuery.toLowerCase())
            ))
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    if (branchFilter !== "all") {
      filtered = filtered.filter((user) => user.branch === branchFilter);
    }

    filtered = filtered.filter((user) => user.connectionStatus === "none");

    setFilteredUsers(filtered);
  };

  const handleConnect = async (userId: number) => {
    try {
      setConnectingUserId(userId);
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/connections", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ responderId: userId }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Connection request sent!");
        fetchNetworkData();
        fetchMLRecommendations();
      } else {
        toast.error(data.error || "Failed to send connection request");
      }
    } catch (error) {
      console.error("Error sending connection request:", error);
      toast.error("Failed to send connection request");
    } finally {
      setConnectingUserId(null);
    }
  };

  const handleAcceptConnection = async (connectionId: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/connections/${connectionId}/accept`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success("Connection request accepted!");
        fetchNetworkData();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to accept connection");
      }
    } catch (error) {
      console.error("Error accepting connection:", error);
      toast.error("Failed to accept connection");
    }
  };

  const handleRejectConnection = async (connectionId: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/connections/${connectionId}/reject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success("Connection request rejected");
        fetchNetworkData();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to reject connection");
      }
    } catch (error) {
      console.error("Error rejecting connection:", error);
      toast.error("Failed to reject connection");
    }
  };

  const handleStartChat = async (userId: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        toast.success("Opening chat...");
        router.push("/student/messages");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to create chat");
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Failed to create chat");
    }
  };

  const MLMatchCard = ({
    recommendation,
  }: {
    recommendation: MLRecommendation;
  }) => {
    const { alumni, match_score, breakdown, explanation } = recommendation;

    return (
      <Card className="h-full hover:shadow-xl transition-all border-2 bg-gradient-to-br from-white to-blue-50/30 dark:from-background dark:to-blue-950/20">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-xl flex-shrink-0">
                {alumni.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg truncate">
                  {alumni.name}
                </CardTitle>
                <CardDescription className="mt-1 space-y-1">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="capitalize">
                      {alumni.role}
                    </Badge>
                    {alumni.branch && (
                      <Badge variant="secondary" className="capitalize">
                        {alumni.branch}
                      </Badge>
                    )}
                  </div>
                  {alumni.currentPosition && alumni.currentCompany && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {alumni.currentPosition} @ {alumni.currentCompany}
                    </p>
                  )}
                </CardDescription>
              </div>
            </div>

            {/* Match Score Badge */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-primary/20 flex items-center justify-center bg-gradient-to-br from-green-500 to-blue-600">
                  <span className="text-white font-bold text-lg">
                    {match_score}%
                  </span>
                </div>
                <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-yellow-500" />
              </div>
              <Badge
                variant="default"
                className="text-xs bg-gradient-to-r from-green-600 to-blue-600"
              >
                AI Match
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* AI Explanation */}
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900">
            <div className="flex items-start gap-2">
              <Brain className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">{explanation}</p>
            </div>
          </div>

          {/* Match Breakdown */}
          <div className="space-y-3">
            <p className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Match Breakdown
            </p>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Skills Overlap</span>
                  <span className="font-medium">
                    {breakdown.skills_overlap}%
                  </span>
                </div>
                <Progress value={breakdown.skills_overlap} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Branch Match</span>
                  <span className="font-medium">{breakdown.branch_match}%</span>
                </div>
                <Progress value={breakdown.branch_match} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">
                    Experience Match
                  </span>
                  <span className="font-medium">
                    {breakdown.experience_match}%
                  </span>
                </div>
                <Progress value={breakdown.experience_match} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Activity Score</span>
                  <span className="font-medium">
                    {breakdown.activity_score}%
                  </span>
                </div>
                <Progress value={breakdown.activity_score} className="h-2" />
              </div>
            </div>
          </div>

          {alumni.headline && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {alumni.headline}
            </p>
          )}

          {alumni.skills && alumni.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {alumni.skills.slice(0, 4).map((skill, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {alumni.skills.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{alumni.skills.length - 4} more
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            {alumni.linkedinUrl && (
              <Button size="sm" variant="ghost" asChild>
                <a
                  href={alumni.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              </Button>
            )}
            {alumni.githubUrl && (
              <Button size="sm" variant="ghost" asChild>
                <a
                  href={alumni.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>

          <Button
            className="w-full"
            onClick={() => handleConnect(alumni.id)}
            disabled={connectingUserId === alumni.id}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {connectingUserId === alumni.id ? "Connecting..." : "Connect Now"}
          </Button>
        </CardContent>
      </Card>
    );
  };

  // Calculate simple match percentage for discover tab users
  const calculateUserMatch = (user: User): number => {
    let score = 0;

    // Profile completeness (30%)
    if (user.headline) score += 10;
    if (user.bio) score += 10;
    if (user.skills && user.skills.length > 0) score += 10;

    // Role match (30%)
    if (user.role === "alumni") score += 30;
    else if (user.role === "faculty") score += 20;
    else score += 10;

    // Activity indicators (40%)
    if (user.linkedinUrl) score += 10;
    if (user.githubUrl) score += 10;
    if (user.currentCompany) score += 10;
    if (user.currentPosition) score += 10;

    return Math.min(score, 100);
  };

  const UserCard = ({
    user,
    showActions = true,
    showMessageButton = false,
  }: {
    user: User;
    showActions?: boolean;
    showMessageButton?: boolean;
  }) => {
    const isExpanded = expandedUserId === user.id;
    const matchScore = calculateUserMatch(user);

    return (
      <Card
        className={`h-full hover:shadow-lg transition-all cursor-pointer ${
          isExpanded ? "ring-2 ring-primary" : ""
        }`}
        onClick={() => setExpandedUserId(isExpanded ? null : user.id)}
      >
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-xl flex-shrink-0">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{user.name}</CardTitle>
              <CardDescription className="mt-1 flex flex-wrap gap-2">
                <Badge variant="outline" className="capitalize">
                  {user.role}
                </Badge>
                {user.branch && (
                  <Badge variant="secondary" className="capitalize">
                    {user.branch}
                  </Badge>
                )}
                {matchScore > 0 && (
                  <Badge
                    variant="default"
                    className={`${
                      matchScore >= 80
                        ? "bg-green-600"
                        : matchScore >= 60
                          ? "bg-blue-600"
                          : "bg-orange-600"
                    }`}
                  >
                    {matchScore}% Match
                  </Badge>
                )}
              </CardDescription>
              {user.headline && (
                <p
                  className={`text-sm text-muted-foreground mt-2 ${isExpanded ? "" : "line-clamp-2"}`}
                >
                  {user.headline}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {user.bio && (
            <p
              className={`text-sm text-muted-foreground ${isExpanded ? "" : "line-clamp-3"}`}
            >
              {user.bio}
            </p>
          )}

          {isExpanded && user.currentPosition && user.currentCompany && (
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900">
              <p className="text-sm font-medium">{user.currentPosition}</p>
              <p className="text-xs text-muted-foreground">
                {user.currentCompany}
              </p>
            </div>
          )}

          {user.skills && user.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(isExpanded ? user.skills : user.skills.slice(0, 4)).map(
                (skill, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                )
              )}
              {!isExpanded && user.skills.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{user.skills.length - 4} more
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            {user.linkedinUrl && (
              <Button
                size="sm"
                variant="ghost"
                asChild
                onClick={(e) => e.stopPropagation()}
              >
                <a
                  href={user.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              </Button>
            )}
            {user.githubUrl && (
              <Button
                size="sm"
                variant="ghost"
                asChild
                onClick={(e) => e.stopPropagation()}
              >
                <a
                  href={user.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>

          {showActions && (
            <>
              {user.connectionStatus === "none" && (
                <Button
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConnect(user.id);
                  }}
                  disabled={connectingUserId === user.id}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {connectingUserId === user.id ? "Connecting..." : "Connect"}
                </Button>
              )}
              {user.connectionStatus === "pending" && (
                <>
                  {user.isRequester ? (
                    // If current user sent the request, show "Pending" status
                    <Button variant="secondary" className="w-full" disabled>
                      <Clock className="h-4 w-4 mr-2" />
                      Request Pending
                    </Button>
                  ) : (
                    // If current user received the request, show Accept/Decline
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          user.connectionId &&
                            handleRejectConnection(user.connectionId);
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          user.connectionId &&
                            handleAcceptConnection(user.connectionId);
                        }}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                    </div>
                  )}
                </>
              )}
              {user.connectionStatus === "accepted" && (
                <Button variant="secondary" className="w-full" disabled>
                  <Check className="h-4 w-4 mr-2" />
                  Connected
                </Button>
              )}
            </>
          )}

          {showMessageButton && (
            <Button
              className="w-full"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleStartChat(user.id);
              }}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <RoleLayout role="student">
        <div className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout role="student">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              My Network
              <Badge
                variant="default"
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <Brain className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
            </h1>
            <p className="text-muted-foreground mt-2">
              Connect with students, alumni, and faculty using ML-powered
              recommendations
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{connections.length}</p>
                  <p className="text-sm text-muted-foreground">
                    My Connections
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950">
                  <UserPlus className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingRequests.length}</p>
                  <p className="text-sm text-muted-foreground">
                    Pending Requests
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950">
                  <Brain className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {mlRecommendations.length}
                  </p>
                  <p className="text-sm text-muted-foreground">AI Matches</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ai-matches">
              <Brain className="h-4 w-4 mr-2" />
              AI Matches ({mlRecommendations.length})
            </TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="connections">
              Connections ({connections.length})
            </TabsTrigger>
            <TabsTrigger value="requests">
              Requests ({pendingRequests.length})
            </TabsTrigger>
          </TabsList>

          {/* AI Matches Tab */}
          <TabsContent value="ai-matches" className="space-y-6">
            <Card className="border-2 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  AI-Powered Alumni Recommendations
                </CardTitle>
                <CardDescription>
                  Machine learning analyzed your profile and found these top
                  alumni matches based on skills, branch, experience, and
                  activity
                </CardDescription>
              </CardHeader>
            </Card>

            {mlLoading ? (
              <div className="grid gap-6 md:grid-cols-2">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-[500px]" />
                ))}
              </div>
            ) : mlRecommendations.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No AI recommendations available yet. Complete your profile
                      to get personalized matches!
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {mlRecommendations.map((rec, index) => (
                  <motion.div
                    key={rec.alumni_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <MLMatchCard recommendation={rec} />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search people..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="student">Students</SelectItem>
                      <SelectItem value="alumni">Alumni</SelectItem>
                      <SelectItem value="faculty">Faculty</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={branchFilter} onValueChange={setBranchFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      <SelectItem value="computer">
                        Computer Engineering
                      </SelectItem>
                      <SelectItem value="electronics">
                        Electronics Engineering
                      </SelectItem>
                      <SelectItem value="mechanical">
                        Mechanical Engineering
                      </SelectItem>
                      <SelectItem value="civil">Civil Engineering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {filteredUsers.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No users found matching your criteria
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <UserCard user={user} />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Connections Tab */}
          <TabsContent value="connections" className="space-y-6">
            {connections.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      You haven't connected with anyone yet
                    </p>
                    <Button
                      className="mt-4"
                      onClick={() => setActiveTab("ai-matches")}
                    >
                      View AI Matches
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {connections.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <UserCard
                      user={user}
                      showActions={false}
                      showMessageButton={true}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            {pendingRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No pending connection requests
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {pendingRequests.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <UserCard user={user} />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </RoleLayout>
  );
}
