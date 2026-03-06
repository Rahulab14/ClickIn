"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function VendorLoginPage() {
    const router = useRouter()

    useEffect(() => {
        // Redirect to the central login page
        router.replace("/login")
    }, [router])

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-pulse text-emerald-600 font-medium">
                Redirecting to secure login...
            </div>
        </div>
    )
}
