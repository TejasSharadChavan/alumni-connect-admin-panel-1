"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  GraduationCap,
  UserCircle,
  FolderKanban,
  Heart,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RoleLayoutProps {
  children: ReactNode;
  role: "admin" | "student" | "alumni" | "faculty";
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export function RoleLayout({ children, role }: RoleLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
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
        setUnreadCount(data.notifications?.filter((n: Notification) => !n.read).length || 0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setNotifications(notifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navigationItems = {
    admin: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
      { icon: Users, label: "User Approvals", href: "/admin/approvals" },
      { icon: Users, label: "Manage Users", href: "/admin/users" },
      { icon: FileText, label: "Content Moderation", href: "/admin/content" },
      { icon: Briefcase, label: "Jobs", href: "/admin/jobs" },
      { icon: Calendar, label: "Events", href: "/admin/events" },
    ],
    student: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/student" },
      { icon: FileText, label: "Feed", href: "/feed" },
      { icon: Users, label: "Network", href: "/student/network" },
      { icon: Briefcase, label: "Jobs", href: "/student/jobs" },
      { icon: Calendar, label: "Events", href: "/student/events" },
      { icon: GraduationCap, label: "Mentorship", href: "/student/mentorship" },
      { icon: FolderKanban, label: "Projects", href: "/student/projects" },
      { icon: MessageSquare, label: "Messages", href: "/student/messages" },
      { icon: UserCircle, label: "Profile", href: "/student/profile" },
    ],
    alumni: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/alumni" },
      { icon: FileText, label: "Feed", href: "/feed" },
      { icon: Users, label: "Network", href: "/alumni/network" },
      { icon: Briefcase, label: "Jobs", href: "/alumni/jobs" },
      { icon: Calendar, label: "Events", href: "/alumni/events" },
      { icon: GraduationCap, label: "Mentorship", href: "/alumni/mentorship" },
      { icon: Heart, label: "Donations", href: "/alumni/donations" },
      { icon: MessageSquare, label: "Messages", href: "/alumni/messages" },
      { icon: UserCircle, label: "Profile", href: "/alumni/profile" },
    ],
    faculty: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/faculty" },
      { icon: FileText, label: "Feed", href: "/feed" },
      { icon: Users, label: "Network", href: "/faculty/network" },
      { icon: Users, label: "Students", href: "/faculty/students" },
      { icon: FileText, label: "Approvals", href: "/faculty/approvals" },
      { icon: Calendar, label: "Events", href: "/faculty/events" },
      { icon: GraduationCap, label: "Mentorship", href: "/faculty/mentorship" },
      { icon: MessageSquare, label: "Messages", href: "/faculty/messages" },
      { icon: UserCircle, label: "Profile", href: "/faculty/profile" },
    ],
  };

  const navItems = navigationItems[role];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link href={`/${role}`} className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg hidden sm:inline-block">
                Alumni Connect
              </span>
            </Link>
            <Badge variant="secondary" className="capitalize hidden sm:inline-flex">
              {role}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
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
                            !notif.read ? "bg-muted/50" : ""
                          }`}
                          onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                        >
                          <div className="flex items-start justify-between w-full">
                            <div className="flex-1">
                              <span className="font-medium text-sm">{notif.title}</span>
                              <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                              <span className="text-xs text-muted-foreground mt-1">
                                {new Date(notif.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {!notif.read && (
                              <div className="h-2 w-2 rounded-full bg-primary ml-2 mt-1" />
                            )}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/${role}/notifications`} className="w-full text-center">
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

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.profileImageUrl} alt={user?.name} />
                    <AvatarFallback>{user?.name ? getInitials(user.name) : "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/${role}/profile`}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${role}/settings`}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:bg-muted/30">
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Sidebar - Mobile */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-background lg:hidden"
              >
                <div className="flex h-16 items-center border-b px-4">
                  <Link href={`/${role}`} className="flex items-center gap-2">
                    <GraduationCap className="h-6 w-6 text-primary" />
                    <span className="font-bold text-lg">Alumni Connect</span>
                  </Link>
                </div>
                <nav className="flex-1 space-y-1 p-4">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6 max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}