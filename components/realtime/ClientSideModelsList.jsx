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
        <div className="flex flex-col gap-5">
          <div className="flex flex-row gap-4 w-full justify-between items-center text-center">
            <h1 className="text-2xl font-bold text-slate-800">Your Portrait Collection</h1>
            <div className="flex gap-3">
              {isAdminUser && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCleanAllExpiredModels} 
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700 px-4 py-2 rounded-xl transition-all duration-300"
                >
                  <FaBroom className="w-3 h-3" />
                  {isLoading ? "Processing..." : "Remove Expired Models"}
                </Button>
              )}
              
              <Link href={packsIsEnabled ? "/overview/packs" : "/overview/models/train/raw-tune"} className="w-fit">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 px-4 py-2 rounded-xl transition-all duration-300 shadow-md">
                  Create New Portrait
                </Button>
              </Link>
            </div>
          </div>
          
          {message && (
            <div className={`p-4 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {message.text}
            </div>
          )}
          
          <ModelsTable models={models} />
        </div>
      )}
      {models && models.length === 0 && (
        <div className="flex flex-col gap-6 items-center py-12 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl shadow-sm mt-4">
          <FaImages size={72} className="text-blue-500 opacity-80" />
          <h1 className="text-2xl font-bold text-slate-700">
            Begin your portrait journey today
          </h1>
          <p className="text-slate-600 max-w-md text-center">
            Create your first personalized AI portrait collection with our advanced technology.
          </p>
          <div className="mt-4">
            <Link href={packsIsEnabled ? "/overview/packs" : "/overview/models/train/raw-tune"}>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 px-8 py-6 rounded-xl text-lg font-medium transition-all duration-300 shadow-lg">
                Create Your First Portrait
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 