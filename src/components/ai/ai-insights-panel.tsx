"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle, Sparkles, Target, Users, Calendar, Briefcase } from "lucide-react";
import { motion } from "framer-motion";

interface Insight {
  id: string;
  title: string;
  description: string;
  trend: "up" | "down" | "neutral";
  value: string;
  change: string;
  icon: any;
  color: string;
}

interface AIInsightsPanelProps {
  insights?: Insight[];
  recommendations?: string[];
  userRole?: string;
}

const defaultInsights: Insight[] = [
  {
    id: "1",
    title: "Network Growth",
    description: "Your connections increased significantly this month",
    trend: "up",
    value: "+15%",
    change: "+12 new connections",
    icon: Users,
    color: "text-green-600",
  },
  {
    id: "2",
    title: "Engagement Rate",
    description: "Your post engagement is above average",
    trend: "up",
    value: "85%",
    change: "+10% from last week",
    icon: TrendingUp,
    color: "text-blue-600",
  },
  {
    id: "3",
    title: "Opportunities",
    description: "New job postings match your profile",
    trend: "neutral",
    value: "5",
    change: "2 high-priority matches",
    icon: Briefcase,
    color: "text-purple-600",
  },
  {
    id: "4",
    title: "Event Participation",
    description: "Attend more events to boost visibility",
    trend: "down",
    value: "2",
    change: "3 upcoming recommended",
    icon: Calendar,
    color: "text-orange-600",
  },
];

const defaultRecommendations = [
  "Complete your profile to increase visibility by 40%",
  "Connect with 3 alumni in Software Engineering this week",
  "Attend the AI/ML Workshop on Dec 15 for skill enhancement",
  "Update your skills section with trending technologies",
  "Engage with 2-3 posts daily to boost your network reach",
];

export const AIInsightsPanel = ({ 
  insights = defaultInsights, 
  recommendations = defaultRecommendations,
  userRole = "student" 
}: AIInsightsPanelProps) => {
  return (
    <div className="space-y-6">
      {/* Key Insights */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI-Powered Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-gradient-to-br from-background to-muted/30 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className={`h-5 w-5 ${insight.color}`} />
                            <h4 className="font-semibold">{insight.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {insight.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-lg font-bold">
                              {insight.value}
                            </Badge>
                            <div className="flex items-center gap-1 text-sm">
                              {insight.trend === "up" && (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              )}
                              {insight.trend === "down" && (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                              )}
                              <span className="text-muted-foreground">{insight.change}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card className="border-2 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-background/60 hover:bg-background transition-colors"
              >
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{rec}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
