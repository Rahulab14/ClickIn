"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, getDoc, doc } from "firebase/firestore";
import { MessageSquare, Star, Clock, AlertTriangle, ShieldCheck, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type FeedbackItem = {
    id: string;
    userId: string;
    userName?: string;
    rating: number;
    message: string;
    tags: string[];
    isSerious: boolean;
    createdAt: any;
};

export default function AdminFeedbackPage() {
    const { user } = useAuth();
    const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "feedback"), orderBy("createdAt", "desc"));
        
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const feedbackPromises = snapshot.docs.map(async (fbDoc) => {
                const data = fbDoc.data();
                let userName = "Anonymous Customer";
                
                // Attempt to fetch user details to display name
                if (data.userId) {
                    try {
                        const userSnapshot = await getDoc(doc(db, "users", data.userId));
                        if (userSnapshot.exists()) {
                            // Extract just the name or phone
                            userName = userSnapshot.data().name || userSnapshot.data().phoneNumber || userName;
                        }
                    } catch (e) {
                         // ignore fetch errors
                    }
                }

                return {
                    id: fbDoc.id,
                    ...data,
                    userName,
                } as FeedbackItem;
            });

            const resolvedFeedbacks = await Promise.all(feedbackPromises);
            setFeedbacks(resolvedFeedbacks);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading && feedbacks.length === 0) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
        </div>
    );

    return (
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-10">
            {/* Mission Control Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">Operations Alpha</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 leading-[0.9]">USER<br />FEEDBACK</h1>
                    <p className="text-gray-500 font-bold max-w-md text-sm uppercase tracking-widest opacity-60">Real-time application experience monitor</p>
                </div>

                <div className="flex items-center gap-4 bg-white p-3 rounded-3xl shadow-xl shadow-gray-100 border border-gray-100">
                    <div className="px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Reports</span>
                        <span className="text-sm font-black text-gray-900">{feedbacks.length}</span>
                    </div>
                    <div className="px-4 py-2 bg-red-500 text-white rounded-2xl shadow-lg shadow-red-200 flex flex-col items-center">
                        <span className="text-[9px] font-black text-white/70 uppercase tracking-widest">Serious Issues</span>
                        <span className="text-sm font-black">{feedbacks.filter(f => f.isSerious).length}</span>
                    </div>
                </div>
            </div>

            {/* Live Feedback Feed */}
            <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className="p-8 border-b border-gray-50 bg-gray-50/50 flex flex-row items-center justify-between sticky top-0 z-10">
                    <div>
                        <CardTitle className="text-2xl font-black tracking-tight">LIVE REVIEWS</CardTitle>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Streaming user sentiment globally</p>
                    </div>
                    <Badge className="bg-emerald-500 text-white border-none py-1.5 px-4 rounded-xl font-bold uppercase text-[9px] tracking-widest animate-pulse">SYNC ACTIVE</Badge>
                </CardHeader>
                <CardContent className="p-0">
                    {feedbacks.length === 0 ? (
                        <div className="p-12 text-center text-gray-400 font-bold">No feedback received yet.</div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {feedbacks.map((fb, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: Math.min(idx * 0.05, 0.5) }} // Cap animation delay
                                    key={fb.id}
                                    className={cn(
                                        "p-6 hover:bg-gray-50/80 transition-all flex flex-col md:flex-row gap-6",
                                        fb.isSerious && "bg-red-50/30 hover:bg-red-50/50 border-l-4 border-l-red-500"
                                    )}
                                >
                                    {/* Left Column: Rating & User */}
                                    <div className="md:w-64 shrink-0 space-y-3">
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star key={star} className={cn("w-5 h-5", fb.rating >= star ? "fill-yellow-400 text-yellow-400" : "fill-gray-100 text-gray-200")} />
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                <User className="w-4 h-4 text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{fb.userName}</p>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {fb.createdAt ? new Date(fb.createdAt.toDate()).toLocaleString() : "Just now"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Message & Tags */}
                                    <div className="flex-1 space-y-4">
                                        {fb.isSerious && (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-widest">
                                                <AlertTriangle className="w-3 h-3" /> Escalate
                                            </div>
                                        )}
                                        
                                        {(fb as any).likedFeatures && (
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Liked Features</p>
                                                <p className="text-[14px] font-medium text-emerald-900 leading-relaxed border-l-2 border-emerald-200 pl-4 italic bg-emerald-50/50 py-1 pr-2 rounded-r-lg">
                                                    "{(fb as any).likedFeatures}"
                                                </p>
                                            </div>
                                        )}

                                        {fb.message ? (
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Detailed Feedback</p>
                                                <p className="text-[15px] font-medium text-gray-800 leading-relaxed border-l-2 border-gray-200 pl-4 italic">
                                                    "{fb.message}"
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-sm italic text-gray-400">No written feedback provided.</p>
                                        )}

                                        {fb.tags && fb.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {fb.tags.map(tag => (
                                                    <span key={tag} className={cn(
                                                        "px-3 py-1 rounded-lg text-xs font-bold border",
                                                        fb.rating >= 4 ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
                                                    )}>
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
