"use client"

import { BarChart3 } from "lucide-react"

export default function VendorReportsPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <BarChart3 className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Analytics Coming Soon</h2>
            <p className="text-gray-500 max-w-sm">Detailed sales reports, revenue tracking, and customer insights module is under development.</p>
        </div>
    )
}
