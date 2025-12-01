"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleLayout } from "@/components/layout/role-layout";
import { Users, Search, Filter, UserPlus, Check, X, Linkedin, Github, Mail, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

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
  connectionStatus?: "none" | "pending" | "accepted";
  connectionId?: number;
}

export default function StudentNetworkPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [connections, setConnections] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<User[]>([]);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("discover");
  const [connectingUserId, setConnectingUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchNetworkData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter, branchFilter]);

  const fetchNetworkData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all users
      const usersRes = await fetch("/api/users", { headers });
      const usersData = await usersRes.json();

      // Fetch connections
      const connectionsRes = await fetch("/api/connections", { headers });
      const connectionsData = await connectionsRes.json();

      // Fetch suggestions
      const suggestionsRes = await fetch("/api/connections/suggestions", { headers });
      const suggestionsData = await suggestionsRes.json();

      if (usersData.users) {
        // Map connection status to users
        const allConnections = connectionsData.connections || [];
        const usersWithStatus = usersData.users.map((user: User) => {
          const connection = allConnections.find(
            (c: any) =>
              (c.requesterId === user.id || c.responderId === user.id)
          );
          
          // Parse skills if it's a string
          let parsedSkills = user.skills;
          if (typeof user.skills === 'string') {
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
          };
        });

        setUsers(usersWithStatus);

        // Set connections (accepted)
        const acceptedConnections = usersWithStatus.filter(
          (u: User) => u.connectionStatus === "accepted"
        );
        setConnections(acceptedConnections);

        // Set pending requests (where I'm the responder)
        const pending = usersWithStatus.filter(
          (u: User) => u.connectionStatus === "pending"
        );
        setPendingRequests(pending);
      }

      if (suggestionsData.suggestions) {
        // Parse skills for suggestions too
        const suggestionsWithParsedSkills = suggestionsData.suggestions.map((user: User) => {
          let parsedSkills = user.skills;
          if (typeof user.skills === 'string') {
            try {
              parsedSkills = JSON.parse(user.skills);
            } catch (e) {
              parsedSkills = [];
            }
          }
          if (!Array.isArray(parsedSkills)) {
            parsedSkills = [];
          }
          return { ...user, skills: parsedSkills };
        });
        setSuggestions(suggestionsWithParsedSkills);
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

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (Array.isArray(user.skills) && user.skills.some((s) =>
            s.toLowerCase().includes(searchQuery.toLowerCase())
          ))
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Branch filter
    if (branchFilter !== "all") {
      filtered = filtered.filter((user) => user.branch === branchFilter);
    }

    // Filter out already connected and pending
    filtered = filtered.filter((user) => user.connectionStatus === "none");

    setFilteredUsers(filtered);
  };

  const handleConnect = async (userId: number) => {
    try {
      setConnectingUserId(userId);
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/connections/request", {
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
        fetchNetworkData(); // Refresh data
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

  const UserCard = ({ user, showActions = true }: { user: User; showActions?: boolean }) => (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-xl flex-shrink-0">
            {user.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{user.name}</CardTitle>
            <CardDescription className="mt-1">
              <Badge variant="outline" className="capitalize">
                {user.role}
              </Badge>
              {user.branch && (
                <Badge variant="secondary" className="ml-2 capitalize">
                  {user.branch}
                </Badge>
              )}
            </CardDescription>
            {user.headline && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {user.headline}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {user.bio && (
          <p className="text-sm text-muted-foreground line-clamp-3">{user.bio}</p>
        )}

        {user.skills && user.skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {user.skills.slice(0, 4).map((skill, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {user.skills.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{user.skills.length - 4} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          {user.linkedinUrl && (
            <Button size="sm" variant="ghost" asChild>
              <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer">
                <Linkedin className="h-4 w-4" />
              </a>
            </Button>
          )}
          {user.githubUrl && (
            <Button size="sm" variant="ghost" asChild>
              <a href={user.githubUrl} target="_blank" rel="noopener noreferrer">
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
                onClick={() => handleConnect(user.id)}
                disabled={connectingUserId === user.id}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {connectingUserId === user.id ? "Connecting..." : "Connect"}
              </Button>
            )}
            {user.connectionStatus === "pending" && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => user.connectionId && handleRejectConnection(user.connectionId)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Decline
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => user.connectionId && handleAcceptConnection(user.connectionId)}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Accept
                </Button>
              </div>
            )}
            {user.connectionStatus === "accepted" && (
              <Button variant="secondary" className="w-full" disabled>
                <Check className="h-4 w-4 mr-2" />
                Connected
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <RoleLayout role="student">
        <div className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
            <h1 className="text-3xl font-bold tracking-tight">My Network</h1>
            <p className="text-muted-foreground mt-2">
              Connect with students, alumni, and faculty
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
                  <p className="text-sm text-muted-foreground">My Connections</p>
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
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950">
                  <Search className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{suggestions.length}</p>
                  <p className="text-sm text-muted-foreground">Suggestions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            <TabsTrigger value="connections">
              Connections ({connections.length})
            </TabsTrigger>
            <TabsTrigger value="requests">
              Requests ({pendingRequests.length})
            </TabsTrigger>
          </TabsList>

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
                      <SelectItem value="computer">Computer Engineering</SelectItem>
                      <SelectItem value="electronics">Electronics Engineering</SelectItem>
                      <SelectItem value="mechanical">Mechanical Engineering</SelectItem>
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
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

          {/* Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-6">
            {suggestions.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No suggestions available at the moment
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {suggestions.map((user, index) => (
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
                    <Button className="mt-4" onClick={() => setActiveTab("discover")}>
                      Discover People
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {connections.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <UserCard user={user} showActions={false} />
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
                    <p className="text-muted-foreground">No pending connection requests</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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