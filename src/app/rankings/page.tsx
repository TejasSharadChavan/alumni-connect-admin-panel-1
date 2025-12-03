"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Award, TrendingUp, Users, Briefcase, Heart, Star, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RankedUser {
  id: number;
  name: string;
  role: string;
  branch?: string;
  company?: string;
  graduationYear?: string;
  score: number;
  rank: number;
  contributions: {
    posts: number;
    mentorships: number;
    jobsPosted: number;
    donations: number;
    connections: number;
  };
  profileImageUrl?: string;
}

export default function RankingsPage() {
  const [alumniRankings, setAlumniRankings] = useState<RankedUser[]>([]);
  const [studentRankings, setStudentRankings] = useState<RankedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Fetch users and calculate rankings
      const response = await fetch("/api/users", { headers });
      if (response.ok) {
        const data = await response.json();
        const users = data.users || [];

        // Calculate scores based on activity
        const rankedUsers = users.map((user: any) => {
          // Score calculation: connections * 5 + posts * 3 + other activities
          const score =
            (user.connectionsCount || 0) * 5 +
            (user.postsCount || 0) * 3 +
            (user.mentorshipsCount || 0) * 10 +
            (user.jobsPostedCount || 0) * 8 +
            (user.donationsTotal || 0) / 1000;

          return {
            id: user.id,
            name: user.name,
            role: user.role,
            branch: user.branch,
            company: user.currentCompany,
            graduationYear: user.graduationYear,
            score: Math.round(score),
            contributions: {
              posts: user.postsCount || 0,
              mentorships: user.mentorshipsCount || 0,
              jobsPosted: user.jobsPostedCount || 0,
              donations: user.donationsTotal || 0,
              connections: user.connectionsCount || 0,
            },
            profileImageUrl: user.profileImageUrl,
          };
        });

        // Sort by score and assign ranks
        rankedUsers.sort((a, b) => b.score - a.score);
        rankedUsers.forEach((user, index) => {
          user.rank = index + 1;
        });

        // Separate alumni and students
        const alumni = rankedUsers.filter((u: any) => u.role === "alumni");
        const students = rankedUsers.filter((u: any) => u.role === "student");

        setAlumniRankings(alumni);
        setStudentRankings(students);
      }
    } catch (error) {
      console.error("Error fetching rankings:", error);
      toast.error("Failed to load rankings");
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-yellow-600";
    if (rank === 2) return "bg-gradient-to-r from-gray-300 to-gray-500";
    if (rank === 3) return "bg-gradient-to-r from-amber-400 to-amber-600";
    return "bg-gradient-to-r from-blue-400 to-blue-600";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const RankingCard = ({ user, index }: { user: RankedUser; index: number }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        className={`border-2 hover:shadow-lg transition-shadow ${
          user.rank <= 3 ? "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20" : ""
        }`}
      >
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            {/* Rank Badge */}
            <div className="flex-shrink-0">
              <div
                className={`w-16 h-16 rounded-full ${getRankBadgeColor(
                  user.rank
                )} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
              >
                {user.rank <= 3 ? getRankIcon(user.rank) : `#${user.rank}`}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.profileImageUrl} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {user.branch && <span>{user.branch}</span>}
                    {user.company && (
                      <>
                        <span>•</span>
                        <span>{user.company}</span>
                      </>
                    )}
                    {user.graduationYear && (
                      <>
                        <span>•</span>
                        <span>Class of {user.graduationYear}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Score and Contributions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-xl">{user.score}</span>
                  <span className="text-sm text-muted-foreground">points</span>
                </div>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  {user.contributions.connections > 0 && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{user.contributions.connections}</span>
                    </div>
                  )}
                  {user.contributions.posts > 0 && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>{user.contributions.posts}</span>
                    </div>
                  )}
                  {user.contributions.mentorships > 0 && (
                    <div className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      <span>{user.contributions.mentorships}</span>
                    </div>
                  )}
                  {user.contributions.jobsPosted > 0 && (
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      <span>{user.contributions.jobsPosted}</span>
                    </div>
                  )}
                  {user.contributions.donations > 0 && (
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      <span>₹{(user.contributions.donations / 1000).toFixed(0)}k</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Skeleton className="h-16 w-64 mb-6" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="h-10 w-10 text-yellow-500" />
              <h1 className="text-4xl font-bold">Community Rankings</h1>
            </div>
            <p className="text-muted-foreground">
              Top contributors making a difference in the Terna community
            </p>
          </motion.div>
        </div>
      </div>

      {/* Rankings Content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Tabs defaultValue="alumni" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="alumni" className="text-base">
              <Trophy className="h-4 w-4 mr-2" />
              Alumni Rankings ({alumniRankings.length})
            </TabsTrigger>
            <TabsTrigger value="students" className="text-base">
              <Award className="h-4 w-4 mr-2" />
              Student Rankings ({studentRankings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alumni" className="space-y-4">
            {alumniRankings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Alumni Rankings Yet</h3>
                  <p className="text-muted-foreground">
                    Rankings will appear as alumni engage with the platform
                  </p>
                </CardContent>
              </Card>
            ) : (
              alumniRankings.map((user, index) => (
                <RankingCard key={user.id} user={user} index={index} />
              ))
            )}
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            {studentRankings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Student Rankings Yet</h3>
                  <p className="text-muted-foreground">
                    Rankings will appear as students engage with the platform
                  </p>
                </CardContent>
              </Card>
            ) : (
              studentRankings.map((user, index) => (
                <RankingCard key={user.id} user={user} index={index} />
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Scoring Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="mt-8 border-2">
            <CardHeader>
              <CardTitle>How Rankings Work</CardTitle>
              <CardDescription>Understanding the scoring system</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">Connections</p>
                  <p className="text-xs text-muted-foreground">5 points each</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <Award className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-sm">Mentorships</p>
                  <p className="text-xs text-muted-foreground">10 points each</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <Briefcase className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-sm">Jobs Posted</p>
                  <p className="text-xs text-muted-foreground">8 points each</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <TrendingUp className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-sm">Posts</p>
                  <p className="text-xs text-muted-foreground">3 points each</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
