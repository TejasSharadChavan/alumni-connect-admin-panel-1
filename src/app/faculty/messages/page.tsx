"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleLayout } from "@/components/layout/role-layout";
import { MessageSquare, Send, Search, Users, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Chat {
  id: number;
  chatType: string;
  name?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  otherUser?: {
    id: number;
    name: string;
    profileImageUrl?: string;
    role: string;
  };
}

interface Message {
  id: number;
  content: string;
  senderId: number;
  senderName: string;
  createdAt: string;
  messageType: string;
}

export default function FacultyMessagesPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id);
      const interval = setInterval(() => fetchMessages(selectedChat.id), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/chats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setChats(data.chats || []);
      } else {
        toast.error("Failed to load chats");
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      toast.error("Failed to load chats");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId: number) => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      setSendingMessage(true);
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/chats/${selectedChat.id}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newMessage }),
      });

      if (response.ok) {
        setNewMessage("");
        fetchMessages(selectedChat.id);
        fetchChats();
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSendingMessage(false);
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

  const filteredChats = chats.filter((chat) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      chat.name?.toLowerCase().includes(searchLower) ||
      chat.otherUser?.name.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <RoleLayout role="faculty">
        <div className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-12 gap-6">
            <Skeleton className="col-span-4 h-[600px]" />
            <Skeleton className="col-span-8 h-[600px]" />
          </div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout role="faculty">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
              <p className="text-muted-foreground mt-2">
                Connect with students and colleagues
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-12 gap-6">
          <Card className="col-span-12 md:col-span-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Conversations
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                {filteredChats.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {searchQuery ? "No chats found" : "No conversations yet"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredChats.map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => setSelectedChat(chat)}
                        className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedChat?.id === chat.id ? "bg-muted" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={chat.otherUser?.profileImageUrl} />
                            <AvatarFallback>
                              {getInitials(chat.otherUser?.name || chat.name || "?")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm truncate">
                                {chat.otherUser?.name || chat.name}
                              </p>
                              {chat.unreadCount > 0 && (
                                <Badge variant="destructive" className="ml-2">
                                  {chat.unreadCount}
                                </Badge>
                              )}
                            </div>
                            {chat.otherUser && (
                              <Badge variant="outline" className="text-xs capitalize mt-1">
                                {chat.otherUser.role}
                              </Badge>
                            )}
                            {chat.lastMessage && (
                              <p className="text-xs text-muted-foreground truncate mt-1">
                                {chat.lastMessage}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="col-span-12 md:col-span-8">
            {selectedChat ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedChat.otherUser?.profileImageUrl} />
                      <AvatarFallback>
                        {getInitials(
                          selectedChat.otherUser?.name || selectedChat.name || "?"
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {selectedChat.otherUser?.name || selectedChat.name}
                      </CardTitle>
                      {selectedChat.otherUser && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {selectedChat.otherUser.role}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex flex-col">
                  <ScrollArea className="h-[480px] p-4">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No messages yet</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message, index) => {
                          const isCurrentUser = message.senderId === selectedChat.otherUser?.id;
                          return (
                            <motion.div
                              key={message.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2, delay: index * 0.02 }}
                              className={`flex ${isCurrentUser ? "justify-start" : "justify-end"}`}
                            >
                              <div
                                className={`max-w-[70%] rounded-lg p-3 ${
                                  isCurrentUser
                                    ? "bg-muted"
                                    : "bg-primary text-primary-foreground"
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                                <p
                                  className={`text-xs mt-1 ${
                                    isCurrentUser ? "text-muted-foreground" : "opacity-70"
                                  }`}
                                >
                                  {new Date(message.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>

                  <form
                    onSubmit={handleSendMessage}
                    className="border-t p-4 flex gap-2"
                  >
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={sendingMessage}
                    />
                    <Button type="submit" disabled={sendingMessage || !newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </>
            ) : (
              <CardContent className="h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-xl font-semibold mb-2">Select a conversation</p>
                  <p className="text-muted-foreground">
                    Choose a chat from the list to start messaging
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </RoleLayout>
  );
}
