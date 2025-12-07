"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  Target,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Award,
  Sparkles,
} from "lucide-react";

interface SkillGapAnalysis {
  matchPercentage: number;
  totalIndustrySkills: number;
  matchedSkills: number;
  missingSkills: number;
  highDemandGaps: number;
  gapsByCategory: Array<{
    category: string;
    count: number;
    skills: any[];
  }>;
  topGaps: any[];
  recommendations: any[];
  currentSkills: number;
}

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
  netVotes: number;
}

export default function SkillGapPage() {
  const [analysis, setAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [allSkills, setAllSkills] = useState<IndustrySkill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("auth_token");

      // Fetch skill gap analysis
      const analysisResponse = await fetch("/api/analytics/skill-gap", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const analysisData = await analysisResponse.json();

      // Fetch all industry skills
      const skillsResponse = await fetch("/api/industry-skills", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const skillsData = await skillsResponse.json();

      if (analysisData.success) {
        setAnalysis(analysisData.analysis);
      }
      if (skillsData.success) {
        setAllSkills(skillsData.skills);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
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

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Skill Gap Analysis</h1>
        <p className="text-muted-foreground">
          Compare your skills with current industry requirements
        </p>
      </div>

      {analysis && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Match Score</p>
                    <p
                      className={`text-3xl font-bold ${getMatchColor(
                        analysis.matchPercentage
                      )}`}
                    >
                      {analysis.matchPercentage}%
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-muted-foreground" />
                </div>
                <Progress value={analysis.matchPercentage} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Your Skills</p>
                    <p className="text-3xl font-bold">
                      {analysis.currentSkills}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Missing Skills
                    </p>
                    <p className="text-3xl font-bold text-orange-600">
                      {analysis.missingSkills}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      High Priority
                    </p>
                    <p className="text-3xl font-bold text-red-600">
                      {analysis.highDemandGaps}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="gaps" className="space-y-4">
            <TabsList>
              <TabsTrigger value="gaps">Skill Gaps</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="all">All Industry Skills</TabsTrigger>
            </TabsList>

            <TabsContent value="gaps" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>High Priority Skills to Learn</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysis.topGaps.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Great job! You have all the high-demand skills.
                    </p>
                  ) : (
                    analysis.topGaps.map((skill: any) => (
                      <div
                        key={skill.id}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold">
                                {skill.skillName}
                              </h3>
                              <Badge
                                className={getDemandColor(skill.demandLevel)}
                              >
                                {skill.demandLevel} demand
                              </Badge>
                              <Badge variant="outline">{skill.category}</Badge>
                            </div>
                            {skill.description && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {skill.description}
                              </p>
                            )}
                            {skill.averageSalaryImpact && (
                              <div className="flex items-center gap-2 text-sm text-green-600">
                                <TrendingUp className="w-4 h-4" />
                                <span>
                                  Salary Impact: {skill.averageSalaryImpact}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {skill.learningResources &&
                          skill.learningResources.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">
                                Learning Resources:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {skill.learningResources.map(
                                  (resource: string, idx: number) => (
                                    <Button
                                      key={idx}
                                      variant="outline"
                                      size="sm"
                                      asChild
                                    >
                                      <a
                                        href={resource}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <ExternalLink className="w-3 h-3 mr-1" />
                                        Resource {idx + 1}
                                      </a>
                                    </Button>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {skill.relatedSkills &&
                          skill.relatedSkills.length > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium">Related:</span>
                              <div className="flex flex-wrap gap-1">
                                {skill.relatedSkills.map(
                                  (rs: string, idx: number) => (
                                    <Badge
                                      key={idx}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {rs}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Gaps by Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Gaps by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.gapsByCategory.map((cat) => (
                      <div key={cat.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium capitalize">
                            {cat.category.replace("_", " ")}
                          </span>
                          <Badge>{cat.count} skills</Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {cat.skills.map((skill: any) => (
                            <Badge key={skill.id} variant="outline">
                              {skill.skillName}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Personalized Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysis.recommendations.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Add more skills to get personalized recommendations
                    </p>
                  ) : (
                    analysis.recommendations.map((skill: any) => (
                      <div
                        key={skill.id}
                        className="border rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">
                            {skill.skillName}
                          </h3>
                          <Badge className={getDemandColor(skill.demandLevel)}>
                            {skill.demandLevel} demand
                          </Badge>
                          <Badge variant="outline">{skill.industry}</Badge>
                        </div>
                        {skill.description && (
                          <p className="text-sm text-muted-foreground">
                            {skill.description}
                          </p>
                        )}
                        {skill.relatedSkills && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">Builds on:</span>
                            <div className="flex flex-wrap gap-1">
                              {skill.relatedSkills.map(
                                (rs: string, idx: number) => (
                                  <Badge
                                    key={idx}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {rs}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              <div className="grid gap-4">
                {allSkills.map((skill) => (
                  <Card key={skill.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">
                              {skill.skillName}
                            </h3>
                            <Badge
                              className={getDemandColor(skill.demandLevel)}
                            >
                              {skill.demandLevel} demand
                            </Badge>
                            <Badge variant="outline">{skill.category}</Badge>
                            <Badge variant="secondary">{skill.industry}</Badge>
                          </div>
                          {skill.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {skill.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Award className="w-4 h-4" />
                            <span>Posted by {skill.postedByName}</span>
                            <span>•</span>
                            <span>{skill.netVotes} votes</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
