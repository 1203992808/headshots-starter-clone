import { Database } from "@/types/supabase";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import axios from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const astriaApiKey = process.env.ASTRIA_API_KEY;
const astriaTestModeIsOn = process.env.ASTRIA_TEST_MODE === "true";
const packsIsEnabled = process.env.NEXT_PUBLIC_TUNE_TYPE === "packs";
// For local development, recommend using an Ngrok tunnel for the domain

const appWebhookSecret = process.env.APP_WEBHOOK_SECRET;
const stripeIsConfigured = false; // 强制设置为 false，禁用 Stripe 检查

if (!appWebhookSecret) {
  throw new Error("MISSING APP_WEBHOOK_SECRET!");
}

export async function POST(request: Request) {
  const payload = await request.json();
  const images = payload.urls;
  const type = payload.type;
  const pack = payload.pack;
  const name = payload.name;

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

  if (!astriaApiKey) {
    return NextResponse.json(
      {
        message:
          "Missing API Key: Add your Astria API Key to generate headshots",
      },
      {
        status: 500,
      }
    );
  }

  if (images?.length < 4) {
    return NextResponse.json(
      {
        message: "Upload at least 4 sample images",
      },
      { status: 500 }
    );
  }
  
  // Special case for the specific email
  if (user.email === "1203992808@qq.com") {
    // Get or create credits for this special user
    const { data: specialCredits, error: specialCreditError } = await supabase
      .from("credits")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (specialCreditError) {
      // Create credits record with 10000 credits
      await supabase
        .from("credits")
        .insert({
          user_id: user.id,
          credits: 10000,
        });
    } else if (specialCredits.credits !== 10000) {
      // Ensure credits are always 10000
      await supabase
        .from("credits")
        .update({
          credits: 10000,
        })
        .eq("user_id", user.id);
    }
  } else {
    // For regular users, check credits and deduct them
    const { data: credits, error: creditError } = await supabase
      .from("credits")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (creditError) {
      // Create credits for new user with 3 initial credits, but they need more to generate an image
      await supabase
        .from("credits")
        .insert({
          user_id: user.id,
          credits: 3,
        });

      return NextResponse.json(
        {
          message: "You need 3 credits to generate an image. Please check in daily to accumulate credits.",
        },
        { status: 400 }
      );
    }

    // Check if user has enough credits (3 required)
    if (credits.credits < 3) {
      return NextResponse.json(
        {
          message: `Not enough credits. You have ${credits.credits} credits, but need 3 to generate an image. Please check in daily to accumulate more credits.`,
        },
        { status: 400 }
      );
    }

    // Deduct 3 credits for image generation
    await supabase
      .from("credits")
      .update({
        credits: credits.credits - 3,
      })
      .eq("user_id", user.id);
  }

  // create a model row in supabase
  const { error: modelError, data } = await supabase
    .from("models")
    .insert({
      user_id: user.id,
      name,
      type,
    })
    .select("id")
    .single();

  if (modelError) {
    console.error("modelError: ", modelError);
    return NextResponse.json(
      {
        message: "Something went wrong!",
      },
      { status: 500 }
    );
  }
  
  // Get the modelId from the created model
  const modelId = data?.id;

  try {

    const trainWebhook = `https://headshots-starter-clone-sigma-blond.vercel.app/astria/train-webhook`;
    const trainWebhookWithParams = `${trainWebhook}?user_id=${user.id}&model_id=${modelId}&webhook_secret=${appWebhookSecret}`;

    const promptWebhook = `https://headshots-starter-clone-sigma-blond.vercel.app/astria/prompt-webhook`;
    const promptWebhookWithParams = `${promptWebhook}?user_id=${user.id}&&model_id=${modelId}&webhook_secret=${appWebhookSecret}`;

    const API_KEY = astriaApiKey;
    const DOMAIN = "https://api.astria.ai";

    // Create a fine tuned model using Astria tune API
    const tuneBody = {
      tune: {
        title: name,
        // Hard coded tune id of Realistic Vision v5.1 from the gallery - https://www.astria.ai/gallery/tunes
        // https://www.astria.ai/gallery/tunes/690204/prompts
        base_tune_id: 690204,
        name: type,
        branch: astriaTestModeIsOn ? "fast" : "sd15",
        token: "ohwx",
        image_urls: images,
        callback: trainWebhookWithParams,
        prompts_attributes: [
          {
            text: `portrait of ohwx ${type} wearing a business suit, professional photo, white background, Amazing Details, Best Quality, Masterpiece, dramatic lighting highly detailed, analog photo, overglaze, 80mm Sigma f/1.4 or any ZEISS lens`,
            callback: promptWebhookWithParams,
            num_images: 8,
          },
          {
            text: `8k close up linkedin profile picture of ohwx ${type}, professional jack suite, professional headshots, photo-realistic, 4k, high-resolution image, workplace settings, upper body, modern outfit, professional suit, business, blurred background, glass building, office window`,
            callback: promptWebhookWithParams,
            num_images: 8,
          },
        ],
      },
    };

    // Create a fine tuned model using Astria packs API
    const packBody = {
      tune: {
        title: name,
        name: type,
        callback: trainWebhookWithParams,
        prompt_attributes: {
          callback: promptWebhookWithParams,
        },
        image_urls: images,
      },
    };

    const response = await axios.post(
      DOMAIN + (packsIsEnabled ? `/p/${pack}/tunes` : "/tunes"),
      packsIsEnabled ? packBody : tuneBody,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    const { status } = response;

    if (status !== 201) {
      console.error({ status });
      // Rollback: Delete the created model if something goes wrong
      if (modelId) {
        await supabase.from("models").delete().eq("id", modelId);
      }

      if (status === 400) {
        return NextResponse.json(
          {
            message: "webhookUrl must be a URL address",
          },
          { status }
        );
      }
      if (status === 402) {
        return NextResponse.json(
          {
            message: "Training models is only available on paid plans.",
          },
          { status }
        );
      }
    }

    const { error: samplesError } = await supabase.from("samples").insert(
      images.map((sample: string) => ({
        modelId: modelId,
        uri: sample,
      }))
    );

    if (samplesError) {
      console.error("samplesError: ", samplesError);
      return NextResponse.json(
        {
          message: "Something went wrong!",
        },
        { status: 500 }
      );
    }
  } catch (e) {
    console.error(e);
    // Rollback: Delete the created model if something goes wrong
    if (modelId) {
      await supabase.from("models").delete().eq("id", modelId);
    }
    return NextResponse.json(
      {
        message: "Something went wrong!",
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      message: "success",
    },
    { status: 200 }
  );
}
