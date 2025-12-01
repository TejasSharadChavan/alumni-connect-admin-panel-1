"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RoleLayout } from "@/components/layout/role-layout";
import { Upload, Loader2, Plus, X, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Team {
  id: number;
  name: string;
  description: string;
  projectName: string;
}

export default function SubmitProjectPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [techInput, setTechInput] = useState("");

  const [formData, setFormData] = useState({
    teamId: "",
    title: "",
    description: "",
    repositoryUrl: "",
    demoUrl: "",
    documentUrl: "",
    technologies: [] as string[],
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      // For now using mock data - in real app would fetch from API
      const mockTeams: Team[] = [
        {
          id: 1,
          name: "AI Research Team",
          description: "Machine learning project",
          projectName: "Sentiment Analysis AI",
        },
        {
          id: 2,
          name: "Campus App Team",
          description: "Mobile app development",
          projectName: "Campus Services App",
        },
      ];
      setTeams(mockTeams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast.error("Failed to load teams");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTechnology = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData({
        ...formData,
        technologies: [...formData.technologies, techInput.trim()],
      });
      setTechInput("");
    }
  };

  const handleRemoveTechnology = (tech: string) => {
    setFormData({
      ...formData,
      technologies: formData.technologies.filter((t) => t !== tech),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.teamId || !formData.title || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("auth_token");

      const response = await fetch("/api/project-submissions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamId: parseInt(formData.teamId),
          title: formData.title,
          description: formData.description,
          repositoryUrl: formData.repositoryUrl || undefined,
          demoUrl: formData.demoUrl || undefined,
          documentUrl: formData.documentUrl || undefined,
          technologies: formData.technologies.length > 0 ? formData.technologies : undefined,
        }),
      });

      if (response.ok) {
        toast.success("Project submitted successfully! Waiting for faculty review.");
        router.push("/student/projects");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to submit project");
      }
    } catch (error) {
      console.error("Error submitting project:", error);
      toast.error("Failed to submit project");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <RoleLayout role="student">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout role="student">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/student/projects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Submit Project for Approval</h1>
            <p className="text-muted-foreground mt-2">
              Submit your project to faculty for review and grading
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Project Submission Form</CardTitle>
            <CardDescription>
              Fill in the details about your project. All fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="team">Select Team/Project *</Label>
                <Select
                  value={formData.teamId}
                  onValueChange={(value) => setFormData({ ...formData, teamId: value })}
                  required
                >
                  <SelectTrigger id="team">
                    <SelectValue placeholder="Choose your team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name} - {team.projectName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select the team/project you're submitting for
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., AI-Powered Sentiment Analysis Platform"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Project Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your project, its objectives, implementation details, and outcomes..."
                  rows={8}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Provide a comprehensive description of your project (minimum 100 characters)
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="repository">Repository URL</Label>
                  <Input
                    id="repository"
                    type="url"
                    value={formData.repositoryUrl}
                    onChange={(e) => setFormData({ ...formData, repositoryUrl: e.target.value })}
                    placeholder="https://github.com/username/project"
                  />
                  <p className="text-xs text-muted-foreground">
                    Link to GitHub, GitLab, or other code repository
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="demo">Live Demo URL</Label>
                  <Input
                    id="demo"
                    type="url"
                    value={formData.demoUrl}
                    onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                    placeholder="https://your-project-demo.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Link to hosted demo or video demonstration
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="document">Documentation URL</Label>
                <Input
                  id="document"
                  type="url"
                  value={formData.documentUrl}
                  onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })}
                  placeholder="https://drive.google.com/file/..."
                />
                <p className="text-xs text-muted-foreground">
                  Link to project documentation, report, or presentation
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tech">Technologies Used</Label>
                <div className="flex gap-2">
                  <Input
                    id="tech"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTechnology();
                      }
                    }}
                    placeholder="e.g., React, Node.js, Python"
                  />
                  <Button type="button" variant="outline" onClick={handleAddTechnology}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.technologies.map((tech) => (
                      <Badge key={tech} variant="secondary" className="gap-1">
                        {tech}
                        <button
                          type="button"
                          onClick={() => handleRemoveTechnology(tech)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Add technologies one at a time and press Enter or click +
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Submit Project
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/student/projects">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </RoleLayout>
  );
}
