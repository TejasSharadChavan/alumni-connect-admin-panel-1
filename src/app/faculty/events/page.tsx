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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  Search,
  Loader2,
  Clock,
  CheckCircle,
  TrendingUp,
  BarChart3,
  Eye,
  UserCheck,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

interface Event {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  category: string;
  organizerId: number;
  organizer: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  rsvpCount: number;
  maxAttendees: number | null;
  status: string;
  isPaid: boolean;
  price: string | null;
  branch: string | null;
  createdAt: string;
}

interface EventMetrics {
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  totalAttendees: number;
  averageAttendance: number;
  popularCategory: string;
  monthlyGrowth: string;
  engagementRate: string;
}

export default function FacultyEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [metrics, setMetrics] = useState<EventMetrics>({
    totalEvents: 0,
    upcomingEvents: 0,
    pastEvents: 0,
    totalAttendees: 0,
    averageAttendance: 0,
    popularCategory: "N/A",
    monthlyGrowth: "0%",
    engagementRate: "0%",
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchEvents();
  }, [user]);

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
        const allEvents = data.events || [];

        // Filter events for faculty - show events they organized or in their branch
        const facultyEvents = allEvents.filter(
          (event: Event) =>
            event.organizerId === user?.id ||
            event.branch === user?.branch ||
            user?.role === "admin"
        );

        setEvents(facultyEvents);
        calculateMetrics(facultyEvents);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (eventsList: Event[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const upcomingEvents = eventsList.filter(
      (e) => new Date(e.startDate) > now
    );
    const pastEvents = eventsList.filter((e) => new Date(e.endDate) < now);
    const totalAttendees = eventsList.reduce((sum, e) => sum + e.rsvpCount, 0);
    const averageAttendance =
      eventsList.length > 0
        ? Math.round(totalAttendees / eventsList.length)
        : 0;

    // Calculate popular category
    const categoryCount: Record<string, number> = {};
    eventsList.forEach((event) => {
      categoryCount[event.category] = (categoryCount[event.category] || 0) + 1;
    });
    const popularCategory = Object.keys(categoryCount).reduce(
      (a, b) => (categoryCount[a] > categoryCount[b] ? a : b),
      "N/A"
    );

    // Calculate monthly growth
    const currentMonthEvents = eventsList.filter((e) => {
      const eventDate = new Date(e.createdAt);
      return (
        eventDate.getMonth() === currentMonth &&
        eventDate.getFullYear() === currentYear
      );
    }).length;

    const lastMonthEvents = eventsList.filter((e) => {
      const eventDate = new Date(e.createdAt);
      return (
        eventDate.getMonth() === lastMonth &&
        eventDate.getFullYear() === lastMonthYear
      );
    }).length;

    const monthlyGrowth =
      lastMonthEvents > 0
        ? `${Math.round(((currentMonthEvents - lastMonthEvents) / lastMonthEvents) * 100)}%`
        : currentMonthEvents > 0
          ? "100%"
          : "0%";

    // Calculate engagement rate (attendees vs max capacity)
    const eventsWithCapacity = eventsList.filter((e) => e.maxAttendees);
    const engagementRate =
      eventsWithCapacity.length > 0
        ? `${Math.round((eventsWithCapacity.reduce((sum, e) => sum + e.rsvpCount / (e.maxAttendees || 1), 0) / eventsWithCapacity.length) * 100)}%`
        : "N/A";

    setMetrics({
      totalEvents: eventsList.length,
      upcomingEvents: upcomingEvents.length,
      pastEvents: pastEvents.length,
      totalAttendees,
      averageAttendance,
      popularCategory,
      monthlyGrowth,
      engagementRate,
    });
  };

  const filterEvents = () => {
    let filtered = [...events];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query) ||
          event.category.toLowerCase().includes(query)
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter((event) => event.category === filterType);
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      workshop: "bg-purple-500",
      webinar: "bg-blue-500",
      meetup: "bg-green-500",
      conference: "bg-red-500",
      social: "bg-yellow-500",
    };
    return colors[category] || "bg-gray-500";
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
          <h1 className="text-3xl font-bold">Events Management</h1>
          <p className="text-muted-foreground">
            Organize and manage college events with detailed analytics
          </p>
        </div>
        <Button asChild>
          <Link href="/faculty/events/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Link>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingEvents.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past Events ({pastEvents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Enhanced Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Total Events
                </CardDescription>
                <CardTitle className="text-3xl">
                  {metrics.totalEvents}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Upcoming
                </CardDescription>
                <CardTitle className="text-3xl">
                  {metrics.upcomingEvents}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total Attendees
                </CardDescription>
                <CardTitle className="text-3xl">
                  {metrics.totalAttendees}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Avg Attendance
                </CardDescription>
                <CardTitle className="text-3xl">
                  {metrics.averageAttendance}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Monthly Growth
                </CardDescription>
                <CardTitle className="text-2xl">
                  {metrics.monthlyGrowth}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Engagement Rate
                </CardDescription>
                <CardTitle className="text-2xl">
                  {metrics.engagementRate}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Popular Category</CardDescription>
                <CardTitle className="text-xl capitalize">
                  {metrics.popularCategory}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Completed Events</CardDescription>
                <CardTitle className="text-3xl">{metrics.pastEvents}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events by title, description, location, or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All Categories</option>
                  <option value="workshop">Workshop</option>
                  <option value="webinar">Webinar</option>
                  <option value="meetup">Meetup</option>
                  <option value="conference">Conference</option>
                  <option value="social">Social</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Recent Events Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
                <CardDescription>Your latest organized events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredEvents.slice(0, 3).map((event) => {
                  const status = getEventStatus(event);
                  return (
                    <div
                      key={event.id}
                      className="flex items-center gap-4 p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(event.startDate)} • {event.rsvpCount}{" "}
                          attendees
                        </p>
                      </div>
                      <Badge className={status.color}>{status.label}</Badge>
                    </div>
                  );
                })}
                {filteredEvents.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No events found
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event Categories</CardTitle>
                <CardDescription>Distribution of your events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(
                  filteredEvents.reduce(
                    (acc, event) => {
                      acc[event.category] = (acc[event.category] || 0) + 1;
                      return acc;
                    },
                    {} as Record<string, number>
                  )
                ).map(([category, count]) => (
                  <div
                    key={category}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${getCategoryColor(category)}`}
                      />
                      <span className="capitalize">{category}</span>
                    </div>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
                {filteredEvents.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No categories to display
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-6">
          {upcomingEvents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Upcoming Events
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first event to get started
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
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge className={getCategoryColor(event.category)}>
                              {event.category}
                            </Badge>
                            <Badge className={status.color}>
                              {status.label}
                            </Badge>
                            {event.isPaid && (
                              <Badge variant="outline" className="gap-1">
                                <DollarSign className="h-3 w-3" />
                                {event.price}
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-xl">
                            {event.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {event.description}
                          </CardDescription>
                        </div>
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
                          {event.rsvpCount}
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
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-6">
          {pastEvents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Past Events</h3>
                <p className="text-muted-foreground text-center">
                  Your completed events will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastEvents.map((event) => {
                const status = getEventStatus(event);
                return (
                  <Card
                    key={event.id}
                    className="hover:shadow-lg transition-shadow opacity-90"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge className={getCategoryColor(event.category)}>
                              {event.category}
                            </Badge>
                            <Badge className={status.color}>
                              {status.label}
                            </Badge>
                          </div>
                          <CardTitle className="text-xl">
                            {event.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {event.description}
                          </CardDescription>
                        </div>
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
                        <span>{event.rsvpCount} attendees</span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          asChild
                        >
                          <Link href={`/faculty/events/${event.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Report
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
