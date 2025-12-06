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
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  Search,
  Loader2,
  Clock,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Event {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  type: string;
  organizerId: number;
  organizerName: string;
  attendeeCount: number;
  maxAttendees: number | null;
  status: string;
}

export default function FacultyEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, filterType]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch("/api/events", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query)
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter((event) => event.type === filterType);
    }

    setFilteredEvents(filtered);
  };

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    if (now < start) return { label: "Upcoming", color: "bg-blue-500" };
    if (now >= start && now <= end)
      return { label: "Ongoing", color: "bg-green-500" };
    return { label: "Completed", color: "bg-gray-500" };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const upcomingEvents = filteredEvents.filter(
    (e) => new Date(e.startDate) > new Date()
  );
  const pastEvents = filteredEvents.filter(
    (e) => new Date(e.endDate) < new Date()
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">
            Organize and manage college events
          </p>
        </div>
        <Button asChild>
          <Link href="/faculty/events/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Events</CardDescription>
            <CardTitle className="text-3xl">{events.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Upcoming</CardDescription>
            <CardTitle className="text-3xl">{upcomingEvents.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Past Events</CardDescription>
            <CardTitle className="text-3xl">{pastEvents.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Attendees</CardDescription>
            <CardTitle className="text-3xl">
              {events.reduce((sum, e) => sum + e.attendeeCount, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events by title, description, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery
                ? "Try adjusting your search"
                : "Start by creating your first event"}
            </p>
            <Button asChild>
              <Link href="/faculty/events/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Upcoming Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingEvents.map((event) => {
                  const status = getEventStatus(event);
                  return (
                    <Card
                      key={event.id}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-xl">
                              {event.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-2">
                              {event.description}
                            </CardDescription>
                          </div>
                          <Badge className={status.color}>{status.label}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(event.startDate)} -{" "}
                            {formatDate(event.endDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            {formatTime(event.startDate)} -{" "}
                            {formatTime(event.endDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>
                            {event.attendeeCount}
                            {event.maxAttendees
                              ? ` / ${event.maxAttendees}`
                              : ""}{" "}
                            attendees
                          </span>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            asChild
                          >
                            <Link href={`/faculty/events/${event.id}`}>
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Past Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastEvents.map((event) => {
                  const status = getEventStatus(event);
                  return (
                    <Card
                      key={event.id}
                      className="hover:shadow-lg transition-shadow opacity-75"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-xl">
                              {event.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-2">
                              {event.description}
                            </CardDescription>
                          </div>
                          <Badge className={status.color}>{status.label}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(event.startDate)} -{" "}
                            {formatDate(event.endDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{event.attendeeCount} attendees</span>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            asChild
                          >
                            <Link href={`/faculty/events/${event.id}`}>
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
