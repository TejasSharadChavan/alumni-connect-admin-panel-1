"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreditCard, Loader2, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MockPaymentButtonProps {
  amount: number;
  campaignId?: number;
  message?: string;
  onSuccess?: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const MockPaymentButton = ({
  amount,
  campaignId,
  message,
  onSuccess,
  disabled,
  className,
  children,
}: MockPaymentButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setShowDialog(true);

      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create donation directly (mock successful payment)
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("Please login to continue");
        return;
      }

      const response = await fetch("/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount,
          campaignId,
          message,
          isAnonymous: false,
        }),
      });

      if (response.ok) {
        toast.success("Payment successful! Thank you for your donation.");
        onSuccess?.();
        setShowDialog(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Payment failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to process payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handlePayment}
        disabled={disabled || loading}
        className={className}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            {children || "Pay Now"}
          </>
        )}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Processing Payment
            </DialogTitle>
            <DialogDescription>
              Please wait while we process your donation of ₹
              {amount.toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8">
            {loading ? (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
                <p className="text-sm text-muted-foreground">
                  Processing payment...
                </p>
              </>
            ) : (
              <>
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-sm text-green-600 font-medium">
                  Payment Successful!
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
