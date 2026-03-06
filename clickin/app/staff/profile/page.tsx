"use client"

import { useStaff } from "@/context/staff/StaffContext"
import { useAuth } from "@/context/auth/AuthContext"
import { useRouter } from "next/navigation"
import { User, LogOut, Shield, MapPin, BadgeInfo, Settings } from "lucide-react"

export default function StaffProfilePage() {
    const { staffProfile, shop, isStaffLoading } = useStaff()
    const { logout } = useAuth()
    const router = useRouter()

    const handleLogout = async () => {
        await logout()
        router.push("/staff-login")
    }

    if (isStaffLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="h-8 w-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
        )
    }

    if (!staffProfile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <User className="h-12 w-12 text-gray-300 mb-4" />
                <h2 className="text-xl font-black text-gray-900">Profile Not Found</h2>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-md mx-auto">
            <header className="mb-8 text-center mt-4">
                <div className="h-24 w-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg relative">
                    <span className="text-4xl font-black text-emerald-700 uppercase">
                        {staffProfile.name.charAt(0)}
                    </span>
                    <div className="absolute bottom-0 right-0 h-6 w-6 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
                <h1 className="text-2xl font-black tracking-tight text-gray-900 mb-1">{staffProfile.name}</h1>
                <p className="text-sm text-gray-400 font-bold">{staffProfile.email}</p>

                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-gray-900 text-white rounded-full text-xs font-black tracking-widest uppercase">
                    <Shield className="h-3.5 w-3.5 text-emerald-400" />
                    {staffProfile.role}
                </div>
            </header>

            <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-50 flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                        <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">Assigned Shop</span>
                        <span className="font-bold text-gray-900">{shop?.name || "Unknown Shop"}</span>
                    </div>
                </div>
                <div className="p-4 border-b border-gray-50 flex items-center gap-3">
                    <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
                        <BadgeInfo className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">Staff ID</span>
                        {/* <span className="font-bold text-gray-900 text-sm tracking-wider">{staffProfile.id.toUpperCase()}</span> */}
                    </div>
                </div>
                <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer text-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center">
                            <Settings className="h-5 w-5" />
                        </div>
                        <span className="font-bold">Account Settings</span>
                    </div>
                </div>
            </div>

            <button
                onClick={handleLogout}
                className="w-full py-4 rounded-[1.5rem] font-black text-red-600 bg-red-50 hover:bg-red-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2 border border-red-100"
            >
                <LogOut className="h-5 w-5" />
                Logout Account
            </button>

            <p className="text-center text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-8">
                Clickin Staff Module v1.0
            </p>
        </div>
    )
}
