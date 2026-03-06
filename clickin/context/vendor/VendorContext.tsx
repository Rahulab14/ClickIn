"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/context/auth/AuthContext";
import { getVendorProfile, getShop, subscribeToShop } from "@/lib/vendor-service";
import { VendorProfile, VendorShop, StaffRole } from "@/lib/types/vendor";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface VendorContextType {
    vendorProfile: VendorProfile | null;
    shop: VendorShop | null;
    shopId: string | null;
    role: StaffRole | null;
    isVendorLoading: boolean;
    isDemo: boolean;
    isPendingApproval: boolean;
}

const VendorContext = createContext<VendorContextType>({
    vendorProfile: null,
    shop: null,
    shopId: null,
    role: null,
    isVendorLoading: true,
    isDemo: false,
    isPendingApproval: false,
});

// Alias to minimize page refactoring
export const useVendor = () => useContext(VendorContext);
// Also export as useVendorAuth to avoid breaking existing pages that import it
export const useVendorAuth = () => useContext(VendorContext);

export const VendorProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, userRole, loading } = useAuth();
    const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
    const [shop, setShop] = useState<VendorShop | null>(null);
    const [isVendorLoading, setIsVendorLoading] = useState(true);

    useEffect(() => {
        if (loading) return;

        let unsubUserDoc: (() => void) | undefined;
        let unsubShop: (() => void) | undefined;

        const load = async () => {
            setIsVendorLoading(true);
            if (user && (userRole === "vendor_owner" || userRole === "vendor_staff")) {
                try {
                    // 1. Subscribe to the user's vendor/staff profile
                    const collectionName = userRole === "vendor_owner" ? "vendors" : "staff";
                    const profileRef = doc(db, collectionName, user.uid);

                    unsubUserDoc = onSnapshot(profileRef, (snap) => {
                        if (snap.exists()) {
                            const profile = snap.data() as VendorProfile;
                            setVendorProfile(profile);

                            // 2. If profile has shopId, subscribe to shop data real-time
                            if (profile.shopId) {
                                // Clear old shop subscription if shopId changes
                                if (unsubShop) unsubShop();
                                unsubShop = subscribeToShop(profile.shopId, (shopData) => {
                                    setShop(shopData);
                                    setIsVendorLoading(false);
                                });
                            } else {
                                setIsVendorLoading(false);
                            }
                        } else {
                            setIsVendorLoading(false);
                        }
                    }, (error) => {
                        console.error("Firestore Vendor Profile listener error:", error);
                        setIsVendorLoading(false);
                    });

                } catch (e) {
                    console.error("Failed to setup vendor real-time listeners:", e);
                    setIsVendorLoading(false);
                }
            } else {
                setVendorProfile(null);
                setShop(null);
                setIsVendorLoading(false);
            }
        };

        load();

        return () => {
            if (unsubUserDoc) unsubUserDoc();
            if (unsubShop) unsubShop();
        };
    }, [user, userRole, loading]);

    return (
        <VendorContext.Provider value={{
            vendorProfile,
            shop,
            shopId: vendorProfile?.shopId || null,
            role: vendorProfile?.role || null,
            isVendorLoading,
            isDemo: false, // Demo flows disabled
            isPendingApproval: vendorProfile?.status !== "APPROVED" && userRole === "vendor_staff",
        }}>
            {children}
        </VendorContext.Provider>
    );
};
