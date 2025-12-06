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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoleLayout } from "@/components/layout/role-layout";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Search,
  Filter,
  DollarSign,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  category: string;
  maxAttendees?: number;
  isPaid: boolean;
  price?: string;
  imageUrl?: string;
  organizerName?: string;
  attendeeCount?: number;
  hasRSVP?: boolean;
  status: string;
}

export default function StudentEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [rsvpingEventId, setRsvpingEventId] = useState<number | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, categoryFilter, timeFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/events", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        // Only show approved events and map category to type
        const approvedEvents = (
          data.events?.filter((e: any) => e.status === "approved") || []
        ).map((event: any) => ({
          ...event,
          type: event.category || event.type || "general",
        }));
        setEvents(approvedEvents);
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

  const filterEvents = () => {
    let filtered = events;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((event) => event.category === categoryFilter);
    }

    // Time filter
    const now = new Date();
    if (timeFilter === "upcoming") {
      filtered = filtered.filter((event) => new Date(event.startDate) > now);
    } else if (timeFilter === "past") {
      filtered = filtered.filter((event) => new Date(event.endDate) < now);
    } else if (timeFilter === "today") {
      const today = now.toDateString();
      filtered = filtered.filter(
        (event) => new Date(event.startDate).toDateString() === today
      );
    }

    setFilteredEvents(filtered);
  };

  const handleRSVP = async (eventId: number) => {
    try {
      setRsvpingEventId(eventId);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("RSVP confirmed! See you at the event!");
        fetchEvents(); // Refresh to update RSVP status
      } else {
        toast.error(data.error || "Failed to RSVP");
      }
    } catch (error) {
      console.error("Error RSVPing to event:", error);
      toast.error("Failed to RSVP");
    } finally {
      setRsvpingEventId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isEventUpcoming = (startDate: string) => {
    return new Date(startDate) > new Date();
  };

  if (loading) {
    return (
      <RoleLayout role="student">
        <div className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        </div>
      </RoleLayout>
    );
  }

  const upcomingEvents = events.filter((e) => isEventUpcoming(e.startDate));
  const myRSVPs = events.filter((e) => e.hasRSVP);

  return (
    <RoleLayout role="student">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Events</h1>
            <p className="text-muted-foreground mt-2">
              Discover and register for workshops, webinars, and networking
              events
            </p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="webinar">Webinar</SelectItem>
                    <SelectItem value="meetup">Meetup</SelectItem>
                    <SelectItem value="conference">Conference</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="past">Past</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{upcomingEvents.length}</p>
                  <p className="text-sm text-muted-foreground">
                    Upcoming Events
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{myRSVPs.length}</p>
                  <p className="text-sm text-muted-foreground">My RSVPs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{filteredEvents.length}</p>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Listings */}
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No events found matching your criteria
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow flex flex-col">
                  {event.imageUrl && (
                    <div className="h-48 w-full overflow-hidden rounded-t-lg">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="flex-grow">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-xl line-clamp-2">
                          {event.title}
                        </CardTitle>
                        <CardDescription className="mt-2 line-clamp-2">
                          {event.description}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          event.category === "workshop"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {event.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(event.startDate)}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {formatTime(event.startDate)} -{" "}
                        {formatTime(event.endDate)}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                      {event.isPaid && event.price && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          {event.price}
                        </div>
                      )}
                      {event.maxAttendees && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          {event.attendeeCount || 0} / {event.maxAttendees}{" "}
                          attendees
                        </div>
                      )}
                    </div>

                    {event.hasRSVP ? (
                      <Button className="w-full" disabled>
                        <Check className="h-4 w-4 mr-2" />
                        Already Registered
                      </Button>
                    ) : !isEventUpcoming(event.startDate) ? (
                      <Button className="w-full" variant="secondary" disabled>
                        Event Ended
                      </Button>
                    ) : event.maxAttendees &&
                      event.attendeeCount &&
                      event.attendeeCount >= event.maxAttendees ? (
                      <Button className="w-full" variant="secondary" disabled>
                        Event Full
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => handleRSVP(event.id)}
                        disabled={rsvpingEventId === event.id}
                      >
                        {rsvpingEventId === event.id
                          ? "Registering..."
                          : "RSVP Now"}
                      </Button>
                    )}
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
