import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import hero from "/public/hero.png";

import { Button } from "@/components/ui/button";
import ExplainerSection from "@/components/ExplainerSection";
import PricingSection from "@/components/PricingSection";

export const dynamic = "force-dynamic";

export default async function Index() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return redirect("/overview");
  }

  return (
    <div className="flex flex-col items-center pt-20">
      <div className="flex flex-col lg:flex-row-reverse items-center gap-10 p-10 max-w-6xl w-full">
        <div className="flex flex-col space-y-5 lg:w-1/2 w-full">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Transform Your Digital Identity with AI Portraits
          </h1>
          <p className="text-slate-700 text-lg leading-relaxed">
            Create stunning, studio-quality portraits powered by cutting-edge AI technology. Perfect for your LinkedIn, resume, company website, or any professional platform.
          </p>
          <div className="flex flex-col space-y-3">
            <Link href="/login">
              <Button className="w-full lg:w-3/5 rounded-xl py-6 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 transition-all duration-300 shadow-lg">Start Your Portrait Journey</Button>
            </Link>
            <p className="text-sm text-slate-500 italic">
              Join thousands of satisfied professionals. No photography skills required.
            </p>
          </div>
          <div className="mt-5 text-slate-600">
            <span>Returning user? </span>
            <Link className="text-blue-600 hover:text-blue-800 font-medium hover:underline" href="/login">
              Access Your Account
            </Link>
          </div>
        </div>
        <div className="lg:w-1/2 w-full mt-8 lg:mt-0">
          <img
            src={hero.src}
            alt="Premium AI Portrait Showcase"
            className="rounded-2xl object-cover w-full h-full shadow-2xl transform hover:scale-[1.02] transition-all duration-500"
          />
        </div>
      </div>
      <ExplainerSection />
      <PricingSection />
    </div>
  );
}
