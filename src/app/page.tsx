"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, Briefcase, Calendar, MessageSquare, TrendingUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const redirectPath = user.role === 'admin' ? '/admin' :
                          user.role === 'student' ? '/student' :
                          user.role === 'alumni' ? '/alumni' :
                          user.role === 'faculty' ? '/faculty' : '/';
      router.push(redirectPath);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const features = [
    {
      icon: Users,
      title: "Network & Connect",
      description: "Build meaningful connections with students, alumni, and faculty across generations",
    },
    {
      icon: Briefcase,
      title: "Career Opportunities",
      description: "Access job postings, internships, and career guidance from industry professionals",
    },
    {
      icon: Calendar,
      title: "Events & Workshops",
      description: "Stay updated with college events, workshops, and alumni meetups",
    },
    {
      icon: MessageSquare,
      title: "Mentorship Programs",
      description: "Connect with mentors for guidance or become a mentor to help students",
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Monitor your professional growth and contributions to the alumni community",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6 max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <GraduationCap className="h-10 w-10 text-primary" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Welcome to<br />
            <span className="text-primary">Alumni Connect Platform</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Terna Engineering College's premier platform for connecting students, alumni, and faculty.
            Build your network, find opportunities, and grow together.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" className="text-lg h-12 px-8">
              <Link href="/login">
                Sign In
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg h-12 px-8">
              <Link href="/register">
                Register Now
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-20"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow border-2">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-20"
        >
          <Card className="border-2">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
                  <div className="text-muted-foreground">Alumni Network</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">500+</div>
                  <div className="text-muted-foreground">Active Students</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">100+</div>
                  <div className="text-muted-foreground">Faculty Members</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-20 text-center"
        >
          <Card className="border-2 bg-primary/5">
            <CardHeader className="space-y-4 pb-8">
              <CardTitle className="text-3xl">Ready to Get Started?</CardTitle>
              <CardDescription className="text-lg max-w-2xl mx-auto">
                Join thousands of Terna Engineering College community members who are already connected.
                Create your account today and unlock endless opportunities.
              </CardDescription>
              <div className="pt-4">
                <Button asChild size="lg" className="text-lg h-12 px-8">
                  <Link href="/register">
                    Create Your Account
                  </Link>
                </Button>
              </div>
            </CardHeader>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}