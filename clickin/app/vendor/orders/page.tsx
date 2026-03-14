"use client"

import { useState, useEffect } from "react"
import { cn, formatRelativeDate } from "@/lib/utils"
import { Check, Clock, ChefHat, ShoppingBag, X, User, Banknote, Smartphone, ArrowRight, Timer, Circle, PlayCircle, Search, Filter, ChevronDown, Eye, Printer, AlertCircle, Link, CheckCircle2, Package, Save } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/input"
import { useVendorAuth } from "@/context/vendor/VendorContext"
import { subscribeToOrders, subscribeToOrderHistory, getOrderHistory, updateOrderStatus, cancelOrder as cancelOrderService, cleanupOldOrders } from "@/lib/vendor-service"
import type { VendorOrder, OrderStatus } from "@/lib/types/vendor"

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
    NEW: { label: "New", color: "text-blue-700", bg: "bg-blue-600", border: "border-blue-700", icon: Circle },
    PREPARING: { label: "Preparing", color: "text-amber-700", bg: "bg-amber-50/40", border: "border-amber-100", icon: PlayCircle },
    READY: { label: "Ready", color: "text-emerald-700", bg: "bg-emerald-50/40", border: "border-emerald-100", icon: Check },
    COMPLETED: { label: "Completed", color: "text-gray-700", bg: "bg-gray-50/40", border: "border-gray-100", icon: Check },
    CANCELLED: { label: "Cancelled", color: "text-red-700", bg: "bg-red-50/40", border: "border-red-100", icon: X },
}

const CANCEL_REASONS = [
    "Customer requested cancellation",
    "Item out of stock",
    "Kitchen too busy",
    "Invalid order details",
    "Duplicate order",
    "Other",
]

