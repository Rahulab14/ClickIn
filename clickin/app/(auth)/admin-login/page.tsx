"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Store, Loader2, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
    const { login, logout, signup } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState("anna1@gmail.com");
    const [password, setPassword] = useState("anna1234");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsLoading(true);

        try {
            await login(email, password, "admin");
            router.push("/admin/dashboard");
        } catch (err: any) {
            setError(err.message || "Failed to login");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateAdmin = async () => {
        setError("");
        setSuccess("");
        setIsLoading(true);
        try {
            await signup(email, password, "System Admin", "admin");
            setSuccess("Admin account created successfully! You can now login.");
        } catch (err: any) {
            setError(err.message || "Failed to create admin");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid md:grid-cols-2">
            {/* Left side - Branding */}
            <div className="hidden md:flex flex-col justify-center items-center bg-zinc-900 text-white p-12">
                <div className="max-w-md text-center space-y-6">
                    <div className="max-w-[400px] aspect-square relative mx-auto rounded-3xl overflow-hidden bg-zinc-800 flex items-center justify-center p-12">
                        <ShieldCheck className="w-full h-full text-zinc-600" />
                    </div>
                </div>
            </div>

            {/* Right side - Login Form */}
            <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-24 bg-zinc-50 dark:bg-zinc-950">
                <div className="max-w-[400px] w-full mx-auto space-y-8">
                    <div className="space-y-2 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
                            <Store className="h-8 w-8 text-primary" />
                            <span className="text-2xl font-bold tracking-tight">ClickIn</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">System Administration</h1>
                        <p className="text-muted-foreground">
                            Enter your credentials to access the master control panel.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        {success && (
                            <Alert className="bg-green-500/10 text-green-600 border-green-500/20">
                                <AlertDescription>{success}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Administrator Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-background h-12"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-background h-12"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-medium shadow-none"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                "Access Control Panel"
                            )}
                        </Button>

                        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                            <p className="text-sm text-muted-foreground text-center mb-4">
                                First time? Create the master administrator account.
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-12 text-base font-medium"
                                onClick={handleCreateAdmin}
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Register as Initial Admin"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
