"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";

interface AuthSuccessModalProps {
    show: boolean;
    autoRedirect?: boolean;
    redirectPath?: string;
    showHomeButton?: boolean;
    onRedirect?: () => void;
}

export default function AuthSuccessModal({
    show,
    autoRedirect = true,
    redirectPath = "/",
    showHomeButton = false,
    onRedirect,
}: AuthSuccessModalProps) {
    const router = useRouter();

    useEffect(() => {
        if (show && autoRedirect) {
            const timer = setTimeout(() => {
                if (onRedirect) {
                    onRedirect();
                } else {
                    // Use window.location.href for a reliable full-page redirect
                    window.location.href = redirectPath;
                }
            }, 1500); // Delay so user can see success confirmation

            return () => clearTimeout(timer);
        }
    }, [show, autoRedirect, redirectPath, onRedirect, router]);

    const handleHomeClick = () => {
        if (onRedirect) {
            onRedirect();
        } else {
            router.push(redirectPath);
        }
    };

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 font-sans">
                    {/* Backdrop with Blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 30 }}
                        transition={{ type: "spring", stiffness: 320, damping: 28 }}
                        className="relative bg-white w-full max-w-[340px] rounded-[38px] p-10 flex flex-col items-center text-center shadow-2xl z-10 overflow-hidden"
                    >
                        {/* Decorative Confetti Dots - Top Left */}
                        <motion.div
                            animate={{ y: [0, -8, 0], scale: [1, 1.1, 1], opacity: [0.6, 0.8, 0.6] }}
                            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.2 }}
                            className="absolute top-16 left-12 w-3 h-3 bg-[#16A34A] rounded-full opacity-60"
                        />
                        <motion.div
                            animate={{ y: [0, 6, 0], scale: [1, 0.9, 1] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.5 }}
                            className="absolute top-24 left-6 w-2 h-2 bg-[#16A34A] rounded-full opacity-40"
                        />
                        <motion.div
                            animate={{ scale: [0, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 1 }}
                            className="absolute top-10 left-20 w-1.5 h-1.5 bg-[#4ADE80] rounded-full opacity-50"
                        />

                        {/* Decorative Confetti Dots - Top Right */}
                        <motion.div
                            animate={{ y: [0, -6, 0], opacity: [0.4, 0.7, 0.4] }}
                            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut", delay: 0.1 }}
                            className="absolute top-12 right-12 w-4 h-4 bg-[#16A34A] rounded-full opacity-40"
                        />
                        <motion.div
                            animate={{ y: [0, 5, 0], scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut", delay: 0.7 }}
                            className="absolute top-24 right-8 w-2.5 h-2.5 bg-[#16A34A] rounded-full opacity-70"
                        />
                        <motion.div
                            animate={{ scale: [0, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 1.5 }}
                            className="absolute top-8 right-24 w-2 h-2 bg-[#4ADE80] rounded-full opacity-50"
                        />

                        {/* Success Icon Circle */}
                        <div className="relative mb-8 mt-2">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                                className="w-28 h-28 bg-[#16A34A] rounded-full flex items-center justify-center shadow-lg shadow-green-500/30"
                            >
                                <User className="w-14 h-14 text-white fill-current" strokeWidth={2.5} />
                            </motion.div>

                            {/* Orbiting / pulsating particles around icon */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                                className="absolute inset-0 -m-2 opacity-50"
                            >
                                <div className="absolute top-0 left-1/2 w-2 h-2 bg-[#4ADE80] rounded-full -translate-x-1/2" />
                            </motion.div>
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                                className="absolute inset-0 -m-5 opacity-30"
                            >
                                <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-[#16A34A] rounded-full -translate-x-1/2" />
                            </motion.div>
                        </div>

                        {/* Text Content */}
                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-[#16A34A] text-[26px] font-bold mb-3 tracking-tight"
                        >
                            Congratulations!
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-gray-500 text-[15px] leading-relaxed font-medium px-2 mb-10"
                        >
                            Your account is ready to use. Redirecting you to the Home page..
                        </motion.p>

                        {/* Loader - Dot Spinner */}
                        <div className="relative h-12 w-12 flex items-center justify-center">
                            {[...Array(12)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-2.5 h-2.5 bg-[#16A34A] rounded-full"
                                    style={{
                                        top: "50%",
                                        left: "50%",
                                        transform: `rotate(${i * 30}deg) translate(0, -18px)`, // Adjusted translate for circle size
                                    }}
                                    animate={{ opacity: [0.2, 1, 0.2] }}
                                    transition={{
                                        duration: 1.2,
                                        repeat: Infinity,
                                        delay: -1.2 + i * 0.1, // Stagger delays for wave effect
                                        ease: "easeInOut",
                                    }}
                                />
                            ))}
                        </div>

                        {/* Optional Home Button */}
                        {showHomeButton && (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                onClick={handleHomeClick}
                                className="mt-8 text-[#16A34A] font-bold text-sm hover:underline focus:outline-none transition-colors"
                            >
                                Go to Home
                            </motion.button>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
