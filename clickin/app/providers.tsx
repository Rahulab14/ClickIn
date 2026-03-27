"use client"

import { AuthProvider } from "@/context/auth/AuthContext"
import { ThemeProvider } from "next-themes"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false}>
            <AuthProvider>
                {children}
            </AuthProvider>
        </ThemeProvider>
    )
}
