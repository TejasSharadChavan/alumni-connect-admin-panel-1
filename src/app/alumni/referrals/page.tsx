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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Copy,
  CheckCircle,
  Users,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

interface Referral {
  id: number;
  code: string;
  company: string;
  position: string;
  description: string | null;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    company: "",
    position: "",
    description: "",
    maxUses: 10,
    expiresAt: "",
  });

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/referrals", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setReferrals(data.referrals);
      }
    } catch (error) {
      toast.error("Failed to load referrals");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/referrals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Referral created successfully!");
        setShowCreate(false);
        setFormData({
          company: "",
          position: "",
          description: "",
          maxUses: 10,
          expiresAt: "",
        });
        fetchReferrals();
      } else {
        toast.error(data.error || "Failed to create referral");
      }
    } catch (error) {
      toast.error("Failed to create referral");
    } finally {
      setCreating(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Referral code copied!");
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Referrals</h1>
          <p className="text-muted-foreground">
            Create and manage referral codes for students
          </p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Referral
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Referral</DialogTitle>
              <DialogDescription>
                Generate a referral code for students to use when applying
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  required
                  placeholder="e.g., Google, Microsoft"
                />
              </div>
              <div>
                <Label htmlFor="position">Position *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  required
                  placeholder="e.g., Software Engineer"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Additional details about the referral..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="maxUses">Maximum Uses</Label>
                <Input
                  id="maxUses"
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxUses: parseInt(e.target.value),
                    })
                  }
                  min={1}
                  max={100}
                />
              </div>
              <div>
                <Label htmlFor="expiresAt">Expiry Date (Optional)</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) =>
                    setFormData({ ...formData, expiresAt: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={creating} className="flex-1">
                  {creating ? "Creating..." : "Create Referral"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading referrals...</div>
      ) : referrals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No referrals yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first referral code to help students
            </p>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Referral
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {referrals.map((referral) => (
            <Card key={referral.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{referral.company}</CardTitle>
                    <CardDescription>{referral.position}</CardDescription>
                  </div>
                  <Badge variant={referral.isActive ? "default" : "secondary"}>
                    {referral.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {referral.description && (
                  <p className="text-sm text-muted-foreground">
                    {referral.description}
                  </p>
                )}

                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <code className="flex-1 font-mono font-semibold">
                    {referral.code}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyCode(referral.code)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Used</div>
                    <div className="font-semibold">
                      {referral.usedCount} / {referral.maxUses}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Created</div>
                    <div className="font-semibold">
                      {new Date(referral.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {referral.expiresAt && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Expires:{" "}
                      {new Date(referral.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
