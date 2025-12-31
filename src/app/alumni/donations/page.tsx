"use client";

import { useEffect, useState } from "react";
import { DonationForm } from "@/components/payments/donation-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, TrendingUp, Users, Award } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface DonationStats {
  totalDonations: number;
  donationCount: number;
  recentDonations: any[];
  userStats: {
    totalDonations: number;
    donationCount: number;
  };
}

interface Donation {
  id: number;
  amount: number;
  message: string;
  donorName: string;
  createdAt: string;
  isAnonymous: boolean;
}

export default function AlumniDonationsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DonationStats | null>(null);
  const [myDonations, setMyDonations] = useState<Donation[]>([]);

  useEffect(() => {
    fetchDonationData();
  }, []);

  const fetchDonationData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch stats
      const statsRes = await fetch("/api/donations/stats", { headers });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch user's donations
      const donationsRes = await fetch("/api/donations", { headers });
      if (donationsRes.ok) {
        const donationsData = await donationsRes.json();
        // Filter to get only current user's donations
        const userDonations = donationsData.donations.filter(
          (d: any) => d.donorName !== "Unknown" && !d.isAnonymous
        );
        setMyDonations(userDonations.slice(0, 10));
      }
    } catch (error) {
      console.error("Error fetching donation data:", error);
      toast.error("Failed to load donation data");
    } finally {
      setLoading(false);
    }
  };

  const handleDonationSuccess = () => {
    fetchDonationData();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Total Platform Donations",
      value: stats?.totalDonations
        ? `₹${stats.totalDonations.toLocaleString()}`
        : "₹0",
      description: "From all alumni",
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950",
    },
    {
      title: "Total Donations",
      value: stats?.donationCount || 0,
      description: "Number of contributions",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Your Contributions",
      value: stats?.userStats.totalDonations
        ? `₹${stats.userStats.totalDonations.toLocaleString()}`
        : "₹0",
      description: "Your total donations",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Your Impact",
      value: stats?.userStats.donationCount || 0,
      description: "Times you've contributed",
      icon: Award,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Donations</h1>
          <p className="text-muted-foreground mt-2">
            Support Terna Engineering College and make a difference
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Donation Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <DonationForm onSuccess={handleDonationSuccess} />
        </motion.div>

        {/* Recent Donations */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Recent Platform Donations</CardTitle>
              <CardDescription>
                Latest contributions from alumni
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats?.recentDonations && stats.recentDonations.length > 0 ? (
                stats.recentDonations.map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-start justify-between p-4 rounded-lg border"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{donation.donorName}</p>
                        {donation.isAnonymous && (
                          <Badge variant="secondary" className="text-xs">
                            Anonymous
                          </Badge>
                        )}
                      </div>
                      {donation.message && (
                        <p className="text-sm text-muted-foreground mt-1">
                          "{donation.message}"
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDate(donation.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        ₹{donation.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No recent donations yet. Be the first to contribute!
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* My Donations History */}
      {stats && stats.userStats.donationCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Your Donation History</CardTitle>
              <CardDescription>
                Your contributions to the college
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myDonations.length > 0 ? (
                  myDonations.map((donation) => (
                    <div
                      key={donation.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-muted/50"
                    >
                      <div className="flex-1">
                        <p className="font-medium">Donation to College Fund</p>
                        {donation.message && (
                          <p className="text-sm text-muted-foreground mt-1">
                            "{donation.message}"
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDate(donation.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          ₹{donation.amount.toLocaleString()}
                        </p>
                        <Badge variant="outline" className="mt-1">
                          Completed
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No donation history available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
