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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleLayout } from "@/components/layout/role-layout";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Search,
  PlusCircle,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Event {
  id: number;
  title: string;
  description: string;
  type: string;
  location: string;
  date: string;
  startDate?: string;
  endDate?: string;
  maxAttendees?: number;
  currentAttendees?: number;
  rsvpCount?: number;
  organizerName: string;
  status: string;
  userRsvpStatus?: string;
  hasRSVPed?: boolean;
  createdAt: string;
}

export default function AlumniEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/events", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        // Map category to type for consistency
        const eventsWithType = (data.events || []).map((event: any) => ({
          ...event,
          type: event.category || event.type || "general",
        }));
        setEvents(eventsWithType);
      } else {
        toast.error("Failed to load events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (eventId: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success("RSVP confirmed!");
        fetchEvents();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to RSVP");
      }
    } catch (error) {
      console.error("Error RSVPing:", error);
      toast.error("Failed to RSVP");
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === "all" || event.type === filterType;

    return matchesSearch && matchesType && event.status === "approved";
  });

  const getEventTypeColor = (type: string) => {
    if (!type) return "bg-gray-500";

    switch (type.toLowerCase()) {
      case "workshop":
        return "bg-blue-500";
      case "seminar":
        return "bg-purple-500";
      case "networking":
        return "bg-green-500";
      case "conference":
        return "bg-red-500";
      case "meetup":
        return "bg-orange-500";
      case "webinar":
        return "bg-pink-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <RoleLayout role="alumni">
        <div className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout role="alumni">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Calendar className="h-8 w-8" />
                Events
              </h1>
              <p className="text-muted-foreground mt-2">
                Discover and manage alumni events
              </p>
            </div>
            <Button asChild>
              <Link href="/alumni/events/create">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Event
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="seminar">Seminar</SelectItem>
                  <SelectItem value="networking">Networking</SelectItem>
                  <SelectItem value="conference">Conference</SelectItem>
                  <SelectItem value="meetup">Meetup</SelectItem>
                  <SelectItem value="webinar">Webinar</SelectItem>
                  <SelectItem value="career-fair">Career Fair</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchQuery
                  ? "No events match your search criteria"
                  : "Be the first to create an event!"}
              </p>
              <Button asChild>
                <Link href="/alumni/events/create">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Event
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge
                        className={`${getEventTypeColor(event.type)} text-white capitalize`}
                      >
                        {event.type}
                      </Badge>
                      {event.userRsvpStatus === "going" && (
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-600"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          RSVP'd
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {event.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatEventDate(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{formatEventTime(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>
                          {event.rsvpCount || event.currentAttendees || 0}
                          {event.maxAttendees
                            ? ` / ${event.maxAttendees}`
                            : ""}{" "}
                          attendees
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <p className="text-sm text-muted-foreground">
                        By {event.organizerName}
                      </p>
                      {event.userRsvpStatus === "going" || event.hasRSVPed ? (
                        <Button variant="outline" disabled>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Already RSVP'd
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleRSVP(event.id)}
                          disabled={
                            event.maxAttendees
                              ? (event.rsvpCount ||
                                  event.currentAttendees ||
                                  0) >= event.maxAttendees
                              : false
                          }
                        >
                          {event.maxAttendees &&
                          (event.rsvpCount || event.currentAttendees || 0) >=
                            event.maxAttendees
                            ? "Full"
                            : "RSVP"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </RoleLayout>
  );
}
