"use client";

import { useState, useEffect, useCallback } from "react";
import { useVendorAuth } from "@/context/vendor/VendorContext";
import {
  updateSettings,
  updateShop,
  toggleShopOnline,
  subscribeToSettings,
} from "@/lib/vendor-service";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  Store,
  Clock,
  CreditCard,
  Bell,
  Shield,
  CheckCircle2,
  Settings2,
  Wifi,
  WifiOff,
  ChevronRight,
  AlertCircle,
  Zap,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { VendorSettings, OperatingHours } from "@/lib/types/vendor";
import { motion, AnimatePresence } from "framer-motion";

export default function VendorSettingsPage() {
  const { shopId, shop, settings: globalSettings } = useVendorAuth();
  const [settings, setSettings] = useState<VendorSettings | null>(null);
  const [editedShop, setEditedShop] = useState({
    name: "",
    address: "",
    phone: "",
    cuisineType: "" as string,
  });
  const [isOnline, setIsOnline] = useState(true);
  const [waitTime, setWaitTime] = useState(20);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "shop" | "hours" | "payment" | "notifications"
  >("shop");
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [upiError, setUpiError] = useState<string | null>(null);
  const [lastAutoStatus, setLastAutoStatus] = useState<boolean | null>(null);

  const validateUpi = (val: string) => {
    const trimmed = val.trim();
    const re = /^[\w.\-]{3,}@[a-zA-Z]+$/;
    return re.test(trimmed);
  };

  const markChanged = () => setHasChanges(true);
  // We use the global settings and shop from VendorContext

  useEffect(() => {
    if (globalSettings) {
      setSettings(globalSettings);
      setLoading(false);
    }
  }, [globalSettings]);

  // Sync shop data in real-time from VendorContext
  useEffect(() => {
    if (shop) {
      setEditedShop({
        name: shop.name,
        address: shop.address,
        phone: shop.phone,
        cuisineType: shop.cuisineType?.join(", ") || "",
      });
      setIsOnline(shop.isOnline);
      setWaitTime(shop.estimatedWaitTime);
    }
  }, [shop]);

  // Operating hours logic has been centralized in VendorContext

  const saveShopDetails = async () => {
    if (!shopId) return;
    setSaving(true);
    try {
      await updateShop(shopId, {
        name: editedShop.name,
        address: editedShop.address,
        phone: editedShop.phone,
        cuisineType: editedShop.cuisineType.split(",").map((s) => s.trim()).filter(Boolean),
        estimatedWaitTime: waitTime,
      });
      setSaved(true);
      setHasChanges(false);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setSaving(false);
    }
  };

  const saveSettingsField = async (fields: Partial<VendorSettings>) => {
    if (!shopId || !settings) return;
    
    if (fields.upiId !== undefined && !validateUpi(fields.upiId)) {
      setUpiError("Invalid UPI ID Format");
      return;
    } else if (fields.upiId !== undefined) {
      setUpiError(null);
    }
    
    setSaving(true);
    try {
      await updateSettings(shopId, fields);
      if (fields.upiId !== undefined) {
        await updateShop(shopId, { upiId: fields.upiId });
      }
      setSaved(true);
      setHasChanges(false);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      console.error("Settings save failed:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleOnline = async (val: boolean) => {
    if (!shopId || !settings) return;
    setIsOnline(val);
    
    // 1. If we are in Auto mode, switch to Manual mode FIRST
    // This prevents the global boundary check from reverting our manual change
    if (!settings.isManualMode) {
      await updateSettings(shopId, { isManualMode: true });
    }
    
    // 2. Then update the shop status
    await toggleShopOnline(shopId, val);
  };

  const handleSetMode = async (mode: "auto" | "manual") => {
    if (!shopId || !settings) return;
    const isManual = mode === "manual";
    
    await updateSettings(shopId, { isManualMode: isManual });
    
    if (!isManual) {
      // Immediately sync with auto status if available when switching back to Auto
      if (lastAutoStatus !== null && isOnline !== lastAutoStatus) {
        await toggleShopOnline(shopId, lastAutoStatus);
      }
    }
  };

  const updateHours = async (
    index: number,
    field: keyof OperatingHours,
    value: string | boolean,
  ) => {
    if (!settings) return;
    const newHours = [...settings.operatingHours];
    newHours[index] = { ...newHours[index], [field]: value } as OperatingHours;
    setSettings({ ...settings, operatingHours: newHours });
    await saveSettingsField({ operatingHours: newHours });
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-xs font-medium text-gray-400">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: "shop" as const,
      label: "Shop",
      fullLabel: "Shop Details",
      icon: Store,
    },
    {
      id: "hours" as const,
      label: "Hours",
      fullLabel: "Operating Hours",
      icon: Clock,
    },
    {
      id: "payment" as const,
      label: "Payment",
      fullLabel: "Payment",
      icon: CreditCard,
    },
    {
      id: "notifications" as const,
      label: "Alerts",
      fullLabel: "Notifications",
      icon: Bell,
    },
  ];

  const activeTabItem = tabs.find((t) => t.id === activeTab);
  const ActiveIcon = activeTabItem?.icon;

  return (
    <div className="space-y-6 pb-28 md:pb-12 max-w-5xl mx-auto px-4 sm:px-6">
      {/* Premium Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-1"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-1.5 bg-emerald-500 rounded-full" />
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900">
              Settings
            </h2>
          </div>
          <p className="text-sm text-gray-500 font-medium">
            Configure your shop&apos;s digital identity and operations.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center gap-3">
            <Button
              onClick={() => {
                if (activeTab === "shop") saveShopDetails();
                else saveSettingsField({});
              }}
              disabled={!hasChanges || saving}
              className={cn(
                "h-10 px-6 rounded-xl font-bold transition-all shadow-sm active:scale-95",
                hasChanges
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-gray-100 text-gray-900 cursor-not-allowed",
              )}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            {saving ? (
              <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm px-3 py-1.5 flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                <div className="h-3 w-3 border-[1.5px] border-emerald-600 border-t-transparent rounded-full animate-spin" />
                Syncing...
              </Badge>
            ) :  (
              <Badge className="bg-white border-gray-200 text-gray-500 shadow-sm px-3 py-1.5 flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider">
                <Wifi className="h-3.5 w-3.5" />
                Live Sync On
              </Badge>
            )}
          </div>
        </motion.div>
      </div>

      {/* Glassmorphism Quick Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-none shadow-2xl bg-white/40 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform">
            <Wifi className="h-16 w-16" />
          </div>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className={cn(
                "h-12 w-12 rounded-2xl flex items-center justify-center transition-all shadow-inner",
                isOnline ? "bg-emerald-500 text-white shadow-emerald-200" : "bg-gray-200 text-gray-400"
              )}>
                {isOnline ? <Wifi className="h-6 w-6" /> : <WifiOff className="h-6 w-6" />}
              </div>
              
              <div className="flex flex-col items-end gap-3">
                <div className="flex bg-gray-100 p-1 rounded-xl border border-white/20 shadow-inner">
                  <button 
                    onClick={() => handleSetMode("auto")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
                      !settings.isManualMode ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    Auto
                  </button>
                  <button 
                    onClick={() => handleSetMode("manual")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
                      settings.isManualMode ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    Manual
                  </button>
                </div>
                <AnimatePresence mode="wait">
                  {settings.isManualMode && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Switch checked={isOnline} onCheckedChange={handleToggleOnline} className="scale-90" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <h3 className="font-black text-gray-900 text-lg mb-1">Store Status</h3>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                {isOnline ? "Accepting Orders • Live" : "Closed • Hidden"}
              </p>
              {!settings.isManualMode && (
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </div>
          </CardContent>
        </Card>

        
      </div>

      {/* Navigation Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Responsive Navigation */}
        <div className="w-full lg:w-64 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide shrink-0">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  "flex-1 lg:w-full flex items-center justify-center lg:justify-between px-6 py-4 lg:px-4 rounded-2xl transition-all duration-300 group min-w-fit",
                  active
                    ? "bg-gray-900 text-white shadow-xl shadow-gray-200 scale-[1.02] lg:scale-100"
                    : "hover:bg-white/60 hover:backdrop-blur-md text-gray-500"
                )}
              >
                <div className="flex items-center gap-0 lg:gap-3">
                  <Icon className={cn("h-6 w-6 lg:h-5 lg:w-5", active ? "text-emerald-400" : "text-gray-400 group-hover:text-gray-600")} />
                  <span className="font-bold text-sm tracking-tight hidden lg:block">{t.fullLabel}</span>
                </div>
                {active && <ChevronRight className="h-4 w-4 animate-pulse hidden lg:block" />}
              </button>
            );
          })}
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-none shadow-2xl bg-white/60 backdrop-blur-2xl rounded-3xl lg:rounded-[2.5rem] overflow-hidden">
                <CardHeader className="bg-gray-900/5 p-8 border-b border-white/20">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                      {ActiveIcon && <ActiveIcon className="h-6 w-6 text-gray-900" />}
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black text-gray-900 uppercase tracking-tighter">
                        {activeTabItem?.fullLabel}
                      </CardTitle>
                      <p className="text-xs text-gray-500 font-medium">Manage your {activeTab.replace("-", " ")} configuration</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 md:p-10">
                  {/* Shop Details Tab */}
                  {activeTab === "shop" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FloatingInput label="Shop Name" value={editedShop.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setEditedShop({ ...editedShop, name: e.target.value }); markChanged(); }} onBlur={saveShopDetails} />
                        <FloatingInput label="Contact Phone" value={editedShop.phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setEditedShop({ ...editedShop, phone: e.target.value }); markChanged(); }} onBlur={saveShopDetails} />
                      </div>
                      <FloatingInput label="Official Address" value={editedShop.address} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setEditedShop({ ...editedShop, address: e.target.value }); markChanged(); }} onBlur={saveShopDetails} />
                      <div className="space-y-4">
                        <FloatingInput 
                          label="Cuisines Offered" 
                          value={editedShop.cuisineType} 
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setEditedShop({ ...editedShop, cuisineType: e.target.value }); markChanged(); }} 
                          onBlur={saveShopDetails}
                          placeholder="Separate with commas (e.g. Indian, Chinese)" 
                        />
                        <div className="flex flex-wrap gap-2">
                          {editedShop.cuisineType.split(",").filter(Boolean).map((c, i) => (
                            <Badge key={i} className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none px-3 py-1 font-bold text-[10px] uppercase">
                              {c.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Operating Hours Tab */}
                  {activeTab === "hours" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      {settings.operatingHours.map((h, i) => (
                        <div key={h.day} className="group relative bg-white/40 p-5 rounded-3xl border border-white/40 hover:bg-white/80 transition-all hover:shadow-lg">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                              <div className={cn("h-4 w-4 rounded-full shadow-sm", h.isOpen ? "bg-emerald-500" : "bg-gray-300")} />
                              <span className="font-black text-gray-900 text-lg w-24 tracking-tighter">
                                {h.day}
                              </span>
                              <div className="flex items-center gap-3">
                                <Switch checked={h.isOpen} onCheckedChange={(v) => updateHours(i, "isOpen", v)} />
                                <span className={cn("text-xs font-black uppercase tracking-widest", h.isOpen ? "text-emerald-600" : "text-gray-400")}>
                                  {h.isOpen ? "Open" : "Closed"}
                                </span>
                              </div>
                            </div>
                            
                            {h.isOpen && (
                              <div className="flex items-center gap-3 animate-in zoom-in-95 duration-300 pr-4">
                                <TimeInput value={h.openTime} onChange={(v) => updateHours(i, "openTime", v)} />
                                <div className="h-px w-4 bg-gray-300" />
                                <TimeInput value={h.closeTime} onChange={(v) => updateHours(i, "closeTime", v)} />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Payment Tab */}
                  {activeTab === "payment" && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="bg-emerald-50/50 rounded-[2rem] p-8 border border-emerald-100/50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                          <Smartphone className="h-24 w-24 text-emerald-600" />
                        </div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="h-10 w-10 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                            <Smartphone className="h-5 w-5" />
                          </div>
                          <h4 className="font-black text-emerald-900 tracking-tight text-lg uppercase">UPI Configuration</h4>
                        </div>
                        <div className="space-y-4 max-w-md">
                          <FloatingInput 
                            label="UPI ID (Merchant Recommended)" 
                            value={settings.upiId} 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const v = e.target.value;
                              setSettings({ ...settings, upiId: v });
                              markChanged();
                              setUpiError(v && !validateUpi(v) ? "Invalid UPI ID Format" : null);
                            }}
                            onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                              const trimmed = e.target.value.trim();
                              if (trimmed !== e.target.value) {
                                setSettings((s) => s ? ({ ...s, upiId: trimmed }) : null);
                              }
                              saveSettingsField({ upiId: trimmed });
                            }}
                            placeholder="shopname@bank"
                          />
                          {upiError && (
                            <div className="flex items-center gap-2 text-red-500 text-xs font-bold animate-pulse">
                              <AlertCircle className="h-3.5 w-3.5" /> {upiError}
                            </div>
                          )}
                          <p className="text-[10px] text-emerald-600/60 font-medium leading-relaxed bg-white/50 p-4 rounded-2xl">
                            💡 Use a verified merchant ID to avoid payout limits and transaction failures on customer apps like GPay or PhonePe.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2 px-2">
                           <div className="h-10 w-10 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                            <Banknote className="h-5 w-5" />
                          </div>
                          <h4 className="font-black text-gray-900 tracking-tight text-lg uppercase">Bank Settlement Details</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FloatingInput label="Account Holder Name" value={settings.bankAccountName || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSettings(s => s ? ({...s, bankAccountName: e.target.value}) : null); markChanged(); }} onBlur={(e: React.FocusEvent<HTMLInputElement>) => saveSettingsField({bankAccountName: e.target.value})} />
                          <FloatingInput label="Account Number" value={settings.bankAccountNumber || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSettings(s => s ? ({...s, bankAccountNumber: e.target.value}) : null); markChanged(); }} onBlur={(e: React.FocusEvent<HTMLInputElement>) => saveSettingsField({bankAccountNumber: e.target.value})} type="password" />
                          <FloatingInput label="IFSC Code" value={settings.bankIFSC || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSettings(s => s ? ({...s, bankIFSC: e.target.value}) : null); markChanged(); }} onBlur={(e: React.FocusEvent<HTMLInputElement>) => saveSettingsField({bankIFSC: e.target.value})} />
                          <FloatingInput label="GST Number" value={settings.gstNumber || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSettings(s => s ? ({...s, gstNumber: e.target.value}) : null); markChanged(); }} onBlur={(e: React.FocusEvent<HTMLInputElement>) => saveSettingsField({gstNumber: e.target.value})} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notifications Tab */}
                  {activeTab === "notifications" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      {[
                        { key: "notifyNewOrders" as const, label: "New Order Alerts", desc: "Push notification for every incoming order", icon: Store },
                        { key: "notifyOrderStatusChange" as const, label: "Status Trackers", desc: "Update when orders change states", icon: Settings2 },
                        { key: "notifyLowStock" as const, label: "Inventory Guard", desc: "Low stock and out-of-stock alerts", icon: AlertCircle },
                        { key: "notifyDailySummary" as const, label: "Analytics Pulse", desc: "Receive automated daily performance stats", icon: TrendingUp },
                        { key: "orderAlertSound" as const, label: "Audio Ping", desc: "Loud alert sound for new orders (Dashboard)", icon: Bell },
                      ].map((n) => (
                        <div key={n.key} className="flex items-center justify-between p-6 rounded-3xl bg-white/40 border border-white/40 hover:bg-white/70 transition-colors group">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-500 group-hover:bg-gray-900 group-hover:text-white transition-colors">
                              <n.icon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-black text-gray-900 text-sm">{n.label}</p>
                              <p className="text-[10px] text-gray-500 font-medium">{n.desc}</p>
                            </div>
                          </div>
                          <Switch checked={settings[n.key] as boolean} onCheckedChange={(v) => { setSettings(s => s ? ({ ...s, [n.key]: v }) : null); saveSettingsField({ [n.key]: v }); }} />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Support Components
function FloatingInput({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 block">
        {label}
      </label>
      <Input
        {...props}
        className="h-14 rounded-2xl bg-white/50 border-white/20 shadow-sm focus:bg-white focus:shadow-xl focus:border-emerald-500 transition-all font-bold text-gray-900"
      />
    </div>
  );
}

function TimeInput({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  return (
    <Input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-32 h-12 rounded-xl bg-white/50 border-white/20 font-black text-center shadow-inner hover:bg-white transition-all transition-all"
    />
  );
}

const Banknote = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect width="20" height="12" x="2" y="6" rx="2" />
    <circle cx="12" cy="12" r="2" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
);

const TrendingUp = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);
