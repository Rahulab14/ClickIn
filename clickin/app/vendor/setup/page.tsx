"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useVendorAuth } from "@/context/vendor/VendorContext";
import { updateShop } from "@/lib/vendor-service";
import { Store, MapPin, Clock, CreditCard, ChevronRight, ChevronLeft, Upload, CheckCircle, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Custom categories
const CATEGORIES = [
    "Canteen", "Restaurant", "Cafe", "Bakery", "Electronics",
    "Stationery", "Grocery", "Juice Shop", "Snacks Stall", "Other"
];

const WORKING_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function VendorSetupPage() {
    const router = useRouter();
    const { vendorProfile, shop, isVendorLoading } = useVendorAuth();

    // We start at step 1
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        // Step 1: Branding
        logo: "",
        banner: "",
        name: "",
        category: "",
        description: "",
        // Step 2: Contact
        ownerName: "",
        phone: "",
        email: "",
        alternatePhone: "",
        // Step 3: Location
        campus: "",
        building: "",
        address: "",
        location: "", // Google maps link
        // Step 4: Operations
        openingTime: "08:00",
        closingTime: "20:00",
        workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        orderTypesSupported: ["Pickup", "Pre-Order"],
        upiId: "",
        paymentInstructions: "Pay via UPI and show payment confirmation at counter",
        allowStaffRequests: true,
        maxStaffAllowed: 5,
        averagePrepTime: 10,
        autoAcceptOrders: false,
        orderQueueLimit: 50
    });

    // Populate initial data safely
    useEffect(() => {
        if (!isVendorLoading && shop) {
            setFormData(prev => ({
                ...prev,
                name: shop.name || prev.name,
                email: shop.contactEmail || prev.email,
                phone: shop.phone || prev.phone,
                ownerName: shop.ownerName || prev.ownerName,
                // Only load if they exist so we don't overwrite defaults with undefined
                category: shop.category || prev.category,
                description: shop.description || prev.description,
                logo: shop.logo || prev.logo,
                banner: shop.banner || prev.banner,
            }));

            // If the shop is already fully setup, redirect to dashboard
            if (shop.phone && shop.category && shop.campus && shop.upiId) {
                router.replace("/vendor/dashboard");
            }
        }
    }, [isVendorLoading, shop, router]);

    // Local Storage save progress
    useEffect(() => {
        const saved = localStorage.getItem("vendorSetupProgress");
        if (saved && !isVendorLoading) {
            try {
                const parsed = JSON.parse(saved);
                setFormData(prev => ({ ...prev, ...parsed }));
            } catch (e) { }
        }
    }, [isVendorLoading]);

    useEffect(() => {
        try {
            // Exclude large image strings from localStorage to avoid QuotaExceededError
            const { logo, banner, ...rest } = formData;
            localStorage.setItem("vendorSetupProgress", JSON.stringify(rest));
        } catch (e) {
            console.warn("Failed to save progress to localStorage:", e);
        }
    }, [formData]);

    // Basic fake image uploader (we just convert to local URL or base64 for demo)
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: "logo" | "banner") => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validations
        const maxSize = field === "logo" ? 5 * 1024 * 1024 : 7 * 1024 * 1024;
        if (file.size > maxSize) {
            setError(`${field === "logo" ? "Logo" : "Banner"} must be under ${field === "logo" ? "5MB" : "7MB"}`);
            return;
        }
        setError("");

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, [field]: reader.result as string }));
        };
        reader.readAsDataURL(file);
    };

    const nextStep = () => {
        setError("");
        if (step === 1) {
            if (!formData.name) return setError("Shop Name is required");
            if (!formData.category) return setError("Shop Category is required");
        }
        if (step === 2) {
            if (!formData.ownerName) return setError("Owner Name is required");
            if (!formData.phone) return setError("Phone Number is required");
        }
        if (step === 3) {
            if (!formData.campus) return setError("Campus Name is required");
            if (!formData.address) return setError("Address is required");
        }
        setStep(p => Math.min(4, p + 1));
        window.scrollTo(0, 0);
    };

    const prevStep = () => setStep(p => Math.max(1, p - 1));

    const toggleArrayItem = (field: "workingDays" | "orderTypesSupported", item: string) => {
        setFormData(prev => {
            const arr = prev[field] as string[];
            if (arr.includes(item)) return { ...prev, [field]: arr.filter(i => i !== item) };
            return { ...prev, [field]: [...arr, item] };
        });
    };

    const handleSubmit = async () => {
        if (!shop?.id) {
            setError("No shop found to update. Please refresh.");
            return;
        }
        if (!formData.upiId) {
            setError("UPI ID is required to receive payments.");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            // Convert simple form strings/arrays back to VendorShop type as needed
            await updateShop(shop.id, {
                name: formData.name,
                logo: formData.logo,
                banner: formData.banner,
                category: formData.category,
                description: formData.description,
                ownerName: formData.ownerName,
                phone: formData.phone,
                contactPhone: formData.alternatePhone || formData.phone,
                contactEmail: formData.email,
                alternatePhone: formData.alternatePhone,
                campus: formData.campus,
                building: formData.building,
                address: formData.address,
                location: formData.location, // maps link
                openingTime: formData.openingTime,
                closingTime: formData.closingTime,
                workingDays: formData.workingDays,
                orderTypesSupported: formData.orderTypesSupported as any,
                upiId: formData.upiId,
                paymentInstructions: formData.paymentInstructions,
                allowStaffRequests: formData.allowStaffRequests,
                maxStaffAllowed: formData.maxStaffAllowed,
                averagePrepTime: formData.averagePrepTime,
                autoAcceptOrders: formData.autoAcceptOrders,
                orderQueueLimit: formData.orderQueueLimit,
                isOnline: false, // Default to offline on creation
            });

            // Clear local storage on success
            localStorage.removeItem("vendorSetupProgress");

            // Redirect to dashboard (which will now have a configured shop)
            router.push("/vendor/dashboard");
        } catch (e: any) {
            console.error("Setup error", e);
            setError("Failed to save shop details. Please try again.");
            setIsSubmitting(false);
        }
    };

    if (isVendorLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
        );
    }

    const STEPS = [
        { id: 1, title: "Branding", icon: Store },
        { id: 2, title: "Contact", icon: Store }, // We can use User but using generic
        { id: 3, title: "Location", icon: MapPin },
        { id: 4, title: "Operations", icon: Clock }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pt-8 pb-20 px-4 flex flex-col items-center selection:bg-emerald-100 selection:text-emerald-900">
            <div className="w-full max-w-2xl">

                {/* Header & Stepper */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Setup Your Shop</h1>
                    <p className="text-gray-500 font-medium">Let's get your store ready for customers.</p>
                </div>

                <div className="flex items-center justify-between mb-8 relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0" />
                    <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 rounded-full z-0 transition-all duration-500"
                        style={{ width: `${((step - 1) / 3) * 100}%` }}
                    />

                    {STEPS.map((s) => (
                        <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm border-2",
                                step >= s.id
                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                    : "bg-white border-gray-200 text-gray-400"
                            )}>
                                {step > s.id ? <CheckCircle className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                            </div>
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-wider absolute -bottom-6 w-20 text-center",
                                step >= s.id ? "text-emerald-700" : "text-gray-400"
                            )}>
                                {s.title}
                            </span>
                        </div>
                    ))}
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 animate-in fade-in zoom-in-95">
                        <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                        <span className="font-bold text-sm tracking-tight">{error}</span>
                    </div>
                )}

                {/* Form Container */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-6">

                    {/* STEP 1: Branding */}
                    {step === 1 && (
                        <div className="p-6 md:p-8 animate-in slide-in-from-right-8 duration-300">
                            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                <Store className="w-5 h-5 text-emerald-500" /> Basic Shop Information
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Shop Logo (1:1 Ratio)</label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 group relative">
                                            {formData.logo ? (
                                                <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="w-6 h-6 text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <input type="file" id="logoUpload" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "logo")} />
                                            <label htmlFor="logoUpload" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-bold text-gray-700 cursor-pointer transition-colors">
                                                <Upload className="w-4 h-4" /> Upload Logo
                                            </label>
                                            <p className="text-xs text-gray-400 font-medium mt-1">Max 5MB. Used as your shop icon.</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Shop Banner (16:9 Ratio)</label>
                                    <div className="w-full h-32 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden relative group">
                                        {formData.banner ? (
                                            <img src={formData.banner} alt="Banner" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center">
                                                <ImageIcon className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                                                <p className="text-xs text-gray-400 font-medium">16:9 Header Image</p>
                                            </div>
                                        )}
                                        <input type="file" id="bannerUpload" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "banner")} />
                                        <label htmlFor="bannerUpload" className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
                                                <Upload className="w-4 h-4" /> Change Banner (Max 7MB)
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-gray-700">Shop Name *</label>
                                        <Input
                                            placeholder="e.g. Ravi Canteen"
                                            value={formData.name}
                                            onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                            className="h-12 bg-gray-50/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-gray-700">Category *</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                                            className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                                        >
                                            <option value="" disabled>Select a category...</option>
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">Short Description</label>
                                    <textarea
                                        placeholder="e.g. Fresh South Indian meals and snacks served daily."
                                        value={formData.description}
                                        onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px] resize-none font-medium"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Contact */}
                    {step === 2 && (
                        <div className="p-6 md:p-8 animate-in slide-in-from-right-8 duration-300">
                            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-emerald-500" /> Contact Information
                            </h2>
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">Owner Full Name *</label>
                                    <Input
                                        placeholder="Enter your name"
                                        value={formData.ownerName}
                                        onChange={(e) => setFormData(p => ({ ...p, ownerName: e.target.value }))}
                                        className="h-12 bg-gray-50/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">Primary Mobile Number *</label>
                                    <Input
                                        placeholder="+91 "
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                                        className="h-12 bg-gray-50/50"
                                    />
                                    <p className="text-xs text-gray-400 font-medium">Used for order issues and customer support.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">Email Address</label>
                                    <Input
                                        placeholder="Email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                                        className="h-12 bg-gray-50/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">Alternate Phone (Optional)</label>
                                    <Input
                                        placeholder="+91 "
                                        type="tel"
                                        value={formData.alternatePhone}
                                        onChange={(e) => setFormData(p => ({ ...p, alternatePhone: e.target.value }))}
                                        className="h-12 bg-gray-50/50"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Location */}
                    {step === 3 && (
                        <div className="p-6 md:p-8 animate-in slide-in-from-right-8 duration-300">
                            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-emerald-500" /> Shop Location
                            </h2>
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">College / Campus Name *</label>
                                    <Input
                                        placeholder="e.g. SRM IST"
                                        value={formData.campus}
                                        onChange={(e) => setFormData(p => ({ ...p, campus: e.target.value }))}
                                        className="h-12 bg-gray-50/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">Building / Block (Optional)</label>
                                    <Input
                                        placeholder="e.g. Main Canteen Block"
                                        value={formData.building}
                                        onChange={(e) => setFormData(p => ({ ...p, building: e.target.value }))}
                                        className="h-12 bg-gray-50/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">Full Address *</label>
                                    <textarea
                                        placeholder="e.g. Ground Floor, Engineering Block Canteen"
                                        value={formData.address}
                                        onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[80px] font-medium resize-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">Google Maps Link (Optional)</label>
                                    <Input
                                        placeholder="https://maps.google.com/..."
                                        type="url"
                                        value={formData.location}
                                        onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))}
                                        className="h-12 bg-gray-50/50"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Operations */}
                    {step === 4 && (
                        <div className="p-6 md:p-8 animate-in slide-in-from-right-8 duration-300">
                            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-emerald-500" /> Operating & Payment Details
                            </h2>
                            <div className="space-y-8">

                                {/* Timings */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Working Hours</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-gray-700">Opening Time</label>
                                            <Input type="time" value={formData.openingTime} onChange={(e) => setFormData(p => ({ ...p, openingTime: e.target.value }))} className="h-12 bg-gray-50/50" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-gray-700">Closing Time</label>
                                            <Input type="time" value={formData.closingTime} onChange={(e) => setFormData(p => ({ ...p, closingTime: e.target.value }))} className="h-12 bg-gray-50/50" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-gray-700">Working Days</label>
                                        <div className="flex flex-wrap gap-2">
                                            {WORKING_DAYS.map(day => (
                                                <button
                                                    key={day}
                                                    onClick={() => toggleArrayItem("workingDays", day)}
                                                    className={cn(
                                                        "px-4 py-2 rounded-xl text-sm font-bold transition-all border",
                                                        formData.workingDays.includes(day)
                                                            ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                                                            : "bg-white text-gray-500 border-gray-200 hover:border-emerald-200 hover:bg-emerald-50"
                                                    )}
                                                >
                                                    {day}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-gray-700">Supported Order Types</label>
                                        <div className="flex gap-2">
                                            {["Pickup", "Pre-Order", "Dine-in", "Delivery"].map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => toggleArrayItem("orderTypesSupported", type)}
                                                    className={cn(
                                                        "px-4 py-2 rounded-xl text-sm font-bold transition-all border",
                                                        formData.orderTypesSupported.includes(type)
                                                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                                            : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                                                    )}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Payments */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Payments</h3>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-gray-700">Shop UPI ID *</label>
                                        <Input
                                            placeholder="e.g. ravicanteen@upi"
                                            value={formData.upiId}
                                            onChange={(e) => setFormData(p => ({ ...p, upiId: e.target.value }))}
                                            className="h-12 bg-gray-50/50"
                                        />
                                    </div>
                                </div>

                                {/* Preferences */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Preferences</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-gray-700">Average Prep Time (mins)</label>
                                            <Input type="number" min={1} value={formData.averagePrepTime} onChange={(e) => setFormData(p => ({ ...p, averagePrepTime: parseInt(e.target.value) }))} className="h-12 bg-gray-50/50" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-gray-700">Order Queue Limit</label>
                                            <Input type="number" min={1} value={formData.orderQueueLimit} onChange={(e) => setFormData(p => ({ ...p, orderQueueLimit: parseInt(e.target.value) }))} className="h-12 bg-gray-50/50" />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="bg-gray-50/80 p-6 border-t border-gray-100 flex items-center justify-between">
                        {step > 1 ? (
                            <Button variant="outline" onClick={prevStep} className="font-bold border-gray-300 text-gray-600 px-6 h-12 rounded-xl hover:bg-white hover:text-gray-900">
                                <ChevronLeft className="w-4 h-4 mr-2" /> Back
                            </Button>
                        ) : <div />}

                        {step < 4 ? (
                            <Button onClick={nextStep} className="bg-gray-900 text-white hover:bg-gray-800 font-bold px-8 h-12 rounded-xl shadow-md">
                                Next Step <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-emerald-600 text-white hover:bg-emerald-700 font-black px-8 h-12 rounded-xl shadow-lg shadow-emerald-200">
                                {isSubmitting ? "Saving..." : "Finish Setup"} <CheckCircle className="w-5 h-5 ml-2" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
