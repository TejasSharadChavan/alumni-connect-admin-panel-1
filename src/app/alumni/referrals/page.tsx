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
  jobId?: number | null; // Optional until migration
  code: string;
  company: string;
  position: string;
  description: string | null;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  jobTitle?: string | null;
  jobStatus?: string | null;
}

interface Job {
  id: number;
  title: string;
  company: string;
  description: string;
  location: string;
  jobType: string;
  salary?: string;
  skills: string[];
  status: string;
  createdAt: string;
  expiresAt: string;
}

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>("");

  const [formData, setFormData] = useState({
    jobId: "",
    company: "",
    position: "",
    description: "",
    maxUses: 10,
    expiresAt: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch referrals first
      const referralsResponse = await fetch("/api/referrals", { headers });
      const referralsData = await referralsResponse.json();

      if (referralsData.success) {
        setReferrals(referralsData.referrals);
      }

      // Try to fetch jobs (may fail if API doesn't exist yet)
      try {
        const jobsResponse = await fetch("/api/alumni/jobs", { headers });
        const jobsData = await jobsResponse.json();
        if (jobsData.success) {
          setJobs(jobsData.jobs);
        }
      } catch (jobError) {
        console.log("Alumni jobs API not available yet");
        setJobs([]);
      }
    } catch (error) {
      toast.error("Failed to load referrals");
    } finally {
      setLoading(false);
    }
  };

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
          jobId: "",
          company: "",
          position: "",
          description: "",
          maxUses: 10,
          expiresAt: "",
        });
        setSelectedJobId("");
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

  const handleJobSelection = (jobId: string) => {
    setSelectedJobId(jobId);
    if (jobId) {
      const selectedJob = jobs.find((j) => j.id.toString() === jobId);
      if (selectedJob) {
        setFormData((prev) => ({
          ...prev,
          jobId,
          company: selectedJob.company,
          position: selectedJob.title,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        jobId: "",
        company: "",
        position: "",
      }));
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
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
                  <Label htmlFor="jobSelect">Select Job (Optional)</Label>
                  <select
                    id="jobSelect"
                    value={selectedJobId}
                    onChange={(e) => handleJobSelection(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Create general referral</option>
                    {jobs
                      .filter((job) => job.status === "approved")
                      .map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.title} at {job.company}
                        </option>
                      ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select a job you posted to create a specific referral, or
                    leave empty for general referral
                  </p>
                </div>
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
                    disabled={!!selectedJobId}
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
                    disabled={!!selectedJobId}
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

        {/* Jobs Summary */}
        {jobs.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Your Posted Jobs ({jobs.length})
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              You can create job-specific referrals for these positions:
            </p>
            <div className="grid gap-2 md:grid-cols-2">
              {jobs.slice(0, 4).map((job) => (
                <div key={job.id} className="text-sm">
                  <span className="font-medium">{job.title}</span> at{" "}
                  <span className="text-blue-800 dark:text-blue-200">
                    {job.company}
                  </span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {job.status}
                  </Badge>
                </div>
              ))}
              {jobs.length > 4 && (
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  +{jobs.length - 4} more jobs
                </div>
              )}
            </div>
          </div>
        )}
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
                    <CardTitle className="flex items-center gap-2">
                      {referral.company}
                      {referral.jobId && (
                        <Badge variant="outline" className="text-xs">
                          Job-Specific
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {referral.position}
                      {referral.jobTitle &&
                        referral.jobTitle !== referral.position && (
                          <span className="text-xs block text-muted-foreground">
                            Job: {referral.jobTitle}
                          </span>
                        )}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge
                      variant={referral.isActive ? "default" : "secondary"}
                    >
                      {referral.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {referral.jobStatus && (
                      <Badge variant="outline" className="text-xs">
                        Job: {referral.jobStatus}
                      </Badge>
                    )}
                  </div>
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
