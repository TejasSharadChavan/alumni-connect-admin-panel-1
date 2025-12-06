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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  TrendingUp,
  Newspaper,
  Sparkles,
  ExternalLink,
  Clock,
  Tag,
  Filter,
  Zap,
  Brain,
  Code,
  Shield,
  Cloud,
  Smartphone,
  BarChart3,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Trend {
  id: number;
  title: string;
  summary: string;
  category: string;
  source: string;
  date: string;
  url: string;
  image: string;
  tags: string[];
  trending: boolean;
  relevanceScore: number;
}

interface TrendsData {
  trends: Trend[];
  total: number;
  query: string | null;
  category: string;
  trendingTopics: string[];
  categories: { name: string; count: number }[];
}

export function IndustryTrends() {
  const [data, setData] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    fetchTrends();
  }, [searchQuery, selectedCategory]);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      const params = new URLSearchParams({
        query: searchQuery,
        category: selectedCategory,
        limit: "20",
      });

      const response = await fetch(`/api/industry-trends?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      } else {
        toast.error("Failed to load industry trends");
      }
    } catch (error) {
      console.error("Error fetching trends:", error);
      toast.error("Failed to load industry trends");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      // Clear search if empty
      setSearchQuery("");
      setSearchInput("");
      return;
    }

    const query = searchInput.trim();

    // Try AI search first if OpenAI is configured
    const openaiKey = process.env.NEXT_PUBLIC_OPENAI_KEY;
    if (openaiKey && query.length > 2) {
      await performAISearch(query);
    } else {
      // Use regular search
      console.log("Using regular search for:", query);
      setSearchQuery(query);
    }
  };

  const performAISearch = async (query: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");

      // Check if OpenAI is configured
      const openaiConfigured =
        process.env.NEXT_PUBLIC_OPENAI_ENABLED === "true";

      if (!openaiConfigured) {
        console.log("AI search not configured, using regular search");
        setSearchQuery(query);
        return;
      }

      toast.info("🤖 AI is searching for latest news...");

      const response = await fetch("/api/industry-trends/ai-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query }),
      });

      if (response.ok) {
        const result = await response.json();
        if (
          result.data &&
          result.data.trends &&
          result.data.trends.length > 0
        ) {
          // Update data with AI search results
          setData({
            trends: result.data.trends,
            total: result.data.total,
            query: query,
            category: "all",
            trendingTopics: result.data.trends
              .flatMap((t: any) => t.tags)
              .slice(0, 10),
            categories: [],
          });
          toast.success(`✨ Found ${result.data.total} articles using AI`);
        } else {
          // No results from AI, use regular search
          console.log("AI returned no results, using regular search");
          setSearchQuery(query);
        }
      } else {
        // Fallback to regular search
        const errorData = await response.json().catch(() => ({}));
        console.log("AI search failed:", errorData);
        setSearchQuery(query);
      }
    } catch (error) {
      console.error("AI search error:", error);
      // Fallback to regular search
      setSearchQuery(query);
      toast.info("Using regular search");
      toast.error("AI search unavailable, using regular search");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSearchQuery(""); // Reset search when changing category
    setSearchInput("");
  };

  const handleTopicClick = (topic: string) => {
    setSearchInput(topic);
    setSearchQuery(topic);
    setSelectedCategory("all");
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      "AI & ML": Brain,
      "Web Development": Code,
      Cybersecurity: Shield,
      "Cloud & DevOps": Cloud,
      "Cloud Computing": Cloud,
      "Mobile Development": Smartphone,
      "Data Science": BarChart3,
      "Data Engineering": BarChart3,
      Career: Briefcase,
      Skills: Sparkles,
    };
    return icons[category] || Newspaper;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading && !data) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">
                Loading industry trends...
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg p-6 text-white"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-lg backdrop-blur">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              Industry Trends & News
            </h2>
            <p className="text-white/90 text-sm mb-4">
              Stay updated with the latest tech news, skills, and industry
              insights powered by AI
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search for AI, React, Python, Cloud, Jobs..."
                  className="pl-10 bg-white/95 backdrop-blur border-0 text-gray-900 placeholder:text-gray-500"
                />
              </div>
              <Button type="submit" variant="secondary" disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Searching...
                  </div>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-1" />
                    AI Search
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </motion.div>

      {/* Trending Topics */}
      {data && data.trendingTopics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-yellow-500" />
              Trending Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.trendingTopics.map((topic) => (
                <Badge
                  key={topic}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => handleTopicClick(topic)}
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {topic}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={handleCategoryChange}>
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-2">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="ai & ml">AI & ML</TabsTrigger>
          <TabsTrigger value="web development">Web Dev</TabsTrigger>
          <TabsTrigger value="cloud & devops">Cloud</TabsTrigger>
          <TabsTrigger value="cybersecurity">Security</TabsTrigger>
          <TabsTrigger value="data science">Data</TabsTrigger>
          <TabsTrigger value="career">Career</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {/* Results Info */}
          {data && (
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {data.query ? (
                  <>
                    Found <span className="font-semibold">{data.total}</span>{" "}
                    results for "
                    <span className="font-semibold">{data.query}</span>"
                  </>
                ) : (
                  <>
                    Showing{" "}
                    <span className="font-semibold">{data.trends.length}</span>{" "}
                    latest trends
                  </>
                )}
              </p>
              {loading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  Updating...
                </div>
              )}
            </div>
          )}

          {/* Trends Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {data?.trends.map((trend, index) => {
                const CategoryIcon = getCategoryIcon(trend.category);
                return (
                  <motion.div
                    key={trend.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className="h-full hover:shadow-lg transition-shadow cursor-pointer group"
                      onClick={() =>
                        window.open(trend.url, "_blank", "noopener,noreferrer")
                      }
                    >
                      <CardContent className="p-0">
                        {/* Image */}
                        <div className="relative h-48 overflow-hidden rounded-t-lg">
                          <img
                            src={trend.image}
                            alt={trend.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {trend.trending && (
                            <Badge className="absolute top-2 right-2 bg-red-500">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Trending
                            </Badge>
                          )}
                          <div className="absolute bottom-2 left-2">
                            <Badge
                              variant="secondary"
                              className="bg-black/60 text-white backdrop-blur"
                            >
                              <CategoryIcon className="h-3 w-3 mr-1" />
                              {trend.category}
                            </Badge>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-3">
                          <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                            {trend.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {trend.summary}
                          </p>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1">
                            {trend.tags.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {trend.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{trend.tags.length - 3}
                              </Badge>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatDate(trend.date)}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(
                                  trend.url,
                                  "_blank",
                                  "noopener,noreferrer"
                                );
                              }}
                            >
                              Read More
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* No Results */}
          {data && data.trends.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No trends found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or browse different categories
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchInput("");
                  }}
                >
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* AI Insights Footer */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">AI-Powered Insights</h3>
              <p className="text-sm text-muted-foreground">
                Our AI analyzes thousands of sources to bring you the most
                relevant industry trends, emerging skills, and career
                opportunities. Stay ahead of the curve with personalized
                recommendations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
