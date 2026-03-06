"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth/AuthContext";
import { db } from "@/lib/firebase";
import {
    collection,
    query,
    where,
    onSnapshot,
    getDocs,
    limit,
    orderBy,
    Timestamp
} from "firebase/firestore";
import {
    Users,
    Store,
    Activity,
    CreditCard,
    Clock,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    Zap,
    ArrowUpRight,
    Search,
    Target,
    ShieldCheck,
    ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type DashboardStats = {
    totalUsers: number;
    activeVendors: number;
    pendingApprovals: number;
    totalRevenue: number;
    todayOrders: number;
};

type ActivityLog = {
    id: string;
    type: "vendor_signup" | "staff_signup" | "order_placed" | "vendor_approved";
    content: string;
    timestamp: any;
};

export default function AdminDashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        activeVendors: 0,
        pendingApprovals: 0,
        totalRevenue: 0,
        todayOrders: 0
    });
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Real-time listener for users/vendors
        const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
            const users = snapshot.docs;
            const activeVendors = users.filter(u => u.data().role === "vendor_owner" && u.data().status === "active").length;
            const pendingVendors = users.filter(u => u.data().role === "vendor_owner" && u.data().status === "pending").length;

            setStats(prev => ({
                ...prev,
                totalUsers: users.length,
                activeVendors,
                pendingApprovals: pendingVendors // (will add staff later)
            }));
        });

        // Real-time listener for staff requests to add to pending count
        const unsubStaff = onSnapshot(query(collection(db, "staff_requests"), where("status", "==", "pending")), (snapshot) => {
            setStats(prev => ({
                ...prev,
                pendingApprovals: prev.pendingApprovals + snapshot.docs.length
            }));
        });

        // Real-time listener for orders
        const unsubOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
            const orders = snapshot.docs;
            const revenue = orders
                .filter(o => o.data().status === "completed")
                .reduce((sum, o) => sum + (o.data().totalAmount || 0), 0);

            const today = new Date().toISOString().split('T')[0];
            const todayOrders = orders.filter(o => {
                const date = o.data().createdAt;
                if (!date) return false;
                return date.startsWith(today);
            }).length;

            setStats(prev => ({
                ...prev,
                totalRevenue: revenue,
                todayOrders
            }));
        });

        // Mock activities (In a real app, you'd pull this from an admin_logs collection)
        setActivities([
            { id: "1", type: "vendor_signup", content: "New vendor 'Bistro One' requested approval", timestamp: new Date() },
            { id: "2", type: "order_placed", content: "Order #9021 completed - ₹1,240.00", timestamp: new Date(Date.now() - 3600000) },
            { id: "3", type: "vendor_approved", content: "Vendor 'Green Grocers' approved", timestamp: new Date(Date.now() - 7200000) },
        ]);

        setLoading(false);
        return () => {
            unsubUsers();
            unsubStaff();
            unsubOrders();
        };
    }, []);

    const statCards = [
        {
            title: "Global Revenue",
            value: `₹${stats.totalRevenue.toLocaleString()}`,
            icon: CreditCard,
            trend: "+12.5%",
            color: "from-emerald-600 to-teal-600",
            shadow: "shadow-emerald-200"
        },
        {
            title: "Active Nodes",
            value: stats.activeVendors.toString(),
            icon: Store,
            trend: stats.pendingApprovals > 0 ? `${stats.pendingApprovals} Pending` : "Stable",
            color: "from-blue-600 to-indigo-600",
            shadow: "shadow-blue-200"
        },
        {
            title: "Live Velocity",
            value: stats.todayOrders.toString(),
            icon: Zap,
            trend: "Peak: 24/hr",
            color: "from-orange-500 to-red-500",
            shadow: "shadow-orange-200"
        },
        {
            title: "User Matrix",
            value: stats.totalUsers.toString(),
            icon: Users,
            trend: "Active Now",
            color: "from-purple-600 to-pink-600",
            shadow: "shadow-purple-200"
        },
    ];

    if (loading) return null;

    return (
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-10">
            {/* Mission Control Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">Operations Alpha</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 leading-[0.9]">MISSION<br />CONTROL</h1>
                    <p className="text-gray-500 font-bold max-w-md text-sm uppercase tracking-widest opacity-60">System-wide operational oversight</p>
                </div>

                <div className="flex items-center gap-4 bg-white p-3 rounded-3xl shadow-xl shadow-gray-100 border border-gray-100">
                    <div className="px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Network</span>
                        <span className="text-sm font-black text-gray-900">HEALTHY</span>
                    </div>
                    <div className="px-4 py-2 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-200 flex flex-col items-center">
                        <span className="text-[9px] font-black text-white/70 uppercase tracking-widest">Latency</span>
                        <span className="text-sm font-black">24ms</span>
                    </div>
                </div>
            </div>

            {/* Matrix Stats */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                    >
                        <Card className={cn(
                            "group relative h-48 border-none overflow-hidden transition-all duration-500 hover:-translate-y-2 cursor-pointer shadow-xl",
                            stat.shadow
                        )}>
                            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-[0.92] z-0", stat.color)} />
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <stat.icon className="w-24 h-24 text-white" />
                            </div>

                            <CardContent className="relative z-10 h-full p-8 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">{stat.title}</p>
                                        <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-lg">
                                            <stat.icon className="h-4 w-4 text-white" />
                                        </div>
                                    </div>
                                    <h3 className="text-4xl font-black text-white tracking-tighter leading-none">{stat.value}</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-white/20 text-white text-[9px] font-black px-2 py-1 rounded-md backdrop-blur-md">
                                        {stat.trend}
                                    </span>
                                    <TrendingUp className="h-3 w-3 text-white/50" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
                {/* Live Activity Feed */}
                <Card className="lg:col-span-8 border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] bg-white overflow-hidden">
                    <CardHeader className="p-8 border-b border-gray-50 bg-gray-50/50 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-black tracking-tight">PLATFORM FEED</CardTitle>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Real-time signal processing</p>
                        </div>
                        <Badge className="bg-emerald-500 text-white border-none py-1.5 px-4 rounded-xl font-bold uppercase text-[9px] tracking-widest">LIVE DATA</Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-gray-50">
                            {activities.map((activity, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={activity.id}
                                    className="p-6 flex items-start gap-6 hover:bg-gray-50/80 transition-all group"
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
                                        activity.type === 'order_placed' ? 'bg-emerald-50 text-emerald-600' :
                                            activity.type === 'vendor_signup' ? 'bg-amber-50 text-amber-600' :
                                                'bg-blue-50 text-blue-600'
                                    )}>
                                        {activity.type === 'order_placed' ? <Target className="w-6 h-6" /> :
                                            activity.type === 'vendor_signup' ? <TrendingUp className="w-6 h-6" /> :
                                                <Activity className="w-6 h-6" />}
                                    </div>
                                    <div className="flex-1 min-w-0 py-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-base font-bold text-gray-900 tracking-tight">{activity.content}</p>
                                            <span className="text-[10px] font-black text-gray-300 uppercase">{activity.timestamp.toLocaleTimeString()}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Status: Success</span>
                                            <div className="h-1 w-1 rounded-full bg-emerald-500" />
                                            <span className="text-[10px] font-bold text-gray-400 leading-none">Internal Hub #104</span>
                                        </div>
                                    </div>
                                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white rounded-xl shadow-sm border border-gray-100 active:scale-95">
                                        <ArrowUpRight className="w-4 h-4 text-gray-900" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Sector Control */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] bg-gray-900 text-white p-8 relative overflow-hidden h-full flex flex-col">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <div className="relative z-10 space-y-8 flex-1">
                            <div>
                                <h3 className="text-2xl font-black tracking-tight mb-2">SECTOR CONTROL</h3>
                                <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Unified management nodes</p>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => window.location.href = '/admin/vendors'}
                                    className="w-full flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/5 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                                            <Store className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-black uppercase tracking-widest">Vendors</p>
                                            <p className="text-[10px] font-medium text-white/50">{stats.pendingApprovals} Pending Approval</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-white/30" />
                                </button>

                                <button className="w-full flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/5 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Users className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-black uppercase tracking-widest">User Base</p>
                                            <p className="text-[10px] font-medium text-white/50">Audit User Rights</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-white/30" />
                                </button>

                                <button className="w-full flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/5 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Activity className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-black uppercase tracking-widest">Analytics</p>
                                            <p className="text-[10px] font-medium text-white/50">Export System Log</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-white/30" />
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 relative z-10">
                            <div className="p-6 bg-emerald-600 rounded-3xl flex items-center justify-between shadow-xl shadow-emerald-500/30">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/60">System Core</p>
                                    <p className="text-lg font-black italic">ACTIVE</p>
                                </div>
                                <ShieldCheck className="w-8 h-8 text-white/30" />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
