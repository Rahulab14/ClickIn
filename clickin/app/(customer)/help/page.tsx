"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MoreHorizontal, Search, Settings2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function HelpCenterPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"faq" | "contact">("faq");
    const [activeCategory, setActiveCategory] = useState("General");
    const [searchQuery, setSearchQuery] = useState("");
    const [openIndex, setOpenIndex] = useState<number>(0);

    const categories = ["General", "Account", "Order", "Payment", "Vendor"];

    const faqs = [
        {
            category: "General",
            question: "What is ClickIn?",
            answer: "ClickIn is a fast, seamless food ordering platform designed for quick service restaurants, cafes, and campuses. It lets you skip the queue and order directly from your favorite local vendors.",
        },
        {
            category: "Payment",
            question: "How can I make a payment?",
            answer: "You can pay securely via UPI (Google Pay, PhonePe, Paytm), cash, or card depending on the vendor's preferences. Payments are verified instantly so the vendor can start preparing your order right away.",
        },
        
        {
            category: "Account",
            question: "How do I delete my account?",
            answer: "You can securely delete your account by navigating to Profile > Settings > Account Security and choosing 'Delete Account'. Note that this action is permanent and cannot be undone.",
        },
        {
            category: "General",
            question: "How do I log out of the app?",
            answer: "To log out, open the side menu from the home page by tapping your profile picture, scroll to the bottom, and tap on 'Logout'.",
        },
        {
            category: "Vendor",
            question: "How do I become a ClickIn partner?",
            answer: "To partner with us as a vendor, log out of your customer account and select 'Join as Partner' from the home screen, or reach out to our support team directly.",
        }
    ];

    const filteredFaqs = faqs.filter(faq => {
        const matchesCategory = activeCategory === "General" ? true : faq.category === activeCategory;
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 px-4 py-4 flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <ArrowLeft className="h-6 w-6 text-gray-900 dark:text-gray-100" />
                </button>
                <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 absolute left-1/2 -translate-x-1/2">
                    Help Center
                </h1>
                <button className="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <MoreHorizontal className="h-6 w-6 text-gray-900 dark:text-gray-100" />
                </button>
            </header>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-800 px-4 mt-2">
                <button
                    onClick={() => setActiveTab("faq")}
                    className={cn(
                        "flex-1 pb-4 text-center font-bold text-[15px] transition-colors relative",
                        activeTab === "faq" ? "text-emerald-600" : "text-gray-400 dark:text-gray-500"
                    )}
                >
                    FAQ
                    {activeTab === "faq" && (
                        <motion.div
                            layoutId="activeTabIndicator"
                            className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-t-full"
                        />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("contact")}
                    className={cn(
                        "flex-1 pb-4 text-center font-bold text-[15px] transition-colors relative",
                        activeTab === "contact" ? "text-emerald-600" : "text-gray-400 dark:text-gray-500"
                    )}
                >
                    Contact us
                    {activeTab === "contact" && (
                        <motion.div
                            layoutId="activeTabIndicator"
                            className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-t-full"
                        />
                    )}
                </button>
            </div>

            {activeTab === "faq" ? (
                <div className="p-4 space-y-6">
                    {/* Categories (Horizontal Scroll) */}
                    <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 -mx-4 px-4 snap-x">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => {
                                    setActiveCategory(category);
                                    setOpenIndex(-1); // Close all when switching category
                                }}
                                className={cn(
                                    "px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all border snap-start",
                                    activeCategory === category
                                        ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/20"
                                        : "bg-white dark:bg-gray-900 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                                )}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div className="relative flex items-center group">
                        <div className="absolute left-4 text-gray-400 dark:text-gray-500">
                            <Search className="h-5 w-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-950 border border-transparent rounded-2xl py-3.5 pl-12 pr-12 text-[15px] font-medium text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                        />
                        <button className="absolute right-4 text-emerald-600 hover:text-emerald-700">
                            <Settings2 className="h-5 w-5" />
                        </button>
                    </div>

                    {/* FAQ Accordion List */}
                    <div className="space-y-3 pb-20">
                        {filteredFaqs.length > 0 ? (
                            filteredFaqs.map((faq, index) => {
                                const isOpen = openIndex === index;
                                return (
                                    <div
                                        key={index}
                                        className={cn(
                                            "bg-white dark:bg-gray-900 rounded-2xl border transition-all duration-300 overflow-hidden",
                                            isOpen ? "border-emerald-100 shadow-lg shadow-emerald-500/5 bg-emerald-50/10" : "border-gray-100 dark:border-gray-800 shadow-sm"
                                        )}
                                    >
                                        <button
                                            onClick={() => setOpenIndex(isOpen ? -1 : index)}
                                            className="w-full flex items-center justify-between p-5 text-left bg-transparent"
                                        >
                                            <span className="font-bold text-[15px] text-gray-900 dark:text-gray-100 pr-4">
                                                {faq.question}
                                            </span>
                                            <div className="shrink-0 flex items-center justify-center">
                                                <ChevronDown
                                                    className={cn(
                                                        "h-5 w-5 text-emerald-600 transition-transform duration-300",
                                                        isOpen && "rotate-180"
                                                    )}
                                                />
                                            </div>
                                        </button>

                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-5 pt-0">
                                                        <div className="h-[1px] w-full bg-gray-100 dark:bg-gray-800 mb-4" />
                                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                                                            {faq.answer}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                                <Search className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                <p className="font-bold">No results found</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mb-4 border border-emerald-100">
                        <Settings2 className="h-10 w-10 text-emerald-600" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Contact Support</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm max-w-[250px] font-medium leading-relaxed">
                        We're here to help! Get in touch with us via email or phone for any assistance.
                    </p>
                    
                        <div className="bg-gradient-to-br from-green-900 to-green-800 text-white p-5 md:p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 shadow-xl relative overflow-hidden ">
                            <div className="absolute top-[-20px] right-[-20px] text-8xl opacity-10">📧</div>
                            <p className="font-extrabold text-base md:text-xl relative z-10 text-center md:text-left">Contact us </p>
                            <a href="mailto:support@clickin.app" className="relative z-10 bg-white text-gray-900 font-extrabold px-6 md:px-8 py-3 md:py-4 rounded-xl shadow-[0_0_20px_rgb(255,255,255,0.3)] hover:scale-105 transition-transform text-sm md:text-base whitespace-nowrap">
                                clickinsupport@gmail.com
                            </a>
                        </div>
                </div>
            )}

            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
