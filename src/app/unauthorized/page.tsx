"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-destructive/5 via-background to-destructive/10 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 border-destructive/20 shadow-xl text-center">
          <CardHeader className="space-y-4">
            <div className="mx-auto w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
            <CardDescription className="text-base">
              You don't have permission to access this page. Please contact an administrator if you believe this is an error.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col space-y-3">
            <Button onClick={() => router.back()} variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Button onClick={() => router.push("/login")} className="w-full">
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
