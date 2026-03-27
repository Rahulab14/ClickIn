"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
    collection,
    query,
    where,
    onSnapshot,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    Timestamp
} from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import {
    Loader2,
    CheckCircle,
    XCircle,
    Store,
    Users,
    Clock,
    ShieldCheck,
    ChevronRight,
    ArrowUpRight,
    AlertCircle,
    Activity,
    Target
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type ShopData = {
    id: string; // auth uid
    email: string;
    shopName: string;
    createdAt: string;
    fullName: string;
};

type PendingStaff = {
    id: string; // doc id in 'staff' collection
    uid: string;
    email: string;
    name: string;
    shopId: string;
    shopName: string;
    role: string;
    status: string;
    createdAt: string;
};

export default function AdminVendorsPage() {
    const [pendingVendors, setPendingVendors] = useState<ShopData[]>([]);
    const [activeVendors, setActiveVendors] = useState<ShopData[]>([]);
    const [pendingStaff, setPendingStaff] = useState<PendingStaff[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);

        // Listen to pending vendors (owners)
        const vQuery = query(
            collection(db, "users"),
            where("role", "==", "vendor_owner"),
            where("status", "==", "pending")
        );

        const unsubscribePending = onSnapshot(vQuery, async (snapshot) => {
            const results: ShopData[] = [];
            for (const userDoc of snapshot.docs) {
                // We fetch the vendor doc for shopName
                const vendorSnap = await getDoc(doc(db, "vendors", userDoc.id));
                results.push({
                    id: userDoc.id,
                    email: userDoc.data().email,
                    fullName: userDoc.data().fullName || "Unknown",
                    shopName: vendorSnap.exists() ? vendorSnap.data().shopName : "Unknown Shop",
                    createdAt: userDoc.data().createdAt
                });
            }
            results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setPendingVendors(results);
            setLoading(false);
        });

        // Listen to active vendors (owners)
        const aQuery = query(
            collection(db, "users"),
            where("role", "==", "vendor_owner"),
            where("status", "==", "active")
        );

        const unsubscribeActive = onSnapshot(aQuery, async (snapshot) => {
            const results: ShopData[] = [];
            for (const userDoc of snapshot.docs) {
                const vendorSnap = await getDoc(doc(db, "vendors", userDoc.id));
                results.push({
                    id: userDoc.id,
                    email: userDoc.data().email || "",
                    fullName: userDoc.data().fullName || "Unknown",
                    shopName: vendorSnap.exists() ? vendorSnap.data().shopName : "Missing Registry",
                    createdAt: userDoc.data().createdAt || new Date().toISOString()
                });
            }
            results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setActiveVendors(results);
        });

        // Listen to pending staff requests (from global staff collection)
        const sQuery = query(
            collection(db, "staff"),
            where("status", "==", "PENDING")
        );

        const unsubscribeStaff = onSnapshot(sQuery, (snapshot) => {
            const results: PendingStaff[] = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            } as PendingStaff));
            setPendingStaff(results);
        });

        return () => {
            unsubscribePending();
            unsubscribeActive();
            unsubscribeStaff();
        };
    }, []);

    const handleApproveVendor = async (uid: string) => {
        setActionId(uid);
        try {
            await updateDoc(doc(db, "users", uid), { status: "active" });
            await updateDoc(doc(db, "vendors", uid), { isApproved: true, verified: true });
        } catch (error) {
            console.error("Failed to approve vendor", error);
        } finally {
            setActionId(null);
        }
    };

    const handleRejectVendor = async (uid: string) => {
        if (!confirm("Are you sure you want to REJECT this vendor?")) return;
        setActionId(uid);
        try {
            await updateDoc(doc(db, "users", uid), { status: "blocked" });
            await updateDoc(doc(db, "vendors", uid), { isApproved: false, verified: false });
        } catch (error) {
            console.error("Failed to block vendor", error);
        } finally {
            setActionId(null);
        }
    };

    const handleDeleteShop = async (uid: string) => {
        if (!confirm("CRITICAL INSTANCE PURGE: Are you absolutely sure you want to physically destroy this Shop and remove it from the database?")) return;
        setActionId(uid);
        try {
            // Delete the vendor profile
            await deleteDoc(doc(db, "vendors", uid));
            // Disconnect the user role
            await updateDoc(doc(db, "users", uid), { status: "deleted", role: "none" });
        } catch (error) {
            console.error("Failed to delete shop segment", error);
        } finally {
            setActionId(null);
        }
    };

    const handleApproveStaff = async (request: PendingStaff) => {
        setActionId(request.id);
        try {
            // 1. Update global staff profile status
            await updateDoc(doc(db, "staff", request.id), {
                status: "APPROVED",
                isActive: true
            });

            // 2. Also update in the shop's specific staff subcollection
            // We need to find the docId in shops/shopId/staff
            const shopStaffQuery = query(
                collection(db, "shops", request.shopId, "staff"),
                where("uid", "==", request.uid)
            );
            const shopStaffSnap = await getDocs(shopStaffQuery);
            if (!shopStaffSnap.empty) {
                const shopStaffDocId = shopStaffSnap.docs[0].id;
                await updateDoc(doc(db, "shops", request.shopId, "staff", shopStaffDocId), {
                    status: "APPROVED",
                    isActive: true
                });
            }

        } catch (error) {
            console.error("Failed to approve staff", error);
        } finally {
            setActionId(null);
        }
    };

    if (loading && pendingVendors.length === 0 && pendingStaff.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
                <div className="relative">
                    <div className="h-20 w-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Activity className="w-8 h-8 text-emerald-500 animate-pulse" />
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-black tracking-tighter text-gray-900 uppercase">SYNCHRONIZING SECURE TUNNEL</h3>
                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Awaiting real-time signal intercept...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Access Control Alpha</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 leading-[0.9]">GLOBAL<br />APPROVALS</h1>
                    <p className="text-gray-500 font-bold max-w-md text-sm uppercase tracking-widest opacity-60">Authorize nodes and personnel entries</p>
                </div>

                <div className="flex items-center gap-2">
                    <Badge className="bg-white text-gray-900 border-gray-100 shadow-sm py-2 px-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                        <Clock className="w-3.5 h-3.5 mr-2 text-blue-500" />
                        LIVE INTERCEPT ACTIVE
                    </Badge>
                </div>
            </div>

            <Tabs defaultValue="vendors" className="w-full">
                <TabsList className="bg-transparent border-b border-gray-100 w-full justify-start h-auto p-0 rounded-none mb-10 gap-8">
                    <TabsTrigger
                        value="vendors"
                        className="rounded-none border-b-2 border-transparent px-0 py-4 data-[state=active]:border-gray-900 data-[state=active]:bg-transparent bg-transparent shadow-none font-black uppercase tracking-[0.2em] text-[11px] text-gray-400 data-[state=active]:text-gray-900 transition-all"
                    >
                        <ShieldCheck className="w-4 h-4 mr-3" />
                        PENDING REQUESTS ({pendingVendors.length})
                    </TabsTrigger>
                    <TabsTrigger
                        value="active_shops"
                        className="rounded-none border-b-2 border-transparent px-0 py-4 data-[state=active]:border-gray-900 data-[state=active]:bg-transparent bg-transparent shadow-none font-black uppercase tracking-[0.2em] text-[11px] text-gray-400 data-[state=active]:text-gray-900 transition-all"
                    >
                        <Store className="w-4 h-4 mr-3" />
                        ACTIVE REGISTRY ({activeVendors.length})
                    </TabsTrigger>
                    <TabsTrigger
                        value="staff"
                        className="rounded-none border-b-2 border-transparent px-0 py-4 data-[state=active]:border-gray-900 data-[state=active]:bg-transparent bg-transparent shadow-none font-black uppercase tracking-[0.2em] text-[11px] text-gray-400 data-[state=active]:text-gray-900 transition-all"
                    >
                        <Users className="w-4 h-4 mr-3" />
                        PERSONNEL ({pendingStaff.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="vendors">
                    <div className="grid gap-6 md:grid-cols-2">
                        <AnimatePresence>
                            {pendingVendors.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="md:col-span-2"
                                >
                                    <Card className="border-dashed border-2 py-20 text-center rounded-[2.5rem] bg-gray-50/50">
                                        <CardContent>
                                            <Store className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                                            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Awaiting Vendor Node Signals</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ) : (
                                pendingVendors.map((vendor, idx) => (
                                    <motion.div
                                        key={vendor.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                    >
                                        <Card className="overflow-hidden border-none shadow-xl shadow-gray-200/50 rounded-[2.5rem] bg-white group hover:-translate-y-1 transition-all duration-500">
                                            <div className="p-8 space-y-8">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-16 h-16 rounded-[1.5rem] bg-blue-50 flex items-center justify-center shrink-0 shadow-sm border border-blue-100 group-hover:scale-110 transition-transform duration-500">
                                                            <Store className="w-8 h-8 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className="font-black text-2xl text-gray-900 tracking-tighter uppercase">{vendor.shopName}</h3>
                                                                <Badge className="bg-amber-100 text-amber-700 border-none text-[8px] font-black uppercase tracking-widest py-1">PENDING AUTH</Badge>
                                                            </div>
                                                            <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                                <span className="flex items-center gap-1.5"><Users className="w-3 h-3" /> {vendor.fullName}</span>
                                                                <div className="h-1 w-1 rounded-full bg-gray-200" />
                                                                <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {new Date(vendor.createdAt).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 space-y-2">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Access Metadata</p>
                                                    <p className="text-xs font-bold text-gray-600 font-mono tracking-tight truncate">{vendor.email}</p>
                                                </div>

                                                <div className="flex gap-4">
                                                    <Button
                                                        onClick={() => handleApproveVendor(vendor.id)}
                                                        disabled={actionId === vendor.id}
                                                        className="flex-1 bg-gray-900 hover:bg-black text-white rounded-2xl h-14 font-black uppercase tracking-widest text-xs shadow-xl shadow-gray-200 transition-all active:scale-95"
                                                    >
                                                        {actionId === vendor.id ? (
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                        ) : (
                                                            <>
                                                                APPROVE NODE
                                                                <ArrowUpRight className="ml-2 w-4 h-4 opacity-50" />
                                                            </>
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => handleRejectVendor(vendor.id)}
                                                        disabled={actionId === vendor.id}
                                                        className="w-14 h-14 rounded-2xl border border-gray-100 text-red-500 hover:text-red-600 hover:bg-red-50 transition-all active:scale-95"
                                                    >
                                                        <XCircle className="w-6 h-6" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </TabsContent>

                <TabsContent value="active_shops">
                    <div className="grid gap-6 xl:grid-cols-2">
                        <AnimatePresence>
                            {activeVendors.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="xl:col-span-2"
                                >
                                    <Card className="border-dashed border-2 py-20 text-center rounded-[2.5rem] bg-gray-50/50">
                                        <CardContent>
                                            <Store className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                                            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">NO ACTIVE REGISTRIES FOUND</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ) : (
                                activeVendors.map((vendor, idx) => (
                                    <motion.div
                                        key={vendor.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                    >
                                        <Card className="overflow-hidden border-none shadow-xl shadow-gray-200/50 rounded-[2.5rem] bg-white group hover:-translate-y-1 transition-all duration-500">
                                            <div className="p-8 space-y-8">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-50 flex items-center justify-center shrink-0 shadow-sm border border-emerald-100 group-hover:scale-110 transition-transform duration-500">
                                                            <CheckCircle className="w-8 h-8 text-emerald-600" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className="font-black text-2xl text-gray-900 tracking-tighter uppercase">{vendor.shopName}</h3>
                                                            </div>
                                                            <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                                <span className="flex items-center gap-1.5"><Users className="w-3 h-3" /> {vendor.fullName}</span>
                                                                <div className="h-1 w-1 rounded-full bg-gray-200" />
                                                                <span className="flex items-center gap-1.5"><Store className="w-3 h-3" /> UID: {vendor.id.slice(0, 8)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 space-y-2">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Registration Date</p>
                                                    <p className="text-xs font-bold text-gray-600 tracking-tight truncate">{new Date(vendor.createdAt).toLocaleDateString()}</p>
                                                </div>

                                                <div className="flex gap-4">
                                                    <Button
                                                        onClick={() => handleDeleteShop(vendor.id)}
                                                        disabled={actionId === vendor.id}
                                                        variant="destructive"
                                                        className="flex-1 rounded-2xl h-14 font-black uppercase tracking-widest text-xs shadow-xl shadow-red-200 transition-all active:scale-95"
                                                    >
                                                        {actionId === vendor.id ? (
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <AlertCircle className="mr-2 w-4 h-4" />
                                                                DESTROY INSTANCE
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </TabsContent>

                <TabsContent value="staff">
                    <div className="grid gap-6 md:grid-cols-2">
                        <AnimatePresence>
                            {pendingStaff.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="md:col-span-2"
                                >
                                    <Card className="border-dashed border-2 py-20 text-center rounded-[2.5rem] bg-gray-50/50">
                                        <CardContent>
                                            <Users className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                                            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No pending personnel entries</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ) : (
                                pendingStaff.map((staff, idx) => (
                                    <motion.div
                                        key={staff.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                    >
                                        <Card className="overflow-hidden border-none shadow-xl shadow-gray-200/50 rounded-[2.5rem] bg-white group hover:-translate-y-1 transition-all duration-500">
                                            <div className="p-8 space-y-8">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-16 h-16 rounded-[1.5rem] bg-gray-900 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-500">
                                                            <ShieldCheck className="w-8 h-8 text-white" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className="font-black text-2xl text-gray-900 tracking-tighter uppercase">{staff.name}</h3>
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-3">
                                                                <Badge className="bg-blue-100 text-blue-700 border-none text-[8px] font-black uppercase tracking-[0.2em] py-1 px-2.5 rounded-lg">
                                                                    {staff.role}
                                                                </Badge>
                                                                <div className="h-1 w-1 rounded-full bg-gray-200" />
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                                                    <Store className="w-3 h-3" /> {staff.shopName}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 space-y-1">
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Registered</p>
                                                        <p className="text-xs font-bold text-gray-600">{new Date(staff.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 space-y-1">
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Signal Type</p>
                                                        <p className="text-xs font-bold text-gray-600 font-mono">ENCRYPTED</p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-4">
                                                    <Button
                                                        onClick={() => handleApproveStaff(staff)}
                                                        disabled={actionId === staff.id}
                                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-14 font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 transition-all active:scale-95"
                                                    >
                                                        {actionId === staff.id ? (
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                        ) : (
                                                            <>
                                                                GRANT ACCESS
                                                                <ArrowUpRight className="ml-2 w-4 h-4 opacity-50" />
                                                            </>
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        className="w-14 h-14 rounded-2xl border border-gray-100 text-gray-400 hover:text-gray-900 transition-all active:scale-95"
                                                    >
                                                        <Target className="w-6 h-6" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

