"use client"

import { useEffect, useState, useMemo } from "react"
import { useVendor } from "@/context/vendor/VendorContext"
import { getDailySummary, getMonthlySummary, subscribeToDailySummary, subscribeToMonthlySummary } from "@/lib/vendor-service"
import type { DailySummary } from "@/lib/types/vendor"
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import {
    TrendingUp, ShoppingBag, IndianRupee, Users, Clock, CreditCard,
    CheckCircle2, XCircle, AlertCircle, ArrowUpRight, ArrowDownRight,
    Flame, BarChart3, ChevronDown,
} from "lucide-react"

type DateRange = "today" | "7days" | "30days"

export default function VendorAnalyticsPage() {
    const { shopId, isDemo } = useVendor()
    const [range, setRange] = useState<DateRange>("today")
    const [todaySummary, setTodaySummary] = useState<DailySummary | null>(null)
    const [monthlySummaries, setMonthlySummaries] = useState<DailySummary[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!shopId) return;

        const unsubDaily = subscribeToDailySummary(shopId, (summary: DailySummary) => {
            setTodaySummary(summary);
            setLoading(false);
        });

        const unsubMonthly = subscribeToMonthlySummary(shopId, (summaries: DailySummary[]) => {
            setMonthlySummaries(summaries);
        });

        return () => {
            unsubDaily();
            unsubMonthly();
        };
    }, [shopId])

    // Aggregated data based on selected range
    const aggregated = useMemo(() => {
        if (!todaySummary) return null
        if (range === "today") return todaySummary

        const days = range === "7days" ? monthlySummaries.slice(0, 7) : monthlySummaries
        if (days.length === 0) return todaySummary

        const totalRevenue = days.reduce((s, d) => s + d.totalRevenue, 0)
        const totalOrders = days.reduce((s, d) => s + d.totalOrders, 0)
        const completedOrders = days.reduce((s, d) => s + d.completedOrders, 0)
        const cancelledOrders = days.reduce((s, d) => s + d.cancelledOrders, 0)
        const onlineRevenue = days.reduce((s, d) => s + d.onlineRevenue, 0)
        const cashRevenue = days.reduce((s, d) => s + d.cashRevenue, 0)
        const newCustomers = days.reduce((s, d) => s + d.newCustomers, 0)
        const returningCustomers = days.reduce((s, d) => s + d.returningCustomers, 0)

        // Merge top selling items
        const itemMap = new Map<string, { name: string; count: number; revenue: number }>()
        days.forEach(d => d.topSellingItems.forEach(item => {
            const existing = itemMap.get(item.name)
            if (existing) {
                existing.count += item.count
                existing.revenue += item.revenue
            } else {
                itemMap.set(item.name, { ...item })
            }
        }))
        const topSellingItems = Array.from(itemMap.values()).sort((a, b) => b.count - a.count)

        // Merge hourly sales
        const hourMap = new Map<string, { hour: string; revenue: number; orders: number }>()
        days.forEach(d => d.hourlySales.forEach(h => {
            const existing = hourMap.get(h.hour)
            if (existing) {
                existing.revenue += h.revenue
                existing.orders += h.orders
            } else {
                hourMap.set(h.hour, { ...h })
            }
        }))
        const hourlySales = Array.from(hourMap.values()).sort((a, b) => {
            const aH = parseInt(a.hour)
            const bH = parseInt(b.hour)
            return aH - bH
        })

        return {
            ...todaySummary,
            totalRevenue,
            totalOrders,
            completedOrders,
            cancelledOrders,
            onlineRevenue,
            cashRevenue,
            newCustomers,
            returningCustomers,
            averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
            topSellingItems,
            hourlySales,
        } as DailySummary
    }, [todaySummary, monthlySummaries, range])

    // Revenue trend chart data
    const revenueTrend = useMemo(() => {
        return monthlySummaries
            .slice(0, 7) // Keep the chart focused on the last 7 days for readability as per prompt wireframe
            .reverse()
            .map(d => ({
                day: new Date(d.date).toLocaleDateString("en-IN", { weekday: "short" }),
                revenue: d.totalRevenue,
                orders: d.totalOrders,
            }))
    }, [monthlySummaries])

    // Hourly data for peak hours chart (filter 6am-11pm for readability)
    const peakHoursData = useMemo(() => {
        if (!aggregated?.hourlySales) return []
        return aggregated.hourlySales
            .filter(h => {
                const hr = parseInt(h.hour)
                return hr >= 6 && hr <= 23
            })
            .map(h => {
                const hr = parseInt(h.hour)
                const label = hr === 0 ? "12 AM" : hr < 12 ? `${hr} AM` : hr === 12 ? "12 PM" : `${hr - 12} PM`
                return { ...h, label }
            })
    }, [aggregated])

    // Payment data for pie chart
    const paymentData = useMemo(() => {
        if (!aggregated) return []
        const total = aggregated.onlineRevenue + aggregated.cashRevenue
        if (total === 0) return [{ name: "No Data", value: 1 }]
        return [
            { name: "UPI", value: aggregated.onlineRevenue },
            { name: "Cash", value: aggregated.cashRevenue },
        ]
    }, [aggregated])

    // Top selling items for bar chart (top 5)
    const topItemsData = useMemo(() => {
        if (!aggregated?.topSellingItems) return []
        return aggregated.topSellingItems.slice(0, 6)
    }, [aggregated])

    // Low selling items (bottom 3)
    const lowItemsData = useMemo(() => {
        if (!aggregated?.topSellingItems || aggregated.topSellingItems.length < 4) return []
        return aggregated.topSellingItems.slice(-3).reverse()
    }, [aggregated])

    const COLORS = {
        primary: "#10B981",
        primaryLight: "#34D399",
        secondary: "#6366F1",
        secondaryLight: "#818CF8",
        accent: "#F59E0B",
        danger: "#EF4444",
        dangerLight: "#FCA5A5",
        text: "#1F2937",
        muted: "#9CA3AF",
        bg: "#F9FAFB",
    }

    const PIE_COLORS = ["#10B981", "#F59E0B"]
    const GRADIENT_ID_REVENUE = "colorRevenue"

    if (loading || !aggregated) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                    <p className="text-sm text-gray-500 font-medium">Loading analytics...</p>
                </div>
            </div>
        )
    }

    const totalCustomers = aggregated.newCustomers + aggregated.returningCustomers
    const returningPct = totalCustomers > 0 ? Math.round((aggregated.returningCustomers / totalCustomers) * 100) : 0
    const pendingOrders = aggregated.totalOrders - aggregated.completedOrders - aggregated.cancelledOrders

    return (
        <div className="space-y-6 pb-8">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Analytics</h1>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Live</span>
                        </div>
                    </div>
                    <p className="text-xs md:text-sm text-gray-500 font-medium">Real-time performance metrics for your shop.</p>
                </div>
                
                {/* Date Filter */}
                <div className="bg-gray-100/80 p-1 rounded-xl flex items-center gap-1 w-fit shadow-inner">
                    {([
                        { key: "today" as DateRange, label: "Today" },
                        { key: "7days" as DateRange, label: "7 Days" },
                        { key: "30days" as DateRange, label: "30 Days" },
                    ]).map(opt => (
                        <button
                            key={opt.key}
                            onClick={() => setRange(opt.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${range === opt.key
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ─── Summary Cards ─── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <SummaryCard
                    title="Total Orders"
                    value={aggregated.totalOrders.toLocaleString("en-IN")}
                    icon={<ShoppingBag className="h-5 w-5" />}
                    gradient="from-blue-500 to-indigo-600"
                    bgLight="bg-blue-50"
                    textColor="text-blue-600"
                    trend="+12%"
                    trendUp
                />
                <SummaryCard
                    title="Revenue"
                    value={`₹${aggregated.totalRevenue.toLocaleString("en-IN")}`}
                    icon={<IndianRupee className="h-5 w-5" />}
                    gradient="from-emerald-500 to-teal-600"
                    bgLight="bg-emerald-50"
                    textColor="text-emerald-600"
                    trend="+8%"
                    trendUp
                />
                <SummaryCard
                    title="Avg Order"
                    value={`₹${aggregated.averageOrderValue.toLocaleString("en-IN")}`}
                    icon={<TrendingUp className="h-5 w-5" />}
                    gradient="from-amber-500 to-orange-600"
                    bgLight="bg-amber-50"
                    textColor="text-amber-600"
                    trend="-2%"
                    trendUp={false}
                />
                <SummaryCard
                    title="Customers"
                    value={totalCustomers.toLocaleString("en-IN")}
                    icon={<Users className="h-5 w-5" />}
                    gradient="from-purple-500 to-violet-600"
                    bgLight="bg-purple-50"
                    textColor="text-purple-600"
                    trend="+5%"
                    trendUp
                />
            </div>

            {/* ─── Revenue Trend ─── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 pb-0 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Revenue Trend</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Last 7 days performance</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Revenue</span>
                    </div>
                </div>
                <div className="p-4 pt-2" style={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                            <defs>
                                <linearGradient id={GRADIENT_ID_REVENUE} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                            <Tooltip
                                contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", boxShadow: "0 4px 6px -1px rgba(0,0,0,.1)" }}
                                formatter={(value: any) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"] as [any, any]}
                            />
                            <Area type="monotone" dataKey="revenue" stroke={COLORS.primary} strokeWidth={3} fill={`url(#${GRADIENT_ID_REVENUE})`} dot={{ fill: COLORS.primary, r: 4 }} activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ─── Top Items + Payment Split ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Top Selling Items */}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 pb-0">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Flame className="h-5 w-5 text-orange-500" /> Top Selling Items
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">Best performers by order count</p>
                    </div>
                    <div className="p-4 pt-2" style={{ height: 280 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topItemsData} layout="vertical" margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                                <YAxis type="category" dataKey="name" width={110} axisLine={false} tickLine={false} tick={{ fill: "#374151", fontSize: 12, fontWeight: 600 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", boxShadow: "0 4px 6px -1px rgba(0,0,0,.1)" }}
                                    formatter={(value: any, name: any) => {
                                        if (name === "count") return [value, "Orders"] as [any, any]
                                        return [`₹${value.toLocaleString("en-IN")}`, "Revenue"] as [any, any]
                                    }}
                                />
                                <Bar dataKey="count" fill={COLORS.primary} radius={[0, 6, 6, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Payment Breakdown */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 pb-0">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-indigo-500" /> Payment Split
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">UPI vs Cash breakdown</p>
                    </div>
                    <div className="p-4 flex items-center justify-center" style={{ height: 280 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={paymentData}
                                    cx="50%" cy="50%"
                                    innerRadius={55} outerRadius={85}
                                    paddingAngle={4}
                                    dataKey="value"
                                    strokeWidth={0}
                                >
                                    {paymentData.map((_, i) => (
                                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB" }}
                                    formatter={(value: any) => [`₹${value.toLocaleString("en-IN")}`, ""] as [any, any]}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    formatter={(value: string) => <span className="text-sm font-semibold text-gray-700">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ─── Peak Hours ─── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 pb-0">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-500" /> Peak Order Hours
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">Orders distributed across the day</p>
                </div>
                <div className="p-4 pt-2" style={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={peakHoursData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 11 }} interval={1} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", boxShadow: "0 4px 6px -1px rgba(0,0,0,.1)" }}
                                formatter={(value: any, name: any) => {
                                    if (name === "orders") return [value, "Orders"] as [any, any]
                                    return [`₹${value.toLocaleString("en-IN")}`, "Revenue"] as [any, any]
                                }}
                            />
                            <Bar dataKey="orders" fill={COLORS.secondary} radius={[4, 4, 0, 0]} barSize={18} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ─── Order Status + Customer Insights ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Order Status */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Order Status</h2>
                    <div className="grid grid-cols-3 gap-3">
                        <StatusCard
                            label="Completed"
                            value={aggregated.completedOrders}
                            icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                            color="bg-emerald-50 border-emerald-100"
                        />
                        <StatusCard
                            label="Cancelled"
                            value={aggregated.cancelledOrders}
                            icon={<XCircle className="h-5 w-5 text-red-500" />}
                            color="bg-red-50 border-red-100"
                        />
                        <StatusCard
                            label="Pending"
                            value={pendingOrders > 0 ? pendingOrders : 0}
                            icon={<AlertCircle className="h-5 w-5 text-amber-500" />}
                            color="bg-amber-50 border-amber-100"
                        />
                    </div>
                    {/* Mini completion rate bar */}
                    <div className="mt-5">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-gray-500 font-medium">Completion Rate</span>
                            <span className="font-bold text-gray-900">
                                {aggregated.totalOrders > 0 ? Math.round((aggregated.completedOrders / aggregated.totalOrders) * 100) : 0}%
                            </span>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700"
                                style={{ width: `${aggregated.totalOrders > 0 ? (aggregated.completedOrders / aggregated.totalOrders) * 100 : 0}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Customer Insights */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Customer Insights</h2>
                    <div className="flex items-center gap-6">
                        {/* Progress Ring */}
                        <div className="relative flex-shrink-0">
                            <svg width="100" height="100" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" stroke="#F3F4F6" strokeWidth="8" fill="none" />
                                <circle
                                    cx="50" cy="50" r="40"
                                    stroke={COLORS.primary}
                                    strokeWidth="8"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeDasharray={`${returningPct * 2.51} ${251 - returningPct * 2.51}`}
                                    transform="rotate(-90 50 50)"
                                    className="transition-all duration-700"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xl font-black text-gray-900">{returningPct}%</span>
                            </div>
                        </div>
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                                    <span className="text-sm font-medium text-gray-700">Returning</span>
                                </div>
                                <span className="text-sm font-bold text-gray-900">{aggregated.returningCustomers}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-gray-200" />
                                    <span className="text-sm font-medium text-gray-700">New</span>
                                </div>
                                <span className="text-sm font-bold text-gray-900">{aggregated.newCustomers}</span>
                            </div>
                            <div className="pt-2 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">Total Customers</span>
                                    <span className="text-sm font-bold text-gray-900">{totalCustomers}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Low Selling Items ─── */}
            {lowItemsData.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Low Performing Items</h2>
                    <p className="text-xs text-gray-500 mb-4">Consider removing or repricing these items</p>
                    <div className="space-y-2">
                        {lowItemsData.map((item, i) => (
                            <div key={i} className="flex items-center justify-between px-4 py-3 bg-red-50/60 border border-red-100 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <span className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-600">
                                        {i + 1}
                                    </span>
                                    <span className="font-semibold text-gray-800 text-sm">{item.name}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-bold text-red-600">{item.count} orders</span>
                                    <span className="text-xs text-gray-400 ml-2">₹{item.revenue.toLocaleString("en-IN")}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ─── Peak Hour Badge ─── */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-5 text-white shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Busiest Time Today</p>
                        <h3 className="text-2xl font-black mt-1">{aggregated.peakHour}</h3>
                        <p className="text-white/60 text-sm mt-0.5">Plan your prep and staffing accordingly</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl backdrop-blur-sm self-start">
                        <Clock className="h-5 w-5" />
                        <span className="font-bold text-sm">Peak Hour</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ─── Sub-components ─── */

function SummaryCard({ title, value, icon, gradient, bgLight, textColor, trend, trendUp }: {
    title: string; value: string; icon: React.ReactNode
    gradient: string; bgLight: string; textColor: string
    trend: string; trendUp: boolean
}) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${bgLight} flex items-center justify-center ${textColor} group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                <div className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-full ${trendUp ? "text-emerald-700 bg-emerald-50" : "text-red-600 bg-red-50"}`}>
                    {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {trend}
                </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{value}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium">{title}</p>
        </div>
    )
}

function StatusCard({ label, value, icon, color }: {
    label: string; value: number; icon: React.ReactNode; color: string
}) {
    return (
        <div className={`${color} border rounded-xl p-3 text-center`}>
            <div className="flex justify-center mb-1">{icon}</div>
            <p className="text-xl font-black text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 font-medium">{label}</p>
        </div>
    )
}
