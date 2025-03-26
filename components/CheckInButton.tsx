"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

interface CheckInButtonProps {
  onCheckInComplete?: (newCredits: number) => void;
}

export default function CheckInButton({ onCheckInComplete }: CheckInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckIn = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/credits/check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        toast({
          title: "Check-in Failed",
          description: data.message || "Something went wrong",
          duration: 5000,
        });
      } else {
        toast({
          title: "Check-in Successful",
          description: data.message,
          duration: 5000,
        });
        
        if (onCheckInComplete && data.credits) {
          onCheckInComplete(data.credits);
        }
      }
    } catch (error) {
      toast({
        title: "Check-in Failed",
        description: "There was an error processing your check-in",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCheckIn} 
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="ml-2"
    >
      {isLoading ? "Checking in..." : "Daily Check-in"}
    </Button>
  );
} 