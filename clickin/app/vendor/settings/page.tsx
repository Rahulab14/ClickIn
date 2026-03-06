"use client"

import { useState, useEffect, useCallback } from "react"
import { useVendorAuth } from "@/context/vendor/VendorContext"
import { getSettings, updateSettings, updateShop, toggleShopOnline } from "@/lib/vendor-service"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Save, Store, Clock, CreditCard, Bell, Shield, CheckCircle2, Settings2, Wifi, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"
import type { VendorSettings, OperatingHours } from "@/lib/types/vendor"

export default function VendorSettingsPage() {
    const { shopId, shop } = useVendorAuth()
    const [settings, setSettings] = useState<VendorSettings | null>(null)
    const [editedShop, setEditedShop] = useState({ name: "", address: "", phone: "", cuisineType: "" as string })
    const [isOnline, setIsOnline] = useState(true)
    const [waitTime, setWaitTime] = useState(20)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [activeTab, setActiveTab] = useState<"shop" | "hours" | "payment" | "notifications">("shop")
    const [loading, setLoading] = useState(true)
    const [hasChanges, setHasChanges] = useState(false)

    useEffect(() => {
        if (!shopId) return
        getSettings(shopId).then(s => {
            setSettings(s)
            setLoading(false)
        })
    }, [shopId])

    // Sync shop data in real-time from VendorContext
    useEffect(() => {
        if (shop) {
            setEditedShop({ name: shop.name, address: shop.address, phone: shop.phone, cuisineType: shop.cuisineType?.join(", ") || "" })
            setIsOnline(shop.isOnline)
            setWaitTime(shop.estimatedWaitTime)
        }
    }, [shop])

    const markChanged = useCallback(() => setHasChanges(true), [])

    const handleSave = async () => {
        if (!settings || !shopId) return
        setSaving(true)
        try {
            await updateSettings(shopId, settings)
            await updateShop(shopId, {
                name: editedShop.name,
                address: editedShop.address,
                phone: editedShop.phone,
                cuisineType: editedShop.cuisineType.split(",").map(s => s.trim()),
                isOnline,
                estimatedWaitTime: waitTime,
            })
            setSaved(true)
            setHasChanges(false)
            setTimeout(() => setSaved(false), 2500)
        } finally {
            setSaving(false)
        }
    }

    const handleToggleOnline = async (val: boolean) => {
        if (!shopId) return
        setIsOnline(val)
        await toggleShopOnline(shopId, val)
    }

    const updateHours = (index: number, field: keyof OperatingHours, value: string | boolean) => {
        if (!settings) return
        const newHours = [...settings.operatingHours]
        newHours[index] = { ...newHours[index], [field]: value }
        setSettings({ ...settings, operatingHours: newHours })
        markChanged()
    }

    if (loading || !settings) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                    <p className="text-xs font-medium text-gray-400">Loading settings...</p>
                </div>
            </div>
        )
    }

    const tabs = [
        { id: "shop" as const, label: "Shop", fullLabel: "Shop Details", icon: Store },
        { id: "hours" as const, label: "Hours", fullLabel: "Operating Hours", icon: Clock },
        { id: "payment" as const, label: "Payment", fullLabel: "Payment", icon: CreditCard },
        { id: "notifications" as const, label: "Alerts", fullLabel: "Notifications", icon: Bell },
    ]

    return (
        <div className="space-y-5 pb-28 md:pb-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900">Settings</h2>
                    <p className="text-xs md:text-sm text-gray-500 mt-1 font-medium">Configure your shop&apos;s profile, hours, and payment details.</p>
                </div>
                <Button
                    onClick={handleSave}
                    className={cn(
                        "font-bold transition-all shadow-md",
                        saved
                            ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                            : hasChanges
                                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 animate-pulse"
                                : "bg-gray-900 hover:bg-gray-800"
                    )}
                    disabled={saving}
                >
                    {saved ? <><CheckCircle2 className="h-4 w-4 mr-1" /> Saved!</> : saving ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="h-4 w-4 mr-1" /> Save Changes</>}
                </Button>
            </div>

            {/* Online/Offline Toggle */}
            <Card className="border-border/50 shadow-sm overflow-hidden">
                <CardContent className="p-3 md:p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn("h-9 w-9 md:h-10 md:w-10 rounded-full flex items-center justify-center shrink-0 transition-colors", isOnline ? "bg-emerald-100" : "bg-gray-100")}>
                            {isOnline ? <Wifi className="h-4 w-4 md:h-5 md:w-5 text-emerald-600" /> : <WifiOff className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-sm md:text-base">Shop Status</h3>
                            <p className="text-[10px] md:text-xs text-gray-500">{isOnline ? "Accepting orders • Visible to customers" : "Not accepting orders"}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 shrink-0">
                        <Badge className={cn("font-bold text-[10px] md:text-xs hidden sm:inline-flex", isOnline ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                            {isOnline ? "ONLINE" : "OFFLINE"}
                        </Badge>
                        <Switch checked={isOnline} onCheckedChange={handleToggleOnline} />
                    </div>
                </CardContent>
            </Card>

            {/* Tab Selector */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar -mx-1 px-1">
                {tabs.map(t => {
                    const Icon = t.icon
                    return (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={cn(
                                "flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all shrink-0",
                                activeTab === t.id ? "bg-gray-900 text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            )}
                        >
                            <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            <span className="sm:hidden">{t.label}</span>
                            <span className="hidden sm:inline">{t.fullLabel}</span>
                        </button>
                    )
                })}
            </div>

            {/* Shop Details Tab */}
            {activeTab === "shop" && (
                <Card className="border-border/50 shadow-sm animate-in fade-in duration-200">
                    <CardHeader className="border-b border-gray-100 p-4 md:p-6">
                        <CardTitle className="text-sm md:text-base font-bold flex items-center gap-2"><Store className="h-4 w-4 text-gray-500" /> Shop Details</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase">Shop Name</label>
                                <Input value={editedShop.name} onChange={e => { setEditedShop({ ...editedShop, name: e.target.value }); markChanged() }} className="text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase">Phone</label>
                                <Input value={editedShop.phone} onChange={e => { setEditedShop({ ...editedShop, phone: e.target.value }); markChanged() }} className="text-sm" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase">Address</label>
                            <Input value={editedShop.address} onChange={e => { setEditedShop({ ...editedShop, address: e.target.value }); markChanged() }} className="text-sm" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase">Cuisine Type (comma separated)</label>
                            <Input value={editedShop.cuisineType} onChange={e => { setEditedShop({ ...editedShop, cuisineType: e.target.value }); markChanged() }} placeholder="Indian, Chinese, Continental" className="text-sm" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase">Estimated Wait Time (minutes)</label>
                            <Input type="number" value={waitTime} onChange={e => { setWaitTime(Number(e.target.value)); markChanged() }} min={5} max={120} className="text-sm w-32" />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Operating Hours Tab */}
            {activeTab === "hours" && (
                <Card className="border-border/50 shadow-sm animate-in fade-in duration-200">
                    <CardHeader className="border-b border-gray-100 p-4 md:p-6">
                        <CardTitle className="text-sm md:text-base font-bold flex items-center gap-2"><Clock className="h-4 w-4 text-gray-500" /> Operating Hours</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 md:p-6">
                        <div className="space-y-2 md:space-y-3">
                            {settings.operatingHours.map((h, i) => (
                                <div key={h.day} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-2.5 border-b border-gray-50 last:border-0">
                                    <div className="flex items-center justify-between sm:justify-start gap-3 sm:w-40">
                                        <span className="font-bold text-gray-900 text-sm w-20">{h.day}</span>
                                        <div className="flex items-center gap-2">
                                            <Switch checked={h.isOpen} onCheckedChange={v => updateHours(i, "isOpen", v)} />
                                            <span className={cn("text-[10px] md:text-xs font-bold w-12", h.isOpen ? "text-emerald-600" : "text-gray-400")}>
                                                {h.isOpen ? "Open" : "Closed"}
                                            </span>
                                        </div>
                                    </div>
                                    {h.isOpen && (
                                        <div className="flex items-center gap-2 pl-0 sm:pl-0">
                                            <Input type="time" value={h.openTime} onChange={e => updateHours(i, "openTime", e.target.value)} className="w-28 md:w-32 h-8 md:h-9 text-xs md:text-sm" />
                                            <span className="text-gray-400 text-xs font-medium">to</span>
                                            <Input type="time" value={h.closeTime} onChange={e => updateHours(i, "closeTime", e.target.value)} className="w-28 md:w-32 h-8 md:h-9 text-xs md:text-sm" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Payment Tab */}
            {activeTab === "payment" && (
                <Card className="border-border/50 shadow-sm animate-in fade-in duration-200">
                    <CardHeader className="border-b border-gray-100 p-4 md:p-6">
                        <CardTitle className="text-sm md:text-base font-bold flex items-center gap-2"><CreditCard className="h-4 w-4 text-gray-500" /> Payment Details</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase">GST Number</label>
                                <Input value={settings.gstNumber} onChange={e => { setSettings({ ...settings, gstNumber: e.target.value }); markChanged() }} className="text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase">UPI ID</label>
                                <Input value={settings.upiId} onChange={e => { setSettings({ ...settings, upiId: e.target.value }); markChanged() }} placeholder="yourshop@upi" className="text-sm" />
                            </div>
                        </div>

                        <div className="h-px bg-gray-100 my-2" />

                        <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">Bank Account</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase">Account Name</label>
                                <Input value={settings.bankAccountName} onChange={e => { setSettings({ ...settings, bankAccountName: e.target.value }); markChanged() }} className="text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase">Account Number</label>
                                <Input value={settings.bankAccountNumber} onChange={e => { setSettings({ ...settings, bankAccountNumber: e.target.value }); markChanged() }} className="text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase">IFSC Code</label>
                                <Input value={settings.bankIFSC} onChange={e => { setSettings({ ...settings, bankIFSC: e.target.value }); markChanged() }} className="text-sm" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
                <Card className="border-border/50 shadow-sm animate-in fade-in duration-200">
                    <CardHeader className="border-b border-gray-100 p-4 md:p-6">
                        <CardTitle className="text-sm md:text-base font-bold flex items-center gap-2"><Bell className="h-4 w-4 text-gray-500" /> Notification Preferences</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 space-y-1">
                        {[
                            { key: "notifyNewOrders" as const, label: "New Orders", desc: "Get notified for every new order" },
                            { key: "notifyOrderStatusChange" as const, label: "Status Changes", desc: "When an order status is updated" },
                            { key: "notifyLowStock" as const, label: "Low Stock Alerts", desc: "When items are running low" },
                            { key: "notifyDailySummary" as const, label: "Daily Summary", desc: "Receive a daily sales summary" },
                            { key: "orderAlertSound" as const, label: "Alert Sound", desc: "Play sound for new orders" },
                        ].map(n => (
                            <div key={n.key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                <div className="min-w-0 mr-4">
                                    <p className="font-bold text-gray-900 text-xs md:text-sm">{n.label}</p>
                                    <p className="text-[10px] md:text-xs text-gray-500 truncate">{n.desc}</p>
                                </div>
                                <Switch
                                    checked={settings[n.key]}
                                    onCheckedChange={v => { setSettings({ ...settings, [n.key]: v }); markChanged() }}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    )
}
