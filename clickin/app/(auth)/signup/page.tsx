"use client";

import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthSuccessModal from "@/components/ui/auth-success-modal";
import { useAuth } from "@/context/auth/AuthContext";

export default function SignupPage() {
    const router = useRouter();
    const { signup, googleSignIn, facebookSignIn, appleSignIn } = useAuth();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Validation logic
    const isMatch = password && confirmPassword && password === confirmPassword;
    const isMismatch = password && confirmPassword && password !== confirmPassword;

    // Updated Green Color: #16A34A (Darker Green) based on user request
    const primaryGreen = "text-[#16A34A]";
    const primaryBgGreen = "bg-[#16A34A]";
    const primaryBorderGreen = "border-[#16A34A]";
    const hoverBgGreen = "hover:bg-[#15803d]"; // Slightly darker for hover

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        try {
            setLoading(true);
            await signup(email, password, fullName);
            setShowSuccess(true);
            // Fallback redirect in case the modal redirect fails
            setTimeout(() => {
                router.push("/");
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Failed to sign up");
        } finally {
            setLoading(false);
        }
    };

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
            <div className="w-full max-w-md bg-white min-h-screen md:min-h-fit md:rounded-[2rem] md:shadow-2xl md:border border-gray-100 flex flex-col px-6 py-6 sm:py-8 mx-auto relative">
                <AuthSuccessModal
                    show={showSuccess}
                    autoRedirect={true}
                    redirectPath="/"
                />

                {/* Header */}
                <header className="w-full flex items-center justify-start mb-6">
                    <Link href="/signin" className="p-2 -ml-2 rounded-full transition-all bg-white/30 backdrop-blur-md border border-gray-100 shadow-sm hover:shadow-md hover:bg-white/50">
                        <ArrowLeft className="w-7 h-7 text-gray-900" />
                    </Link>
                </header>

                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <div className="relative w-28 h-28">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            width={120}
                            height={120}
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-[28px] font-bold text-center text-gray-900 mb-8 tracking-tight">
                    Create New Account
                </h1>

                {/* Form */}
                <form className="space-y-5 w-full" onSubmit={handleSubmit}>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    {/* Full Name Input */}
                    <div className={`flex items-center bg-[#FAFAFA] rounded-[18px] px-5 py-4 border-2 border-transparent focus-within:${primaryBorderGreen}/50 transition-all shadow-sm hover:shadow-md`}>
                        <svg className="w-5 h-5 text-gray-400 mr-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 w-full font-medium text-[15px]"
                            required
                        />
                    </div>

                    {/* Email Input */}
                    <div className={`flex items-center bg-[#FAFAFA] rounded-[18px] px-5 py-4 border-2 border-transparent focus-within:${primaryBorderGreen}/50 transition-all shadow-sm hover:shadow-md`}>
                        <svg className="w-5 h-5 text-gray-400 mr-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                        </svg>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 w-full font-medium text-[15px]"
                            required
                        />
                    </div>

                    {/* Password Input */}
                    <div className={`flex items-center bg-[#FAFAFA] rounded-[18px] px-5 py-4 border-2 border-transparent focus-within:${primaryBorderGreen}/50 transition-all relative shadow-sm hover:shadow-md`}>
                        <svg className="w-5 h-5 text-gray-400 mr-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1c1.71 0 3.1 1.39 3.1 3.1v2z" />
                        </svg>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 w-full font-medium text-[15px]"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                            {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Confirm Password Input */}
                    {/* Added Red Border on Mismatch */}
                    <div className={`flex items-center bg-[#FAFAFA] rounded-[18px] px-5 py-4 border-2 transition-all relative shadow-sm hover:shadow-md ${isMismatch ? 'border-red-500 bg-red-50/50' : `border-transparent focus-within:${primaryBorderGreen}/50`}`}>
                        <svg className={`w-5 h-5 mr-4 flex-shrink-0 ${isMismatch ? 'text-red-500' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1c1.71 0 3.1 1.39 3.1 3.1v2z" />
                        </svg>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`bg-transparent border-none outline-none placeholder-gray-400 w-full font-medium text-[15px] ${isMismatch ? 'text-red-600' : 'text-gray-900'}`}
                            required
                        />
                        <div className="flex items-center gap-3">
                            {/* Validation Icons */}
                            {isMatch && <CheckCircle className="w-5 h-5 text-[#16A34A]" fill="#16A34A" color="white" />}
                            {isMismatch && <XCircle className="w-5 h-5 text-red-500" fill="#EF4444" color="white" />}

                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Sign Up Button (With updated green) */}
                    <button
                        disabled={loading}
                        className={`w-full ${primaryBgGreen} text-white font-bold py-[18px] rounded-full shadow-lg ${hoverBgGreen} transition-all mb-6 mt-4 text-[16px] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Creating Account...
                            </>
                        ) : "Sign up"}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-[1px] bg-gray-100 flex-1"></div>
                    <span className="text-gray-500 font-medium text-sm">or continue with</span>
                    <div className="h-[1px] bg-gray-100 flex-1"></div>
                </div>

                {/* Social Buttons */}
                <div className="flex items-center justify-center gap-6 mb-8">
                    <button onClick={() => handleSocialLogin('facebook')} disabled={loading} className="w-16 h-12 flex items-center justify-center border border-gray-100 rounded-[14px] hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-70">
                        <svg className="w-6 h-6 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                    </button>
                    <button onClick={() => handleSocialLogin('google')} disabled={loading} className="w-16 h-12 flex items-center justify-center border border-gray-100 rounded-[14px] hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-70">
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                    </button>
                    <button onClick={() => handleSocialLogin('apple')} disabled={loading} className="w-16 h-12 flex items-center justify-center border border-gray-100 rounded-[14px] hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-70">
                        <svg className="w-6 h-6 text-black" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.35-1.09-.56-2.09-.48-3.08.35-1.06.86-2.29.38-2.29.38-2.92-2.12-2.86-5.87-1.18-8.31 1.09-1.55 2.94-1.63 3.92-.61 1.05 1.05 2.45.64 3.33-.29 1.4-1.29 3.51-.78 3.51-.78 1.15.5 1.95 1.35 2.41 2.04-.04.04-1.89 1.16-1.81 3.5.08 2.37 2.13 3.16 2.13 3.16-.04.13-1.33 2.97-3.86 2.97zM14.65 6.64c-.66-1.07-.15-2.58.74-3.53.97-1.1 2.65-1.06 3.25-.09.68 1.02.26 2.65-.79 3.63-.9.84-2.58.98-3.2 0z" />
                        </svg>
                    </button>
                </div>

                {/* Footer */}
                <div className="text-center mt-auto pb-6">
                    <p className="text-xs text-gray-500 mb-4">
                        By continuing, you agree to our{" "}
                        <Link href="/terms" className="text-[#16A34A] hover:underline hover:text-[#15803d] transition-colors">
                            Terms
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy-policy" className="text-[#16A34A] hover:underline hover:text-[#15803d] transition-colors">
                            Privacy Policy
                        </Link>.
                    </p>
                    <span className="text-gray-500 text-[14px] font-medium">Already have an account? </span>
                    <Link href="/signin" className={`text-[#16A34A] font-bold text-[14px] hover:underline ml-1`}>
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
