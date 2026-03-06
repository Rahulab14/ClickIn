"use client";

import { Button } from "@/components/ui/Button";
import { ArrowRight, Menu, QrCode, Wallet, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const SLIDES = [
  {
    id: 1,
    title: "Check the Menu",
    subtitle: "Browse Before You Order",
    description: "View live menus, prices & availability instantly",
    gradient: "from-emerald-900/95 via-emerald-900/80 to-transparent",
    imageColor: "bg-emerald-500",
    imageUrl:
      "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&q=80&w=400",
    icon: <Menu className="h-10 w-10 md:h-14 md:w-14 text-emerald-100" />,
    badgeText: "Updated Daily",
    badgeLabel: "Live Menu",
  },
  {
    id: 2,
    title: "Pay Online",
    subtitle: "UPI • Fast & Secure",
    description: "Pay using GPay, PhonePe or Paytm",
    gradient: "from-blue-900/95 via-blue-900/80 to-transparent",
    imageColor: "bg-blue-500",
    imageUrl:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=2000",
    icon: <Wallet className="h-10 w-10 md:h-14 md:w-14 text-blue-100" />,
    badgeText: "Zero Cash",
    badgeLabel: "Instant Payment",
  },
  {
    id: 3,
    title: "Grab & Go",
    subtitle: "No Waiting, No Tokens",
    description: "Show QR or Order ID and collect food",
    gradient: "from-amber-900/95 via-amber-900/80 to-transparent",
    imageColor: "bg-amber-500",
    imageUrl:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=2000",
    icon: <QrCode className="h-10 w-10 md:h-14 md:w-14 text-amber-100" />,
    badgeText: "Order Ready",
    badgeLabel: "Collect & Go",
  },
];

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="px-4 pt-4 md:px-6 lg:px-8 w-full max-w-7xl mx-auto font-sans">
      <div className="relative w-full overflow-hidden rounded-[2rem] md:rounded-[3rem] shadow-2xl ring-1 ring-gray-900/5 group bg-gray-900">
        <div
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] h-[320px] md:h-[400px] lg:h-[480px]"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              className="w-full h-full flex-shrink-0 relative overflow-hidden"
            >
              {/* Background Image with Zoom Effect - using native CSS for performance */}
              <div
                className={cn(
                  "absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-[10000ms] ease-out",
                  currentSlide === idx ? "scale-110" : "scale-100",
                )}
                style={{ backgroundImage: `url(${slide.imageUrl})` }}
              />

              {/* Gradient Overlay */}
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-r to-black/20",
                  slide.gradient,
                )}
              />

              {/* Content Grid */}
              <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-12 p-6 md:p-12 lg:p-16 z-10 h-full">
                <div className="col-span-1 md:col-span-7 flex flex-col justify-center gap-4 md:gap-7 relative">
                  <div className="space-y-3">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={
                        currentSlide === idx
                          ? { opacity: 1, x: 0 }
                          : { opacity: 0, x: -20 }
                      }
                      transition={{
                        delay: 0.1,
                        duration: 0.5,
                        ease: "easeOut",
                      }}
                      className="flex items-center gap-2"
                    >
                      {/* <Sparkles className="w-4 h-4 text-emerald-300 drop-shadow-[0_0_8px_rgba(110,231,183,0.8)]" /> */}
                      <img src="/logo.png" alt="Logo" className="w-4 h-4" />
                      <p className="text-[10px] md:text-sm lg:text-base font-black text-white tracking-[0.25em] uppercase drop-shadow-md">
                        {slide.subtitle}
                      </p>
                    </motion.div>

                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={
                        currentSlide === idx
                          ? { opacity: 1, y: 0 }
                          : { opacity: 0, y: 20 }
                      }
                      transition={{
                        delay: 0.2,
                        duration: 0.6,
                        ease: "easeOut",
                      }}
                      className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-white drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] block"
                    >
                      {slide.title}
                    </motion.h2>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={
                        currentSlide === idx
                          ? { opacity: 1, y: 0 }
                          : { opacity: 0, y: 20 }
                      }
                      transition={{
                        delay: 0.3,
                        duration: 0.6,
                        ease: "easeOut",
                      }}
                      className="text-sm md:text-lg lg:text-xl font-medium text-white/90 max-w-[280px] md:max-w-md drop-shadow-lg leading-relaxed"
                    >
                      {slide.description}
                    </motion.p>
                  </div>

                  {/* Professional Card Component */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={
                      currentSlide === idx
                        ? { opacity: 1, y: 0 }
                        : { opacity: 0, y: 20 }
                    }
                    transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                    className="mt-2 md:mt-4 group/card cursor-pointer"
                  >
                    <div className="relative overflow-hidden bg-white/10 hover:bg-white/20 backdrop-blur-2xl rounded-2xl md:rounded-3xl p-4 md:p-5 w-fit shadow-[0_15px_40px_-10px_rgba(0,0,0,0.6)] border border-white/20 ring-1 ring-white/10 transition-all duration-300">
                      {/* Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] group-hover/card:translate-x-[150%] transition-transform duration-1000 ease-in-out" />

                      <div className="relative flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-6">
                          <span className="font-bold text-[10px] md:text-xs text-white/70 uppercase tracking-[0.15em]">
                            {slide.badgeLabel}
                          </span>
                        </div>
                        <div className="font-black text-xl md:text-3xl lg:text-4xl text-white drop-shadow-xl mt-1 tracking-tight">
                          {slide.badgeText}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Floating Icon / Decor */}
                <div className="hidden md:flex col-span-5 items-center justify-end relative">
                  <motion.div
                    animate={
                      currentSlide === idx
                        ? {
                            y: [0, -15, 0],
                            rotate: [0, 5, -5, 0],
                          }
                        : {}
                    }
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className={cn(
                      "w-48 h-48 lg:w-64 lg:h-64 rounded-full flex items-center justify-center relative overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] ring-8 ring-white/10 backdrop-blur-xl border border-white/20",
                      slide.imageColor,
                    )}
                  >
                    {slide.icon}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent mix-blend-overlay" />
                  </motion.div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Left/Right Controls (Dots) */}
        <div className="absolute bottom-6 left-6 md:left-12 flex gap-2 z-20">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500 shadow-[0_2px_4px_rgba(0,0,0,0.2)]",
                currentSlide === idx
                  ? "w-8 bg-white"
                  : "w-1.5 bg-white/40 hover:bg-white/70",
              )}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
