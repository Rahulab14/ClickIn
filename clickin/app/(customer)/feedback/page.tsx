"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth/AuthContext";
import { submitFeedback, getRecentEligibleOrders } from "@/lib/feedback-service";
import {
  ChevronLeft,
  Star,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Clock,
  ThumbsUp,
  Image as ImageIcon,
  Loader2,
  AlertTriangle,
  Heart
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const POSITIVE_TAGS = ["🚀 Fast App", "💎 Beautiful UI", "🎯 Easy to Use", "✨ Great Features", "🛡️ Secure"];
const NEGATIVE_TAGS = ["📱 App Bug", "🐌 Slow Loading", "😕 Hard to Use", "💸 Payment Glitch", "❌ Checkout Error", "Other"];

export default function FeedbackPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [likedFeatures, setLikedFeatures] = useState("");
  const [message, setMessage] = useState("");
  const [isSerious, setIsSerious] = useState(false);
  
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      getRecentEligibleOrders(user.uid, 5).then((orders) => {
        setRecentOrders(orders);
        if (orders.length > 0) {
          setSelectedOrderId(orders[0].id);
        }
      });
    }
  }, [user]);

  // Determine which tags to show based on rating intelligence
  const currentTags = rating === 0 ? [] : rating >= 4 ? POSITIVE_TAGS : NEGATIVE_TAGS;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!rating) return;
    if (!user) {
      alert("Please login to submit feedback");
      router.push("/signin");
      return;
    }

    setIsSubmitting(true);
    try {
      // Find the associated shop for the selected order context
      const linkedOrder = recentOrders.find(o => o.id === selectedOrderId);
      
      await submitFeedback({
        userId: user.uid,
        orderId: selectedOrderId || undefined,
        shopId: linkedOrder?.shopId || undefined,
        rating,
        tags: selectedTags,
        message,
        likedFeatures,
        isSerious: rating < 4 ? isSerious : false,
      });

      setIsSuccess(true);
    } catch (error) {
      console.error("Submission failed", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Confetti View
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <CheckCircle2 className="w-12 h-12 text-green-600 animate-bounce" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Thank You!</h1>
        <p className="text-gray-500 font-medium mb-8 max-w-[280px]">
          Your feedback helps us and our vendors improve your experience every day.
        </p>
        <Link href="/">
          <button className="bg-primary text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-primary/25 active:scale-95 transition-all">
            Back to Home
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 py-4 flex items-center shadow-sm">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="flex-1 text-center text-lg font-black tracking-tight text-gray-900 mr-10">
          Give Feedback
        </h1>
      </header>

      <main className="container max-w-lg mx-auto p-4 space-y-6">
        
        {/* Order Context Selector */}
        {recentOrders.length > 0 && (
          <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 animate-in slide-in-from-bottom-2">
            <h2 className="text-[13px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Related Order
            </h2>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl px-4 py-3.5 text-[15px] font-bold text-gray-800 outline-none transition-all appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
            >
              <option value="">General Application Feedback</option>
              {recentOrders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.id.slice(0, 8)} • {order.shopName || "Canteen"} • ₹{order.totalAmount}
                </option>
              ))}
            </select>
          </section>
        )}

        {/* Universal Rating Hero */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center animate-in slide-in-from-bottom-4">
          <h2 className="text-xl font-black text-gray-900 mb-6 tracking-tight">
            How was your experience?
          </h2>
          <div className="flex justify-center gap-2 sm:gap-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => { setRating(star); setSelectedTags([]); }}
                className="group relative transition-transform active:scale-75 duration-200"
              >
                <Star
                  className={cn(
                    "w-10 h-10 sm:w-12 sm:h-12 transition-all duration-300",
                    (hoverRating || rating) >= star
                      ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_2px_8px_rgba(250,204,21,0.4)] scale-110"
                      : "fill-gray-100 text-gray-200 group-hover:text-yellow-200"
                  )}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="mt-4 text-sm font-bold text-gray-400 animate-in fade-in">
              {rating === 5 ? "Absolutely Excellent! 🥳" : rating === 4 ? "Really Good! 😊" : rating === 3 ? "It was Okay 😐" : rating === 2 ? "Could be better 😕" : "Terrible Experience 😞"}
            </p>
          )}
        </section>

        {/* Smart Conditional UI */}
        {rating > 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
            
            {/* Quick Tags */}
            <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
              <h2 className="text-[13px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                {rating >= 4 ? <ThumbsUp className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {rating >= 4 ? "What do you like about the app?" : "What went wrong with the app?"}
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {currentTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        "px-4 py-2.5 rounded-xl text-[14px] font-bold transition-all duration-200 border-2 active:scale-95",
                        isSelected
                          ? rating >= 4 
                            ? "bg-green-50 border-green-500 text-green-700 shadow-sm"
                            : "bg-red-50 border-red-500 text-red-700 shadow-sm"
                          : "bg-white border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Exact Complaint Escalation */}
            {rating < 4 && selectedTags.length > 0 && (
              <section className="bg-red-50/50 rounded-3xl p-5 border border-red-100 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-gray-900">Serious Issue?</h4>
                      <p className="text-[12px] font-semibold text-gray-500">Flag for urgent admin review</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsSerious(!isSerious)}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-colors duration-300",
                      isSerious ? "bg-red-500" : "bg-gray-300"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300",
                      isSerious ? "translate-x-7" : "translate-x-1"
                    )} />
                  </button>
                </div>
              </section>
            )}
             <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
              <h2 className="text-[13px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4" /> Like Features
              </h2>
              <textarea
                value={likedFeatures}
                onChange={(e) => setLikedFeatures(e.target.value)}
                placeholder={
  rating >= 5
    ? "What did you love the most about Clickin? Any favorite features?"
    : rating === 4
    ? "What features did you like? How can we make Clickin even better?"
    : rating === 3
    ? "What was good, and what could be improved in your experience?"
    : rating === 2
    ? "What issues did you face? What didn’t work well for you?"
    : "Please tell us what went wrong. Your feedback helps us improve."
}
                className="w-full h-32 bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl p-4 text-[15px] font-medium text-gray-800 placeholder:text-gray-400 outline-none transition-all resize-none"
              />
              
              {/* Optional Appended Upload */}
             
            </section>
            {/* Detailed Text Area */}
            <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
              <h2 className="text-[13px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Detailed Feedback
              </h2>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={rating >= 4 ? "How can we make Clickin even better? Tell us!" : "Please explain the app issue in detail..."}
                className="w-full h-32 bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl p-4 text-[15px] font-medium text-gray-800 placeholder:text-gray-400 outline-none transition-all resize-none"
              />
              
              {/* Optional Appended Upload */}
             
            </section>
            
          </div>
        )}
      </main>

      {/* Fixed Bottom Submit Button */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-100 transition-transform duration-500",
        rating > 0 ? "translate-y-0" : "translate-y-full"
      )}>
        <div className="container max-w-lg mx-auto">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className="w-full bg-gray-900 text-white font-bold text-[16px] py-4 rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
            ) : (
              "Submit Feedback"
            )}
          </button>
        </div>
      </div>
      
    </div>
  );
}
