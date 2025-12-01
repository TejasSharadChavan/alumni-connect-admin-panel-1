"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, IndianRupee, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DonationFormProps {
  campaignId?: string;
  campaignTitle?: string;
  onSuccess?: () => void;
}

export function DonationForm({ campaignId, campaignTitle, onSuccess }: DonationFormProps) {
  const [amount, setAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const presetAmounts = [500, 1000, 2000, 5000, 10000];

  const handleDonate = async () => {
    const finalAmount = parseInt(amount || customAmount);
    
    if (!finalAmount || finalAmount < 100) {
      toast.error("Minimum donation amount is ₹100");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("auth_token");

      const response = await fetch("/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          campaignId: campaignId || null,
          amount: finalAmount,
          message,
          isAnonymous,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to process donation");
      }

      toast.success("Thank you for your generous donation! 🎉");
      
      // Reset form
      setAmount("");
      setCustomAmount("");
      setMessage("");
      setIsAnonymous(false);
      
      onSuccess?.();
    } catch (error: any) {
      console.error("Donation error:", error);
      toast.error(error.message || "Failed to process donation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Make a Donation
        </CardTitle>
        <CardDescription>
          {campaignTitle || "Support our initiatives and make a difference"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preset Amounts */}
        <div>
          <Label>Select Amount</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {presetAmounts.map((preset) => (
              <Button
                key={preset}
                variant={amount === preset.toString() ? "default" : "outline"}
                onClick={() => {
                  setAmount(preset.toString());
                  setCustomAmount("");
                }}
                disabled={isSubmitting}
              >
                ₹{preset.toLocaleString()}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <div>
          <Label htmlFor="customAmount">Or Enter Custom Amount</Label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="customAmount"
              type="number"
              placeholder="Enter amount"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setAmount("");
              }}
              className="pl-9"
              min={100}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Message */}
        <div>
          <Label htmlFor="message">Message (Optional)</Label>
          <Textarea
            id="message"
            placeholder="Leave a message of support..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            disabled={isSubmitting}
          />
        </div>

        {/* Anonymous Option */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="anonymous"
            checked={isAnonymous}
            onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
            disabled={isSubmitting}
          />
          <Label htmlFor="anonymous" className="text-sm font-normal cursor-pointer">
            Make this donation anonymous
          </Label>
        </div>

        {/* Donate Button */}
        <Button
          onClick={handleDonate}
          disabled={(!amount && !customAmount) || isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Heart className="mr-2 h-4 w-4" />
              Donate ₹{(parseInt(amount || customAmount) || 0).toLocaleString()}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}