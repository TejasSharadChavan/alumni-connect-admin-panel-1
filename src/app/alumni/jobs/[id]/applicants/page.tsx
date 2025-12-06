"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Download,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface Applicant {
  id: number;
  status: string;
  appliedAt: string;
  coverLetter: string | null;
  resumeUrl: string | null;
  student: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    branch: string | null;
    cohort: string | null;
  };
}

export default function JobApplicantsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const fetchApplicants = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/jobs/${jobId}/applicants`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setApplicants(data.applicants);
        setJobTitle(data.jobTitle);
      } else {
        toast.error(data.error || "Failed to load applicants");
      }
    } catch (error) {
      toast.error("Failed to load applicants");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId: number, newStatus: string) => {
    try {
      setUpdating(applicationId);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `/api/jobs/applications/${applicationId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success(`Application ${newStatus}`);
        fetchApplicants(); // Refresh list
      } else {
        toast.error(data.error || "Failed to update status");
      }
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "interview":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "accepted":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filterByStatus = (status?: string) => {
    if (!status) return applicants;
    return applicants.filter((app) => app.status === status);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">Loading applicants...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Jobs
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Applicants for {jobTitle}</h1>
        <p className="text-muted-foreground">
          Manage applications and update candidate status
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All ({applicants.length})</TabsTrigger>
          <TabsTrigger value="applied">
            Applied ({filterByStatus("applied").length})
          </TabsTrigger>
          <TabsTrigger value="interview">
            Interview ({filterByStatus("interview").length})
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Accepted ({filterByStatus("accepted").length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({filterByStatus("rejected").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ApplicantsList
            applicants={applicants}
            updateStatus={updateStatus}
            updating={updating}
            getStatusColor={getStatusColor}
          />
        </TabsContent>
        <TabsContent value="applied">
          <ApplicantsList
            applicants={filterByStatus("applied")}
            updateStatus={updateStatus}
            updating={updating}
            getStatusColor={getStatusColor}
          />
        </TabsContent>
        <TabsContent value="interview">
          <ApplicantsList
            applicants={filterByStatus("interview")}
            updateStatus={updateStatus}
            updating={updating}
            getStatusColor={getStatusColor}
          />
        </TabsContent>
        <TabsContent value="accepted">
          <ApplicantsList
            applicants={filterByStatus("accepted")}
            updateStatus={updateStatus}
            updating={updating}
            getStatusColor={getStatusColor}
          />
        </TabsContent>
        <TabsContent value="rejected">
          <ApplicantsList
            applicants={filterByStatus("rejected")}
            updateStatus={updateStatus}
            updating={updating}
            getStatusColor={getStatusColor}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ApplicantsList({
  applicants,
  updateStatus,
  updating,
  getStatusColor,
}: {
  applicants: Applicant[];
  updateStatus: (id: number, status: string) => void;
  updating: number | null;
  getStatusColor: (status: string) => string;
}) {
  if (applicants.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No applicants yet</h3>
          <p className="text-muted-foreground">
            Applications will appear here once students apply
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {applicants.map((applicant) => (
        <Card key={applicant.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {applicant.student.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">
                    {applicant.student.name}
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    {applicant.student.branch && (
                      <span>{applicant.student.branch}</span>
                    )}
                    {applicant.student.cohort && (
                      <span>Batch {applicant.student.cohort}</span>
                    )}
                    <span>
                      Applied{" "}
                      {new Date(applicant.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <Badge className={getStatusColor(applicant.status)}>
                {applicant.status.charAt(0).toUpperCase() +
                  applicant.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 text-sm">
              {applicant.student.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${applicant.student.email}`}
                    className="text-primary hover:underline"
                  >
                    {applicant.student.email}
                  </a>
                </div>
              )}
              {applicant.student.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{applicant.student.phone}</span>
                </div>
              )}
            </div>

            {applicant.coverLetter && (
              <div>
                <h4 className="font-semibold mb-2">Cover Letter</h4>
                <p className="text-sm text-muted-foreground">
                  {applicant.coverLetter}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 pt-4 border-t">
              {applicant.resumeUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(applicant.resumeUrl!, "_blank")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  View Resume
                </Button>
              )}

              {applicant.status === "applied" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus(applicant.id, "interview")}
                    disabled={updating === applicant.id}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Schedule Interview
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => updateStatus(applicant.id, "accepted")}
                    disabled={updating === applicant.id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => updateStatus(applicant.id, "rejected")}
                    disabled={updating === applicant.id}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}

              {applicant.status === "interview" && (
                <>
                  <Button
                    size="sm"
                    onClick={() => updateStatus(applicant.id, "accepted")}
                    disabled={updating === applicant.id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => updateStatus(applicant.id, "rejected")}
                    disabled={updating === applicant.id}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
