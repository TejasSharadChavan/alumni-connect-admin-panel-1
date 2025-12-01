"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleLayout } from "@/components/layout/role-layout";
import { NewChatDialog } from "@/components/chat/new-chat-dialog";
import { MessageSquare, Send, Search, Users, Smile, Check, CheckCheck, Circle, Paperclip, Phone, Video, MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import EmojiPicker from "emoji-picker-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export default function StudentMessagesPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<number[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id);
      // Poll for new messages every 5 seconds
      const interval = setInterval(() => fetchMessages(selectedChat.id), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
        setShowEmojiPicker(false);
        fetchMessages(selectedChat.id);
        fetchChats(); // Refresh chat list to update last message
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

  const handleEmojiClick = (emojiData: any) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChat) return;

    // Simulate image upload
    toast.success("Image upload feature coming soon!");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatMessageTime = (date: string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return `Yesterday ${messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  const isOnline = (userId?: number) => {
    return userId ? onlineUsers.includes(userId) : false;
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
      <RoleLayout role="student">
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
    <RoleLayout role="student">
      <div className="space-y-6 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
              <p className="text-muted-foreground mt-2">
                Connect with your network
              </p>
            </div>
            <NewChatDialog onChatCreated={fetchChats} />
          </div>
        </motion.div>

        {/* Messages Interface */}
        <div className="grid grid-cols-12 gap-6">
          {/* Chat List */}
          <Card className="col-span-12 md:col-span-4 border-2">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
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
                    <p className="text-sm text-muted-foreground mt-2">
                      Start a conversation with someone from your network
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredChats.map((chat) => (
                      <motion.div
                        key={chat.id}
                        whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                        onClick={() => setSelectedChat(chat)}
                        className={`p-4 cursor-pointer transition-colors ${
                          selectedChat?.id === chat.id ? "bg-muted" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={chat.otherUser?.profileImageUrl} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                                {getInitials(chat.otherUser?.name || chat.name || "?")}
                              </AvatarFallback>
                            </Avatar>
                            {isOnline(chat.otherUser?.id) && (
                              <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-green-500 text-green-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-sm truncate">
                                {chat.otherUser?.name || chat.name}
                              </p>
                              {chat.lastMessageTime && (
                                <span className="text-xs text-muted-foreground">
                                  {formatMessageTime(chat.lastMessageTime)}
                                </span>
                              )}
                            </div>
                            {chat.otherUser && (
                              <Badge variant="outline" className="text-xs capitalize mt-1">
                                {chat.otherUser.role}
                              </Badge>
                            )}
                            <div className="flex items-center justify-between mt-1">
                              {chat.lastMessage && (
                                <p className="text-xs text-muted-foreground truncate flex-1">
                                  {chat.lastMessage}
                                </p>
                              )}
                              {chat.unreadCount > 0 && (
                                <Badge variant="default" className="ml-2 bg-green-500">
                                  {chat.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Window */}
          <Card className="col-span-12 md:col-span-8 border-2">
            {selectedChat ? (
              <>
                <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={selectedChat.otherUser?.profileImageUrl} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                            {getInitials(
                              selectedChat.otherUser?.name || selectedChat.name || "?"
                            )}
                          </AvatarFallback>
                        </Avatar>
                        {isOnline(selectedChat.otherUser?.id) && (
                          <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-green-500 text-green-500" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {selectedChat.otherUser?.name || selectedChat.name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {isOnline(selectedChat.otherUser?.id) ? (
                            <span className="text-green-600 font-medium">Online</span>
                          ) : (
                            "Last seen recently"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Phone className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Video className="h-5 w-5" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
                          <DropdownMenuItem>Clear Chat</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Block User</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex flex-col bg-[url('/chat-bg.png')] bg-repeat">
                  {/* Messages */}
                  <ScrollArea className="h-[480px] p-4">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No messages yet</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Start the conversation!
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((message, index) => {
                          const isCurrentUser = message.senderId !== selectedChat.otherUser?.id;
                          const showDate = index === 0 || 
                            new Date(messages[index - 1].createdAt).toDateString() !== 
                            new Date(message.createdAt).toDateString();

                          return (
                            <div key={message.id}>
                              {showDate && (
                                <div className="flex justify-center my-4">
                                  <Badge variant="secondary" className="bg-background/80 backdrop-blur">
                                    {new Date(message.createdAt).toLocaleDateString('en-US', { 
                                      weekday: 'long', 
                                      year: 'numeric', 
                                      month: 'long', 
                                      day: 'numeric' 
                                    })}
                                  </Badge>
                                </div>
                              )}
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.2 }}
                                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                              >
                                <div
                                  className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                                    isCurrentUser
                                      ? "bg-blue-500 text-white rounded-br-none"
                                      : "bg-background border rounded-bl-none"
                                  }`}
                                >
                                  <p className="text-sm break-words">{message.content}</p>
                                  <div className={`flex items-center gap-1 justify-end mt-1 ${
                                    isCurrentUser ? "text-white/70" : "text-muted-foreground"
                                  }`}>
                                    <span className="text-xs">
                                      {formatMessageTime(message.createdAt)}
                                    </span>
                                    {isCurrentUser && (
                                      <CheckCheck className="h-3 w-3" />
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                    
                    {/* Typing Indicator */}
                    <AnimatePresence>
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="flex justify-start mt-2"
                        >
                          <div className="bg-background border rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                            <div className="flex gap-1">
                              <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                className="w-2 h-2 bg-muted-foreground rounded-full"
                              />
                              <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                className="w-2 h-2 bg-muted-foreground rounded-full"
                              />
                              <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                className="w-2 h-2 bg-muted-foreground rounded-full"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="border-t p-4 bg-background/95 backdrop-blur">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="relative"
                        >
                          <Smile className="h-5 w-5" />
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Paperclip className="h-5 w-5" />
                        </Button>
                      </div>
                      <div className="flex-1 relative">
                        <Input
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          disabled={sendingMessage}
                          className="pr-12 rounded-full"
                        />
                        {showEmojiPicker && (
                          <div className="absolute bottom-full mb-2 right-0 z-50">
                            <EmojiPicker onEmojiClick={handleEmojiClick} />
                          </div>
                        )}
                      </div>
                      <Button 
                        type="submit" 
                        disabled={sendingMessage || !newMessage.trim()}
                        size="icon"
                        className="rounded-full"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="h-[680px] flex items-center justify-center bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="h-12 w-12 text-primary" />
                  </div>
                  <p className="text-2xl font-semibold mb-2">Select a conversation</p>
                  <p className="text-muted-foreground max-w-sm">
                    Choose a chat from the list to start messaging or create a new conversation
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