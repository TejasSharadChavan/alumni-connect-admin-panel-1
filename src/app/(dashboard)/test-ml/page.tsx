"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Sparkles, Users, TrendingUp, Award } from "lucide-react";

export default function TestMLPage() {
  const [loading, setLoading] = useState(false);
  const [seeded, setSeeded] = useState(false);

  const handleSeedEnhanced = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/seed-enhanced", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Enhanced data seeded successfully! 🎉");
        setSeeded(true);
      } else {
        toast.error(data.error || "Failed to seed data");
      }
    } catch (error) {
      console.error("Seed error:", error);
      toast.error("Failed to seed enhanced data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">ML & Analytics Testing</h1>
        <p className="text-muted-foreground">
          Seed enhanced data and test machine learning features
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Enhanced Data
            </CardTitle>
            <CardDescription>
              Populate with realistic users, connections, and interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleSeedEnhanced}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeding...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Seed Enhanced Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Profile Matching
            </CardTitle>
            <CardDescription>
              AI-powered profile matching and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => (window.location.href = "/test-ml/matching")}
              disabled={!seeded}
              variant="outline"
              className="w-full"
            >
              Test Matching
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Profile Rating
            </CardTitle>
            <CardDescription>
              Analyze profile completeness and engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => (window.location.href = "/test-ml/rating")}
              disabled={!seeded}
              variant="outline"
              className="w-full"
            >
              Test Rating
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What Gets Seeded</CardTitle>
          <CardDescription>
            Comprehensive data for testing ML features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold mb-2">Users & Profiles</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 5 diverse students with skills</li>
                <li>• 5 experienced alumni mentors</li>
                <li>• Complete profiles with bios</li>
                <li>• Skill endorsements</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Connections & Network</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Student-alumni connections</li>
                <li>• Peer-to-peer connections</li>
                <li>• Pending connection requests</li>
                <li>• Network graph data</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Engagement & Content</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 5 posts with varied content</li>
                <li>• Comments and reactions</li>
                <li>• Direct messages and chats</li>
                <li>• Activity tracking</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Mentorship & Learning</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Mentorship requests</li>
                <li>• Accepted mentorships</li>
                <li>• Skill-based matching</li>
                <li>• Notifications</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>ML Features Available</CardTitle>
          <CardDescription>
            Advanced features powered by machine learning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Profile Matching</h3>
              <p className="text-sm text-muted-foreground">
                TF-IDF and Jaccard similarity for intelligent profile matching
                based on skills, interests, and background
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Profile Rating</h3>
              <p className="text-sm text-muted-foreground">
                Multi-factor scoring algorithm analyzing completeness,
                engagement, expertise, and network strength
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Smart Recommendations</h3>
              <p className="text-sm text-muted-foreground">
                Personalized suggestions for connections, jobs, events, and
                content based on user behavior
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
