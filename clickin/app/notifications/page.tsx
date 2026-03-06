"use client";

import React, { useState } from "react";
import { ArrowLeft, Trash2, X, ShoppingBag, Ticket, Wallet, User, CheckCheck, Square, CheckSquare, MoreVertical, BellRing, Star, Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
    id: string;
    title: string;
    date: string;
    time: string;
    message: string;
    isNew?: boolean;
    type: 'error' | 'success' | 'warning' | 'info' | 'neutral';
    icon: React.ReactNode;
}

const initialNotifications: Notification[] = [
    {
        id: "1",
        title: "Orders Cancelled!",
        date: "Today",
        time: "8:50 PM",
        message: "You have canceled an order at Burger Hut. We apologize for your inconvenience. We will try to improve our service next time 😔",
        isNew: true,
        type: 'error',
        icon: <X className="w-5 h-5 text-white" />,
    },
    {
        id: "2",
        title: "Orders Successful!",
        date: "Today",
        time: "8:49 PM",
        message: "You have placed an order at Burger Hut and paid $24. Your food will arrive soon. Enjoy our services 😋",
        isNew: true,
        type: 'success',
        icon: <ShoppingBag className="w-5 h-5 text-white" />,
    },
    {
        id: "3",
        title: "New Services Available!",
        date: "Yesterday",
        time: "10:52 AM",
        message: "You can now make multiple food orders at one time. You can also cancel your orders.",
        type: 'warning',
        icon: <Ticket className="w-5 h-5 text-white" />,
    },
    {
        id: "4",
        title: "Credit Card Connected!",
        date: "December 12, 2022",
        time: "3:38 PM",
        message: "Your credit card has been successfully linked with Foodu. Enjoy our services.",
        type: 'info',
        icon: <Wallet className="w-5 h-5 text-white" />,
    },
    {
        id: "5",
        title: "Account Setup Successful!",
        date: "December 12, 2022",
        time: "2:27 PM",
        message: "Your account creation is successful, you can now experience our services.",
        type: 'success',
        icon: <User className="w-5 h-5 text-white" />,
    },
];

