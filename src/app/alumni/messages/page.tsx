"use client";

import { useEffect, useState, useRef } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleLayout } from "@/components/layout/role-layout";
import { NewChatDialog } from "@/components/chat/new-chat-dialog";
import {
  MessageSquare,
  Send,
  Search,
  Users,
  Image as ImageIcon,
  X,
} from "lucide-react";
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

export default function AlumniMessagesPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const token = localStorage.getItem("auth_token");
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
      const token = localStorage.getItem("auth_token");
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, GIF, WebP)");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "message-image");

      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/files/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        return data.url;
      } else {
        toast.error(data.error || "Failed to upload image");
        return null;
      }
    } catch (error) {
      toast.error("Failed to upload image");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedImage) || !selectedChat) return;

    try {
      setSendingMessage(true);
      let imageUrl = null;

      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
        if (!imageUrl) {
          setSendingMessage(false);
          return;
        }
      }

      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/chats/${selectedChat.id}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newMessage.trim() || (imageUrl ? "📷 Image" : ""),
          imageUrl: imageUrl,
        }),
      });

      if (response.ok) {
        setNewMessage("");
        removeImage();
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
      <RoleLayout role="alumni">
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
    <RoleLayout role="alumni">
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
                Connect with your network
              </p>
            </div>
            <NewChatDialog onChatCreated={fetchChats} />
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
                            <AvatarImage
                              src={chat.otherUser?.profileImageUrl}
                            />
                            <AvatarFallback>
                              {getInitials(
                                chat.otherUser?.name || chat.name || "?"
                              )}
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
                              <Badge
                                variant="outline"
                                className="text-xs capitalize mt-1"
                              >
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
                      <AvatarImage
                        src={selectedChat.otherUser?.profileImageUrl}
                      />
                      <AvatarFallback>
                        {getInitials(
                          selectedChat.otherUser?.name ||
                            selectedChat.name ||
                            "?"
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
                          <p className="text-muted-foreground">
                            No messages yet
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message, index) => {
                          const isCurrentUser =
                            message.senderId === selectedChat.otherUser?.id;
                          return (
                            <motion.div
                              key={message.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.2,
                                delay: index * 0.02,
                              }}
                              className={`flex ${isCurrentUser ? "justify-start" : "justify-end"}`}
                            >
                              <div
                                className={`max-w-[70%] rounded-lg p-3 ${
                                  isCurrentUser
                                    ? "bg-muted"
                                    : "bg-primary text-primary-foreground"
                                }`}
                              >
                                {(message as any).imageUrl ? (
                                  <div className="space-y-2">
                                    <div className="relative">
                                      <img
                                        src={(message as any).imageUrl}
                                        alt="Shared image"
                                        className="max-w-full max-h-96 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => {
                                          const url = (message as any).imageUrl;
                                          console.log("Opening image:", url);
                                          window.open(url, "_blank");
                                        }}
                                        onLoad={() => {
                                          console.log(
                                            "Image loaded successfully:",
                                            (message as any).imageUrl
                                          );
                                        }}
                                        onError={(e) => {
                                          console.error(
                                            "Failed to load image:",
                                            (message as any).imageUrl
                                          );
                                          const img =
                                            e.target as HTMLImageElement;
                                          img.style.display = "none";
                                          const errorDiv =
                                            document.createElement("div");
                                          errorDiv.className =
                                            "text-xs text-red-500 p-2 bg-red-50 rounded";
                                          errorDiv.textContent =
                                            "Failed to load image";
                                          img.parentElement?.appendChild(
                                            errorDiv
                                          );
                                        }}
                                      />
                                    </div>
                                    {message.content &&
                                      message.content !== "📷 Image" && (
                                        <p className="text-sm">
                                          {message.content}
                                        </p>
                                      )}
                                  </div>
                                ) : (
                                  <p className="text-sm">{message.content}</p>
                                )}
                                <p
                                  className={`text-xs mt-1 ${
                                    isCurrentUser
                                      ? "text-muted-foreground"
                                      : "opacity-70"
                                  }`}
                                >
                                  {new Date(
                                    message.createdAt
                                  ).toLocaleTimeString()}
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>

                  <div className="border-t p-4">
                    {imagePreview && (
                      <div className="mb-3 relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-w-xs max-h-32 rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={removeImage}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}

                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpg,image/jpeg,image/gif,image/webp"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                      <Input
                        placeholder={
                          selectedImage
                            ? "Add a caption..."
                            : "Type a message..."
                        }
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={sendingMessage || uploading}
                      />
                      <Button
                        type="submit"
                        disabled={
                          (!newMessage.trim() && !selectedImage) ||
                          sendingMessage ||
                          uploading
                        }
                      >
                        {sendingMessage || uploading ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-xl font-semibold mb-2">
                    Select a conversation
                  </p>
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
