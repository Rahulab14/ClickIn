"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/badge"
import { 
    CreditCard, 
    DollarSign, 
    ArrowUpRight, 
    ArrowDownLeft, 
    History, 
    Banknote, 
    Wallet, 
    Smartphone, 
    Lock, 
    CheckCircle2, 
    TrendingUp,
    Download,
    Save
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useVendorAuth } from "@/context/vendor/VendorContext"
import { getSettings, updateSettings, getTransactions, updateShop, subscribeToSettings, subscribeToTransactions } from "@/lib/vendor-service"
import type { VendorSettings, VendorTransaction } from "@/lib/types/vendor"

type TabType = "history" | "payouts" | "methods"

export default function VendorPaymentsPage() {
    const { shopId, shop } = useVendorAuth()
    const [activeTab, setActiveTab] = useState<TabType>("history")
    const [settings, setSettings] = useState<VendorSettings | null>(null)
    const [transactions, setTransactions] = useState<VendorTransaction[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isSaved, setIsSaved] = useState(false)
    const [upiError, setUpiError] = useState<string | null>(null)

    useEffect(() => {
        if (!shopId) return;

        const unsubSettings = subscribeToSettings(shopId, (data: VendorSettings) => {
            setSettings(data);
            setIsLoading(false);
        });

        const unsubTransactions = subscribeToTransactions(shopId, (data: VendorTransaction[]) => {
            setTransactions(data);
        });

        return () => {
            unsubSettings();
            unsubTransactions();
        };
    }, [shopId])

    const validateUpi = (upi: string) => {
        return /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upi)
    }

    const handleSaveSettings = async () => {
        if (!shopId || !settings) return
        
        if (settings.upiId && !validateUpi(settings.upiId)) {
            setUpiError("Please enter a valid UPI ID")
            return
        }

        setIsSaving(true)
        setIsSaved(false)
        try {
            await updateSettings(shopId, settings)
            // Sync UPI ID with the shop document for real-time customer access
            if (settings.upiId) {
                await updateShop(shopId, { upiId: settings.upiId })
            }
            setIsSaved(true)
            setTimeout(() => setIsSaved(false), 3000)
        } catch (error) {
            console.error("Error saving settings:", error)
            alert("Failed to update settings. Please try again.")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
        )
    }

    // Calculated stats
    const lifetimeEarnings = transactions
        .filter(t => t.type === "PAYMENT" && t.status === "COMPLETED")
        .reduce((sum, t) => sum + t.amount, 0)
    
    const totalPayouts = transactions
        .filter(t => t.type === "PAYOUT" && t.status === "COMPLETED")
        .reduce((sum, t) => sum + t.amount, 0)
    
    const pendingSettlement = Math.max(0, lifetimeEarnings - totalPayouts)

    const historyItems = transactions.filter(t => t.type !== "PAYOUT")
    const payoutItems = transactions.filter(t => t.type === "PAYOUT")

    return (
        <div className="space-y-6 md:space-y-8 pb-20 md:pb-8">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Payments & Payouts</h1>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Live</span>
                        </div>
                    </div>
                    <p className="text-xs md:text-sm text-gray-500 font-medium">Manage your earnings, settlements, and withdrawal methods.</p>
                </div>
                {isSaved && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in zoom-in-95 fill-mode-forwards">
                        <CheckCircle2 className="h-4 w-4" /> Changes Saved Successfully
                    </div>
                )}
            </div>

            {/* Financial Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-border/50 shadow-sm bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden relative group transition-all">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform text-white">
                        <Wallet className="h-24 w-24" />
                    </div>
                    <CardHeader className="pb-1">
                        <CardTitle className="text-[10px] uppercase tracking-widest text-emerald-400 font-black">Lifetime Earnings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black tabular-nums">₹{lifetimeEarnings.toLocaleString()}</div>
                        <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-400 font-bold bg-white/10 w-fit px-2 py-1 rounded-full">
                            <TrendingUp className="h-3 w-3" /> All-time Revenue
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-emerald-100 shadow-sm bg-emerald-50/30 overflow-hidden relative group">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-[10px] uppercase tracking-widest text-emerald-600 font-black">Pending Settlement</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black tabular-nums text-emerald-700">₹{pendingSettlement.toLocaleString()}</div>
                        <p className="text-[10px] text-emerald-600/70 mt-4 font-bold tracking-tight">Next payout scheduled automatically</p>
                    </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm bg-white overflow-hidden relative group">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Total Payouts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black tabular-nums text-gray-900">₹{totalPayouts.toLocaleString()}</div>
                        <p className="text-[10px] text-gray-400 mt-4 font-bold font-mono uppercase tracking-tighter">Settled to Bank</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-gray-100/80 p-1.5 rounded-2xl flex w-fit gap-1 mb-2">
                {[
                    { id: "history", icon: History, label: "History" },
                    { id: "payouts", icon: ArrowUpRight, label: "Payouts" },
                    { id: "methods", icon: CreditCard, label: "Withdrawal Methods" }
                ].map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id as TabType)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all",
                            activeTab === t.id 
                                ? "bg-white text-gray-900 shadow-sm shadow-black/5" 
                                : "text-gray-500 hover:text-gray-700 hover:bg-black/5"
                        )}
                    >
                        <t.icon className={cn("h-4 w-4", activeTab === t.id ? "text-emerald-600" : "text-gray-400")} />
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in duration-300">
                {activeTab === "history" && (
                    <Card className="border-border/50 shadow-sm overflow-hidden">
                        <CardHeader className="border-b border-gray-100 bg-gray-50/30 p-4 md:p-6 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-bold">Transaction History</CardTitle>
                            <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold gap-2">
                                <Download className="h-3 w-3" /> EXPORT CSV
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-gray-100">
                                {historyItems.length > 0 ? historyItems.map((tx) => (
                                    <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                                                tx.type === "PAYMENT" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                                            )}>
                                                {tx.type === "PAYMENT" ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <p className="text-xs md:text-sm font-bold text-gray-900">{tx.description}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] text-gray-500 font-medium">#{tx.orderId || tx.id}</span>
                                                    <span className="text-[10px] text-gray-300">•</span>
                                                    <span className="text-[10px] text-gray-500 font-medium italic">{new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={cn(
                                                "text-xs md:text-sm font-black tabular-nums tracking-tight",
                                                tx.type === "PAYMENT" ? "text-emerald-600" : "text-red-500"
                                            )}>
                                                {tx.type === "PAYMENT" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                                            </span>
                                            <div className="flex items-center justify-end mt-1">
                                                <Badge variant="outline" className="text-[9px] font-bold py-0 h-4 px-1.5 opacity-60">
                                                    {tx.method}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-12 text-center text-gray-400">
                                        <History className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                        <p className="font-bold">No transactions found</p>
                                        <p className="text-xs">Your sales and refunds will appear here.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {activeTab === "payouts" && (
                    <Card className="border-border/50 shadow-sm overflow-hidden">
                        <CardHeader className="border-b border-gray-100 bg-gray-50/30 p-4 md:p-6">
                            <CardTitle className="text-sm font-bold">Settlement History</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-gray-100">
                                {payoutItems.length > 0 ? payoutItems.map((tx) => (
                                    <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                                <CheckCircle2 className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs md:text-sm font-bold text-gray-900">{tx.description}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md">Settled</span>
                                                    <span className="text-[10px] text-gray-300">•</span>
                                                    <span className="text-[10px] text-gray-500 font-medium italic">{new Date(tx.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs md:text-sm font-black text-gray-900 tabular-nums tracking-tight">
                                                ₹{tx.amount.toLocaleString()}
                                            </span>
                                            <p className="text-[10px] text-gray-400 font-bold mt-1">Bank Tag: CLICKIN_PAYOUT</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-12 text-center text-gray-400">
                                        <ArrowUpRight className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                        <p className="font-bold">No payouts recorded</p>
                                        <p className="text-xs">Your bank settlements will appear here when processed.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <div className="p-4 bg-blue-50/50 border-t border-blue-100/50">
                            <p className="text-[10px] text-blue-700 font-medium flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                                Settlements are processed every Sunday for the previous week's balance.
                            </p>
                        </div>
                    </Card>
                )}

                {activeTab === "methods" && settings && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="border-border/50 shadow-sm h-fit">
                            <CardHeader className="border-b border-gray-100 p-4 md:p-6">
                                <CardTitle className="text-sm font-bold flex items-center justify-between">
                                    <span className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-emerald-600" /> UPI Withdrawal</span>
                                    <Badge variant="outline" className="h-5 text-[9px] font-black tracking-widest bg-emerald-50 text-emerald-700 border-emerald-200">ACTIVE</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 md:p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Merchant UPI ID</label>
                                    <Input 
                                        value={settings.upiId || ""} 
                                        onChange={(e) => {
                                            setSettings({...settings, upiId: e.target.value})
                                            setUpiError(null)
                                        }}
                                        placeholder="yourname@bank"
                                        className="h-12 text-sm font-bold border-gray-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                    {upiError && <p className="text-[10px] text-red-500 font-bold mt-1">{upiError}</p>}
                                    <p className="text-[10px] text-gray-400 font-medium bg-gray-50 p-2.5 rounded-lg border border-gray-200/50 mt-2">
                                        ⚡ UPI is our fastest settlement method. Ensure this is a <span className="text-gray-900 font-bold underline">Merchant ID</span> to avoid bank limits.
                                    </p>
                                </div>
                                <Button 
                                    onClick={handleSaveSettings}
                                    disabled={isSaving}
                                    className={cn(
                                        "w-full h-11 font-bold text-xs transition-all",
                                        isSaved ? "bg-emerald-600 text-white" : "bg-gray-900 text-white hover:bg-gray-800"
                                    )}
                                >
                                    {isSaving ? "SAVING..." : isSaved ? "UPDATED!" : "UPDATE UPI SETTINGS"}
                                    {!isSaving && !isSaved && <Save className="h-4 w-4 ml-2" />}
                                    {isSaved && <CheckCircle2 className="h-4 w-4 ml-2" />}
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-border/50 shadow-sm h-fit">
                            <CardHeader className="border-b border-gray-100 p-4 md:p-6">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Banknote className="h-4 w-4 text-blue-600" /> Bank Transfer (IMPS/NEFT)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 md:p-6 space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Account Holder Name</label>
                                        <Input 
                                            value={settings.bankAccountName || ""} 
                                            onChange={(e) => setSettings({...settings, bankAccountName: e.target.value})}
                                            className="h-10 text-sm font-medium border-gray-100"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Account Number</label>
                                        <Input 
                                            value={settings.bankAccountNumber || ""} 
                                            onChange={(e) => setSettings({...settings, bankAccountNumber: e.target.value})}
                                            className="h-10 text-sm font-medium border-gray-100"
                                            type="password"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">IFSC Code</label>
                                            <Input 
                                                value={settings.bankIFSC || ""} 
                                                onChange={(e) => setSettings({...settings, bankIFSC: e.target.value})}
                                                className="h-10 text-sm font-medium border-gray-100 uppercase"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">GST Number (Optional)</label>
                                            <Input 
                                                value={settings.gstNumber || ""} 
                                                onChange={(e) => setSettings({...settings, gstNumber: e.target.value})}
                                                className="h-10 text-sm font-medium border-gray-100"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Button 
                                    onClick={handleSaveSettings}
                                    disabled={isSaving}
                                    variant="outline"
                                    className="w-full border-gray-200 hover:bg-gray-50 h-11 font-bold text-xs"
                                >
                                    {isSaving ? "SAVING..." : "UPDATE BANK DETAILS"}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            {/* Footer Notice */}
            <div className="flex items-center justify-center gap-2 p-6">
                <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    All financial data is encrypted and secure • ClickIn Payments
                </p>
            </div>
        </div>
    )
}