// Helper to get styles based on type
const getTypeStyles = (type: Notification['type']) => {
    switch (type) {
        case 'error':
            return {
                bg: "bg-red-100 dark:bg-red-900/30",
                iconContainer: "bg-[#FF4B4B]", // Vibrant Red
                icon: <X className="w-5 h-5 text-white" />
            };
        case 'success':
            return {
                bg: "bg-green-100 dark:bg-green-900/30",
                iconContainer: "bg-[#22C55E]", // Vibrant Green
                icon: <ShoppingBag className="w-5 h-5 text-white" />
            };
        case 'warning':
            return {
                bg: "bg-orange-100 dark:bg-orange-900/30",
                iconContainer: "bg-[#F97316]", // Vibrant Orange
                icon: <Ticket className="w-5 h-5 text-white" />
            };
        case 'info':
            return {
                bg: "bg-blue-100 dark:bg-blue-900/30",
                iconContainer: "bg-[#3B82F6]", // Vibrant Blue
                icon: <Wallet className="w-5 h-5 text-white" />
            };
        default:
            return {
                bg: "bg-gray-100 dark:bg-gray-800",
                iconContainer: "bg-gray-500",
                icon: <BellRing className="w-5 h-5 text-white" />
            };
    }
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

export default function NotificationPage() {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Group notifications by date
    const groupedNotifications = notifications.reduce((acc, curr) => {
        (acc[curr.date] = acc[curr.date] || []).push(curr);
        return acc;
    }, {} as Record<string, Notification[]>);

    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        if (isSelectionMode) {
            setSelectedIds(new Set());
        }
        setShowDeleteConfirm(false);
    };

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const selectAll = () => {
        if (selectedIds.size === notifications.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(notifications.map(n => n.id)));
        }
    };

    const handleDelete = () => {
        setNotifications(prev => prev.filter(n => !selectedIds.has(n.id)));
        setSelectedIds(new Set());
        setIsSelectionMode(false);
        setShowDeleteConfirm(false);
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isNew: false })));
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] dark:bg-black/95 flex justify-center py-0 md:py-8 lg:py-12 px-0 md:px-4 relative overflow-hidden">

            {/* Background Decorative Blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-2xl bg-white/60 dark:bg-black/40 backdrop-blur-3xl rounded-none md:rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.1)] md:border border-white/40 dark:border-white/10 overflow-hidden flex flex-col min-h-screen md:min-h-0 md:max-h-[850px] ring-1 ring-black/[0.03]"
            >
                {/* Header */}
                <header className="flex items-center justify-between px-8 py-8 sticky top-0 bg-white/40 dark:bg-black/40 backdrop-blur-3xl z-20 border-b border-white/20 dark:border-white/5">
                    {/* Left: Back Button */}
                    <Link
                        href="/"
                        className="group p-3.5 rounded-2xl bg-white dark:bg-white/10 shadow-sm border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/20 transition-all active:scale-95 duration-200 z-30"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white group-hover:-translate-x-0.5 transition-transform" />
                    </Link>

                    {/* Center: Title */}
                    <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600 dark:from-white dark:via-gray-200 dark:to-gray-500 tracking-tight leading-none">
                            Alerts
                        </h1>
                        <div className="h-1 w-4 bg-primary rounded-full mt-1 opacity-50" />
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3 z-30">
                        <button
                            onClick={markAllAsRead}
                            className="group p-3.5 rounded-2xl bg-white dark:bg-white/10 border border-gray-100 dark:border-white/5 hover:bg-primary/5 hover:border-primary/20 transition-all active:scale-95 shadow-sm"
                            title="Mark all as read"
                        >
                            <CheckCheck className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                        </button>

                        <button
                            onClick={() => {
                                if (isSelectionMode && selectedIds.size > 0) {
                                    setShowDeleteConfirm(true);
                                } else {
                                    toggleSelectionMode();
                                }
                            }}
                            className={cn(
                                "p-3.5 rounded-2xl transition-all active:scale-95 duration-300 shadow-sm border",
                                isSelectionMode
                                    ? "bg-rose-500 border-rose-500 text-white shadow-xl shadow-rose-500/20"
                                    : "bg-white dark:bg-white/10 border-gray-100 dark:border-white/5 hover:bg-rose-50 text-gray-500 hover:text-rose-500 hover:border-rose-100"
                            )}
                            title={isSelectionMode ? "Delete Selected" : "Select to Delete"}
                        >
                            <Trash2 className={cn("w-5 h-5", isSelectionMode && "fill-current")} />
                        </button>
                    </div>
                </header>

                {/* Sub-header: Select All Control (Visible only in selection mode) */}
                <AnimatePresence>
                    {isSelectionMode && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-gray-50/80 dark:bg-white/5 border-b border-gray-100 dark:border-white/5 backdrop-blur-sm"
                        >
                            <div className="px-6 py-3 flex items-center">
                                <button
                                    onClick={selectAll}
                                    className="flex items-center gap-3 text-sm font-semibold text-foreground/80 hover:text-primary transition-colors p-1"
                                >
                                    {selectedIds.size === notifications.length && notifications.length > 0 ? (
                                        <div className="w-5 h-5 rounded bg-primary flex items-center justify-center text-white shadow-sm">
                                            <Check className="w-3.5 h-3.5" />
                                        </div>
                                    ) : (
                                        <div className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-transparent" />
                                    )}
                                    Select All <span className="text-muted-foreground font-normal">({selectedIds.size})</span>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-0 bg-white dark:bg-black">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="p-4 md:p-6 space-y-8"
                    >
                        <AnimatePresence mode="popLayout">
                            {Object.entries(groupedNotifications).map(([date, items]) => (
                                <div key={date} className="space-y-4">
                                    <motion.div
                                        variants={itemVariants}
                                        className="px-4 py-2 bg-gray-100/50 dark:bg-white/5 rounded-2xl w-fit ml-2"
                                    >
                                        <h2 className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-[0.2em]">
                                            {date}
                                        </h2>
                                    </motion.div>

                                    <div className="space-y-6">
                                        {items.map((notification) => {
                                            const styles = getTypeStyles(notification.type);
                                            return (
                                                <motion.div
                                                    key={notification.id}
                                                    variants={itemVariants}
                                                    exit="exit"
                                                    layout
                                                    onClick={() => isSelectionMode && toggleSelection(notification.id)}
                                                    className={cn(
                                                        "group relative flex gap-5 p-5 pr-2 transition-all duration-500 cursor-pointer rounded-[2rem] border border-transparent",
                                                        isSelectionMode && "hover:bg-white dark:hover:bg-white/5 hover:shadow-xl hover:shadow-black/5 hover:border-gray-100 dark:hover:border-white/5",
                                                        isSelectionMode && selectedIds.has(notification.id) && "bg-white dark:bg-white/5 shadow-2xl shadow-black/5 border-gray-100 dark:border-white/10"
                                                    )}
                                                >
                                                    {/* Selection Checkbox */}
                                                    {isSelectionMode && (
                                                        <div className="flex items-center justify-center mr-1">
                                                            {selectedIds.has(notification.id) ? (
                                                                <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                                                    <Check className="w-4 h-4" strokeWidth={3} />
                                                                </div>
                                                            ) : (
                                                                <div className="w-6 h-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-transparent" />
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Icon Box */}
                                                    <div className={cn(
                                                        "flex-shrink-0 w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-xl ring-4 ring-white dark:ring-white/5",
                                                        styles.iconContainer
                                                    )}>
                                                        <div className="text-white drop-shadow-md">
                                                            {styles.icon}
                                                        </div>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0 flex flex-col gap-1.5 pt-1">
                                                        <div className="flex justify-between items-start gap-3">
                                                            <h3 className="font-black text-lg text-gray-900 dark:text-white leading-tight tracking-tight">
                                                                {notification.title}
                                                            </h3>

                                                            {notification.isNew && !isSelectionMode && (
                                                                <div className="flex items-center gap-1.5 bg-emerald-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                                                                    <BellRing className="w-3 h-3" />
                                                                    New
                                                                </div>
                                                            )}
                                                        </div>

                                                        <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-relaxed font-bold">
                                                            {notification.message}
                                                        </p>

                                                        <div className="flex items-center gap-2 text-[10px] text-gray-300 dark:text-gray-600 font-black uppercase tracking-widest mt-1">
                                                            {notification.date} <span className="w-1 h-1 rounded-full bg-gray-200 dark:bg-gray-800" /> {notification.time}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </AnimatePresence>

                        {/* End of list spacer */}
                        {notifications.length === 0 && (
                            <div className="h-[50vh] flex flex-col items-center justify-center text-center p-8">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="p-6 bg-gray-50 dark:bg-white/5 rounded-full mb-6 relative"
                                >
                                    <BellRing className="w-12 h-12 text-muted-foreground/30" />
                                </motion.div>
                                <h3 className="text-xl font-bold text-foreground">No Notifications</h3>
                                <p className="text-muted-foreground mt-2">You're all caught up!</p>
                            </div>
                        )}

                        <div className="h-10" />
                    </motion.div>
                </div>
            </motion.div >

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {
                    showDeleteConfirm && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                                onClick={() => setShowDeleteConfirm(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative bg-white dark:bg-[#1a1a1a] p-0 rounded-[2rem] shadow-2xl max-w-sm w-full overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />

                                <div className="p-8 pb-6 flex flex-col items-center text-center">
                                    <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-6">
                                        <Trash2 className="w-10 h-10 text-red-500" />
                                    </div>

                                    <h3 className="text-2xl font-bold text-foreground mb-3">Delete items?</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        You are about to delete <span className="font-bold text-foreground">{selectedIds.size}</span> notifications.
                                        <br />This action cannot be undone.
                                    </p>
                                </div>

                                <div className="p-6 pt-2 flex gap-3">
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="flex-1 py-3.5 rounded-xl font-bold text-foreground bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="flex-1 py-3.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        Yes, Delete
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >
        </div >
    );
}