export default function VendorOrdersPage() {
    const { shopId, role, shop } = useVendorAuth()
    const [orders, setOrders] = useState<VendorOrder[]>([])
    const [tab, setTab] = useState<"active" | "history">("active")
    const [searchQuery, setSearchQuery] = useState("")
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
    const [cancelModal, setCancelModal] = useState<string | null>(null)
    const [cancelReason, setCancelReason] = useState("")
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL")
    const [historyRange, setHistoryRange] = useState<"TODAY" | "7DAYS" | "1MONTH">("TODAY")

    useEffect(() => {
        if (!shopId) return
        setLoading(true)

        // Trigger automated cleanup for ones older than 1 month
        const isOwner = role === "OWNER" || role === "MANAGER"; 
        if (isOwner) {
            cleanupOldOrders(shopId).catch(err => console.error("Cleanup failed:", err));
        }

        if (tab === "active") {
            const unsubscribe = subscribeToOrders(shopId, (o) => {
                setOrders(o)
                setLoading(false)
            })
            return () => unsubscribe()
        } else {
            const unsubscribe = subscribeToOrderHistory(shopId, (o) => {
                setOrders(o)
                setLoading(false)
            }, historyRange)
            return () => unsubscribe()
        }
    }, [shopId, tab, historyRange])

    const handleUpdateStatus = (id: string, newStatus: OrderStatus) => {
        // Optimistic UI updates are okay but Firestore listener will sync automatically
        updateOrderStatus(id, newStatus)
    }

    const handleCancelOrder = (id: string) => {
        if (!cancelReason) return
        setOrders(orders.map(o => o.id === id ? { ...o, status: "CANCELLED" as OrderStatus, cancelReason, updatedAt: new Date().toISOString() } : o))
        cancelOrderService(id, cancelReason, role || "STAFF")
        setCancelModal(null)
        setCancelReason("")
    }

    const handlePrintReceipt = (order: VendorOrder) => {
        const printWindow = window.open("", "_blank")
        if (!printWindow) return
        printWindow.document.write(`
            <html><head><title>Receipt - ${order.id}</title>
            <style>body{font-family:monospace;padding:20px;max-width:300px;margin:auto}
            h2{text-align:center;margin-bottom:5px}
            .line{border-top:1px dashed #ccc;margin:8px 0}
            table{width:100%;border-collapse:collapse}
            td{padding:2px 0}
            .right{text-align:right}
            .bold{font-weight:bold}
            .center{text-align:center}
            </style></head><body>
            <h2>ORDER RECEIPT</h2>
            <p class="center">${order.id}</p>
            <div class="line"></div>
            <table>
                <tr><td>Customer:</td><td class="right">${order.customerName}</td></tr>
                <tr><td>Type:</td><td class="right">${order.orderType}</td></tr>
                ${order.tableNumber ? `<tr><td>Table:</td><td class="right">${order.tableNumber}</td></tr>` : ""}
                <tr><td>Payment:</td><td class="right">${order.payment}</td></tr>
                <tr><td>Time:</td><td class="right">${new Date(order.createdAt).toLocaleTimeString()}</td></tr>
            </table>
            <div class="line"></div>
            <table>
                <tr class="bold"><td>Item</td><td class="right">Qty</td><td class="right">Amt</td></tr>
                ${order.items.map(item => `<tr><td>${item.name}</td><td class="right">${item.quantity}</td><td class="right">₹${item.price * item.quantity}</td></tr>`).join("")}
            </table>
            <div class="line"></div>
            <table>
                <tr class="bold"><td>Total</td><td class="right">₹${order.total}</td></tr>
            </table>
            <div class="line"></div>
            <p class="center" style="font-size:10px">Thank you! Visit again.</p>
            </body></html>
        `)
        printWindow.document.close()
        printWindow.print()
    }

    const filteredOrders = orders.filter(o => {
        // Apply Search Filter First
        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            const matchesSearch = o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.items.some(i => i.name.toLowerCase().includes(q))
            if (!matchesSearch) return false
        }
        
        // Apply Status Filter
        if (statusFilter !== "ALL") {
            return o.status === statusFilter
        }
        
        return true
    })

    // Calculate metrics for the ribbon
    const allOrders = orders.filter(o => o.status !== "CANCELLED").length
    const newOrders = orders.filter(o => o.status === "NEW").length
    const preparingOrders = orders.filter(o => o.status === "PREPARING").length
    const readyOrders = orders.filter(o => o.status === "READY").length
    // We don't have access to totalMenuItems or availableItems directly in this file
    // without subscribing to the menu items, so I will hide the 'Menu Active' badge
    // or keep it static if it was already static. In the user code it was referencing
    // undefined variables because it was copied from the dashboard. I'll remove it 
    // to strictly solve the filter issue without causing reference errors.

    // Order Progress Stepper
    const OrderProgress = ({ status }: { status: OrderStatus }) => {
        const steps = ["NEW", "PREPARING", "READY", "COMPLETED"] as OrderStatus[]
        const currentIndex = steps.indexOf(status)
        if (status === "CANCELLED") {
            return <div className="flex items-center gap-1 text-xs text-red-600 font-bold"><X className="h-3 w-3" /> Cancelled</div>
        }
        return (
            <div className="flex items-center gap-1">
                {steps.map((step, i) => (
                    <div key={step} className="flex items-center">
                        <div className={cn(
                            "h-2 w-2 rounded-full transition-all",
                            i <= currentIndex ? "bg-emerald-500 scale-110" : "bg-gray-200"
                        )} />
                        {i < steps.length - 1 && (
                            <div className={cn("h-[2px] w-4 md:w-6", i < currentIndex ? "bg-emerald-500" : "bg-gray-200")} />
                        )}
                    </div>
                ))}
            </div>
        )
    }

    // Veg/Non-Veg Icon
    const VegIcon = ({ isVeg }: { isVeg: boolean }) => (
        <div className={cn("h-4 w-4 border-2 rounded-sm flex items-center justify-center", isVeg ? "border-emerald-600" : "border-red-600")}>
            <div className={cn("h-1.5 w-1.5 rounded-full", isVeg ? "bg-emerald-600" : "bg-red-600")} />
        </div>
    )

    const getNextStatus = (current: OrderStatus): OrderStatus | null => {
        switch (current) {
            case "NEW": return "PREPARING"
            case "PREPARING": return "READY"
            case "READY": return "COMPLETED"
            default: return null
        }
    }

    const getNextStatusLabel = (current: OrderStatus): string => {
        switch (current) {
            case "NEW": return "Accept & Prepare"
            case "PREPARING": return "Mark Ready"
            case "READY": return "Complete"
            default: return ""
        }
    }

    return (
        <div className="space-y-6 pb-20 md:pb-0 relative min-h-screen">
            {shop?.isOnline === false && (
                <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-md flex items-center justify-center rounded-2xl">
                    <div className="bg-red-50 border border-red-200 p-8 rounded-[2rem] shadow-2xl max-w-md text-center animate-in zoom-in-95 pointer-events-auto">
                        <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                            <AlertCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="text-2xl font-black text-red-900 mb-3 tracking-tighter">Kitchen is Offline</h3>
                        <p className="text-base font-medium text-red-700 leading-relaxed">
                            The shop is currently closed. You cannot accept or manage new orders right now. <br /><br />
                            An Owner or Manager needs to turn the shop online from the Dashboard to resume operations.
                        </p>
                    </div>
                </div>
            )}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Orders</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
                            <div className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </div>
                            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Live Sync</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Manage incoming and past orders.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        onClick={() => {}}
                        className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm active:scale-95"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        Save Sync
                    </Button>
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-10 bg-white"
                        />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-gray-50/80 p-1.5 rounded-2xl flex w-fit border border-gray-100 mb-6">
                <button
                    onClick={() => { setTab("active"); setStatusFilter("ALL"); }}
                    className={cn("px-5 py-2.5 rounded-xl text-sm font-bold transition-all", tab === "active" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}
                >
                    Active Orders
                </button>
                <button
                    onClick={() => { setTab("history"); setStatusFilter("ALL"); }}
                    className={cn("px-5 py-2.5 rounded-xl text-sm font-bold transition-all", tab === "history" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}
                >
                    Order History
                </button>
            </div>
            
            {/* Live Order Ribbon (Filters) dont show it for the order history */}
            {tab === "active" && (
                <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-1 px-1 pb-4 border-b border-gray-200 mb-6">
                    <button 
                        onClick={() => setStatusFilter("ALL")}
                        className={cn(
                            "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all whitespace-nowrap",
                            statusFilter === "ALL" ? "bg-gray-100 border-gray-200 text-gray-900 shadow-sm" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 gap-2"
                        )}
                    >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        <span>{allOrders} All</span>
                    </button>
                    <button 
                        onClick={() => setStatusFilter("NEW")}
                        className={cn(
                            "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all whitespace-nowrap",
                            statusFilter === "NEW" ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm" : "bg-white border-blue-100 text-blue-600 hover:bg-blue-50"
                        )}
                    >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        <span>{newOrders} New</span>
                    </button>
                    <button 
                        onClick={() => setStatusFilter("PREPARING")}
                        className={cn(
                            "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all whitespace-nowrap",
                            statusFilter === "PREPARING" ? "bg-amber-50 border-amber-200 text-amber-700 shadow-sm" : "bg-white border-amber-100 text-amber-600 hover:bg-amber-50"
                        )}
                    >
                        <ChefHat className="h-3.5 w-3.5" />
                        <span>{preparingOrders} Preparing</span>
                    </button>
                    <button 
                        onClick={() => setStatusFilter("READY")}
                        className={cn(
                            "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all whitespace-nowrap",
                            statusFilter === "READY" ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm" : "bg-white border-emerald-100 text-emerald-600 hover:bg-emerald-50"
                        )}
                    >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{readyOrders} Ready</span>
                    </button>
                </div>
            )}

            {/* Time Filter for History */}
            {tab === "history" && (
                <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-1 px-1 pb-4 border-b border-gray-200 mb-6">
                    {(["TODAY", "7DAYS", "1MONTH"] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setHistoryRange(range)}
                            className={cn(
                                "flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-xs font-bold transition-all whitespace-nowrap",
                                historyRange === range
                                    ? "bg-gray-100 border-gray-200 text-gray-900 shadow-sm"
                                    : "bg-white border-gray-100 text-gray-500 hover:bg-gray-50"
                            )}
                        >
                            <Clock className="h-3.5 w-3.5" />
                            {range === "TODAY" ? "Today" : range === "7DAYS" ? "Last 7 Days" : "Last 1 Month"}
                        </button>
                    ))}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="h-8 w-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <ShoppingBag className="h-12 w-12 text-gray-300 mb-3" />
                    <h3 className="font-bold text-gray-800">No orders found</h3>
                    <p className="text-sm text-gray-500 mt-1">{tab === "active" ? "All caught up! No active orders." : "No past orders to show."}</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(
                        filteredOrders.reduce((groups, order) => {
                            const dateStr = formatRelativeDate(order.createdAt);
                            if (!groups[dateStr]) groups[dateStr] = [];
                            groups[dateStr].push(order);
                            return groups;
                        }, {} as Record<string, typeof filteredOrders>)
                    ).map(([dateLabel, dateOrders]) => (
                        <div key={dateLabel} className="space-y-4">
                            {/* Date Header */}
                            <div className="flex items-center gap-3 w-full">
                                <h3 className="font-bold text-gray-900 text-sm bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">{dateLabel} Orders</h3>
                                <div className="h-px flex-1 bg-gray-200" />
                            </div>

                            {dateOrders.map((order) => {
                                const config = STATUS_CONFIG[order.status]
                                const StatusIcon = config.icon
                                const isExpanded = expandedOrder === order.id
                                const nextStatus = getNextStatus(order.status)
                                const dateObj = new Date(order.createdAt)
                                const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                const displayDate = tab === "history" 
                                    ? formattedTime
                                    : `${Math.round((Date.now() - dateObj.getTime()) / 60000)}m ago`

                                return (
                                    <div 
                                        key={order.id} 
                                        className={cn(
                                            "rounded-3xl border transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md", 
                                            config.bg, 
                                            config.border, 
                                            order.status === "NEW" && "text-white",
                                            isExpanded && "ring-4 ring-black/5 shadow-xl"
                                        )}
                                    >
                                        {/* Clickable Header Area */}
                                        <div
                                            className="p-5 cursor-pointer hover:bg-black/5 transition-colors"
                                            onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-xl font-black text-gray-900 tracking-tight leading-none">{order.id}</span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="outline" className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm", order.status === "NEW" ? "bg-white/20 text-white border-white/30" : `bg-white ${config.color} ${config.border}`)}>
                                                            <StatusIcon className="h-3 w-3 mr-1" /> {config.label}
                                                        </Badge>
                                                        <Badge variant="outline" className={cn("text-[10px] font-bold border px-2 py-0.5 rounded-full", order.status === "NEW" ? "bg-white/10 text-blue-50 border-white/20" : "bg-white text-gray-600 border-gray-200")}>
                                                            {order.orderType}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className={cn("flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-lg", order.status === "NEW" ? "bg-white/20 text-white" : "text-gray-500 bg-white/60")}>
                                                        <Clock className="h-3 w-3" /> {displayDate}
                                                    </div>
                                                    <ChevronDown className={cn("h-4 w-4 transition-transform mt-1", order.status === "NEW" ? "text-white/60" : "text-gray-400", isExpanded && "rotate-180")} />
                                                </div>
                                            </div>

                                            {/* Items Preview */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-gray-100 text-sm shadow-sm">
                                                        {item.isVeg ? (
                                                            <div className="flex items-center justify-center shrink-0">
                                                                <div className="h-3.5 w-3.5 border border-emerald-600 rounded-sm flex items-center justify-center">
                                                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-center shrink-0">
                                                                <div className="h-3.5 w-3.5 border border-red-600 rounded-[4px] flex items-center justify-center">
                                                                    <div className="h-[5px] w-[5px] rounded-full bg-red-600" />
                                                                </div>
                                                            </div>
                                                        )}
                                                        <span className="font-bold text-gray-800">{item.name}</span>
                                                        <span className="text-gray-400 font-medium">×{item.quantity}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between mt-2">
                                                <div className={cn("flex items-center gap-4 text-xs font-bold", order.status === "NEW" ? "text-blue-100" : "text-gray-500")}>
                                                    <span className="flex items-center gap-1.5"><User className={cn("h-3.5 w-3.5", order.status === "NEW" ? "text-blue-200" : "text-gray-400")} /> {order.customerName}</span>
                                                    <span className="flex items-center gap-1.5">
                                                        {order.payment === "UPI" ? <Smartphone className={cn("h-3.5 w-3.5", order.status === "NEW" ? "text-blue-200" : "text-gray-400")} /> : <Banknote className={cn("h-3.5 w-3.5", order.status === "NEW" ? "text-blue-200" : "text-gray-400")} />}
                                                        {order.payment}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <OrderProgress status={order.status} />
                                                    <span className={cn("text-xl font-black tracking-tighter", order.status === "NEW" ? "text-white" : "text-gray-900")}>₹{order.total}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Detail View */}
                                        {isExpanded && (
                                            <div className="border-t border-gray-200/50 bg-white/50 backdrop-blur-sm animate-in slide-in-from-top-2 duration-200">
                                                <div className="p-5 space-y-4">
                                                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                                        <div className="grid grid-cols-2 gap-4 text-sm mb-4 pb-4 border-b border-gray-100">
                                                            <div>
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Customer</p>
                                                                <p className="font-bold text-gray-900">{order.customerName}</p>
                                                                <p className="font-medium text-gray-500 text-xs mt-0.5">{order.customerPhone}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Order Info</p>
                                                                <p className="font-bold text-gray-900">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                                <p className="font-medium text-gray-500 text-xs mt-0.5">{order.payment} • {order.orderType}</p>
                                                            </div>
                                                        </div>

                                                        <table className="w-full text-sm">
                                                            <thead>
                                                                <tr className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                                    <th className="text-left pb-3">Item</th>
                                                                    <th className="text-center pb-3">Qty</th>
                                                                    <th className="text-right pb-3">Price</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-50">
                                                                {order.items.map((item, idx) => (
                                                                    <tr key={idx}>
                                                                        <td className="py-2.5 flex items-center gap-2">
                                                                            <VegIcon isVeg={item.isVeg} />
                                                                            <span className="font-bold text-gray-800">{item.name}</span>
                                                                            {item.specialInstructions && (
                                                                                <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Note</span>
                                                                            )}
                                                                        </td>
                                                                        <td className="py-2.5 text-center font-bold text-gray-600">{item.quantity}</td>
                                                                        <td className="py-2.5 text-right font-bold text-gray-900">₹{item.price * item.quantity}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>

                                                        {order.specialInstructions && (
                                                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm mt-3">
                                                                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1">Special Instructions</p>
                                                                <p className="text-amber-900 font-medium">{order.specialInstructions}</p>
                                                            </div>
                                                        )}

                                                        <div className="border-t border-gray-100 mt-4 pt-3 flex justify-between font-black text-gray-900 text-lg">
                                                            <span>Total Amount</span>
                                                            <span className="text-emerald-600">₹{order.total}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => handlePrintReceipt(order)}
                                                            className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-bold border-gray-200"
                                                        >
                                                            <Printer className="h-4 w-4 mr-2 text-gray-500" /> Print Receipt
                                                        </Button>
                                                        {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => setCancelModal(order.id)}
                                                                className="flex-none bg-white text-red-600 border-gray-200 hover:bg-red-50 hover:border-red-200 font-bold px-4"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Quick Actions (Collapsed only) */}
                                        {!isExpanded && nextStatus && (
                                            <div className={cn("px-5 py-3.5 flex items-center justify-between border-t transition-colors", order.status === "NEW" ? "border-white/10 bg-black/10" : `${config.border} bg-white/40`)}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order.id, nextStatus) }}
                                                    className={cn("flex items-center gap-2 text-sm font-bold transition-colors", order.status === "NEW" ? "text-white hover:text-blue-100" : "text-emerald-600 hover:text-emerald-700")}
                                                >
                                                    <ArrowRight className="h-4 w-4" /> {getNextStatusLabel(order.status)}
                                                </button>
                                                {order.status === "NEW" && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setCancelModal(order.id) }}
                                                        className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors bg-white px-3 py-1 rounded-lg border border-red-100 shadow-sm"
                                                    >
                                                        Reject
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>
            )}

            {/* Cancel Modal */}
            {cancelModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setCancelModal(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Cancel Order</h3>
                                <p className="text-sm text-gray-500">Select a reason for cancellation</p>
                            </div>
                        </div>

                        <div className="space-y-2 mb-4">
                            {CANCEL_REASONS.map(reason => (
                                <button
                                    key={reason}
                                    onClick={() => setCancelReason(reason)}
                                    className={cn(
                                        "w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                                        cancelReason === reason
                                            ? "border-red-500 bg-red-50 text-red-700"
                                            : "border-gray-200 hover:border-gray-300 text-gray-700"
                                    )}
                                >
                                    {reason}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => { setCancelModal(null); setCancelReason("") }}>
                                Go Back
                            </Button>
                            <Button
                                className="flex-1 bg-red-600 hover:bg-red-700 font-bold"
                                disabled={!cancelReason}
                                onClick={() => handleCancelOrder(cancelModal)}
                            >
                                Confirm Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
