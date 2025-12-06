"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, File, X, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface ResumeUploadProps {
  onUpload: (url: string, filename: string) => void;
  currentResume?: string;
}

export function ResumeUpload({ onUpload, currentResume }: ResumeUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState(currentResume || "");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Invalid file type. Only PDF, DOC, and DOCX are allowed.");
      return;
    }

    // Validate file size (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 5MB.");
      return;
    }

    setFile(selectedFile);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/files/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setUploadedUrl(data.url);
        onUpload(data.url, data.originalName);
        toast.success("Resume uploaded successfully!");
      } else {
        toast.error(data.error || "Upload failed");
        setFile(null);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed. Please try again.");
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setUploadedUrl("");
    onUpload("", "");
  };

  return (
    <div className="space-y-4">
      {!uploadedUrl ? (
        <label className="block cursor-pointer">
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">
              {uploading ? "Uploading..." : "Click to upload resume"}
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, DOC, or DOCX (Max 5MB)
            </p>
            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </div>
        </label>
      ) : (
        <div className="flex items-center gap-3 p-4 border rounded-lg bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900 dark:text-green-100">
              {file?.name || "Resume uploaded"}
            </p>
            <p className="text-xs text-green-700 dark:text-green-300">
              {file ? `${(file.size / 1024).toFixed(1)} KB` : "Ready to submit"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-green-700 hover:text-green-900 dark:text-green-300 dark:hover:text-green-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {uploading && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Uploading resume...</span>
        </div>
      )}
    </div>
  );
}
