"use client";
import { Button } from "@/components/ui/button";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaImages, FaBroom } from "react-icons/fa";
import ModelsTable from "../ModelsTable.jsx";

// Force dynamic rendering to avoid cookies error
export const dynamic = "force-dynamic";

const packsIsEnabled = process.env.NEXT_PUBLIC_TUNE_TYPE === "packs";

export const revalidate = 0;

export default function ClientSideModelsList({ serverModels }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const [models, setModels] = useState(serverModels);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 获取当前用户信息
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    fetchUser();
    
    const channel = supabase
      .channel("realtime-models")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "models" },
        async (payload) => {
          const samples = await supabase
            .from("samples")
            .select("*")
            .eq("modelId", payload.new.id);

          const newModel = {
            ...payload.new,
            samples: samples.data,
          };

          const dedupedModels = models.filter(
            (model) => model.id !== payload.old?.id
          );

          setModels([...dedupedModels, newModel]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, models, setModels]);
  
  // Function to clean all expired models across all users
  const handleCleanAllExpiredModels = async () => {
    try {
      setIsLoading(true);
      setMessage(null);
      
      const response = await fetch("/api/cleanup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: "success", text: data.message || "清理完成！所有过期模型已被删除。" });
      } else {
        setMessage({ type: "error", text: data.error || "清理失败，请重试。" });
      }
    } catch (error) {
      console.error("清理错误:", error);
      setMessage({ type: "error", text: "发生错误，请重试。" });
    } finally {
      setIsLoading(false);
    }
  };

  // 检查当前用户是否是指定的管理员账户
  const isAdminUser = user && user.email === "1203992808@qq.com";

  return (
    <div id="train-model-container" className="w-full">
      {models && models.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-4 w-full justify-between items-center text-center">
            <h1>Your models</h1>
            <div className="flex gap-2">
              {isAdminUser && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCleanAllExpiredModels} 
                  disabled={isLoading}
                  className="flex items-center gap-1 bg-amber-50 hover:bg-amber-100 border-amber-200"
                >
                  <FaBroom className="w-3 h-3" />
                  {isLoading ? "清理中..." : "清理所有过期模型"}
                </Button>
              )}
              
              <Link href={packsIsEnabled ? "/overview/packs" : "/overview/models/train/raw-tune"} className="w-fit">
                <Button size="sm">
                  Train model
                </Button>
              </Link>
            </div>
          </div>
          
          {message && (
            <div className={`p-3 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {message.text}
            </div>
          )}
          
          <ModelsTable models={models} />
        </div>
      )}
      {models && models.length === 0 && (
        <div className="flex flex-col gap-4 items-center">
          <FaImages size={64} className="text-gray-500" />
          <h1 className="text-2xl">
            Get started by training your first model.
          </h1>
          <div>
            <Link href={packsIsEnabled ? "/overview/packs" : "/overview/models/train/raw-tune"}>
              <Button size="lg">Train model</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 