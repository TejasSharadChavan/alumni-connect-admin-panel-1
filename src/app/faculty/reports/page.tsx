"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  Download,
  Users,
  Calendar,
  FileText,
  TrendingUp,
  Loader2,
} from "lucide-react";
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
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      // Fetch all data in parallel for faster loading
      const [usersRes, eventsRes] = await Promise.all([
        fetch("/api/users?role=student", {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),
        fetch("/api/events", {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),
      ]);

      // Parse responses in parallel
      const [usersData, eventsData] = await Promise.all([
        usersRes?.ok ? usersRes.json() : { users: [] },
        eventsRes?.ok ? eventsRes.json() : { events: [] },
      ]);

      const students = usersData.users || [];
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

  const handleExportReport = async () => {
    toast.success("Generating PDF report. This may take a moment...");

    try {
      // Dynamically import jsPDF to avoid SSR issues
      const { default: jsPDF } = await import("jspdf");

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Helper function to add text with word wrap
      const addText = (
        text: string,
        fontSize: number = 12,
        isBold: boolean = false
      ) => {
        doc.setFontSize(fontSize);
        if (isBold) {
          doc.setFont("helvetica", "bold");
        } else {
          doc.setFont("helvetica", "normal");
        }

        const lines = doc.splitTextToSize(text, pageWidth - 40);
        lines.forEach((line: string) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, 20, yPosition);
          yPosition += fontSize * 0.5;
        });
        yPosition += 5;
      };

      // Header
      doc.setFillColor(59, 130, 246); // Blue
      doc.rect(0, 0, pageWidth, 40, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("Faculty Report", pageWidth / 2, 25, { align: "center" });

      yPosition = 50;
      doc.setTextColor(0, 0, 0);

      // Report Info
      addText(
        `Report Type: ${reportTypes.find((t) => t.value === reportType)?.label}`,
        14,
        true
      );
      addText(
        `Time Period: ${
          timePeriod === "week"
            ? "Last Week"
            : timePeriod === "month"
              ? "Last Month"
              : timePeriod === "quarter"
                ? "Last Quarter"
                : timePeriod === "year"
                  ? "Last Year"
                  : "All Time"
        }`,
        12
      );
      addText(`Generated: ${new Date().toLocaleString()}`, 12);
      yPosition += 10;

      // Key Metrics Section
      doc.setFillColor(240, 240, 240);
      doc.rect(15, yPosition, pageWidth - 30, 10, "F");
      addText("KEY METRICS", 16, true);
      yPosition += 5;

      addText(`Total Students: ${reportData.studentCount}`, 12);
      addText(`Active Students: ${reportData.activeStudents}`, 12);
      addText(`Total Events: ${reportData.eventCount}`, 12);
      addText(`Average Attendance: ${reportData.avgAttendance}`, 12);
      yPosition += 10;

      // Summary Section
      doc.setFillColor(240, 240, 240);
      doc.rect(15, yPosition, pageWidth - 30, 10, "F");
      addText("SUMMARY", 16, true);
      yPosition += 5;

      addText(
        `• ${reportData.studentCount} students enrolled in your department`,
        11
      );
      addText(
        `• ${reportData.activeStudents} students actively participating`,
        11
      );
      addText(`• ${reportData.eventCount} events organized`, 11);
      addText(
        `• ${reportData.avgAttendance} average event attendance rate`,
        11
      );
      yPosition += 10;

      // Performance Insights
      doc.setFillColor(240, 240, 240);
      doc.rect(15, yPosition, pageWidth - 30, 10, "F");
      addText("PERFORMANCE INSIGHTS", 16, true);
      yPosition += 5;

      addText("Student Enrollment Growth: +12% from last period", 11);
      addText("Engagement Rate Improvement: +5% from last period", 11);
      addText("Event Participation: Consistently above 80%", 11);
      yPosition += 10;

      // Recommendations Section
      doc.setFillColor(240, 240, 240);
      doc.rect(15, yPosition, pageWidth - 30, 10, "F");
      addText("RECOMMENDATIONS", 16, true);
      yPosition += 5;

      addText(
        "• Consider organizing more interactive workshops to boost engagement",
        11
      );
      addText(
        "• Focus on mentorship programs for students with lower participation",
        11
      );
      addText("• Continue current strategies for event organization", 11);
      addText("• Implement peer-to-peer learning sessions", 11);
      yPosition += 10;

      // Footer
      const footerY = pageHeight - 15;
      doc.setFontSize(9);
      doc.setTextColor(128, 128, 128);
      doc.text(
        "Terna Engineering College - Faculty Report",
        pageWidth / 2,
        footerY,
        { align: "center" }
      );
      doc.text(`Page 1 of ${doc.getNumberOfPages()}`, pageWidth - 20, footerY, {
        align: "right",
      });

      // Save PDF
      const fileName = `faculty-report-${reportType}-${timePeriod}-${Date.now()}.pdf`;
      doc.save(fileName);

      toast.success("PDF report generated successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF report");
    }
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
          <p className="text-muted-foreground">
            Generate and export department analytics
          </p>
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
            <CardTitle className="text-3xl">
              {reportData.studentCount}
            </CardTitle>
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
            <CardTitle className="text-3xl">
              {reportData.activeStudents}
            </CardTitle>
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
            <CardTitle className="text-3xl">
              {reportData.avgAttendance}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Event participation rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Report Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Report Preview</CardTitle>
          <CardDescription>
            Summary of {reportTypes.find((t) => t.value === reportType)?.label}{" "}
            for{" "}
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
                  <p className="text-sm text-muted-foreground">
                    Student Enrollment
                  </p>
                  <p className="text-2xl font-bold">
                    {reportData.studentCount}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    ↑ 12% from last period
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Engagement Rate
                  </p>
                  <p className="text-2xl font-bold">
                    {reportData.avgAttendance}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    ↑ 5% from last period
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Summary</h4>
              <div className="p-4 border rounded-lg space-y-2">
                <p className="text-sm">
                  • <strong>{reportData.studentCount}</strong> students enrolled
                  in your department
                </p>
                <p className="text-sm">
                  • <strong>{reportData.activeStudents}</strong> students
                  actively participating
                </p>
                <p className="text-sm">
                  • <strong>{reportData.eventCount}</strong> events organized
                </p>
                <p className="text-sm">
                  • <strong>{reportData.avgAttendance}</strong> average event
                  attendance rate
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Recommendations</h4>
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm">
                  • Consider organizing more interactive workshops to boost
                  engagement
                </p>
                <p className="text-sm">
                  • Focus on mentorship programs for students with lower
                  participation
                </p>
                <p className="text-sm">
                  • Continue current strategies for event organization
                </p>
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
