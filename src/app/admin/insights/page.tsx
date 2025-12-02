"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoleLayout } from "@/components/layout/role-layout";
import { Brain, TrendingUp, AlertTriangle, Sparkles, Target, Users, Zap, Award, LightbulbIcon } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function AIInsightsPage() {
  // Mock AI-generated insights
  const predictiveData = [
    { month: "Feb", predicted: 320, actual: 310 },
    { month: "Mar", predicted: 380, actual: 365 },
    { month: "Apr", predicted: 450, actual: 420 },
    { month: "May", predicted: 520, actual: 0 },
    { month: "Jun", predicted: 600, actual: 0 },
  ];

  const insights = [
    {
      icon: TrendingUp,
      title: "User Growth Acceleration",
      description: "Platform experiencing 28% month-over-month growth. Predict 600+ users by June 2024.",
      priority: "high",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      icon: AlertTriangle,
      title: "Pending Approvals Bottleneck",
      description: "Average approval time increased to 48 hours. Consider adding more admin reviewers.",
      priority: "medium",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
    {
      icon: Sparkles,
      title: "Peak Engagement Hours",
      description: "Users most active between 2-4 PM and 7-9 PM. Schedule important announcements accordingly.",
      priority: "low",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      icon: Target,
      title: "Job Application Success Rate",
      description: "Students with complete profiles are 3.2x more likely to receive interview calls.",
      priority: "high",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
  ];

  const recommendations = [
    {
      icon: Users,
      title: "Increase Alumni Engagement",
      action: "Launch monthly alumni spotlight series and success stories",
      impact: "+35% expected engagement",
    },
    {
      icon: Zap,
      title: "Optimize Event Timing",
      action: "Schedule events on weekends for 2x better attendance",
      impact: "+45% attendance rate",
    },
    {
      icon: Award,
      title: "Gamification Strategy",
      action: "Introduce points system for profile completion and participation",
      impact: "+60% profile completion",
    },
    {
      icon: LightbulbIcon,
      title: "Mentorship Matching",
      action: "AI-powered mentor-mentee matching based on skills and interests",
      impact: "+80% satisfaction rate",
    },
  ];

  const skillTrends = [
    { skill: "React", demand: 95 },
    { skill: "Node.js", demand: 88 },
    { skill: "Python", demand: 92 },
    { skill: "Machine Learning", demand: 85 },
    { skill: "Cloud Computing", demand: 90 },
  ];

  return (
    <RoleLayout role="admin">
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                AI Insights & Predictions
                <Sparkles className="h-6 w-6 text-yellow-500" />
              </h1>
              <p className="text-muted-foreground">Machine learning-powered platform intelligence</p>
            </div>
          </div>
        </motion.div>

        {/* Predictive Analytics */}
        <Card className="border-2 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Predictive User Growth
            </CardTitle>
            <CardDescription>AI forecast based on historical patterns and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={predictiveData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} name="Actual Users" />
                <Line type="monotone" dataKey="predicted" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" name="AI Prediction" />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 p-4 bg-white/50 dark:bg-background/50 rounded-lg">
              <p className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                AI Confidence: 87% accuracy based on 6-month historical data
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Key Insights */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Key Insights & Alerts</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {insights.map((insight, index) => (
              <motion.div
                key={insight.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${insight.bgColor}`}>
                        <insight.icon className={`h-5 w-5 ${insight.color}`} />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold">{insight.title}</h3>
                          <Badge variant={insight.priority === "high" ? "destructive" : insight.priority === "medium" ? "secondary" : "outline"}>
                            {insight.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{insight.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LightbulbIcon className="h-5 w-5 text-yellow-500" />
              AI-Powered Recommendations
            </CardTitle>
            <CardDescription>Strategic actions to improve platform performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={rec.title} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent transition-colors">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <rec.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{rec.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{rec.action}</p>
                    <Badge variant="secondary" className="mt-2">
                      {rec.impact}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skill Demand Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Skill Demand Intelligence</CardTitle>
            <CardDescription>Top in-demand skills based on job postings and industry trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {skillTrends.map((skill) => (
                <div key={skill.skill} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{skill.skill}</span>
                    <span className="text-sm text-muted-foreground">{skill.demand}% demand</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${skill.demand}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Model Info */}
        <Card className="border-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-600">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold">AI Model Information</h3>
            </div>
            <div className="grid gap-3 md:grid-cols-3 text-sm">
              <div>
                <p className="text-muted-foreground">Model Version</p>
                <p className="font-medium">AlumniConnect AI v2.1</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p className="font-medium">2 days ago</p>
              </div>
              <div>
                <p className="text-muted-foreground">Prediction Accuracy</p>
                <p className="font-medium">87.3%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleLayout>
  );
}
