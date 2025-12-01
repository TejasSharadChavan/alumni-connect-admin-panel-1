"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleLayout } from "@/components/layout/role-layout";
import { Users, Search, UserPlus, Check, MessageSquare, GraduationCap, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
  connectionStatus?: "none" | "pending" | "accepted";
  connectionId?: number;
}

export default function FacultyNetworkPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [connections, setConnections] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
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

      if (usersData.users) {
        const allConnections = Array.isArray(connectionsData) ? connectionsData : [];
        
        const usersWithStatus = usersData.users.map((user: User) => {
          const connection = allConnections.find(
            (c: any) => c.connectedUser?.id === user.id
          );
          
          // Parse skills
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

        const acceptedConnections = usersWithStatus.filter(
          (u: User) => u.connectionStatus === "accepted"
        );
        setConnections(acceptedConnections);
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
        router.push("/faculty/messages");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to create chat");
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Failed to create chat");
    }
  };

  const UserCard = ({ user, showMessageButton = false }: { user: User; showMessageButton?: boolean }) => (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.profileImageUrl} />
            <AvatarFallback className="text-lg">
              {user.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{user.name}</CardTitle>
            <CardDescription className="mt-1">
              <Badge variant="outline" className="capitalize">
                {user.role === "alumni" ? (
                  <><Briefcase className="h-3 w-3 mr-1" /> Alumni</>
                ) : (
                  <><GraduationCap className="h-3 w-3 mr-1" /> {user.role}</>
                )}
              </Badge>
              {user.branch && (
                <Badge variant="secondary" className="ml-2 capitalize">
                  {user.branch}
                </Badge>
              )}
              {user.yearOfPassing && (
                <Badge variant="secondary" className="ml-2">
                  Class of {user.yearOfPassing}
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

        <div className="flex gap-2">
          {user.connectionStatus === "none" && (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => handleConnect(user.id)}
              disabled={connectingUserId === user.id}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {connectingUserId === user.id ? "Connecting..." : "Connect"}
            </Button>
          )}
          {user.connectionStatus === "pending" && (
            <Button size="sm" variant="outline" className="flex-1" disabled>
              Pending
            </Button>
          )}
          {user.connectionStatus === "accepted" && (
            <Button size="sm" variant="secondary" className="flex-1" disabled>
              <Check className="h-4 w-4 mr-2" />
              Connected
            </Button>
          )}
          {showMessageButton && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStartChat(user.id)}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <RoleLayout role="faculty">
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

  const students = filteredUsers.filter(u => u.role === "student");
  const alumni = filteredUsers.filter(u => u.role === "alumni");

  return (
    <RoleLayout role="faculty">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Professional Network</h1>
            <p className="text-muted-foreground mt-2">
              Connect with students and alumni to mentor and collaborate
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
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950">
                  <GraduationCap className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{students.length}</p>
                  <p className="text-sm text-muted-foreground">Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950">
                  <Briefcase className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{alumni.length}</p>
                  <p className="text-sm text-muted-foreground">Alumni</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, skills..."
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

        {/* Tabs */}
        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({filteredUsers.length})</TabsTrigger>
            <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
            <TabsTrigger value="alumni">Alumni ({alumni.length})</TabsTrigger>
            <TabsTrigger value="connections">My Network ({connections.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6 mt-6">
            {filteredUsers.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No users found</p>
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
                    <UserCard user={user} showMessageButton={user.connectionStatus === "accepted"} />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="students" className="space-y-6 mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {students.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <UserCard user={user} showMessageButton={user.connectionStatus === "accepted"} />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="alumni" className="space-y-6 mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {alumni.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <UserCard user={user} showMessageButton={user.connectionStatus === "accepted"} />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="connections" className="space-y-6 mt-6">
            {connections.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No connections yet</p>
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
                    <UserCard user={user} showMessageButton={true} />
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
