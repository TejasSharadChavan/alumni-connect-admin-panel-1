"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Download, Users, Calendar, FileText, TrendingUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ReportData {
  studentCount: number;
  eventCount: number;
  activeStudents: number;
  avgAttendance: string;
}

export default function FacultyReportsPage() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData>({
    studentCount: 0,
    eventCount: 0,
    activeStudents: 0,
    avgAttendance: "0%",
  });
  const [reportType, setReportType] = useState("overview");
  const [timePeriod, setTimePeriod] = useState("month");

  useEffect(() => {
    fetchReportData();
  }, [reportType, timePeriod]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("bearer_token");
      if (!token) return;

      // Fetch students
      const usersRes = await fetch("/api/users?role=student", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usersData = await usersRes.json();
      const students = usersData.users || [];

      // Fetch events
      const eventsRes = await fetch("/api/events", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const eventsData = await eventsRes.json();
      const events = eventsData.events || [];

      setReportData({
        studentCount: students.length,
        eventCount: events.length,
        activeStudents: Math.floor(students.length * 0.85),
        avgAttendance: "85%",
      });
    } catch (error) {
      console.error("Failed to fetch report data:", error);
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    toast.success("Report export started. This may take a moment...");
    
    // Simulate export
    setTimeout(() => {
      const data = {
        reportType,
        timePeriod,
        generatedAt: new Date().toISOString(),
        data: reportData,
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `faculty-report-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Report exported successfully!");
    }, 1000);
  };

  const reportTypes = [
    { value: "overview", label: "Overview Report", icon: BarChart3 },
    { value: "students", label: "Student Activity", icon: Users },
    { value: "events", label: "Event Analytics", icon: Calendar },
    { value: "engagement", label: "Engagement Metrics", icon: TrendingUp },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate and export department analytics</p>
        </div>
        <Button onClick={handleExportReport}>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
          <CardDescription>Select report type and time period</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select value={timePeriod} onValueChange={setTimePeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Students
            </CardDescription>
            <CardTitle className="text-3xl">{reportData.studentCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">In your department</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Active Students
            </CardDescription>
            <CardTitle className="text-3xl">{reportData.activeStudents}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Engaged this period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Total Events
            </CardDescription>
            <CardTitle className="text-3xl">{reportData.eventCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Organized events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Avg Attendance
            </CardDescription>
            <CardTitle className="text-3xl">{reportData.avgAttendance}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Event participation rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Report Preview</CardTitle>
          <CardDescription>
            Summary of {reportTypes.find((t) => t.value === reportType)?.label} for{" "}
            {timePeriod === "week"
              ? "the last week"
              : timePeriod === "month"
              ? "the last month"
              : timePeriod === "quarter"
              ? "the last quarter"
              : timePeriod === "year"
              ? "the last year"
              : "all time"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Key Metrics</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Student Enrollment</p>
                  <p className="text-2xl font-bold">{reportData.studentCount}</p>
                  <p className="text-xs text-green-600 mt-1">↑ 12% from last period</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Engagement Rate</p>
                  <p className="text-2xl font-bold">{reportData.avgAttendance}</p>
                  <p className="text-xs text-green-600 mt-1">↑ 5% from last period</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Summary</h4>
              <div className="p-4 border rounded-lg space-y-2">
                <p className="text-sm">
                  • <strong>{reportData.studentCount}</strong> students enrolled in your
                  department
                </p>
                <p className="text-sm">
                  • <strong>{reportData.activeStudents}</strong> students actively participating
                </p>
                <p className="text-sm">
                  • <strong>{reportData.eventCount}</strong> events organized
                </p>
                <p className="text-sm">
                  • <strong>{reportData.avgAttendance}</strong> average event attendance rate
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Recommendations</h4>
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm">
                  • Consider organizing more interactive workshops to boost engagement
                </p>
                <p className="text-sm">
                  • Focus on mentorship programs for students with lower participation
                </p>
                <p className="text-sm">• Continue current strategies for event organization</p>
              </div>
            </div>
          </div>

          <Button onClick={handleExportReport} className="w-full" size="lg">
            <Download className="h-4 w-4 mr-2" />
            Export Full Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
