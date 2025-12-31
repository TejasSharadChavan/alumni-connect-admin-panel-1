"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  GraduationCap,
  LayoutDashboard,
  Briefcase,
  Calendar,
  Users,
  MessageSquare,
  LogOut,
  Menu,
  FolderKanban,
  UserCheck,
  TrendingUp,
  FileText,
  Sparkles,
  Bell,
  UserCircle,
  Settings,
  BarChart3,
  Maximize,
  Minimize,
  Expand,
  Shrink,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      setIsBrowserFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch("/api/notifications?limit=5", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(
          data.notifications?.filter((n: Notification) => !n.isRead).length || 0
        );
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isRead: true,
        }),
      });

      if (response.ok) {
        setNotifications(
          notifications.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const navigation = [
    { name: "Dashboard", href: "/student", icon: LayoutDashboard },
    { name: "Network", href: "/student/network", icon: Users },
    { name: "Jobs", href: "/student/jobs", icon: Briefcase },
    { name: "Applications", href: "/student/applications", icon: FileText },
    { name: "Events", href: "/student/events", icon: Calendar },
    { name: "Mentorship", href: "/student/mentorship", icon: UserCheck },
    { name: "Projects", href: "/student/projects", icon: FolderKanban },
    { name: "Messages", href: "/student/messages", icon: MessageSquare },
    { name: "Profile", href: "/student/profile", icon: UserCircle },
  ];

  const toggleBrowserFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        // Enter fullscreen
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if ((document.documentElement as any).webkitRequestFullscreen) {
          await (document.documentElement as any).webkitRequestFullscreen();
        } else if ((document.documentElement as any).mozRequestFullScreen) {
          await (document.documentElement as any).mozRequestFullScreen();
        } else if ((document.documentElement as any).msRequestFullscreen) {
          await (document.documentElement as any).msRequestFullscreen();
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (error) {
      console.error("Error toggling browser fullscreen:", error);
    }
  };

  const topNavItems = [
    { name: "Feed", href: "/feed", icon: FileText },
    { name: "Analytics", href: "/student/analytics", icon: TrendingUp },
    { name: "Trends", href: "/student/trends", icon: Sparkles },
    { name: "Skill Gap", href: "/student/skill-gap", icon: BarChart3 },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Link
                href="/student"
                className="flex items-center gap-2 font-semibold"
              >
                <GraduationCap className="h-6 w-6 text-primary" />
                <span className="hidden sm:inline-block">AlumConnect</span>
              </Link>
            </div>

            {/* Top Navigation Items */}
            <div className="hidden lg:flex items-center gap-1">
              {topNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-500 text-white shadow-sm"
                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* Separator */}
              <div className="h-6 w-px bg-gray-200 mx-2" />

              {/* Fullscreen Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium">{user?.name}</span>
                <span className="text-xs text-muted-foreground">Student</span>
              </div>

              {/* Mobile Analytics Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden text-blue-600 hover:bg-blue-50 hover:text-blue-700 relative"
                    title="Analytics & Insights"
                  >
                    <BarChart3 className="h-4 w-4" />
                    {/* Active indicator */}
                    {[
                      "/student/analytics",
                      "/student/trends",
                      "/student/skill-gap",
                    ].includes(pathname) && (
                      <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    Analytics & Insights
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {[
                    {
                      name: "Analytics",
                      href: "/student/analytics",
                      icon: TrendingUp,
                      description: "Track your progress",
                    },
                    {
                      name: "Trends",
                      href: "/student/trends",
                      icon: Sparkles,
                      description: "Industry insights",
                    },
                    {
                      name: "Skill Gap",
                      href: "/student/skill-gap",
                      icon: BarChart3,
                      description: "Identify missing skills",
                    },
                  ].map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <DropdownMenuItem
                        key={item.name}
                        asChild
                        className="cursor-pointer"
                      >
                        <Link
                          href={item.href}
                          className={`flex flex-col items-start gap-1 p-3 ${
                            isActive ? "bg-blue-50 text-blue-600" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            <span className="font-medium">{item.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground ml-6">
                            {item.description}
                          </span>
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Fullscreen Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="lg:hidden text-black hover:bg-black hover:text-white"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length > 0 ? (
                    <>
                      <div className="max-h-[400px] overflow-y-auto">
                        {notifications.map((notif) => (
                          <DropdownMenuItem
                            key={notif.id}
                            className={`flex flex-col items-start py-3 cursor-pointer ${
                              !notif.isRead ? "bg-muted/50" : ""
                            }`}
                            onClick={() => {
                              if (!notif.isRead) handleMarkAsRead(notif.id);
                              // Navigate based on notification type
                              if (notif.type === "job") {
                                router.push("/student/jobs");
                              } else if (notif.type === "application") {
                                router.push("/student/applications");
                              } else if (notif.type === "connection") {
                                router.push("/student/network");
                              } else if (notif.type === "event") {
                                router.push("/student/events");
                              } else if (notif.type === "message") {
                                router.push("/student/messages");
                              }
                            }}
                          >
                            <div className="flex items-start justify-between w-full">
                              <div className="flex-1">
                                <span className="font-medium text-sm">
                                  {notif.title}
                                </span>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {notif.message}
                                </p>
                                <span className="text-xs text-muted-foreground mt-1">
                                  {new Date(
                                    notif.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              {!notif.isRead && (
                                <div className="h-2 w-2 rounded-full bg-primary ml-2 mt-1" />
                              )}
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href="/student/notifications"
                          className="w-full text-center"
                        >
                          View all notifications
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No notifications
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={user?.profileImageUrl}
                        alt={user?.name}
                      />
                      <AvatarFallback className="bg-blue-500/10 text-blue-600">
                        {user?.name ? getInitials(user.name) : "ST"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                      <p className="text-xs font-medium text-blue-600 mt-1">
                        Student
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/student/profile">
                      <UserCircle className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/student/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Browser Fullscreen Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleBrowserFullscreen}
                className="text-black hover:bg-black hover:text-white"
                title={
                  isBrowserFullscreen
                    ? "Exit Browser Fullscreen"
                    : "Enter Browser Fullscreen"
                }
              >
                {isBrowserFullscreen ? (
                  <Shrink className="h-4 w-4" />
                ) : (
                  <Expand className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          {!isFullscreen && (
            <aside
              className={cn(
                "fixed inset-y-0 left-0 z-40 w-64 border-r bg-background transition-transform duration-300 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:translate-x-0",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              )}
            >
              <nav className="flex flex-col gap-2 p-4 pt-20 md:pt-4">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-blue-500 text-white"
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </aside>
          )}

          {/* Overlay for mobile */}
          {!isFullscreen && sidebarOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/50 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <main
            className={cn(
              "flex-1 overflow-y-auto transition-all duration-300",
              isFullscreen ? "w-full" : ""
            )}
          >
            <div
              className={cn(
                "py-6 px-4 md:px-6",
                isFullscreen ? "container-fluid max-w-none" : "container"
              )}
            >
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
