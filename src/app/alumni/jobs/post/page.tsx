"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Briefcase, X, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AlumniPostJobPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    description: "",
    location: "",
    jobType: "full-time",
    salary: "",
    branch: "",
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills((prev) => [...prev, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills((prev) => prev.filter((skill) => skill !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.company ||
      !formData.description ||
      !formData.location
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          branch: formData.branch === "all" ? null : formData.branch,
          skills,
          expiresAt: new Date(
            Date.now() + 90 * 24 * 60 * 60 * 1000
          ).toISOString(), // 90 days from now
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(
          "Job posted successfully! It will be visible after admin approval."
        );
        router.push("/alumni/jobs");
      } else {
        console.error("Job posting error:", data);
        toast.error(data.error || data.message || "Failed to post job");
      }
    } catch (error) {
      console.error("Error posting job:", error);
      toast.error("Failed to post job: " + (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Briefcase className="h-8 w-8" />
            Post a Job
          </h1>
          <p className="text-muted-foreground mt-2">
            Share job opportunities with students and help them kickstart their
            careers
          </p>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>
              Provide detailed information about the job opportunity. Your post
              will be reviewed by admins before being published.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Job Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g., Software Engineer, Data Analyst"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">
                    Company Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="company"
                    name="company"
                    placeholder="e.g., Google, Microsoft, Startup Inc."
                    value={formData.company}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Job Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                    rows={8}
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Job Type & Location */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="jobType">
                    Job Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.jobType}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, jobType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">
                    Location <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="e.g., Mumbai, Remote, Hybrid"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Salary & Branch */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary Range (Optional)</Label>
                  <Input
                    id="salary"
                    name="salary"
                    placeholder="e.g., ₹5-8 LPA, $80k-120k"
                    value={formData.salary}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch">Preferred Branch (Optional)</Label>
                  <Select
                    value={formData.branch}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, branch: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      <SelectItem value="computer">
                        Computer Engineering
                      </SelectItem>
                      <SelectItem value="electronics">
                        Electronics Engineering
                      </SelectItem>
                      <SelectItem value="mechanical">
                        Mechanical Engineering
                      </SelectItem>
                      <SelectItem value="civil">Civil Engineering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Required Skills */}
              <div className="space-y-2">
                <Label>Required Skills</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill (e.g., React, Python, Leadership)"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddSkill}
                    disabled={!newSkill.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? "Submitting..." : "Post Job"}
                </Button>
              </div>

              {/* Info Message */}
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Your job posting will be reviewed by
                  our admin team before being published. You'll receive a
                  notification once it's approved. This typically takes 24-48
                  hours.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
