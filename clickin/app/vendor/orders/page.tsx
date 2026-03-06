"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Check, Clock, ChefHat, ShoppingBag, X, User, Banknote, Smartphone, ArrowRight, Timer, Circle, PlayCircle, Search, Filter, ChevronDown, Eye, Printer, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/input"
import { useVendorAuth } from "@/context/vendor/VendorContext"
import { subscribeToOrders, getOrderHistory, updateOrderStatus, cancelOrder as cancelOrderService } from "@/lib/vendor-service"
import type { VendorOrder, OrderStatus } from "@/lib/types/vendor"

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    NEW: { label: "New", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: Circle },
    PREPARING: { label: "Preparing", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: PlayCircle },
    READY: { label: "Ready", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: Check },
    COMPLETED: { label: "Completed", color: "text-gray-700", bg: "bg-gray-50 border-gray-200", icon: Check },
    CANCELLED: { label: "Cancelled", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: X },
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

    useEffect(() => {
        if (!shopId) return
        setLoading(true)

        if (tab === "active") {
            const unsubscribe = subscribeToOrders(shopId, (o) => {
                setOrders(o)
                setLoading(false)
            })
            return () => unsubscribe()
        } else {
            getOrderHistory(shopId).then(o => {
                setOrders(o)
                setLoading(false)
            })
        }
    }, [shopId, tab])

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
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        return o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.items.some(i => i.name.toLowerCase().includes(q))
    })

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
            <div className="bg-gray-100 p-1 rounded-xl flex w-fit">
                <button
                    onClick={() => setTab("active")}
                    className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", tab === "active" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500")}
                >
                    Active Orders
                </button>
                <button
                    onClick={() => setTab("history")}
                    className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", tab === "history" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500")}
                >
                    Order History
                </button>
            </div>

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
                <div className="space-y-4">
                    {filteredOrders.map((order) => {
                        const config = STATUS_CONFIG[order.status]
                        const StatusIcon = config.icon
                        const isExpanded = expandedOrder === order.id
                        const nextStatus = getNextStatus(order.status)
                        const timeSince = Math.round((Date.now() - new Date(order.createdAt).getTime()) / 60000)

                        return (
                            <div key={order.id} className={cn("bg-white rounded-2xl border shadow-sm overflow-hidden transition-all", config.bg)}>
                                {/* Order Header */}
                                <div
                                    className="p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-black text-gray-900">{order.id}</span>
                                            <Badge variant="outline" className={cn("text-[10px] font-bold", config.color, config.bg)}>
                                                <StatusIcon className="h-3 w-3 mr-1" /> {config.label}
                                            </Badge>
                                            <Badge variant="outline" className="text-[10px] font-medium bg-white">
                                                {order.orderType}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Clock className="h-3 w-3" /> {timeSince}m ago
                                            <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
                                        </div>
                                    </div>

                                    {/* Items Preview */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-gray-100 text-sm">
                                                <VegIcon isVeg={item.isVeg} />
                                                <span className="font-medium text-gray-800">{item.name}</span>
                                                <span className="text-gray-400">×{item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span className="flex items-center gap-1"><User className="h-3 w-3" /> {order.customerName}</span>
                                            <span className="flex items-center gap-1">
                                                {order.payment === "UPI" ? <Smartphone className="h-3 w-3" /> : <Banknote className="h-3 w-3" />}
                                                {order.payment}
                                            </span>
                                            {order.tableNumber && <span className="font-bold text-gray-700">🪑 {order.tableNumber}</span>}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <OrderProgress status={order.status} />
                                            <span className="text-lg font-black text-gray-900">₹{order.total}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Detail View */}
                                {isExpanded && (
                                    <div className="border-t border-gray-200 bg-white animate-in slide-in-from-top-2 duration-200">
                                        <div className="p-4 space-y-4">
                                            {/* Customer Info */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase">Customer</p>
                                                    <p className="font-bold text-gray-900">{order.customerName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase">Phone</p>
                                                    <p className="font-medium text-gray-700">{order.customerPhone}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase">Order Time</p>
                                                    <p className="font-medium text-gray-700">{new Date(order.createdAt).toLocaleTimeString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase">Payment</p>
                                                    <p className="font-medium text-gray-700">{order.payment} • {order.orderType}</p>
                                                </div>
                                            </div>

                                            {/* Itemized Table */}
                                            <div className="bg-gray-50 rounded-xl p-3">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="text-xs text-gray-400 font-bold uppercase">
                                                            <th className="text-left pb-2">Item</th>
                                                            <th className="text-center pb-2">Qty</th>
                                                            <th className="text-right pb-2">Price</th>
                                                            <th className="text-right pb-2">Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {order.items.map((item, idx) => (
                                                            <tr key={idx}>
                                                                <td className="py-2 flex items-center gap-2">
                                                                    <VegIcon isVeg={item.isVeg} />
                                                                    <span className="font-medium">{item.name}</span>
                                                                    {item.specialInstructions && (
                                                                        <span className="text-[10px] text-amber-600 bg-amber-50 px-1 rounded">Note</span>
                                                                    )}
                                                                </td>
                                                                <td className="py-2 text-center font-bold">{item.quantity}</td>
                                                                <td className="py-2 text-right text-gray-500">₹{item.price}</td>
                                                                <td className="py-2 text-right font-bold">₹{item.price * item.quantity}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                <div className="border-t border-gray-200 mt-2 pt-2 space-y-1 text-sm">
                                                    <div className="flex justify-between font-black text-gray-900 text-base"><span>Total</span><span>₹{order.total}</span></div>
                                                </div>
                                            </div>

                                            {/* Special Instructions */}
                                            {order.specialInstructions && (
                                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm">
                                                    <p className="text-xs font-bold text-amber-700 uppercase mb-1">Special Instructions</p>
                                                    <p className="text-amber-900">{order.specialInstructions}</p>
                                                </div>
                                            )}

                                            {/* Cancel Reason */}
                                            {order.status === "CANCELLED" && order.cancelReason && (
                                                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm">
                                                    <p className="text-xs font-bold text-red-700 uppercase mb-1">Cancellation Reason</p>
                                                    <p className="text-red-900">{order.cancelReason}</p>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex flex-wrap gap-2">
                                                {nextStatus && (
                                                    <Button
                                                        onClick={() => handleUpdateStatus(order.id, nextStatus)}
                                                        className="bg-emerald-600 hover:bg-emerald-700 font-bold"
                                                    >
                                                        <ArrowRight className="h-4 w-4 mr-1" /> {getNextStatusLabel(order.status)}
                                                    </Button>
                                                )}
                                                {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setCancelModal(order.id)}
                                                        className="text-red-600 border-red-200 hover:bg-red-50 font-bold"
                                                    >
                                                        <X className="h-4 w-4 mr-1" /> Cancel
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handlePrintReceipt(order)}
                                                    className="font-bold"
                                                >
                                                    <Printer className="h-4 w-4 mr-1" /> Print Receipt
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Quick Action Bar (collapsed) */}
                                {!isExpanded && nextStatus && (
                                    <div className="border-t border-gray-100 px-4 py-2 flex items-center justify-between bg-white">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order.id, nextStatus) }}
                                            className="flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                                        >
                                            <ArrowRight className="h-4 w-4" /> {getNextStatusLabel(order.status)}
                                        </button>
                                        {order.status === "NEW" && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setCancelModal(order.id) }}
                                                className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors"
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
