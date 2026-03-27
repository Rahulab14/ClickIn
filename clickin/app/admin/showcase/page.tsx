"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
    collection,
    query,
    where,
    onSnapshot,
    deleteDoc,
    doc,
    getDocs,
    updateDoc,
    orderBy
} from "firebase/firestore";
import { subscribeToAllShops } from "@/lib/vendor-service";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import {
    Store,
    Activity,
    Package,
    Users,
    AlertTriangle,
    Coffee,
    Search,
    Loader2,
    ShieldAlert
} from "lucide-react";
import { VendorMenuItem } from "@/lib/types/vendor";

type ActiveShop = {
    id: string; // the shop uid
    ownerId: string; // the vendor uid
    shopName: string;
    description: string;
    verified: boolean;
    isOnline: boolean;
};

export default function AdminShowcasePage() {
    const [shops, setShops] = useState<ActiveShop[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [purgingId, setPurgingId] = useState<string | null>(null);
    const [purgeStatus, setPurgeStatus] = useState<string>("");

    // 1. Live stream all active vendors via global shops query
    useEffect(() => {
        const unsubscribe = subscribeToAllShops((updatedShops) => {
            const data: ActiveShop[] = updatedShops.map(s => ({
                id: s.id,
                ownerId: s.ownerId || s.id, // Fallback if ownerId is missing
                shopName: s.name || "Unnamed Store",
                description: s.location || "No location provided.",
                verified: true,
                isOnline: s.isOnline ?? false,
            }));
            setShops(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // 2. Cascade Destructor Function
    const handleDeepPurge = async (shopId: string, shopName: string, ownerId: string) => {
        const confirmDelete = window.confirm(`⚠️ FINAL WARNING\n\nYou are about to permanently remove "${shopName}" and all related data.\n\nThis will delete:\n• All menu items\n• All staff access\n• The vendor profile\n\nThis action CANNOT be undone. Continue?`);
        if (!confirmDelete) return;

        setPurgingId(shopId);
        setPurgeStatus("Transmitting Purge Protocol...");
        console.log(`[DEEP PURGE] Initiating teardown for Shop: ${shopId}, Owner: ${ownerId}`);

        try {
            setPurgeStatus("Executing Backend Cascade Delete...");
            const { executeDeepPurge } = await import("@/lib/actions/admin-purge");
            const result = await executeDeepPurge(shopId, ownerId);

            if (result.success) {
                setPurgeStatus("PURGE COMPLETE");
                setTimeout(() => {
                    setPurgingId(null);
                    setPurgeStatus("");
                }, 2000);
            }
        } catch (error: any) {
            console.error("[DEEP PURGE] FAILURE:", error);
            setPurgeStatus(`ERROR: ${error.message || "Partial failure"}`);
            alert(`Purge failed: ${error.message || "Check console for details."}`);
            setTimeout(() => setPurgingId(null), 5000);
        }
    };

    const filteredShops = shops.filter(s => s.shopName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-10 bg-zinc-50/50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600">Global Panopticon</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 leading-[0.9]">
                        LIVE SHOWCASE
                    </h1>
                    <p className="text-gray-500 font-bold max-w-lg text-sm uppercase tracking-widest leading-relaxed">
                        Surveillance of all operational commerce nodes and their synchronized retail inventory.
                    </p>
                </div>

                <div className="relative group min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Scan for registry..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 h-14 bg-white border border-gray-200 rounded-2xl text-sm font-bold shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                    />
                </div>
            </div>

            {/* Shop Grid */}
            <div className="grid gap-8">
                <AnimatePresence>
                    {filteredShops.length === 0 ? (
                        <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-gray-200 shadow-sm">
                            <Store className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                            <h3 className="text-xl font-black text-gray-400 tracking-tighter uppercase mb-2">NO REGISTRIES FOUND</h3>
                            <p className="text-sm font-bold text-gray-300 uppercase tracking-widest">The sector is completely devoid of shops.</p>
                        </div>
                    ) : (
                        filteredShops.map((shop, index) => (
                            <motion.div
                                key={shop.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.1, duration: 0.4 }}
                            >
                                <Card className="p-8 rounded-[3rem] bg-white border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative group">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-blue-500 transition-all duration-500 opacity-0 group-hover:opacity-100" />
                                    
                                    <div className="flex flex-col xl:flex-row gap-8 items-start">
                                        {/* Shop Meta Data */}
                                        <div className="xl:w-1/3 space-y-8 flex-shrink-0">
                                            <div className="flex items-center gap-5">
                                                <div className="w-20 h-20 rounded-[1.8rem] bg-gray-50 flex items-center justify-center border border-gray-100 shadow-inner shrink-0 group-hover:-translate-y-1 transition-transform duration-500">
                                                    <Store className="w-10 h-10 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                                </div>
                                                <div>
                                                    <h2 className="text-3xl font-black tracking-tighter text-gray-900 uppercase leading-none mb-3">
                                                        {shop.shopName}
                                                    </h2>
                                                    <div className="flex flex-wrap gap-2">
                                                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black uppercase text-[10px] tracking-widest py-1.5 px-3">
                                                            AUTHORIZED NODE
                                                        </Badge>
                                                        {shop.isOnline ? (
                                                            <Badge className="bg-blue-50 text-blue-600 border-blue-100 font-black uppercase text-[10px] tracking-widest py-1.5 px-3 flex items-center gap-1.5">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> LIVE
                                                            </Badge>
                                                        ) : (
                                                            <Badge className="bg-gray-100 text-gray-500 border-gray-200 font-black uppercase text-[10px] tracking-widest py-1.5 px-3">
                                                                OFFLINE
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-sm font-medium text-gray-500 leading-relaxed max-w-sm">
                                                {shop.description}
                                            </p>

                                            <Button
                                                onClick={() => handleDeepPurge(shop.id, shop.shopName, shop.ownerId)}
                                                disabled={purgingId === shop.id}
                                                variant="destructive"
                                                className="w-full h-14 rounded-2xl bg-red-50 hover:bg-red-500 hover:text-white text-red-600 font-black tracking-widest text-[11px] uppercase transition-all shadow-none hover:shadow-xl hover:shadow-red-500/20 group/btn"
                                            >
                                                {purgingId === shop.id ? (
                                                    <div className="flex items-center gap-3">
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        <span className="animate-pulse">{purgeStatus}</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <ShieldAlert className="w-4 h-4 mr-2 group-hover/btn:animate-pulse" />
                                                        Execute Deep Purge
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                        {/* Real-time Subscribed Menu Catalog */}
                                        <div className="xl:w-2/3 w-full bg-gray-50 rounded-[2rem] p-6 border border-gray-100 relative overflow-hidden">
                                            <div className="absolute top-4 right-6 flex items-center gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Syncing Menu</span>
                                            </div>
                                            
                                            <MenuStreamer shopId={shop.id} />
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// Separate component to handle individual isolated shop streams cleanly
function MenuStreamer({ shopId }: { shopId: string }) {
    const [menu, setMenu] = useState<VendorMenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "shops", shopId, "menu"), orderBy("name", "asc"));
        const unsub = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as VendorMenuItem));
            setMenu(items);
            setLoading(false);
        });
        return () => unsub();
    }, [shopId]);

    if (loading) {
        return <div className="h-32 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>;
    }

    if (menu.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-48 text-center opacity-60">
                <Coffee className="w-8 h-8 text-gray-300 mb-3" />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Inventory is Empty</p>
            </div>
        );
    }

    const liveCount = menu.filter((i) => i.available !== false).length;
    const displayedMenu = showAll ? menu : menu.slice(0, 2);

    return (
        <div className="space-y-4">
            <h4 className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <Package className="w-4 h-4" /> {liveCount} Live Items / {menu.length} Total
                </span>
                {menu.length > 2 && (
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                    >
                        {showAll ? "View Less" : "View More"}
                    </button>
                )}
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                {displayedMenu.map((item) => (
                    <div key={item.id} className="bg-white p-3 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors shadow-sm flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                            {item.image || "📦"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-gray-800 text-sm truncate" title={item.name}>{item.name}</h5>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-black text-emerald-600">₹{item.price}</span>
                                {item.available !== false ? (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-green-50 text-green-600 rounded uppercase">Live</span>
                                ) : (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-red-50 text-red-600 rounded uppercase">Out</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
