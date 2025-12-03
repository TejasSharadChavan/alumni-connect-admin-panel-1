"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import { RazorpayButton } from "@/components/payments/razorpay-button";

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

  const presetAmounts = [500, 1000, 2000, 5000, 10000];

  const handleSuccess = () => {
    // Reset form
    setAmount("");
    setCustomAmount("");
    setMessage("");
    setIsAnonymous(false);
    
    onSuccess?.();
  };

  const finalAmount = parseInt(amount || customAmount);

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
              placeholder="Enter amount (Min: ₹100)"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setAmount("");
              }}
              className="pl-9"
              min={100}
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
          />
        </div>

        {/* Anonymous Option */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="anonymous"
            checked={isAnonymous}
            onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
          />
          <Label htmlFor="anonymous" className="text-sm font-normal cursor-pointer">
            Make this donation anonymous
          </Label>
        </div>

        {/* Payment Info */}
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Secure Payment via Razorpay</strong>
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
            Your payment is processed securely. We accept UPI, Cards, Net Banking, and Wallets.
          </p>
        </div>

        {/* Razorpay Payment Button */}
        <RazorpayButton
          amount={finalAmount}
          campaignId={campaignId ? parseInt(campaignId) : undefined}
          message={message}
          onSuccess={handleSuccess}
          disabled={!finalAmount || finalAmount < 100}
          className="w-full"
        >
          <Heart className="mr-2 h-4 w-4" />
          Donate ₹{(finalAmount || 0).toLocaleString()}
        </RazorpayButton>

        <p className="text-xs text-muted-foreground text-center">
          By donating, you agree to our terms and conditions. All donations are non-refundable.
        </p>
      </CardContent>
    </Card>
  );
}