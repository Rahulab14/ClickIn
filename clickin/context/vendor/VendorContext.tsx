"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/context/auth/AuthContext";
import { getVendorProfile, getShop, subscribeToShop, subscribeToSettings, toggleShopOnline } from "@/lib/vendor-service";
import { VendorProfile, VendorShop, StaffRole, VendorSettings } from "@/lib/types/vendor";
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
    settings: VendorSettings | null;
}

const VendorContext = createContext<VendorContextType>({
    vendorProfile: null,
    shop: null,
    shopId: null,
    role: null,
    isVendorLoading: true,
    isDemo: false,
    isPendingApproval: false,
    settings: null,
});

// Alias to minimize page refactoring
export const useVendor = () => useContext(VendorContext);
// Also export as useVendorAuth to avoid breaking existing pages that import it
export const useVendorAuth = () => useContext(VendorContext);

export const VendorProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, userRole, loading } = useAuth();
    const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
    const [shop, setShop] = useState<VendorShop | null>(null);
    const [settings, setSettings] = useState<VendorSettings | null>(null);
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

    // Global Settings subscription
    useEffect(() => {
        if (!vendorProfile?.shopId) return;
        const unsubSettings = subscribeToSettings(vendorProfile.shopId, (s) => {
            setSettings(s);
        });
        return () => unsubSettings();
    }, [vendorProfile?.shopId]);

    // Global Operating Hours Boundary Check logic
    useEffect(() => {
        if (!settings || !vendorProfile?.shopId || !shop) return;

        const checkBoundaries = () => {
            const now = new Date();
            const currentDay = now.toLocaleDateString("en-US", { weekday: "long" });
            const currentTime = now.getHours() * 60 + now.getMinutes();

            const hoursToday = settings.operatingHours.find((h) => h.day === currentDay);
            
            if (!hoursToday || !hoursToday.isOpen) {
                if (shop.isOnline) {
                    toggleShopOnline(vendorProfile.shopId!, false);
                }
                return;
            }

            const [openH, openM] = hoursToday.openTime.split(":").map(Number);
            const [closeH, closeM] = hoursToday.closeTime.split(":").map(Number);
            const openMinutes = openH * 60 + openM;
            const closeMinutes = closeH * 60 + closeM;

            const shouldBeOpen = currentTime >= openMinutes && currentTime < closeMinutes;

            // If we are in Auto Mode (not Manual Override)
            if (!settings.isManualMode) {
                if (shop.isOnline !== shouldBeOpen) {
                    toggleShopOnline(vendorProfile.shopId!, shouldBeOpen);
                }
            }
        };

        const timer = setInterval(checkBoundaries, 10000); // Check every 10s
        checkBoundaries(); // Initial check

        return () => clearInterval(timer);
    }, [settings, vendorProfile?.shopId, shop?.isOnline]);

    return (
        <VendorContext.Provider value={{
            vendorProfile,
            shop,
            shopId: vendorProfile?.shopId || null,
            role: vendorProfile?.role || null,
            isVendorLoading,
            isDemo: false,
            isPendingApproval: vendorProfile?.status !== "APPROVED" && userRole === "vendor_staff",
            settings,
        }}>
            {children}
        </VendorContext.Provider>
    );
};
