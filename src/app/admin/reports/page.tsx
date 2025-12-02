"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RoleLayout } from "@/components/layout/role-layout";
import { TrendingUp, Download, FileText, Calendar, Users, Briefcase, DollarSign, Activity } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ReportsPage() {
  const [reportType, setReportType] = useState("user-activity");
  const [timeRange, setTimeRange] = useState("7d");
  const [format, setFormat] = useState("pdf");
  const [generating, setGenerating] = useState(false);

  const reportTypes = [
    { value: "user-activity", label: "User Activity Report", icon: Activity },
    { value: "enrollment", label: "Enrollment Statistics", icon: Users },
    { value: "job-applications", label: "Job Applications Report", icon: Briefcase },
    { value: "event-attendance", label: "Event Attendance", icon: Calendar },
    { value: "donations", label: "Donations & Fundraising", icon: DollarSign },
    { value: "engagement", label: "Platform Engagement", icon: TrendingUp },
  ];

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      // Simulate report generation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success(`${reportType} report generated successfully!`);
      // In real implementation, trigger download here
    } catch (error) {
      toast.error("Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const quickStats = [
    { label: "Reports Generated", value: "145", icon: FileText, color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-950" },
    { label: "Last Generated", value: "2 hrs ago", icon: Calendar, color: "text-green-600", bgColor: "bg-green-50 dark:bg-green-950" },
    { label: "Scheduled Reports", value: "8", icon: TrendingUp, color: "text-purple-600", bgColor: "bg-purple-50 dark:bg-purple-950" },
  ];

  return (
    <RoleLayout role="admin">
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Reports & Analytics</h1>
              <p className="text-muted-foreground">Generate comprehensive reports and insights</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Report Generator */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Custom Report</CardTitle>
            <CardDescription>Select report type and parameters to generate comprehensive analytics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Report Type</Label>
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
                <Label>Time Range</Label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="90d">Last 90 Days</SelectItem>
                    <SelectItem value="1y">Last Year</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Export Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                    <SelectItem value="csv">CSV File</SelectItem>
                    <SelectItem value="json">JSON Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleGenerateReport} disabled={generating} className="w-full md:w-auto">
              {generating ? (
                <>
                  <Activity className="mr-2 h-4 w-4 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Quick Access Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Access Reports</CardTitle>
            <CardDescription>Frequently used report templates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {reportTypes.map((type) => (
                <Button
                  key={type.value}
                  variant="outline"
                  className="h-auto py-4 justify-start"
                  onClick={() => {
                    setReportType(type.value);
                    toast.info(`Selected ${type.label}`);
                  }}
                >
                  <type.icon className="h-5 w-5 mr-3 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">{type.label}</p>
                    <p className="text-xs text-muted-foreground">Generate now</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>Previously generated reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "User Activity Report - January 2024", date: "2 hours ago", format: "PDF" },
                { name: "Enrollment Statistics Q4 2023", date: "1 day ago", format: "Excel" },
                { name: "Job Applications Monthly Report", date: "3 days ago", format: "CSV" },
                { name: "Event Attendance Analytics", date: "1 week ago", format: "PDF" },
              ].map((report, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{report.name}</p>
                      <p className="text-sm text-muted-foreground">{report.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{report.format}</Badge>
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleLayout>
  );
}
