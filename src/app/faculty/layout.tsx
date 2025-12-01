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
import { GraduationCap, LayoutDashboard, Users, Calendar, FileText, MessageSquare, LogOut, Menu, BarChart3, FileCheck, UserCircle, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/faculty", icon: LayoutDashboard },
    { name: "Students", href: "/faculty/students", icon: Users },
    { name: "Events", href: "/faculty/events", icon: Calendar },
    { name: "Mentorship", href: "/faculty/mentorship", icon: GraduationCap },
    { name: "Approvals", href: "/faculty/approvals", icon: FileCheck },
    { name: "Reports", href: "/faculty/reports", icon: BarChart3 },
    { name: "Messages", href: "/faculty/messages", icon: MessageSquare },
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <ProtectedRoute requiredRole="faculty">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
              <Link href="/faculty" className="flex items-center gap-2 font-semibold">
                <GraduationCap className="h-6 w-6 text-primary" />
                <span className="hidden sm:inline-block">Alumni Connect</span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium">{user?.name}</span>
                <span className="text-xs text-muted-foreground">Faculty</span>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.profileImageUrl} alt={user?.name} />
                      <AvatarFallback className="bg-purple-500/10 text-purple-600">
                        {user?.name ? getInitials(user.name) : 'FC'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      <p className="text-xs font-medium text-purple-600 mt-1">Faculty</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/faculty/profile">
                      <UserCircle className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/faculty/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 border-r bg-background transition-transform duration-300 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}>
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
                        ? "bg-purple-500 text-white"
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

          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/50 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="container py-6 px-4 md:px-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}