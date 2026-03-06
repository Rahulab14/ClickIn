"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import AuthSuccessModal from "@/components/ui/auth-success-modal";
import { useAuth } from "@/context/auth/AuthContext";

export default function LoginPage() {
    const { googleSignIn, facebookSignIn, appleSignIn } = useAuth();
    const [showSuccess, setShowSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSocialLogin = async (provider: string) => {
        setError("");
        setLoading(true);
        try {
            if (provider === "google") {
                await googleSignIn();
            } else if (provider === "facebook") {
                await facebookSignIn();
            } else if (provider === "apple") {
                await appleSignIn();
            }
            setShowSuccess(true);
        } catch (err: any) {
            setError(err.message || `Failed to sign in with ${provider}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-0 md:p-6 font-sans selection:bg-indigo-100">
            <div className="w-full max-w-md bg-white min-h-screen md:min-h-fit md:rounded-[2rem] md:shadow-2xl md:border border-gray-100 flex flex-col items-center px-6 py-4 sm:py-8 mx-auto relative">
                <AuthSuccessModal
                    show={showSuccess}
                    autoRedirect={true}
                    redirectPath="/"
                />

                {/* Header */}
                <header className="w-full flex items-center justify-start mb-6">
                    <Link href="/" className="p-2 -ml-2 rounded-full transition-all bg-white/30 backdrop-blur-md border border-gray-100 shadow-sm hover:shadow-md hover:bg-gray-50 active:scale-95">
                        <ArrowLeft className="w-6 h-6 sm:w-7 sm:h-7 text-gray-900" />
                    </Link>
                </header>

                {/* Illustration */}
                
             <div className="w-full flex justify-center mb-8 overflow-visible">
                <Image src="/owl.png" alt="Owl" width={200} height={200} />
                </div>

                {/* Title */}
                <h1 className="text-[28px] sm:text-[32px] font-bold text-center text-gray-900 mb-8 sm:mb-10 tracking-tight leading-tight">
                    Let's get you in
                </h1>

                {/* Error Message */}
                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

                {/* Social Buttons */}
                <div className="space-y-4 w-full mb-8">
                    {/* Facebook */}
                    <button
                        onClick={() => handleSocialLogin('facebook')}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-semibold py-3.5 sm:py-4 rounded-2xl hover:bg-gray-50 transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed text-[15px]"
                    >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Continue with Facebook
                    </button>

                    {/* Google */}
                    <button
                        onClick={() => handleSocialLogin('google')}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-semibold py-3.5 sm:py-4 rounded-2xl hover:bg-gray-50 transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed text-[15px]"
                    >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    {/* Apple */}
                    <button
                        onClick={() => handleSocialLogin('apple')}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-semibold py-3.5 sm:py-4 rounded-2xl hover:bg-gray-50 transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed text-[15px]"
                    >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-black" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.35-1.09-.56-2.09-.48-3.08.35-1.06.86-2.29.38-2.29.38-2.92-2.12-2.86-5.87-1.18-8.31 1.09-1.55 2.94-1.63 3.92-.61 1.05 1.05 2.45.64 3.33-.29 1.4-1.29 3.51-.78 3.51-.78 1.15.5 1.95 1.35 2.41 2.04-.04.04-1.89 1.16-1.81 3.5.08 2.37 2.13 3.16 2.13 3.16-.04.13-1.33 2.97-3.86 2.97zM14.65 6.64c-.66-1.07-.15-2.58.74-3.53.97-1.1 2.65-1.06 3.25-.09.68 1.02.26 2.65-.79 3.63-.9.84-2.58.98-3.2 0z" />
                        </svg>
                        Continue with Apple
                    </button>
                </div>

                {/* Divider */}
                <div className="w-full flex items-center gap-4 mb-8 px-2 opacity-80">
                    <div className="h-[1px] bg-gray-200 flex-1"></div>
                    <span className="text-gray-400 font-medium text-xs uppercase tracking-wider">or continue with email</span>
                    <div className="h-[1px] bg-gray-200 flex-1"></div>
                </div>

                {/* Main Action Button */}
                <Link href="/login" className="w-full flex items-center justify-center bg-[#16A34A] text-white font-bold py-4 rounded-full shadow-[0_8px_16px_rgba(22,163,74,0.2)] hover:bg-[#15803d] hover:shadow-[0_8px_20px_rgba(22,163,74,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all mb-8 text-[15px]">
                    Sign in with Email Id
                </Link>

                {/* Footer */}
                <div className="text-center mt-auto pb-4">
                    
                    <span className="text-gray-500 text-[13.5px]">Don&apos;t have an account? </span>
                    <Link href="/signup" className="text-[#16A34A] font-bold text-[13.5px] hover:text-[#15803d] transition-colors ml-1">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
}
