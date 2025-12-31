"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { JobApplicantsView } from "@/components/job-applicants-view";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function JobApplicantsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = parseInt(params.id as string);
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setJobTitle(data.title);
        }
      } else {
        toast.error("Job not found");
        router.push("/alumni/jobs");
      }
    } catch (error) {
      console.error("Error fetching job:", error);
      toast.error("Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-gray-200 animate-pulse rounded" />
        <div className="h-96 bg-gray-200 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>
      </div>

      <JobApplicantsView jobId={jobId} jobTitle={jobTitle} />
    </div>
  );
}
