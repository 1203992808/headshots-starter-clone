import React from 'react';
import Login from "@/app/login/page";
import { Icons } from "@/components/icons";
import ClientSideModel from "@/components/realtime/ClientSideModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import ExpirationTimer from "@/components/ExpirationTimer";
import { Database } from "@/types/supabase";
import { imageRow, modelRow, sampleRow } from "@/types/utils";

// Force dynamic rendering
export const dynamic = "force-dynamic";

interface ModelDetailProps {
  params: {
    id: string;
  };
}

export default async function ModelDetail({ params }: ModelDetailProps) {
  const supabase = createServerComponentClient<Database>({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <Login />;
  }

  const { data: model } = await supabase
    .from("models")
    .select("*")
    .eq("id", Number(params.id))
    .eq("user_id", user.id)
    .single();

  if (!model) {
    redirect("/overview");
  }

  const { data: images } = await supabase
    .from("images")
    .select("*")
    .eq("modelId", model.id);

  const { data: samples } = await supabase.from("samples").select("*").eq("modelId", model.id);

  // Calculate expiration time (20 minutes from creation)
  const expirationTime = new Date(new Date(model.created_at).getTime() + 20 * 60 * 1000);

  return (
    <div id="train-model-container" className="w-full h-full">
      <div className="flex flex-row gap-4">
        <Link href="/overview" className="text-xs w-fit">
          <Button variant="outline" className="text-xs" size="sm">
            <FaArrowLeft className="mr-2" />
            Go Back
          </Button>
        </Link>
        <div className="flex flex-row gap-2 align-middle text-center items-center pb-4">
          <h1 className="text-xl">{model.name}</h1>
          <div>
            <Badge
              variant={model.status === "finished" ? "default" : "secondary"}
              className="text-xs font-medium"
            >
              {model.status === "processing" ? "training" : model.status}
              {model.status === "processing" && (
                <Icons.spinner className="h-4 w-4 animate-spin ml-2 inline-block" />
              )}
            </Badge>
          </div>
        </div>
      </div>

      {model.status === "finished" && (
        <div className="mt-4 mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center gap-2 text-yellow-800">
            <Icons.alert className="h-5 w-5" />
            <p className="font-medium">Your generated images will be deleted in:</p>
            <ExpirationTimer expirationTime={expirationTime} />
          </div>
          <p className="mt-2 text-sm text-yellow-700">
            Please download your images before they expire. After expiration, you'll need to generate new images.
          </p>
        </div>
      )}

      <ClientSideModel samples={samples ?? []} serverModel={model} serverImages={images ?? []} />
    </div>
  );
} 