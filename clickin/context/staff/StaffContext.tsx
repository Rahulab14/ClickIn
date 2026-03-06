"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/context/auth/AuthContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { subscribeToShop } from "@/lib/vendor-service";
import type { VendorStaff, VendorShop } from "@/lib/types/vendor";

interface StaffContextType {
    staffProfile: VendorStaff | null;
    shop: VendorShop | null;
    shopId: string | null;
    isStaffLoading: boolean;
    isPendingApproval: boolean;
}

const StaffContext = createContext<StaffContextType>({
    staffProfile: null,
    shop: null,
    shopId: null,
    isStaffLoading: true,
    isPendingApproval: false,
});

export const useStaff = () => useContext(StaffContext);

export const StaffProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, userRole, loading } = useAuth();
    const [staffProfile, setStaffProfile] = useState<VendorStaff | null>(null);
    const [shop, setShop] = useState<VendorShop | null>(null);
    const [isStaffLoading, setIsStaffLoading] = useState(true);

    useEffect(() => {
        if (loading) return;

        let unsubStaffDoc: (() => void) | undefined;
        let unsubShop: (() => void) | undefined;

        const load = async () => {
            setIsStaffLoading(true);

            // Only allow users with role "vendor_staff"
            if (user && userRole === "vendor_staff") {
                try {
                    const profileRef = doc(db, "staff", user.uid);

                    unsubStaffDoc = onSnapshot(profileRef, (snap) => {
                        if (snap.exists()) {
                            const profile = { id: snap.id, ...snap.data() } as VendorStaff;
                            setStaffProfile(profile);

                            // Load shop data real-time if staff has a shop ID
                            if (profile.shopId) {
                                if (unsubShop) unsubShop();
                                unsubShop = subscribeToShop(profile.shopId, (shopData) => {
                                    setShop(shopData);
                                    setIsStaffLoading(false);
                                });
                            } else {
                                setIsStaffLoading(false);
                            }
                        } else {
                            setIsStaffLoading(false);
                        }
                    }, (error) => {
                        console.error("Firestore Staff Profile listener error:", error);
                        setIsStaffLoading(false);
                    });

                } catch (e) {
                    console.error("Failed to setup staff real-time listeners:", e);
                    setIsStaffLoading(false);
                }
            } else {
                setStaffProfile(null);
                setShop(null);
                setIsStaffLoading(false);
            }
        };

        load();

        return () => {
            if (unsubStaffDoc) unsubStaffDoc();
            if (unsubShop) unsubShop();
        };
    }, [user, userRole, loading]);

    return (
        <StaffContext.Provider value={{
            staffProfile,
            shop,
            shopId: staffProfile?.shopId || null,
            isStaffLoading,
            isPendingApproval: !!staffProfile && (staffProfile.status !== "APPROVED" || !staffProfile.isActive),
        }}>
            {children}
        </StaffContext.Provider>
    );
};
