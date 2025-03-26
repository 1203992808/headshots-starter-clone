"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import CheckInButton from "./CheckInButton";

interface CreditsNotificationProps {
  credits: number;
}

export default function CreditsNotification({ credits }: CreditsNotificationProps) {
  const { toast } = useToast();
  const router = useRouter();

  const showNotEnoughCredits = () => {
    const toastContent = (
      <div className="flex flex-col gap-3">
        <p>You need 3 credits to generate an image. You currently have {credits} credit{credits !== 1 ? 's' : ''}.</p>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => router.push('/credits')}
          >
            View Credits
          </Button>
          <CheckInButton 
            onCheckInComplete={(newCredits) => {
              toast({
                title: "Credits Updated",
                description: `You now have ${newCredits} credits.`,
                duration: 3000,
              });
            }} 
          />
        </div>
      </div>
    );

    toast({
      title: "Not Enough Credits",
      description: toastContent,
      duration: 8000,
    });
  };

  return (
    <Button 
      onClick={showNotEnoughCredits}
      variant="outline"
      size="sm"
      className="mt-2"
    >
      Check Credits
    </Button>
  );
} 