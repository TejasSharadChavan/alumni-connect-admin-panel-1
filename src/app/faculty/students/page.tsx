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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  Search,
  Loader2,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  Award,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";

interface Student {
  id: number;
  name: string;
  email: string;
  branch: string;
  cohort: string;
  skills: string[];
  headline?: string;
  bio?: string;
  phoneNumber?: string;
  createdAt: string;
}

export default function FacultyStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [cohortFilter, setCohortFilter] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchQuery, branchFilter, cohortFilter]);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch("/api/users?role=student", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        // Parse skills if they're JSON strings
        const studentsWithParsedSkills = (data.users || []).map(
          (student: any) => {
            let parsedSkills = student.skills;
            if (typeof student.skills === "string") {
              try {
                parsedSkills = JSON.parse(student.skills);
              } catch (e) {
                parsedSkills = [];
              }
            }
            if (!Array.isArray(parsedSkills)) {
              parsedSkills = [];
            }
            return { ...student, skills: parsedSkills };
          }
        );
        setStudents(studentsWithParsedSkills);
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query) ||
          student.branch.toLowerCase().includes(query) ||
          student.skills.some((skill) => skill.toLowerCase().includes(query))
      );
    }

    // Branch filter
    if (branchFilter !== "all") {
      filtered = filtered.filter((student) => student.branch === branchFilter);
    }

    // Cohort filter
    if (cohortFilter !== "all") {
      filtered = filtered.filter((student) => student.cohort === cohortFilter);
    }

    setFilteredStudents(filtered);
  };

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setDetailsDialogOpen(true);
  };

  const getBranchColor = (branch: string) => {
    const colors: Record<string, string> = {
      CSE: "bg-blue-500",
      IT: "bg-purple-500",
      EXTC: "bg-green-500",
      MECH: "bg-orange-500",
      CIVIL: "bg-yellow-500",
      EE: "bg-red-500",
    };
    return colors[branch] || "bg-gray-500";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get unique branches and cohorts for filters
  const uniqueBranches = Array.from(new Set(students.map((s) => s.branch)));
  const uniqueCohorts = Array.from(
    new Set(students.map((s) => s.cohort))
  ).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Students</h1>
        <p className="text-muted-foreground">
          View and monitor students in your department
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Students</CardDescription>
            <CardTitle className="text-3xl">{students.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Filtered Results</CardDescription>
            <CardTitle className="text-3xl">
              {filteredStudents.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Branches</CardDescription>
            <CardTitle className="text-3xl">{uniqueBranches.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Cohorts</CardDescription>
            <CardTitle className="text-3xl">{uniqueCohorts.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, branch, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {uniqueBranches.map((branch) => (
                  <SelectItem key={branch} value={branch}>
                    {branch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={cohortFilter} onValueChange={setCohortFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by cohort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cohorts</SelectItem>
                {uniqueCohorts.map((cohort) => (
                  <SelectItem key={cohort} value={cohort}>
                    {cohort}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Students Found</h3>
            <p className="text-muted-foreground text-center">
              {searchQuery || branchFilter !== "all" || cohortFilter !== "all"
                ? "Try adjusting your filters"
                : "No students in the system yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <Card
              key={student.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">
                      {student.name}
                    </CardTitle>
                    <CardDescription className="truncate">
                      {student.email}
                    </CardDescription>
                    <div className="flex gap-2 mt-2">
                      <Badge className={getBranchColor(student.branch)}>
                        {student.branch}
                      </Badge>
                      <Badge variant="outline">{student.cohort}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {student.headline && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {student.headline}
                  </p>
                )}

                {student.skills.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {student.skills.slice(0, 3).map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {student.skills.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{student.skills.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleViewDetails(student)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Student Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>
              Complete information about the student
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {getInitials(selectedStudent.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{selectedStudent.name}</h3>
                  {selectedStudent.headline && (
                    <p className="text-muted-foreground mt-1">
                      {selectedStudent.headline}
                    </p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <Badge className={getBranchColor(selectedStudent.branch)}>
                      {selectedStudent.branch}
                    </Badge>
                    <Badge variant="outline">{selectedStudent.cohort}</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedStudent.email}</span>
                  </div>
                  {selectedStudent.phoneNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedStudent.phoneNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Joined{" "}
                      {new Date(selectedStudent.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {selectedStudent.bio && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    About
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedStudent.bio}
                  </p>
                </div>
              )}

              {selectedStudent.skills.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudent.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button className="flex-1" asChild>
                  <a href={`mailto:${selectedStudent.email}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </a>
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <a
                    href={`/student/${selectedStudent.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Profile
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
