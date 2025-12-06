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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  Briefcase,
  GraduationCap,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Brain,
  Zap,
  BookOpen,
  Award,
  Clock,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface SkillGapData {
  student: {
    name: string;
    branch: string;
    cohort: string;
    currentSkills: number;
  };
  skillGapAnalysis: {
    currentSkills: any[];
    missingSkills: any[];
    totalGaps: number;
    criticalGaps: number;
  };
  careerPath: {
    connectedAlumni: number;
    learningPaths: any[];
    careerInsights: any;
  };
  marketIntelligence: {
    totalJobsAnalyzed: number;
    totalAlumniAnalyzed: number;
    topDemandSkills: any[];
  };
  aiInsights: any[];
  recommendations: any[];
}

export function SkillGapDashboard() {
  const [data, setData] = useState<SkillGapData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/student/skill-gap-analysis", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      } else {
        toast.error("Failed to load skill analysis");
      }
    } catch (error) {
      console.error("Error fetching analysis:", error);
      toast.error("Failed to load skill analysis");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">
                Analyzing your skills...
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No analysis data available</p>
        </CardContent>
      </Card>
    );
  }

  const skillCoverage = Math.round(
    (data.student.currentSkills /
      (data.student.currentSkills + data.skillGapAnalysis.totalGaps)) *
      100
  );

  return (
    <div className="space-y-6">
      {/* AI Insights Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-lg p-6 text-white"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-lg backdrop-blur">
            <Brain className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI-Powered Career Intelligence
            </h3>
            <p className="text-white/90 text-sm">
              Personalized insights based on{" "}
              {data.marketIntelligence.totalAlumniAnalyzed} alumni profiles and{" "}
              {data.marketIntelligence.totalJobsAnalyzed} active job postings
            </p>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Skill Coverage
                  </p>
                  <p className="text-3xl font-bold">{skillCoverage}%</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <Progress value={skillCoverage} className="mt-3" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Skills to Learn
                  </p>
                  <p className="text-3xl font-bold">
                    {data.skillGapAnalysis.totalGaps}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <BookOpen className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {data.skillGapAnalysis.criticalGaps} high priority
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Connected Alumni
                  </p>
                  <p className="text-3xl font-bold">
                    {data.careerPath.connectedAlumni}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Expand your network
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Career Readiness
                  </p>
                  <p className="text-3xl font-bold">
                    {data.aiInsights.find((i) => i.type === "career_readiness")
                      ?.score || skillCoverage}
                    %
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Briefcase className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                For target roles
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            AI-Generated Insights
          </CardTitle>
          <CardDescription>
            Personalized recommendations based on your profile and goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.aiInsights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.priority === "high"
                    ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                    : insight.priority === "medium"
                      ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
                      : "border-green-500 bg-green-50 dark:bg-green-950/20"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1 flex items-center gap-2">
                      {insight.title}
                      <Badge
                        variant={
                          insight.priority === "high"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {insight.priority}
                      </Badge>
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {insight.message}
                    </p>
                    {insight.skills && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {insight.skills.map((skill: string) => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  {insight.actionable && (
                    <Button size="sm" variant="outline">
                      {insight.action}
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for detailed analysis */}
      <Tabs defaultValue="gaps" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="gaps">Skill Gaps</TabsTrigger>
          <TabsTrigger value="current">Current Skills</TabsTrigger>
          <TabsTrigger value="paths">Learning Paths</TabsTrigger>
          <TabsTrigger value="market">Market Intel</TabsTrigger>
        </TabsList>

        {/* Skill Gaps Tab */}
        <TabsContent value="gaps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Missing Skills Analysis</CardTitle>
              <CardDescription>
                Skills you should learn based on alumni success and market
                demand
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.skillGapAnalysis.missingSkills
                  .slice(0, 10)
                  .map((gap, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{gap.skill}</span>
                          <Badge
                            variant={
                              gap.demandLevel === "High"
                                ? "destructive"
                                : gap.demandLevel === "Medium"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {gap.demandLevel} Demand
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>{gap.alumniWithSkill} alumni have this</span>
                          <span>•</span>
                          <span>{gap.jobsRequiring} jobs require this</span>
                          {gap.avgSalary && (
                            <>
                              <span>•</span>
                              <span className="text-green-600 dark:text-green-400">
                                {gap.avgSalary}
                              </span>
                            </>
                          )}
                        </div>
                        {gap.commonRoles.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {gap.commonRoles.map((role: string) => (
                              <Badge
                                key={role}
                                variant="outline"
                                className="text-xs"
                              >
                                {role}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {gap.importanceScore}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Priority
                          </div>
                        </div>
                        <Button size="sm">Learn</Button>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Current Skills Tab */}
        <TabsContent value="current" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Current Skills</CardTitle>
              <CardDescription>
                Market value and demand analysis of your existing skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.skillGapAnalysis.currentSkills.map((skill, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg border bg-green-50 dark:bg-green-950/20"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium">{skill.skill}</span>
                        <Badge
                          variant={
                            skill.demandLevel === "High"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {skill.demandLevel} Demand
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{skill.alumniWithSkill} alumni have this</span>
                        <span>•</span>
                        <span>{skill.jobsRequiring} jobs need this</span>
                        {skill.marketValue && (
                          <>
                            <span>•</span>
                            <span className="text-green-600 dark:text-green-400">
                              {skill.marketValue}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learning Paths Tab */}
        <TabsContent value="paths" className="space-y-4">
          {data.careerPath.learningPaths.length > 0 ? (
            data.careerPath.learningPaths.map((path, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={path.alumniImage} />
                        <AvatarFallback>
                          {path.alumniName
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {path.alumniName}
                        </CardTitle>
                        <CardDescription>{path.alumniRole}</CardDescription>
                        {path.yearsExperience && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {path.yearsExperience} years of experience
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Clock className="h-3 w-3" />
                        {path.estimatedTimeToReach}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          Skills to Learn
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {path.skillsToLearn.map((skill: string) => (
                            <Badge key={skill} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Recommended Actions
                        </h4>
                        <div className="space-y-2">
                          {path.recommendedActions.map(
                            (action: string, i: number) => (
                              <div
                                key={i}
                                className="flex items-center gap-2 text-sm"
                              >
                                <ArrowRight className="h-4 w-4 text-primary" />
                                <span>{action}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                      <Button className="w-full">
                        Request Mentorship from {path.alumniName.split(" ")[0]}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Connect with Alumni</h3>
                <p className="text-muted-foreground mb-4">
                  Connect with alumni to get personalized learning paths based
                  on their career journey
                </p>
                <Button>Browse Alumni</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Market Intelligence Tab */}
        <TabsContent value="market" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Market Intelligence
              </CardTitle>
              <CardDescription>
                Real-time analysis of{" "}
                {data.marketIntelligence.totalJobsAnalyzed} job postings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.marketIntelligence.topDemandSkills.map((skill, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-3 rounded-lg border"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{skill.skill}</div>
                      <div className="text-xs text-muted-foreground">
                        Required in {skill.demand} job postings
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {skill.roles.map((role: string) => (
                          <Badge
                            key={role}
                            variant="outline"
                            className="text-xs"
                          >
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <TrendingUp className="h-5 w-5 text-green-600 ml-auto" />
                      <div className="text-xs text-muted-foreground mt-1">
                        High demand
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Personalized Recommendations
          </CardTitle>
          <CardDescription>
            Action items to accelerate your career growth
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg border"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{rec.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {rec.description}
                    </p>
                  </div>
                  <Badge
                    variant={
                      rec.priority === "high" ? "destructive" : "secondary"
                    }
                  >
                    {rec.priority}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {rec.items.map((item: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-2 rounded bg-muted/50"
                    >
                      <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {item.action || item.skill}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.benefit || item.reason}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
