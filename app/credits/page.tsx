import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ClientSideCredits from "@/components/realtime/ClientSideCredits";

export const dynamic = "force-dynamic";

export default async function CreditsPage() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const { data: credits } = await supabase
    .from("credits")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const isSpecialUser = user.email === "1203992808@qq.com";

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Credits</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-semibold mb-2">Current Balance</h2>
            <ClientSideCredits creditsRow={credits ? credits : null} />
          </div>
          
          <div className="flex flex-col gap-2">
            <Link href="/overview">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
        
        <div className="mt-6 border-t pt-4">
          <h3 className="text-lg font-semibold mb-3">How Credits Work</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>New users receive 3 credits when they join</li>
            <li>Each image generation costs 3 credits</li>
            <li>You can check in once per day to receive 1 credit</li>
            {isSpecialUser && (
              <li className="text-blue-600 font-medium">As a special user, your account always maintains 10,000 credits</li>
            )}
          </ul>
        </div>
      </div>
      
      {!isSpecialUser && credits && credits.credits < 3 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 mb-2">
            <strong>Note:</strong> You need at least 3 credits to generate an image.
          </p>
          <p className="text-yellow-700">
            Remember to check in daily to accumulate more credits!
          </p>
        </div>
      )}
    </div>
  );
} 