"use client";

import { useEffect, useState } from "react";

interface ExpirationTimerProps {
  expirationTime: Date;
}

export default function ExpirationTimer({ expirationTime }: ExpirationTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiration = expirationTime.getTime();
      const difference = expiration - now;

      if (difference <= 0) {
        setTimeLeft("Expired");
        return;
      }

      const minutes = Math.floor(difference / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [expirationTime]);

  return (
    <span className="font-mono font-bold text-lg">
      {timeLeft}
    </span>
  );
} 