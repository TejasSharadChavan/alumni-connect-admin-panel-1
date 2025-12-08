"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RoleLayout } from "@/components/layout/role-layout";
import {
  ArrowLeft,
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Campaign {
  id: number;
  title: string;
  description: string;
  category: string;
  goalAmount: number;
  currentAmount: number;
  status: string;
  startDate: string;
  endDate: string;
  imageUrl?: string;
  createdAt: string;
}

interface Donation {
  id: number;
  amount: number;
  message?: string;
  isAnonymous: boolean;
  createdAt: string;
  userId: number;
  userName?: string;
  userEmail?: string;
}

export default function CampaignDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [totalDonations, setTotalDonations] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    fetchCampaignDetails();
    fetchDonations();
  }, [campaignId]);

  const fetchCampaignDetails = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/admin/campaigns/${campaignId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCampaign(data.campaign);
      } else {
        toast.error("Failed to load campaign details");
      }
    } catch (error) {
      console.error("Error fetching campaign:", error);
      toast.error("Failed to load campaign");
    }
  };

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `/api/admin/campaigns/${campaignId}/donations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDonations(data.donations || []);
        setTotalDonations(data.total || 0);
        setTotalAmount(data.totalAmount || 0);
      }
    } catch (error) {
      console.error("Error fetching donations:", error);
      toast.error("Failed to load donations");
    } finally {
      setLoading(false);
    }
  };

  const getProgress = () => {
    if (!campaign) return 0;
    return Math.min((campaign.currentAmount / campaign.goalAmount) * 100, 100);
  };

  const exportDonations = () => {
    if (donations.length === 0) {
      toast.error("No donations to export");
      return;
    }

    const csv = [
      ["Date", "Donor Name", "Email", "Amount", "Message", "Anonymous"],
      ...donations.map((d) => [
        new Date(d.createdAt).toLocaleDateString(),
        d.isAnonymous ? "Anonymous" : d.userName || "Unknown",
        d.isAnonymous ? "-" : d.userEmail || "-",
        `₹${d.amount.toLocaleString()}`,
        d.message || "-",
        d.isAnonymous ? "Yes" : "No",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campaign-${campaignId}-donations.csv`;
    a.click();
    toast.success("Donations exported successfully");
  };

  if (!campaign) {
    return (
      <RoleLayout role="admin">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">Loading campaign details...</p>
          </div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout role="admin">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{campaign.title}</h1>
              <p className="text-muted-foreground mt-2">
                {campaign.description}
              </p>
            </div>
            <Badge
              variant={campaign.status === "active" ? "default" : "secondary"}
            >
              {campaign.status}
            </Badge>
          </div>
        </motion.div>

        {/* Campaign Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Goal Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{campaign.goalAmount.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Raised</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{campaign.currentAmount.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {getProgress().toFixed(1)}% of goal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Donors
              </CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDonations}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Days Left</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.max(
                  0,
                  Math.ceil(
                    (new Date(campaign.endDate).getTime() -
                      new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={getProgress()} className="h-3" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>₹{campaign.currentAmount.toLocaleString()} raised</span>
                <span>Goal: ₹{campaign.goalAmount.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Donations List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Donations ({totalDonations})</CardTitle>
                <CardDescription>
                  List of all donations for this campaign
                </CardDescription>
              </div>
              <Button onClick={exportDonations} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading donations...</div>
            ) : donations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No donations yet for this campaign
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Donor</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donations.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell>
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {donation.isAnonymous ? (
                          <Badge variant="secondary">Anonymous</Badge>
                        ) : (
                          donation.userName || "Unknown"
                        )}
                      </TableCell>
                      <TableCell>
                        {donation.isAnonymous ? "-" : donation.userEmail || "-"}
                      </TableCell>
                      <TableCell className="font-semibold">
                        ₹{donation.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {donation.message || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Campaign Details */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <Badge variant="outline" className="mt-1">
                  {campaign.category}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className="mt-1">{campaign.status}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium mt-1">
                  {new Date(campaign.startDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="font-medium mt-1">
                  {new Date(campaign.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleLayout>
  );
}
