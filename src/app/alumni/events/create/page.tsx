"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    location: "",
    date: "",
    time: "",
    maxAttendees: "",
    registrationDeadline: "",
    branch: "",
    isPaid: false,
    price: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("Please log in to continue");
        router.push("/login");
        return;
      }

      // Combine date and time
      const eventDateTime = new Date(`${formData.date}T${formData.time}`);

      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.type, // API expects 'category' not 'type'
          location: formData.location,
          startDate: eventDateTime.toISOString(),
          endDate: new Date(
            eventDateTime.getTime() + 2 * 60 * 60 * 1000
          ).toISOString(), // Default 2 hours duration
          maxAttendees: formData.maxAttendees
            ? parseInt(formData.maxAttendees)
            : null,
          branch: formData.branch === "all" ? null : formData.branch || null,
          isPaid: formData.isPaid,
          price:
            formData.isPaid && formData.price ? `₹${formData.price}` : null,
          imageUrl: null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Event creation error:", data);
        throw new Error(data.error || "Failed to create event");
      }

      toast.success("Event submitted for admin approval!");
      router.push("/alumni/events");
    } catch (error: any) {
      console.error("Error creating event:", error);
      toast.error(error.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button variant="ghost" asChild>
        <Link href="/alumni">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Create New Event</CardTitle>
              <CardDescription>
                Submit an event for admin approval. Once approved, it will be
                visible to all members.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Alumni Tech Meetup 2024"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe your event, what attendees can expect, and any special instructions..."
                rows={6}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Event Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                  required
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="seminar">Seminar</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                    <SelectItem value="conference">Conference</SelectItem>
                    <SelectItem value="meetup">Meetup</SelectItem>
                    <SelectItem value="webinar">Webinar</SelectItem>
                    <SelectItem value="career-fair">Career Fair</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch">Target Branch (Optional)</Label>
                <Select
                  value={formData.branch}
                  onValueChange={(value) =>
                    setFormData({ ...formData, branch: value })
                  }
                >
                  <SelectTrigger id="branch">
                    <SelectValue placeholder="All branches (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    <SelectItem value="CSE">Computer Science</SelectItem>
                    <SelectItem value="IT">Information Technology</SelectItem>
                    <SelectItem value="EXTC">Electronics & Telecom</SelectItem>
                    <SelectItem value="MECH">Mechanical</SelectItem>
                    <SelectItem value="CIVIL">Civil</SelectItem>
                    <SelectItem value="EE">Electrical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="Campus Auditorium / Zoom Link / Address"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxAttendees">Max Attendees (Optional)</Label>
                <Input
                  id="maxAttendees"
                  type="number"
                  value={formData.maxAttendees}
                  onChange={(e) =>
                    setFormData({ ...formData, maxAttendees: e.target.value })
                  }
                  placeholder="Leave empty for unlimited"
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationDeadline">
                  Registration Deadline (Optional)
                </Label>
                <Input
                  id="registrationDeadline"
                  type="date"
                  value={formData.registrationDeadline}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      registrationDeadline: e.target.value,
                    })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  max={formData.date}
                />
              </div>
            </div>

            <div className="space-y-4 border rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPaid"
                  checked={formData.isPaid}
                  onChange={(e) =>
                    setFormData({ ...formData, isPaid: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <Label htmlFor="isPaid" className="font-medium cursor-pointer">
                  This is a paid event
                </Label>
              </div>

              {formData.isPaid && (
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="500"
                    min="0"
                    step="0.01"
                    required={formData.isPaid}
                  />
                </div>
              )}
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Your event will be submitted for admin
                review. Once approved, it will be visible to all members and
                they can RSVP.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Event for Approval"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
