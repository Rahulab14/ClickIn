"use client";

import Image from "next/image";
import { ShieldCheck } from "lucide-react";

interface PremiumLoaderProps {
  message?: string;
}

export function PremiumLoader({
  message = "Securely loading...",
}: PremiumLoaderProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center font-sans overflow-hidden relative">
      {/* Background Decorative Ripples */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full animate-ripple" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full animate-ripple [animation-delay:0.5s]" />

      <div className="relative z-10 flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-700">
        {/* Animated Logo Container */}
        <div className="relative group">
          <div className="absolute -inset-4 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-all duration-500 animate-pulse" />
          <div className="relative w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center border border-gray-100 animate-float p-4">
            <Image
              src="/logo.png"
              alt="ClickIn"
              width={64}
              height={64}
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Loading Text & Progress */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <h2 className="text-xl font-black text-gray-900 tracking-tight">
              ClickIn
            </h2>
            <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary/10 rounded-full overflow-hidden">
              <div
                className="h-full w-1/2 bg-primary animate-[shimmer_1.5s_infinite_linear]"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, var(--primary), transparent)",
                  backgroundSize: "200% 100%",
                }}
              />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            {message}
          </p>
        </div>
      </div>

      {/* Bottom Security Badge */}
      <div className="absolute bottom-12 flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100 animate-in slide-in-from-bottom-4 duration-1000">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Secure Platform
        </span>
      </div>
    </div>
  );
}
