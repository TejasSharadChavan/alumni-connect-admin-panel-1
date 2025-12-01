"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Loader2, FolderKanban, Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Task {
  id: number;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  assignedTo?: string;
  dueDate?: string;
  createdAt: string;
}

interface Team {
  id: number;
  name: string;
  description: string;
  createdBy: number;
  memberCount: number;
  tasks: Task[];
  createdAt: string;
}

export default function ProjectsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  const [teamForm, setTeamForm] = useState({
    name: "",
    description: "",
  });

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: "",
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      if (!token) return;

      // For now, use mock data since we don't have teams API yet
      // TODO: Replace with actual API call
      const mockTeams: Team[] = [
        {
          id: 1,
          name: "AI Research Project",
          description: "Building a machine learning model for sentiment analysis",
          createdBy: 1,
          memberCount: 4,
          createdAt: new Date().toISOString(),
          tasks: [
            {
              id: 1,
              title: "Data Collection",
              description: "Gather training data from various sources",
              status: "completed",
              priority: "high",
              createdAt: new Date().toISOString(),
            },
            {
              id: 2,
              title: "Model Training",
              description: "Train the neural network",
              status: "in_progress",
              priority: "high",
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              createdAt: new Date().toISOString(),
            },
            {
              id: 3,
              title: "UI Development",
              description: "Build the frontend interface",
              status: "todo",
              priority: "medium",
              createdAt: new Date().toISOString(),
            },
          ],
        },
        {
          id: 2,
          name: "Campus App Development",
          description: "Mobile app for campus services",
          createdBy: 1,
          memberCount: 3,
          createdAt: new Date().toISOString(),
          tasks: [
            {
              id: 4,
              title: "Requirements Gathering",
              description: "Document all required features",
              status: "completed",
              priority: "high",
              createdAt: new Date().toISOString(),
            },
            {
              id: 5,
              title: "API Development",
              description: "Build backend REST APIs",
              status: "in_progress",
              priority: "high",
              createdAt: new Date().toISOString(),
            },
          ],
        },
      ];

      setTeams(mockTeams);
    } catch (error) {
      console.error("Failed to fetch teams:", error);
      toast.error("Failed to load teams");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("bearer_token");
      if (!token) {
        toast.error("Please log in to continue");
        return;
      }

      // TODO: Replace with actual API call when teams API is available
      const newTeam: Team = {
        id: Date.now(),
        name: teamForm.name,
        description: teamForm.description,
        createdBy: 1,
        memberCount: 1,
        tasks: [],
        createdAt: new Date().toISOString(),
      };

      setTeams([newTeam, ...teams]);
      toast.success("Team created successfully!");
      setCreateDialogOpen(false);
      setTeamForm({ name: "", description: "" });
    } catch (error) {
      console.error("Failed to create team:", error);
      toast.error("Failed to create team");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTeamId) return;

    try {
      const token = localStorage.getItem("bearer_token");
      if (!token) {
        toast.error("Please log in to continue");
        return;
      }

      // TODO: Replace with actual API call when tasks API is available
      const newTask: Task = {
        id: Date.now(),
        title: taskForm.title,
        description: taskForm.description,
        status: "todo",
        priority: taskForm.priority,
        dueDate: taskForm.dueDate || undefined,
        createdAt: new Date().toISOString(),
      };

      setTeams(teams.map(team => 
        team.id === selectedTeamId
          ? { ...team, tasks: [...team.tasks, newTask] }
          : team
      ));

      toast.success("Task created successfully!");
      setTaskDialogOpen(false);
      setTaskForm({ title: "", description: "", priority: "medium", dueDate: "" });
    } catch (error) {
      console.error("Failed to create task:", error);
      toast.error("Failed to create task");
    }
  };

  const updateTaskStatus = (teamId: number, taskId: number, newStatus: "todo" | "in_progress" | "completed") => {
    setTeams(teams.map(team => 
      team.id === teamId
        ? {
            ...team,
            tasks: team.tasks.map(task =>
              task.id === taskId ? { ...task, status: newStatus } : task
            ),
          }
        : team
    ));
    toast.success("Task status updated!");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="h-4 w-4" />;
      case "in_progress": return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Projects & Teams</h1>
          <p className="text-muted-foreground">Collaborate with teammates and manage your projects</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Start a new project team and invite members to collaborate
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Team Name *</Label>
                <Input
                  id="name"
                  value={teamForm.name}
                  onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                  placeholder="AI Research Team"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={teamForm.description}
                  onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
                  placeholder="What is this project about?"
                  rows={4}
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">Create Team</Button>
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {teams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Teams Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first team to start collaborating on projects
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {teams.map((team) => (
            <Card key={team.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FolderKanban className="h-5 w-5 text-primary" />
                      {team.name}
                    </CardTitle>
                    <CardDescription className="mt-2">{team.description}</CardDescription>
                    <div className="flex gap-4 mt-3">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {team.memberCount} members
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(team.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Dialog open={taskDialogOpen && selectedTeamId === team.id} onOpenChange={(open) => {
                    setTaskDialogOpen(open);
                    if (open) setSelectedTeamId(team.id);
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Task
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Task</DialogTitle>
                        <DialogDescription>Add a task to {team.name}</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateTask} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="task-title">Task Title *</Label>
                          <Input
                            id="task-title"
                            value={taskForm.title}
                            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                            placeholder="Implement feature X"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="task-description">Description *</Label>
                          <Textarea
                            id="task-description"
                            value={taskForm.description}
                            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                            placeholder="Task details..."
                            rows={3}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="task-priority">Priority</Label>
                            <Select
                              value={taskForm.priority}
                              onValueChange={(value: "low" | "medium" | "high") => 
                                setTaskForm({ ...taskForm, priority: value })
                              }
                            >
                              <SelectTrigger id="task-priority">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="task-due">Due Date</Label>
                            <Input
                              id="task-due"
                              type="date"
                              value={taskForm.dueDate}
                              onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                              min={new Date().toISOString().split("T")[0]}
                            />
                          </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                          <Button type="submit" className="flex-1">Create Task</Button>
                          <Button type="button" variant="outline" onClick={() => setTaskDialogOpen(false)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {/* Kanban Board */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* To Do Column */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-semibold">To Do</h4>
                      <Badge variant="secondary" className="ml-auto">
                        {team.tasks.filter(t => t.status === "todo").length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {team.tasks
                        .filter(task => task.status === "todo")
                        .map(task => (
                          <Card key={task.id} className="p-3">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <h5 className="font-medium text-sm">{task.title}</h5>
                                <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                                  {task.priority}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {task.description}
                              </p>
                              {task.dueDate && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(task.dueDate).toLocaleDateString()}
                                </div>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full text-xs"
                                onClick={() => updateTaskStatus(team.id, task.id, "in_progress")}
                              >
                                Start Task
                              </Button>
                            </div>
                          </Card>
                        ))}
                    </div>
                  </div>

                  {/* In Progress Column */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <h4 className="font-semibold">In Progress</h4>
                      <Badge variant="secondary" className="ml-auto">
                        {team.tasks.filter(t => t.status === "in_progress").length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {team.tasks
                        .filter(task => task.status === "in_progress")
                        .map(task => (
                          <Card key={task.id} className="p-3 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <h5 className="font-medium text-sm">{task.title}</h5>
                                <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                                  {task.priority}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {task.description}
                              </p>
                              {task.dueDate && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(task.dueDate).toLocaleDateString()}
                                </div>
                              )}
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 text-xs"
                                  onClick={() => updateTaskStatus(team.id, task.id, "todo")}
                                >
                                  Move Back
                                </Button>
                                <Button
                                  size="sm"
                                  className="flex-1 text-xs"
                                  onClick={() => updateTaskStatus(team.id, task.id, "completed")}
                                >
                                  Complete
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                    </div>
                  </div>

                  {/* Completed Column */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <h4 className="font-semibold">Completed</h4>
                      <Badge variant="secondary" className="ml-auto">
                        {team.tasks.filter(t => t.status === "completed").length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {team.tasks
                        .filter(task => task.status === "completed")
                        .map(task => (
                          <Card key={task.id} className="p-3 border-green-200 bg-green-50/50 dark:bg-green-950/20">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <h5 className="font-medium text-sm line-through opacity-70">{task.title}</h5>
                                <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                                  {task.priority}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2 opacity-70">
                                {task.description}
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full text-xs"
                                onClick={() => updateTaskStatus(team.id, task.id, "in_progress")}
                              >
                                Reopen
                              </Button>
                            </div>
                          </Card>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
