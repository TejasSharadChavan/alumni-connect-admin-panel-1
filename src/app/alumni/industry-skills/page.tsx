"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, ThumbsUp, ThumbsDown, Award } from "lucide-react";
import { toast } from "sonner";

interface IndustrySkill {
  id: number;
  skillName: string;
  category: string;
  industry: string;
  demandLevel: string;
  description: string | null;
  relatedSkills: string[] | null;
  averageSalaryImpact: string | null;
  learningResources: string[] | null;
  upvotes: number;
  downvotes: number;
  postedByName: string;
  postedByHeadline: string | null;
  userVote: string | null;
  netVotes: number;
}

export default function IndustrySkillsPage() {
  const [skills, setSkills] = useState<IndustrySkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    skillName: "",
    category: "technical",
    industry: "software",
    demandLevel: "high",
    description: "",
    relatedSkills: "",
    averageSalaryImpact: "",
    learningResources: "",
  });

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/industry-skills", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setSkills(data.skills);
      }
    } catch (error) {
      console.error("Error fetching skills:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/industry-skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          relatedSkills: formData.relatedSkills
            ? formData.relatedSkills.split(",").map((s) => s.trim())
            : null,
          learningResources: formData.learningResources
            ? formData.learningResources.split(",").map((s) => s.trim())
            : null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Industry skill posted successfully!");
        setShowForm(false);
        setFormData({
          skillName: "",
          category: "technical",
          industry: "software",
          demandLevel: "high",
          description: "",
          relatedSkills: "",
          averageSalaryImpact: "",
          learningResources: "",
        });
        fetchSkills();
      } else {
        toast.error(data.error || "Failed to post skill");
      }
    } catch (error) {
      console.error("Error creating skill:", error);
      toast.error("Failed to post skill. Please try again.");
    }
  };

  const handleVote = async (skillId: number, voteType: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      await fetch(`/api/industry-skills/${skillId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ voteType }),
      });
      fetchSkills();
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const getDemandColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Industry Skills</h1>
          <p className="text-muted-foreground">
            Share current industry-required skills to help students stay
            competitive
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Post New Skill
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Post Industry Skill</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Skill Name *</label>
                <Input
                  value={formData.skillName}
                  onChange={(e) =>
                    setFormData({ ...formData, skillName: e.target.value })
                  }
                  placeholder="e.g., React.js, Python, AWS"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Category *</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="soft_skill">Soft Skill</SelectItem>
                      <SelectItem value="tool">Tool</SelectItem>
                      <SelectItem value="framework">Framework</SelectItem>
                      <SelectItem value="language">Language</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Industry *</label>
                  <Select
                    value={formData.industry}
                    onValueChange={(value) =>
                      setFormData({ ...formData, industry: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="software">Software</SelectItem>
                      <SelectItem value="data_science">Data Science</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Demand Level *</label>
                  <Select
                    value={formData.demandLevel}
                    onValueChange={(value) =>
                      setFormData({ ...formData, demandLevel: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Why is this skill important in the industry?"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Related Skills (comma-separated)
                </label>
                <Input
                  value={formData.relatedSkills}
                  onChange={(e) =>
                    setFormData({ ...formData, relatedSkills: e.target.value })
                  }
                  placeholder="e.g., JavaScript, TypeScript, Node.js"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Average Salary Impact
                </label>
                <Input
                  value={formData.averageSalaryImpact}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      averageSalaryImpact: e.target.value,
                    })
                  }
                  placeholder="e.g., +15%, $10k-20k"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Learning Resources (comma-separated URLs)
                </label>
                <Textarea
                  value={formData.learningResources}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      learningResources: e.target.value,
                    })
                  }
                  placeholder="https://example.com/course1, https://example.com/course2"
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Post Skill</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {skills.map((skill) => (
          <Card key={skill.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{skill.skillName}</h3>
                    <Badge className={getDemandColor(skill.demandLevel)}>
                      {skill.demandLevel} demand
                    </Badge>
                    <Badge variant="outline">{skill.category}</Badge>
                    <Badge variant="secondary">{skill.industry}</Badge>
                  </div>

                  {skill.description && (
                    <p className="text-muted-foreground mb-3">
                      {skill.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm">
                    {skill.relatedSkills && skill.relatedSkills.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Related:</span>
                        <div className="flex flex-wrap gap-1">
                          {skill.relatedSkills.map((rs, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs"
                            >
                              {rs}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {skill.averageSalaryImpact && (
                      <div className="flex items-center gap-2 text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span>Salary Impact: {skill.averageSalaryImpact}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Award className="w-4 h-4" />
                      <span>
                        Posted by {skill.postedByName}
                        {skill.postedByHeadline &&
                          ` • ${skill.postedByHeadline}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 ml-4">
                  <Button
                    size="sm"
                    variant={
                      skill.userVote === "upvote" ? "default" : "outline"
                    }
                    onClick={() => handleVote(skill.id, "upvote")}
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </Button>
                  <span className="font-semibold text-lg">
                    {skill.netVotes}
                  </span>
                  <Button
                    size="sm"
                    variant={
                      skill.userVote === "downvote" ? "default" : "outline"
                    }
                    onClick={() => handleVote(skill.id, "downvote")}
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {skills.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No industry skills posted yet. Be the first to share!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
