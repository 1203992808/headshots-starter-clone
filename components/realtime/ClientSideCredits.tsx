"use client";

import { Database } from "@/types/supabase";
import { creditsRow } from "@/types/utils";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import CheckInButton from "../CheckInButton";

export const revalidate = 0;

type ClientSideCreditsProps = {
  creditsRow: creditsRow | null;
};

export default function ClientSideCredits({
  creditsRow,
}: ClientSideCreditsProps) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );
  const [credits, setCredits] = useState<creditsRow | null>(creditsRow);

  useEffect(() => {
    if (!credits) return;

    const channel = supabase
      .channel("realtime credits")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "credits" },
        (payload: { new: creditsRow }) => {
          setCredits(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, credits, setCredits]);

  // Handler for when check-in is completed
  const handleCheckInComplete = (newCredits: number) => {
    if (credits) {
      setCredits({
        ...credits,
        credits: newCredits,
      });
    }
  };

  return (
    <div className="flex items-center">
      <p>Credits: {credits?.credits || 0}</p>
      <CheckInButton onCheckInComplete={handleCheckInComplete} />
    </div>
  );
}
