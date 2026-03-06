"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, CheckCircle2, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface RatingModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (rating: number) => Promise<void>
    shopName: string
}

export function RatingModal({ isOpen, onClose, onSubmit, shopName }: RatingModalProps) {
    const [rating, setRating] = useState(0)
    const [hover, setHover] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleSubmit = async () => {
        if (rating === 0) return
        setIsSubmitting(true)
        try {
            await onSubmit(rating)
            setIsSuccess(true)
            setTimeout(() => {
                onClose()
            }, 2000)
        } catch (error) {
            console.error("Rating submission failed:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={isSuccess ? undefined : onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden"
                    >
                        {/* Status Bar */}
                        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-teal-500" />

                        {!isSuccess ? (
                            <div className="p-8 text-center pt-10">
                                {/* Close Button */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                                <div className="mb-6">
                                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
                                        <Star className="h-8 w-8 text-emerald-500 fill-emerald-500" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">Rate your meal</h3>
                                    <p className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-widest leading-relaxed">
                                        How was your experience at <span className="text-gray-900">{shopName}</span>?
                                    </p>
                                </div>

                                {/* Star Selector */}
                                <div className="flex items-center justify-center gap-2.5 mb-10">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onMouseEnter={() => setHover(star)}
                                            onMouseLeave={() => setHover(0)}
                                            onClick={() => setRating(star)}
                                            className="p-1 transition-all hover:scale-125 hover:-translate-y-1 active:scale-95 duration-200"
                                        >
                                            <Star
                                                className={cn(
                                                    "h-12 w-12 transition-all duration-300",
                                                    (hover || rating) >= star
                                                        ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                                                        : "text-gray-100"
                                                )}
                                            />
                                        </button>
                                    ))}
                                </div>

                                <button
                                    disabled={rating === 0 || isSubmitting}
                                    onClick={handleSubmit}
                                    className={cn(
                                        "w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all transform flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/10",
                                        rating > 0
                                            ? "bg-gray-900 text-white hover:bg-black active:scale-[0.98] cursor-pointer"
                                            : "bg-gray-100 text-gray-300 cursor-not-allowed"
                                    )}
                                >
                                    {isSubmitting ? (
                                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        "Submit Rating"
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="p-12 text-center flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 12 }}
                                    className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/30"
                                >
                                    <CheckCircle2 className="h-10 w-10 text-white" />
                                </motion.div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">Thank You!</h3>
                                <p className="text-sm font-bold text-gray-400 mt-3 tracking-wide leading-relaxed">
                                    Your rating helps us improve <br />the community experience.
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
