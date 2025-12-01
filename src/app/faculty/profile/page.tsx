"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { Loader2, Save, User, Mail, Building, FileText } from "lucide-react";
import { toast } from "sonner";

export default function FacultyProfilePage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    headline: "",
    bio: "",
    phoneNumber: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        department: user.department || "",
        headline: user.headline || "",
        bio: user.bio || "",
        phoneNumber: "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const token = localStorage.getItem("bearer_token");
      if (!token) return;

      const response = await fetch(`/api/users/${user?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Profile updated successfully");
        await refreshUser();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your faculty profile information</p>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-2xl">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <div className="flex items-center gap-2">
                <Badge>Faculty</Badge>
                {user.department && <Badge variant="outline">{user.department}</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  <User className="h-4 w-4 inline mr-2" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">
                  <Building className="h-4 w-4 inline mr-2" />
                  Department
                </Label>
                <Input
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+91 1234567890"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="headline">
                <FileText className="h-4 w-4 inline mr-2" />
                Professional Headline
              </Label>
              <Input
                id="headline"
                name="headline"
                value={formData.headline}
                onChange={handleChange}
                placeholder="e.g., Professor of Computer Science | Research in AI & ML"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">About</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={5}
                placeholder="Write a brief description about your expertise, research interests, and teaching philosophy..."
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (user) {
                    setFormData({
                      name: user.name || "",
                      email: user.email || "",
                      department: user.department || "",
                      headline: user.headline || "",
                      bio: user.bio || "",
                      phoneNumber: "",
                    });
                  }
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>View your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Role</p>
              <p className="text-lg capitalize">{user.role}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant={user.status === "active" ? "default" : "secondary"}>
                {user.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
