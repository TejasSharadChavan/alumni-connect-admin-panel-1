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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  Mail,
  Briefcase,
  GraduationCap,
  MapPin,
  Calendar,
  Edit2,
  Save,
  X,
  Upload,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export default function AlumniProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    branch: "",
    graduationYear: "",
    currentCompany: "",
    currentPosition: "",
    location: "",
    bio: "",
    skills: [] as string[],
    linkedin: "",
    github: "",
    profileImageUrl: "",
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/users/${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();

        // Parse skills if it's a string
        let parsedSkills = data.user.skills || [];
        if (typeof parsedSkills === "string") {
          try {
            parsedSkills = JSON.parse(parsedSkills);
          } catch (e) {
            parsedSkills = [];
          }
        }
        // Ensure it's always an array
        if (!Array.isArray(parsedSkills)) {
          parsedSkills = [];
        }

        setProfileData({
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          branch: data.user.branch || "",
          graduationYear: data.user.graduationYear || "",
          currentCompany: data.user.currentCompany || "",
          currentPosition: data.user.currentPosition || "",
          location: data.user.location || "",
          bio: data.user.bio || "",
          skills: parsedSkills,
          linkedin: data.user.linkedin || "",
          github: data.user.github || "",
          profileImageUrl: data.user.profileImageUrl || "",
        });
      } else {
        toast.error("Failed to load profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/users/${user?.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        toast.success("Profile updated successfully");
        setEditing(false);
        fetchProfile();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 2MB for base64)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    try {
      setUploadingImage(true);

      // Convert to base64 (simpler, always works)
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageUrl = event.target?.result as string;

        // Update profile with new image
        const token = localStorage.getItem("auth_token");
        const response = await fetch(`/api/users/${user?.id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ profileImageUrl: imageUrl }),
        });

        if (response.ok) {
          setProfileData((prev) => ({ ...prev, profileImageUrl: imageUrl }));
          toast.success("Profile image updated successfully!");
          // Refresh to update avatar in header
          setTimeout(() => window.location.reload(), 500);
        } else {
          toast.error("Failed to update profile image");
        }
        setUploadingImage(false);
      };

      reader.onerror = () => {
        toast.error("Failed to read image file");
        setUploadingImage(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
      setUploadingImage(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-96" />
          <Skeleton className="col-span-2 h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <User className="h-8 w-8" />
              My Profile
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your professional profile
            </p>
          </div>
          {!editing ? (
            <Button onClick={() => setEditing(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditing(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarImage src={profileData.profileImageUrl} />
                <AvatarFallback className="text-2xl">
                  {getInitials(profileData.name)}
                </AvatarFallback>
              </Avatar>
              {editing && (
                <label
                  htmlFor="image-upload"
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            {uploadingImage && (
              <p className="text-sm text-muted-foreground">Uploading...</p>
            )}
            <div className="text-center">
              <h3 className="font-semibold text-lg">{profileData.name}</h3>
              <p className="text-sm text-muted-foreground">
                {profileData.currentPosition}
              </p>
              {profileData.currentCompany && (
                <p className="text-sm text-muted-foreground">
                  @ {profileData.currentCompany}
                </p>
              )}
            </div>
            <div className="w-full space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="truncate">{profileData.email}</span>
              </div>
              {profileData.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{profileData.location}</span>
                </div>
              )}
              {profileData.graduationYear && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Class of {profileData.graduationYear}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              {editing
                ? "Update your professional information"
                : "Your professional details"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  disabled={!editing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                  disabled={!editing}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Input
                  id="branch"
                  value={profileData.branch}
                  onChange={(e) =>
                    setProfileData({ ...profileData, branch: e.target.value })
                  }
                  disabled={!editing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="graduationYear">Graduation Year</Label>
                <Input
                  id="graduationYear"
                  value={profileData.graduationYear}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      graduationYear: e.target.value,
                    })
                  }
                  disabled={!editing}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="currentCompany">Current Company</Label>
                <Input
                  id="currentCompany"
                  value={profileData.currentCompany}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      currentCompany: e.target.value,
                    })
                  }
                  disabled={!editing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentPosition">Current Position</Label>
                <Input
                  id="currentPosition"
                  value={profileData.currentPosition}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      currentPosition: e.target.value,
                    })
                  }
                  disabled={!editing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={profileData.location}
                onChange={(e) =>
                  setProfileData({ ...profileData, location: e.target.value })
                }
                disabled={!editing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) =>
                  setProfileData({ ...profileData, bio: e.target.value })
                }
                disabled={!editing}
                rows={4}
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  value={profileData.linkedin}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      linkedin: e.target.value,
                    })
                  }
                  disabled={!editing}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github">GitHub URL</Label>
                <Input
                  id="github"
                  value={profileData.github}
                  onChange={(e) =>
                    setProfileData({ ...profileData, github: e.target.value })
                  }
                  disabled={!editing}
                  placeholder="https://github.com/..."
                />
              </div>
            </div>

            {Array.isArray(profileData.skills) &&
              profileData.skills.length > 0 && (
                <div className="space-y-2">
                  <Label>Skills</Label>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
