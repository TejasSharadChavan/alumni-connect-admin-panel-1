"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { RoleLayout } from "@/components/layout/role-layout";
import { DollarSign, Search, TrendingUp, Users, Target, Heart } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Campaign {
  id: number;
  title: string;
  category: string;
  goalAmount: number;
  currentAmount: number;
  status: string;
  creator: string;
  donorsCount?: number;
  startDate: string;
  endDate: string;
}

export default function CampaignsManagementPage() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      // Mock data - replace with actual API call
      setCampaigns([
        {
          id: 1,
          title: "Student Scholarship Fund 2024",
          category: "scholarship",
          goalAmount: 500000,
          currentAmount: 325000,
          status: "active",
          creator: "Admin",
          donorsCount: 45,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 2,
          title: "New Computer Lab Infrastructure",
          category: "infrastructure",
          goalAmount: 1000000,
          currentAmount: 780000,
          status: "active",
          creator: "Alumni Association",
          donorsCount: 68,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 3,
          title: "Emergency Student Relief Fund",
          category: "emergency",
          goalAmount: 200000,
          currentAmount: 200000,
          status: "completed",
          creator: "Faculty Committee",
          donorsCount: 92,
          startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      toast.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalRaised: campaigns.reduce((acc, c) => acc + c.currentAmount, 0),
    activeCampaigns: campaigns.filter((c) => c.status === "active").length,
    totalDonors: campaigns.reduce((acc, c) => acc + (c.donorsCount || 0), 0),
    completedCampaigns: campaigns.filter((c) => c.status === "completed").length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "completed":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  return (
    <RoleLayout role="admin">
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Campaigns Management</h1>
              <p className="text-muted-foreground">Manage fundraising campaigns and donations</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{(stats.totalRaised / 100000).toFixed(1)}L</div>
              <p className="text-xs text-muted-foreground mt-1">Across all campaigns</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDonors}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Heart className="h-4 w-4 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedCampaigns}</div>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns List */}
        <Card>
          <CardHeader>
            <CardTitle>All Campaigns</CardTitle>
            <CardDescription>Manage fundraising campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">Loading campaigns...</div>
              ) : filteredCampaigns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No campaigns found</div>
              ) : (
                filteredCampaigns.map((campaign) => (
                  <Card key={campaign.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{campaign.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Created by {campaign.creator} • {campaign.donorsCount} donors
                            </p>
                          </div>
                          <Badge variant={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">
                              ₹{campaign.currentAmount.toLocaleString()} raised
                            </span>
                            <span className="text-muted-foreground">
                              Goal: ₹{campaign.goalAmount.toLocaleString()}
                            </span>
                          </div>
                          <Progress value={getProgress(campaign.currentAmount, campaign.goalAmount)} />
                          <p className="text-xs text-muted-foreground">
                            {getProgress(campaign.currentAmount, campaign.goalAmount).toFixed(1)}% of goal
                          </p>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Badge variant="outline">{campaign.category}</Badge>
                          </div>
                          <div>
                            Ends: {new Date(campaign.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleLayout>
  );
}
