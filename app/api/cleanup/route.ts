import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase credentials");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Support both GET and POST methods for easier testing
export async function GET(request: Request) {
  return handleCleanup(request);
}

export async function POST(request: Request) {
  return handleCleanup(request);
}

async function handleCleanup(request: Request) {
  try {
    // Get current authenticated user
    const supabaseAuth = createServerComponentClient({ cookies });
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();
    
    // Only allow authenticated users
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // 只允许特定的管理员用户使用清理功能
    if (user.email !== "1203992808@qq.com") {
      return NextResponse.json({ error: "Forbidden. Only admin can perform this operation." }, { status: 403 });
    }
    
    // Get all models that are older than 20 minutes and have status "finished"
    const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000).toISOString();
    
    const { data: expiredModels, error: modelsError } = await supabase
      .from("models")
      .select("id")
      .lt("created_at", twentyMinutesAgo)
      .eq("status", "finished");

    if (modelsError) {
      console.error("Error fetching expired models:", modelsError);
      return NextResponse.json({ error: "Failed to fetch expired models" }, { status: 500 });
    }

    if (!expiredModels || expiredModels.length === 0) {
      return NextResponse.json({ message: "No expired models found" });
    }

    const modelIds = expiredModels.map(model => model.id);

    // Delete associated images
    const { error: imagesError } = await supabase
      .from("images")
      .delete()
      .in("modelId", modelIds);

    if (imagesError) {
      console.error("Error deleting images:", imagesError);
      return NextResponse.json({ error: "Failed to delete images" }, { status: 500 });
    }

    // Delete associated samples
    const { error: samplesError } = await supabase
      .from("samples")
      .delete()
      .in("modelId", modelIds);

    if (samplesError) {
      console.error("Error deleting samples:", samplesError);
      return NextResponse.json({ error: "Failed to delete samples" }, { status: 500 });
    }

    // Delete the models
    const { error: modelsDeleteError } = await supabase
      .from("models")
      .delete()
      .in("id", modelIds);

    if (modelsDeleteError) {
      console.error("Error deleting models:", modelsDeleteError);
      return NextResponse.json({ error: "Failed to delete models" }, { status: 500 });
    }

    return NextResponse.json({ 
      message: `成功清理了 ${modelIds.length} 个过期模型及其关联的图片` 
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 