import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CheckInButton from "@/components/CheckInButton";
import Link from "next/link";
import { FaCoins, FaImage, FaCalendarCheck } from 'react-icons/fa';

export default async function CreditsPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

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

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="w-full max-w-3xl">
        <h1 className="text-4xl font-bold mb-12 text-center text-gray-800">Your Credits</h1>
        
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 transform transition hover:shadow-xl">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Current Balance</h2>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <FaCoins className="text-yellow-500 text-3xl mr-3" />
              <span className="text-4xl font-bold text-gray-800">Credits: {credits?.credits || 0}</span>
            </div>
            <CheckInButton className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition transform hover:scale-105" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">How Credits Work</h2>
          <div className="space-y-6">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <FaCoins className="text-yellow-500 text-2xl mr-4" />
              <p className="text-lg text-gray-700">New users receive 3 credits when they join</p>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <FaImage className="text-blue-500 text-2xl mr-4" />
              <p className="text-lg text-gray-700">Each image generation costs 3 credits</p>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <FaCalendarCheck className="text-green-500 text-2xl mr-4" />
              <p className="text-lg text-gray-700">You can check in once per day to receive 1 credit</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-yellow-800 mb-2">Note:</h3>
          <p className="text-yellow-700 mb-2">You need at least 3 credits to generate an image.</p>
          <p className="text-yellow-700">Remember to check in daily to accumulate more credits!</p>
        </div>

        <div className="text-center">
          <Link 
            href="/" 
            className="inline-block bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-8 rounded-lg transition transform hover:scale-105"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 