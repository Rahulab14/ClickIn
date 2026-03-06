"use client"

import { useState, useEffect } from "react"
import { useVendor } from "@/context/vendor/VendorContext"
import { db } from "@/lib/firebase"
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore"
import { Users, CheckCircle, XCircle, Clock, ShieldAlert, ChevronDown, ChevronUp, UserCheck, UserX, UserCog } from "lucide-react"
import { VendorStaff } from "@/lib/types/vendor"
import { cn } from "@/lib/utils"

export default function VendorStaffPage() {
    const { vendorProfile } = useVendor()
    const [staffList, setStaffList] = useState<VendorStaff[]>([])
    const [loading, setLoading] = useState(true)
    const [isBlockedCollapsed, setIsBlockedCollapsed] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [showToast, setShowToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

    useEffect(() => {
        if (!vendorProfile?.shopId) return

        const q = query(
            collection(db, "staff"),
            where("shopId", "==", vendorProfile.shopId)
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const staffData: VendorStaff[] = []
            snapshot.forEach((doc) => {
                staffData.push({ id: doc.id, ...doc.data() } as VendorStaff)
            })
            // Sort by createdAt descending
            staffData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            setStaffList(staffData)
            setLoading(false)
        }, (error) => {
            console.error("Error fetching staff:", error)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [vendorProfile?.shopId])

    const handleUpdateStatus = async (staffId: string, newStatus: "APPROVED" | "REJECTED") => {
        setProcessingId(staffId)
        try {
            await updateDoc(doc(db, "staff", staffId), {
                status: newStatus,
                isActive: newStatus === "APPROVED"
            })
            triggerToast(newStatus === "APPROVED" ? "Staff approved successfully." : "Staff request rejected.", newStatus === "APPROVED" ? "success" : "error")
        } catch (error) {
            console.error("Error updating staff status:", error)
            triggerToast("Failed to update status. Please try again.", "error")
        } finally {
            setProcessingId(null)
        }
    }

    const triggerToast = (message: string, type: 'success' | 'error') => {
        setShowToast({ message, type })
        setTimeout(() => setShowToast(null), 3000)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="h-8 w-8 border-4 border-gray-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
        )
    }

    const pendingStaff = staffList.filter(s => s.status === "PENDING")
    const activeStaff = staffList.filter(s => s.status === "APPROVED")
    const blockedStaff = staffList.filter(s => s.status === "REJECTED")

    const formatLastActive = (dateString?: string, isOnline?: boolean) => {
        if (isOnline) return "Just now"
        if (!dateString) return "Never"

        const date = new Date(dateString)
        const diffInSeconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

        if (diffInSeconds < 60) return `${diffInSeconds} secs ago`
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
        return `${Math.floor(diffInSeconds / 86400)} days ago`
    }

    const formatRequestedTime = (dateString: string) => {
        const date = new Date(dateString)
        const diffInSeconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
        if (diffInSeconds < 60) return `${diffInSeconds} secs ago`
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
        return date.toLocaleDateString()
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-20 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Users className="h-8 w-8 text-emerald-600" />
                        Staff Management
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm font-medium">Manage staff access, approvals, and live activity in real time</p>
                </div>
            </div>

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-24 md:bottom-10 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className={cn(
                        "flex items-center gap-3 px-6 py-3 rounded-full shadow-xl shadow-gray-200/50 font-bold text-sm",
                        showToast.type === 'success' ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                    )}>
                        {showToast.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                        {showToast.message}
                    </div>
                </div>
            )}

            {/* Section 1: Pending Approvals (Yellow/Amber Theme) */}
            {pendingStaff.length > 0 && (
                <section className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-4 md:p-6 shadow-sm overflow-hidden relative">
                    {/* Decorative pattern */}
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <ShieldAlert className="h-32 w-32 text-amber-500 -mt-8 -mr-8" />
                    </div>

                    <div className="flex items-center justify-between mb-5 relative z-10">
                        <h2 className="text-xl font-black text-amber-900 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse" />
                            Pending Action
                        </h2>
                        <span className="bg-amber-100 text-amber-800 text-xs font-black px-2.5 py-1 rounded-full border border-amber-200">
                            {pendingStaff.length} Request{pendingStaff.length !== 1 && 's'}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                        {pendingStaff.map(staff => (
                            <div key={staff.id} className="bg-white rounded-xl border border-amber-100 shadow-sm p-5 transition-all hover:border-amber-300 hover:shadow-md">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-3">
                                        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold border border-amber-200 shrink-0">
                                            {staff.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 leading-none">{staff.name}</h3>
                                            <p className="text-sm text-gray-500 mt-1">{staff.email}</p>
                                        </div>
                                    </div>
                                    <div className="bg-amber-50 border border-amber-100 px-2 py-1 rounded-md flex items-center gap-1.5 text-xs font-bold text-amber-700">
                                        <UserCog className="h-3.5 w-3.5" />
                                        {staff.role}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-amber-600/80 mb-5 font-medium">
                                    <Clock className="h-3.5 w-3.5" />
                                    Requested: {formatRequestedTime(staff.createdAt)}
                                </div>

                                <div className="flex gap-3 mt-4 pt-4 border-t border-gray-50">
                                    <button
                                        onClick={() => handleUpdateStatus(staff.id, "APPROVED")}
                                        disabled={processingId === staff.id}
                                        className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    >
                                        {processingId === staff.id ? (
                                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <UserCheck className="h-4 w-4" />
                                                Approve
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm("Are you sure you want to reject this staff request?")) {
                                                handleUpdateStatus(staff.id, "REJECTED")
                                            }
                                        }}
                                        disabled={processingId === staff.id}
                                        className="flex-1 bg-white hover:bg-red-50 text-red-600 font-bold py-2.5 px-4 rounded-xl border border-red-200 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    >
                                        <XCircle className="h-4 w-4" />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Section 2: Active Staff (Green Theme / Real-time) */}
            <section className="bg-white border border-gray-100 rounded-2xl p-4 md:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                            Active Staff
                        </h2>
                        <p className="text-sm text-gray-500 mt-1 font-medium">Real-time presence and manage permissions</p>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Online: {activeStaff.filter(s => s.isOnline).length}
                    </span>
                </div>

                {activeStaff.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <Users className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-gray-900 font-bold">No Active Staff</h3>
                        <p className="text-gray-500 text-sm mt-1">Approve pending requests to add staff.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeStaff.map(staff => (
                            <div key={staff.id} className="group relative border border-gray-100 rounded-xl p-4 hover:border-emerald-200 hover:shadow-md transition-all bg-white overflow-hidden">
                                {/* Online Status Indicator Bar */}
                                <div className={cn(
                                    "absolute top-0 left-0 w-1 h-full transition-colors",
                                    staff.isOnline ? "bg-emerald-500" : "bg-gray-200"
                                )} />

                                <div className="flex justify-between items-start pl-2 mb-3">
                                    <div className="flex gap-3">
                                        <div className="relative">
                                            <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold border border-emerald-100">
                                                {staff.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className={cn(
                                                "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white",
                                                staff.isOnline ? "bg-emerald-500" : "bg-gray-400"
                                            )} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-sm leading-tight flex items-center gap-2">
                                                {staff.name}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-0.5">{staff.role}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pl-2 space-y-2 mb-4">
                                    <p className="text-xs text-gray-500 flex items-center gap-2">
                                        <span className="font-medium text-gray-400 w-16">Status:</span>
                                        {staff.isOnline
                                            ? <span className="text-emerald-600 font-bold text-[10px] uppercase tracking-wider bg-emerald-50 px-1.5 py-0.5 rounded">Online</span>
                                            : <span className="text-gray-500 font-bold text-[10px] uppercase tracking-wider bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded">Offline</span>
                                        }
                                    </p>
                                    <p className="text-xs text-gray-500 flex items-center gap-2">
                                        <span className="font-medium text-gray-400 w-16">Active:</span>
                                        {formatLastActive(staff.lastActiveAt, staff.isOnline)}
                                    </p>
                                </div>

                                <div className="pl-2 pt-3 border-t border-gray-50 flex justify-end opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => {
                                            if (window.confirm(`Are you sure you want to revoke access for ${staff.name}?`)) {
                                                handleUpdateStatus(staff.id, "REJECTED")
                                            }
                                        }}
                                        className="text-[10px] uppercase tracking-widest font-black text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                    >
                                        <UserX className="h-3 w-3" />
                                        Revoke Access
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Section 3: Blocked / Removed (Collapsed by Default) */}
            <section className="bg-white border text-gray-500 border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <button
                    onClick={() => setIsBlockedCollapsed(!isBlockedCollapsed)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <UserX className="h-5 w-5 text-gray-400" />
                        <h2 className="font-bold text-gray-600">Blocked & Removed Staff</h2>
                        {blockedStaff.length > 0 && (
                            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                {blockedStaff.length}
                            </span>
                        )}
                    </div>
                    {isBlockedCollapsed ? <ChevronDown className="h-5 w-5 text-gray-400" /> : <ChevronUp className="h-5 w-5 text-gray-400" />}
                </button>

                {!isBlockedCollapsed && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                        {blockedStaff.length === 0 ? (
                            <p className="text-sm text-center text-gray-400 py-4">No blocked staff members.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {blockedStaff.map(staff => (
                                    <div key={staff.id} className="bg-white border border-gray-200 rounded-lg p-3 flex justify-between items-center group">
                                        <div className="flex items-center gap-3 opacity-60">
                                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs">
                                                {staff.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 leading-tight">{staff.name}</p>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{staff.role}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (window.confirm("Re-activate this staff member?")) {
                                                    handleUpdateStatus(staff.id, "APPROVED")
                                                }
                                            }}
                                            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"
                                        >
                                            Restore
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    )
}
