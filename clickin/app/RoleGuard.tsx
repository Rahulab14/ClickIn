"use client";

import { usePathname } from "next/navigation";
import { CustomerProviders } from "./customer-providers";

export function RoleGuard({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isVendorRoute = pathname?.startsWith("/vendor");
    const isAdminRoute = pathname?.startsWith("/admin");

    return (
        <>
            {isVendorRoute || isAdminRoute ? (
                // Vendor and Admin routes handle their own specific context setup
                children
            ) : (
                // Customer routes receive Customer-specific context providers
                <CustomerProviders>
                    {children}
                </CustomerProviders>
            )}
        </>
    );
}
