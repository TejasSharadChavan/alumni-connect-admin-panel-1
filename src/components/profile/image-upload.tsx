"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  currentImageUrl?: string;
  userName: string;
  onImageUpdate: (imageUrl: string) => void;
}

export const ImageUpload = ({ currentImageUrl, userName, onImageUpdate }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("File must be an image");
      return;
    }

    try {
      setUploading(true);

      // Create preview
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        // Here you would typically upload to a cloud storage service
        // For now, we'll just use the base64 string directly
        // In production, replace this with actual upload logic to Supabase/Cloudinary/S3
        
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For demo purposes, we'll use the preview URL
        // In production, this would be the URL from your storage service
        onImageUpdate(preview);
        toast.success("Profile image updated successfully!");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  }, [onImageUpdate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"]
    },
    maxFiles: 1,
    disabled: uploading
  });

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageUpdate("");
    toast.success("Profile image removed");
  };

  const displayImageUrl = previewUrl || currentImageUrl;

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4">
        <div className="relative group">
          <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
            <AvatarImage src={displayImageUrl} alt={userName} />
            <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-400 to-purple-500 text-white">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          
          {displayImageUrl && !uploading && (
            <button
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-destructive text-destructive-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:scale-110"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          {uploading && (
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
        </div>

        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary hover:bg-accent"
              } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <input {...getInputProps()} />
              
              <div className="flex flex-col items-center gap-2">
                {uploading ? (
                  <>
                    <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                  </>
                ) : (
                  <>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      {isDragActive ? (
                        <Upload className="h-6 w-6 text-primary" />
                      ) : (
                        <Camera className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    
                    <div>
                      <p className="font-medium">
                        {isDragActive ? "Drop your image here" : "Upload profile picture"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Drag & drop or click to browse
                      </p>
                    </div>
                    
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Supported formats: PNG, JPG, GIF, WebP</p>
                      <p>Maximum size: 5MB</p>
                    </div>
                    
                    <Button type="button" variant="outline" size="sm" className="mt-2">
                      Choose File
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
