import { Database } from "@/types/supabase";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  // Special case for the specified email
  if (user.email === "1203992808@qq.com") {
    const { data: credits, error: creditsFetchError } = await supabase
      .from("credits")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (creditsFetchError) {
      // Credits record doesn't exist, create one with 10000 credits
      const { error: createError } = await supabase
        .from("credits")
        .insert({
          user_id: user.id,
          credits: 10000,
        });

      if (createError) {
        return NextResponse.json(
          {
            message: "Failed to create credits record",
          },
          { status: 500 }
        );
      }
    } else if (credits.credits !== 10000) {
      // Update to ensure it's always 10000
      const { error: updateError } = await supabase
        .from("credits")
        .update({ credits: 10000 })
        .eq("user_id", user.id);

      if (updateError) {
        return NextResponse.json(
          {
            message: "Failed to update credits",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      message: "Special user credits set to 10000",
      credits: 10000,
    });
  }

  // For normal users, check if they've already checked in today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: credits, error: creditsFetchError } = await supabase
    .from("credits")
    .select("*, last_check_in")
    .eq("user_id", user.id)
    .single();

  if (creditsFetchError) {
    // Credits record doesn't exist, create one with initial 3 credits and set check-in
    const { error: createError } = await supabase
      .from("credits")
      .insert({
        user_id: user.id,
        credits: 4, // 3 initial + 1 for this check-in
        last_check_in: new Date().toISOString(),
      });

    if (createError) {
      return NextResponse.json(
        {
          message: "Failed to create credits record",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Welcome! You received 3 initial credits plus 1 for checking in today.",
      credits: 4,
    });
  }

  // Check if user has already checked in today
  const lastCheckIn = credits.last_check_in ? new Date(credits.last_check_in) : null;
  const lastCheckInDay = lastCheckIn ? new Date(lastCheckIn.setHours(0, 0, 0, 0)) : null;
  const todayTimestamp = today.getTime();
  
  if (lastCheckInDay && lastCheckInDay.getTime() === todayTimestamp) {
    return NextResponse.json({
      message: "You have already checked in today",
      credits: credits.credits,
    });
  }

  // Update credits and last_check_in
  const { error: updateError } = await supabase
    .from("credits")
    .update({
      credits: credits.credits + 1,
      last_check_in: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json(
      {
        message: "Failed to update credits",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Successfully checked in! You received 1 credit.",
    credits: credits.credits + 1,
  });
} 