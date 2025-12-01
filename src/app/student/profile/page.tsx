"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { RoleLayout } from "@/components/layout/role-layout";
import { User, Mail, MapPin, Briefcase, Award, Link2, Github, Linkedin, Save, X } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function StudentProfilePage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    headline: "",
    bio: "",
    branch: "",
    cohort: "",
    phone: "",
    linkedinUrl: "",
    githubUrl: "",
    skills: [] as string[],
  });
  
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    if (user) {
      // Parse skills if they're a JSON string
      let parsedSkills = user.skills;
      if (typeof user.skills === 'string') {
        try {
          parsedSkills = JSON.parse(user.skills);
        } catch (e) {
          parsedSkills = [];
        }
      }
      if (!Array.isArray(parsedSkills)) {
        parsedSkills = [];
      }
      
      setFormData({
        name: user.name || "",
        email: user.email || "",
        headline: user.headline || "",
        bio: user.bio || "",
        branch: user.branch || "",
        cohort: user.cohort || "",
        phone: "",
        linkedinUrl: user.linkedinUrl || "",
        githubUrl: user.githubUrl || "",
        skills: parsedSkills,
      });
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
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
        body: JSON.stringify({
          headline: formData.headline,
          bio: formData.bio,
          linkedinUrl: formData.linkedinUrl,
          githubUrl: formData.githubUrl,
          skills: formData.skills,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Profile updated successfully!");
        await refreshUser();
        setIsEditing(false);
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to user data
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        headline: user.headline || "",
        bio: user.bio || "",
        branch: user.branch || "",
        cohort: user.cohort || "",
        phone: "",
        linkedinUrl: user.linkedinUrl || "",
        githubUrl: user.githubUrl || "",
        skills: user.skills || [],
      });
    }
    setIsEditing(false);
  };

  const profileCompleteness = () => {
    let score = 20; // Base score for having an account
    if (formData.headline) score += 15;
    if (formData.bio) score += 20;
    if (formData.skills.length > 0) score += 10 * Math.min(formData.skills.length, 3);
    if (formData.linkedinUrl) score += 10;
    if (formData.githubUrl) score += 10;
    return Math.min(100, score);
  };

  if (loading) {
    return (
      <RoleLayout role="student">
        <div className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout role="student">
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
              <p className="text-muted-foreground mt-2">
                Manage your personal information and portfolio
              </p>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel}>
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

        {/* Profile Completeness */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Profile Completeness</CardTitle>
              <CardDescription>
                Complete your profile to stand out to recruiters and alumni
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">{profileCompleteness()}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${profileCompleteness()}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Picture & Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Your basic profile information (some fields cannot be changed)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-3xl">
                  {formData.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{formData.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formData.branch && <span className="capitalize">{formData.branch}</span>}
                    {formData.cohort && <span> • {formData.cohort}</span>}
                  </p>
                  <Badge variant="secondary" className="mt-2 capitalize">
                    {user?.role}
                  </Badge>
                </div>
              </div>

              {/* Read-only fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input value={formData.name} disabled />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input value={formData.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Branch
                  </Label>
                  <Input value={formData.branch} disabled className="capitalize" />
                </div>
                <div className="space-y-2">
                  <Label>Cohort</Label>
                  <Input value={formData.cohort} disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Professional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
              <CardDescription>
                Tell others about your expertise and interests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="headline" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Headline
                </Label>
                <Input
                  id="headline"
                  name="headline"
                  placeholder="e.g., Computer Science Student | Web Developer | ML Enthusiast"
                  value={formData.headline}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell us about yourself, your interests, and your goals..."
                  rows={6}
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Skills
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill (e.g., React, Python, Machine Learning)"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    disabled={!isEditing}
                  />
                  <Button
                    type="button"
                    onClick={handleAddSkill}
                    disabled={!isEditing || !newSkill.trim()}
                  >
                    Add
                  </Button>
                </div>
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {skill}
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-2 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>
                Connect your professional social media accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="linkedinUrl" className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn URL
                </Label>
                <Input
                  id="linkedinUrl"
                  name="linkedinUrl"
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={formData.linkedinUrl}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="githubUrl" className="flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  GitHub URL
                </Label>
                <Input
                  id="githubUrl"
                  name="githubUrl"
                  type="url"
                  placeholder="https://github.com/yourusername"
                  value={formData.githubUrl}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Save Button (mobile view) */}
        {isEditing && (
          <div className="md:hidden flex gap-2">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>
    </RoleLayout>
  );
}