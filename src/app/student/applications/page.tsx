"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleLayout } from "@/components/layout/role-layout";
import {
  MapPin,
  Building,
  Calendar,
  FileText,
  ExternalLink,
  Download,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Application {
  id: number;
  status: string;
  appliedAt: string;
  coverLetter: string | null;
  resumeUrl: string | null;
  job: {
    id: number;
    title: string;
    company: string;
    location: string;
    salary: string;
    jobType: string;
  };
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/jobs/applications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setApplications(data.applications);
      }
    } catch (error) {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
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
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "applied":
        return "Applied";
      case "interview":
        return "Interview";
      case "accepted":
        return "Accepted";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  };

  const filterApplications = (status?: string) => {
    if (!status) return applications;
    return applications.filter((app) => app.status === status);
  };

  const appliedCount = filterApplications("applied").length;
  const interviewCount = filterApplications("interview").length;
  const acceptedCount = filterApplications("accepted").length;
  const rejectedCount = filterApplications("rejected").length;

  if (loading) {
    return (
      <RoleLayout role="student">
        <div className="text-center py-12">Loading applications...</div>
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
          <h1 className="text-3xl font-bold mb-2">My Applications</h1>
          <p className="text-muted-foreground">
            Track your job applications and their status
          </p>
        </motion.div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{applications.length}</p>
                  <p className="text-sm text-muted-foreground">
                    Total Applications
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{appliedCount}</p>
                  <p className="text-sm text-muted-foreground">
                    Pending Review
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{acceptedCount}</p>
                  <p className="text-sm text-muted-foreground">Accepted</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{rejectedCount}</p>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applications Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
            <TabsTrigger value="applied">Applied ({appliedCount})</TabsTrigger>
            <TabsTrigger value="interview">
              Interview ({interviewCount})
            </TabsTrigger>
            <TabsTrigger value="accepted">
              Accepted ({acceptedCount})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <ApplicationsList
              applications={applications}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
            />
          </TabsContent>
          <TabsContent value="applied">
            <ApplicationsList
              applications={filterApplications("applied")}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
            />
          </TabsContent>
          <TabsContent value="interview">
            <ApplicationsList
              applications={filterApplications("interview")}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
            />
          </TabsContent>
          <TabsContent value="accepted">
            <ApplicationsList
              applications={filterApplications("accepted")}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
            />
          </TabsContent>
          <TabsContent value="rejected">
            <ApplicationsList
              applications={filterApplications("rejected")}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
            />
          </TabsContent>
        </Tabs>
      </div>
    </RoleLayout>
  );
}

function ApplicationsList({
  applications,
  getStatusColor,
  getStatusText,
}: {
  applications: Application[];
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}) {
  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No applications found</h3>
          <p className="text-muted-foreground">
            Start applying to jobs to see them here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application, index) => (
        <motion.div
          key={application.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-xl">
                    {application.job.title}
                  </CardTitle>
                  <CardDescription className="flex flex-wrap items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      {application.job.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {application.job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Applied{" "}
                      {new Date(application.appliedAt).toLocaleDateString()}
                    </span>
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(application.status)}>
                  {getStatusText(application.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <p className="text-sm text-muted-foreground">
                    {application.job.jobType} • {application.job.salary}
                  </p>
                  {application.coverLetter && (
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-sm font-medium mb-1">Cover Letter:</p>
                      <p className="text-sm text-muted-foreground">
                        {application.coverLetter.substring(0, 150)}
                        {application.coverLetter.length > 150 && "..."}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 items-start">
                  {application.resumeUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(application.resumeUrl!, "_blank")
                      }
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Resume
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/student/jobs`, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Job
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
