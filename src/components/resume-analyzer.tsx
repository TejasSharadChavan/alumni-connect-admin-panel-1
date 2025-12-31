"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Star,
  Target,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ResumeAnalysis {
  summary: string;
  matchingScore: number;
  skillsMatch: string[];
  experienceMatch: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  keyHighlights: string[];
}

interface ResumeAnalyzerProps {
  jobId: number;
  onAnalysisComplete: (analysis: ResumeAnalysis) => void;
  disabled?: boolean;
  debugMode?: boolean;
}

export function ResumeAnalyzer({
  jobId,
  onAnalysisComplete,
  disabled,
  debugMode = false,
}: ResumeAnalyzerProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please upload a PDF, DOC, or DOCX file");
      return;
    }

    // Validate file size (5MB limit)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setUploadedFile(selectedFile.name);
    setError(null);
    setAnalysis(null);

    // Automatically analyze the resume
    await analyzeResume(selectedFile);
  };

  const analyzeResume = async (fileToAnalyze?: File) => {
    if (!fileToAnalyze) {
      setError("Please select a resume file");
      return;
    }

    try {
      setAnalyzing(true);
      setError(null);

      const formData = new FormData();
      formData.append("resume", fileToAnalyze);
      formData.append("jobId", jobId.toString());

      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/resume/analyze", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAnalysis(data.analysis);
        onAnalysisComplete(data.analysis);
        toast.success("Resume analyzed successfully!");
      } else {
        const errorMessage = data.error || "Failed to analyze resume";
        setError(errorMessage);

        // Show specific toast messages based on error type
        if (data.code === "PDF_EXTRACTION_FAILED") {
          toast.error(
            "PDF processing failed. Please try a different PDF file."
          );
        } else if (data.code === "NO_TEXT_EXTRACTED") {
          toast.error(
            "Could not read text from PDF. Please ensure it's a text-based resume."
          );
        } else if (data.code === "PDF_REQUIRED") {
          toast.error("Please upload a PDF file for analysis.");
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      console.error("Error analyzing resume:", error);
      setError("Failed to analyze resume. Please try again.");
      toast.error("Failed to analyze resume");
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 40) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Fair Match";
    return "Needs Improvement";
  };

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resume Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileSelect}
              className="hidden"
              id="resume-upload"
              disabled={disabled || analyzing}
            />
            <label
              htmlFor="resume-upload"
              className={`cursor-pointer ${disabled || analyzing ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">
                {uploadedFile
                  ? `Uploaded: ${uploadedFile}`
                  : "Click to upload your resume (PDF, DOC, or DOCX, max 5MB)"}
              </p>
              {!uploadedFile && (
                <p className="text-xs text-gray-500 mt-1">
                  💡 Analysis will start automatically after upload
                </p>
              )}
              {debugMode && !uploadedFile && (
                <div className="mt-4 space-y-2">
                  <Button
                    onClick={async () => {
                      try {
                        const response = await fetch(
                          "/api/test-resume-analysis"
                        );
                        const data = await response.json();
                        if (data.success) {
                          toast.success("Resume analysis test passed!");
                          setAnalysis(data.analysis);
                          onAnalysisComplete(data.analysis);
                        } else {
                          toast.error("Test failed: " + data.error);
                        }
                      } catch (error) {
                        toast.error("Test failed");
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    🧪 Test Resume Analysis (Dummy Data)
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        const response = await fetch("/api/test-pdf-parsing");
                        const data = await response.json();
                        if (data.success) {
                          toast.success("PDF parsing test passed!");
                        } else {
                          toast.error(
                            "PDF test failed: " + data.pdfParsingError
                          );
                        }
                      } catch (error) {
                        toast.error("PDF test failed");
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    📄 Test PDF Parsing
                  </Button>
                </div>
              )}
            </label>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {analyzing && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3" />
              <span className="text-sm text-muted-foreground">
                Analyzing your resume...
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      <AnimatePresence>
        {analyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Analyzing Your Resume...</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                  <span className="text-sm text-muted-foreground">
                    AI is analyzing your resume against job requirements...
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Overall Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Job Match Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-3xl font-bold">
                      {analysis.matchingScore}%
                    </div>
                    <div
                      className={`text-sm font-medium ${getScoreColor(analysis.matchingScore).split(" ")[0]}`}
                    >
                      {getScoreLabel(analysis.matchingScore)}
                    </div>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-lg border ${getScoreColor(analysis.matchingScore)}`}
                  >
                    <Star className="h-5 w-5 inline mr-1" />
                    Score: {analysis.matchingScore}/100
                  </div>
                </div>
                <Progress value={analysis.matchingScore} className="mb-4" />
                <p className="text-sm text-muted-foreground">
                  {analysis.summary}
                </p>
              </CardContent>
            </Card>

            {/* Skills Match */}
            {analysis.skillsMatch.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Matching Skills ({analysis.skillsMatch.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.skillsMatch.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-green-50 text-green-700"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Experience Match */}
            {analysis.experienceMatch && (
              <Card>
                <CardHeader>
                  <CardTitle>Experience Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{analysis.experienceMatch}</p>
                </CardContent>
              </Card>
            )}

            {/* Strengths and Key Highlights */}
            <div className="grid md:grid-cols-2 gap-6">
              {analysis.strengths.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.strengths.map((strength, index) => (
                        <li
                          key={index}
                          className="text-sm flex items-start gap-2"
                        >
                          <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {analysis.keyHighlights.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-600">
                      <Star className="h-5 w-5" />
                      Key Highlights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.keyHighlights.map((highlight, index) => (
                        <li
                          key={index}
                          className="text-sm flex items-start gap-2"
                        >
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 shrink-0" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Recommendations and Areas for Improvement */}
            <div className="grid md:grid-cols-2 gap-6">
              {analysis.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-600">
                      <Lightbulb className="h-5 w-5" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.recommendations.map((rec, index) => (
                        <li
                          key={index}
                          className="text-sm flex items-start gap-2"
                        >
                          <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {analysis.weaknesses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-600">
                      <AlertCircle className="h-5 w-5" />
                      Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.weaknesses.map((weakness, index) => (
                        <li
                          key={index}
                          className="text-sm flex items-start gap-2"
                        >
                          <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 shrink-0" />
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
