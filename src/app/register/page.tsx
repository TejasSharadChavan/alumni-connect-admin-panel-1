"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, GraduationCap, UserPlus, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    requestedRole: "",
    phone: "",
    branch: "",
    cohort: "",
    yearOfPassing: "",
    department: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.requestedRole) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    // Role-specific validation
    if (formData.requestedRole === "student" && (!formData.branch || !formData.cohort)) {
      toast.error("Branch and Cohort are required for student registration");
      return;
    }

    if (formData.requestedRole === "alumni" && (!formData.branch || !formData.yearOfPassing)) {
      toast.error("Branch and Year of Passing are required for alumni registration");
      return;
    }

    if (formData.requestedRole === "faculty" && !formData.department) {
      toast.error("Department is required for faculty registration");
      return;
    }

    setLoading(true);

    try {
      const submittedData: any = {};
      
      if (formData.phone) submittedData.phone = formData.phone;
      if (formData.branch) submittedData.branch = formData.branch;
      if (formData.cohort) submittedData.cohort = formData.cohort;
      if (formData.yearOfPassing) submittedData.yearOfPassing = parseInt(formData.yearOfPassing);
      if (formData.department) submittedData.department = formData.department;

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          requestedRole: formData.requestedRole,
          submittedData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        toast.success("Registration submitted successfully!");
      } else {
        toast.error(data.error || "Registration failed");
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-2 shadow-xl text-center">
            <CardHeader className="space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold">Registration Submitted!</CardTitle>
              <CardDescription className="text-base">
                Your registration has been received and is pending admin approval.
                You'll receive an email notification once your account is approved.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col space-y-3">
              <Button onClick={() => router.push('/login')} className="w-full">
                Go to Login
              </Button>
              <Button variant="outline" onClick={() => router.push('/')} className="w-full">
                Back to Home
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-2 shadow-xl">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
            <CardDescription className="text-base">
              Join the Terna Engineering College Alumni Connect Platform
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@terna.ac.in"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      disabled={loading}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
                      disabled={loading}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select value={formData.requestedRole} onValueChange={(value) => handleChange("requestedRole", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="alumni">Alumni</SelectItem>
                      <SelectItem value="faculty">Faculty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="+91-9876543210"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Student-specific fields */}
              {formData.requestedRole === "student" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch *</Label>
                    <Select value={formData.branch} onValueChange={(value) => handleChange("branch", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Computer Engineering">Computer Engineering</SelectItem>
                        <SelectItem value="Electronics Engineering">Electronics Engineering</SelectItem>
                        <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                        <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                        <SelectItem value="IT Engineering">IT Engineering</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cohort">Cohort *</Label>
                    <Input
                      id="cohort"
                      placeholder="e.g., 2023-2024"
                      value={formData.cohort}
                      onChange={(e) => handleChange("cohort", e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              {/* Alumni-specific fields */}
              {formData.requestedRole === "alumni" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch *</Label>
                    <Select value={formData.branch} onValueChange={(value) => handleChange("branch", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Computer Engineering">Computer Engineering</SelectItem>
                        <SelectItem value="Electronics Engineering">Electronics Engineering</SelectItem>
                        <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                        <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                        <SelectItem value="IT Engineering">IT Engineering</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yearOfPassing">Year of Passing *</Label>
                    <Input
                      id="yearOfPassing"
                      type="number"
                      placeholder="e.g., 2020"
                      value={formData.yearOfPassing}
                      onChange={(e) => handleChange("yearOfPassing", e.target.value)}
                      disabled={loading}
                      min="1990"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>
              )}

              {/* Faculty-specific fields */}
              {formData.requestedRole === "faculty" && (
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select value={formData.department} onValueChange={(value) => handleChange("department", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Engineering">Computer Engineering</SelectItem>
                      <SelectItem value="Electronics Engineering">Electronics Engineering</SelectItem>
                      <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                      <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                      <SelectItem value="IT Engineering">IT Engineering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Sign in here
                </Link>
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground bg-amber-500/10 border border-amber-500/20 p-3 rounded-md">
                  ⚠️ <strong>Note:</strong> Your registration will be reviewed by an administrator.
                  You'll receive an email once your account is approved.
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
