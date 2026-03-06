"use client";

import { useAuth } from "@/context/auth/AuthContext";
import { useVendor } from "@/context/vendor/VendorContext";
import { Button } from "@/components/ui/Button";
import { Clock, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PendingApprovalPage() {
    const { user, userStatus, logout } = useAuth();
    const { vendorProfile } = useVendor();
    const router = useRouter();

    useEffect(() => {
        // userStatus comes from AuthContext (not real-time), vendorProfile comes from VendorContext (real-time)
        const profile = vendorProfile as any;
        const isOwnerApproved = profile?.isApproved === true;
        const isStaffApproved = profile?.status === "active" || profile?.status === "APPROVED";

        if (userStatus === "active" || isOwnerApproved || isStaffApproved) {
            router.push("/vendor/dashboard");
        }
    }, [userStatus, vendorProfile, router]);

    const handleSignOut = async () => {
        await logout();
        router.push("/vendor");
    };

    const isRejected = vendorProfile?.status === "REJECTED";

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock className="w-10 h-10" />
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    {isRejected ? "Access Denied" : "Approval Pending"}
                </h1>

                <p className="text-zinc-600 dark:text-zinc-400">
                    Hello {user?.displayName || user?.email},
                    {isRejected ? " your request to join has been declined." : " your account is currently under review by our administration team."}
                </p>

                {!isRejected && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 p-4 rounded-lg text-sm text-left relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                        <p>Usually this takes between 1-2 business days. This page will automatically refresh once your shop has been approved and activated.</p>
                    </div>
                )}

                <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                    <Button
                        variant="outline"
                        onClick={handleSignOut}
                        className="w-full"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </div>
        </div>
    );
}
