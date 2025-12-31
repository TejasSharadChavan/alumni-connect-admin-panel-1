"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreditCard, Loader2 } from "lucide-react";

interface RazorpayButtonProps {
  amount: number;
  campaignId?: number;
  message?: string;
  onSuccess?: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const RazorpayButton = ({
  amount,
  campaignId,
  message,
  onSuccess,
  disabled,
  className,
  children,
}: RazorpayButtonProps) => {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window.Razorpay !== "undefined") {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway");
        return;
      }

      // Create order
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("Please login to continue");
        return;
      }

      const orderResponse = await fetch("/api/payments/razorpay/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount,
          campaignId,
          message,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        console.error("Create order error:", errorData);
        throw new Error(errorData.error || "Failed to create order");
      }

      const orderData = await orderResponse.json();
      console.log("Order created successfully:", orderData);

      // Get user info
      const userResponse = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        console.error("User fetch error:", errorData);
        throw new Error("Failed to get user information");
      }

      const userData = await userResponse.json();
      console.log("User data fetched:", userData.user?.name);

      // Initialize Razorpay
      const options = {
        key: orderData.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Terna Engineering College",
        description: campaignId ? "Campaign Donation" : "General Donation",
        order_id: orderData.order.id,
        prefill: {
          name: userData.user?.name || "",
          email: userData.user?.email || "",
        },
        theme: {
          color: "#3b82f6",
        },
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch(
              "/api/payments/razorpay/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  donationId: orderData.donationId,
                }),
              }
            );

            if (verifyResponse.ok) {
              toast.success("Payment successful! Thank you for your donation.");
              onSuccess?.();
            } else {
              toast.error("Payment verification failed");
            }
          } catch (error) {
            console.error("Verification error:", error);
            toast.error("Payment verification failed");
          }
        },
        modal: {
          ondismiss: function () {
            toast.info("Payment cancelled");
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
};
