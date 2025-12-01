"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, Bot, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  context?: Record<string, any>;
  suggestions?: string[];
}

export function AIAssistant({ context, suggestions = [] }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Network insights
    if (lowerMessage.includes("network") || lowerMessage.includes("connection")) {
      return "📊 Based on your network data:\n\n• You have strong connections in Computer Science (45%)\n• Consider connecting with more alumni in your field\n• Your network has grown 23% this month\n• Top recommendation: Connect with Dr. Priya Joshi for AI/ML mentorship";
    }
    
    // Career insights
    if (lowerMessage.includes("job") || lowerMessage.includes("career") || lowerMessage.includes("opportunity")) {
      return "💼 Career Insights:\n\n• 8 new job postings match your skills\n• Your profile views increased by 34% this week\n• Top skills in demand: React, Node.js, AI/ML\n• Recommended: Update your resume and apply to Google SDE role";
    }
    
    // Skills analysis
    if (lowerMessage.includes("skill") || lowerMessage.includes("improve")) {
      return "🎯 Skills Analysis:\n\n• Current top skills: JavaScript, React, Python\n• Trending skills you should learn: AI/ML, Cloud Computing\n• 5 workshops available this month\n• Recommendation: Enroll in the upcoming AI workshop by Prof. Joshi";
    }
    
    // Activity insights
    if (lowerMessage.includes("activity") || lowerMessage.includes("engagement")) {
      return "📈 Activity Insights:\n\n• Your engagement score: 87/100 (Excellent!)\n• Most active times: Weekday evenings\n• 12 posts this month (↑ 40%)\n• Your posts get 3.2x more engagement than average";
    }
    
    // Predictions
    if (lowerMessage.includes("predict") || lowerMessage.includes("future") || lowerMessage.includes("trend")) {
      return "🔮 Predictive Analytics:\n\n• Network growth projection: +45 connections in 3 months\n• Job application success rate: 68% (above average)\n• Predicted next connection: Alumni from Google\n• Trending topics: AI/ML, Cloud, Web3";
    }
    
    // Events
    if (lowerMessage.includes("event") || lowerMessage.includes("workshop")) {
      return "📅 Event Recommendations:\n\n• 3 upcoming events match your interests\n• AI/ML Workshop (This Saturday) - Highly recommended!\n• Alumni Meetup next week\n• Career Fair in 2 weeks - 15+ companies attending";
    }
    
    // Mentorship
    if (lowerMessage.includes("mentor") || lowerMessage.includes("guidance")) {
      return "🎓 Mentorship Insights:\n\n• 8 mentors available in your field\n• Recommended: Connect with Rahul Agarwal (Google SDE)\n• Average response time: 2 days\n• Success rate: 85% of requests accepted";
    }
    
    // General help
    return "✨ I'm your AI assistant! I can help you with:\n\n• Network analysis & growth predictions\n• Career opportunities & job insights\n• Skills recommendations\n• Activity & engagement tracking\n• Event suggestions\n• Mentorship connections\n\nTry asking: 'Show my network insights' or 'Predict my growth'";
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI processing
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateAIResponse(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <>
      {/* Floating AI Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Sparkles className="h-6 w-6" />
        </Button>
      </motion.div>

      {/* AI Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 z-50 w-96"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="shadow-2xl border-2">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Messages */}
                <ScrollArea className="h-96 p-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                      <Bot className="h-12 w-12 mb-4 text-primary" />
                      <p className="text-sm">
                        Hi! I'm your AI assistant. Ask me anything about your network, career, or activities!
                      </p>
                      {suggestions.length > 0 && (
                        <div className="mt-4 space-y-2 w-full">
                          {suggestions.slice(0, 3).map((suggestion, i) => (
                            <Button
                              key={i}
                              variant="outline"
                              size="sm"
                              className="w-full text-xs"
                              onClick={() => setInput(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex gap-3 ${
                            message.role === "user" ? "flex-row-reverse" : ""
                          }`}
                        >
                          <div
                            className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            {message.role === "user" ? (
                              <User className="h-4 w-4" />
                            ) : (
                              <Bot className="h-4 w-4" />
                            )}
                          </div>
                          <div
                            className={`flex-1 rounded-lg p-3 ${
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-line">
                              {message.content}
                            </p>
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                      {isLoading && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-3"
                        >
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <Bot className="h-4 w-4" />
                          </div>
                          <div className="flex-1 rounded-lg p-3 bg-muted">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask me anything..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      disabled={isLoading}
                    />
                    <Button
                      size="icon"
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
