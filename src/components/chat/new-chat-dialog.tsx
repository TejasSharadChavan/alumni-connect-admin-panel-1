"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  profileImageUrl?: string;
}

interface NewChatDialogProps {
  onChatCreated?: () => void;
}

export const NewChatDialog = ({ onChatCreated }: NewChatDialogProps) => {
  const [open, setOpen] = useState(false);
  const [connections, setConnections] = useState<User[]>([]);
  const [filteredConnections, setFilteredConnections] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (open) {
      fetchConnections();
    }
  }, [open]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = connections.filter((user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConnections(filtered);
    } else {
      setFilteredConnections(connections);
    }
  }, [searchQuery, connections]);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/connections?status=accepted", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const connectedUsers = Array.isArray(data) 
          ? data.map((conn: any) => conn.connectedUser).filter(Boolean)
          : [];
        setConnections(connectedUsers);
        setFilteredConnections(connectedUsers);
      } else {
        toast.error("Failed to load connections");
      }
    } catch (error) {
      console.error("Error fetching connections:", error);
      toast.error("Failed to load connections");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChat = async (userId: number) => {
    try {
      setCreating(true);
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        toast.success("Chat created!");
        setOpen(false);
        onChatCreated?.();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to create chat");
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Failed to create chat");
    } finally {
      setCreating(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Search className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Start New Chat</DialogTitle>
          <DialogDescription>
            Select a connection to start chatting with
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search connections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredConnections.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {connections.length === 0
                  ? "No connections yet. Connect with people first!"
                  : "No connections found"}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {filteredConnections.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleCreateChat(user.id)}
                    disabled={creating}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left disabled:opacity-50"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profileImageUrl} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.name}</p>
                      <Badge variant="outline" className="text-xs capitalize mt-1">
                        {user.role}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
