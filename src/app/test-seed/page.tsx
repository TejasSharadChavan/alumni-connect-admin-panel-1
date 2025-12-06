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
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function TestSeedPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const createAlumniUser = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/auth/quick-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Alumni User",
          email: "alumni@test.com",
          password: "password123",
          role: "alumni",
          branch: "Computer Engineering",
          yearOfPassing: 2020,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("auth_token", data.token);
        setResult({ type: "user", data });
      } else {
        setError(data.error || "Failed to create user");
      }
    } catch (err) {
      setError("Network error: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const seedDatabase = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ type: "seed", data });
      } else {
        setError(data.error || "Failed to seed database");
      }
    } catch (err) {
      setError("Network error: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Database Seeding Tool</CardTitle>
          <CardDescription>
            Use this page to quickly populate your database with test data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">
              Step 1: Create Alumni User
            </h3>
            <p className="text-sm text-muted-foreground">
              First, create a test alumni user that will be used to post jobs
              and events.
            </p>
            <Button
              onClick={createAlumniUser}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating User...
                </>
              ) : (
                "Create Alumni User"
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Email: alumni@test.com | Password: password123
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">
              Step 2: Seed Jobs & Events
            </h3>
            <p className="text-sm text-muted-foreground">
              After creating the user, seed the database with 10 jobs and 5
              events.
            </p>
            <Button
              onClick={seedDatabase}
              disabled={loading}
              variant="secondary"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeding Database...
                </>
              ) : (
                "Seed Database"
              )}
            </Button>
          </div>

          {/* Results */}
          {result && (
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900 dark:text-green-100">
                    {result.type === "user"
                      ? "User Created Successfully!"
                      : "Database Seeded Successfully!"}
                  </h4>
                  <pre className="mt-2 text-xs bg-white dark:bg-gray-900 p-2 rounded overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                  {result.type === "user" && (
                    <p className="mt-2 text-sm text-green-800 dark:text-green-200">
                      ✓ User created and logged in. Now click "Seed Database" to
                      add jobs and events.
                    </p>
                  )}
                  {result.type === "seed" && (
                    <p className="mt-2 text-sm text-green-800 dark:text-green-200">
                      ✓ Created {result.data.data?.jobs} jobs and{" "}
                      {result.data.data?.events} events.
                      <br />
                      <a
                        href="/alumni/jobs"
                        className="underline font-semibold"
                      >
                        Go to Jobs Page
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Errors */}
          {error && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900 dark:text-red-100">
                    Error
                  </h4>
                  <p className="mt-1 text-sm text-red-800 dark:text-red-200">
                    {error}
                  </p>
                  {error.includes("Email already registered") && (
                    <p className="mt-2 text-xs text-red-700 dark:text-red-300">
                      The test user already exists. You can skip Step 1 and go
                      directly to Step 2.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-2">What This Does:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Creates a test alumni user (alumni@test.com)</li>
              <li>Seeds 10 sample jobs from various companies</li>
              <li>Seeds 5 sample events (workshops, meetups, webinars)</li>
              <li>All data is auto-approved and ready to view</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
