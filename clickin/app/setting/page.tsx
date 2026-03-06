"use client"

import { Bell, CreditCard, HelpCircle, LogOut, ChevronRight, Moon } from "lucide-react"

export default function SettingsPage() {
    return (
        <div className="min-h-screen bg-gray-50 pb-24 font-sans selection:bg-indigo-100">
            <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto w-full">
                <header className="bg-white p-6 shadow-sm sticky top-0 z-10 md:mt-4 md:rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden ring-2 ring-gray-100">
                            <img
                                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Rahul Clickin</h1>
                            <p className="text-sm text-gray-500 font-medium mt-0.5">+91 98765 43210</p>
                            <button className="text-xs text-red-500 font-bold mt-1.5 hover:text-red-600 transition-colors">Edit Profile</button>
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-0 md:mt-6 space-y-4">
                    {/* Account Settings */}
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <h2 className="px-5 py-3.5 bg-gray-50/80 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Account</h2>
                        <div className="divide-y divide-gray-50">
                            <div className="flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-3.5">
                                    <div className="p-2 bg-indigo-50 text-indigo-500 rounded-xl group-hover:bg-indigo-100 transition-colors">
                                        <Bell className="h-5 w-5" />
                                    </div>
                                    <span className="font-semibold text-[15px] text-gray-800 tracking-tight">Notifications</span>
                                </div>
                                <div className="w-[42px] h-6 bg-emerald-500 rounded-full relative transition-colors cursor-pointer shadow-inner">
                                    <div className="absolute right-1 top-1 bg-white w-4 h-4 rounded-full shadow-sm"></div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-3.5">
                                    <div className="p-2 bg-sky-50 text-sky-500 rounded-xl group-hover:bg-sky-100 transition-colors">
                                        <CreditCard className="h-5 w-5" />
                                    </div>
                                    <span className="font-semibold text-[15px] text-gray-800 tracking-tight">Payment Methods</span>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-gray-400 transition-colors" />
                            </div>
                        </div>
                    </section>

                    {/* Support */}
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <h2 className="px-5 py-3.5 bg-gray-50/80 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Support</h2>
                        <div className="divide-y divide-gray-50">
                            <div className="flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-3.5">
                                    <div className="p-2 bg-gray-50 text-gray-500 rounded-xl group-hover:bg-gray-100 transition-colors">
                                        <HelpCircle className="h-5 w-5" />
                                    </div>
                                    <span className="font-semibold text-[15px] text-gray-800 tracking-tight">Help & Support</span>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-gray-400 transition-colors" />
                            </div>
                            <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-red-50/80 transition-colors group">
                                <div className="flex items-center gap-3.5 text-red-500">
                                    <div className="p-2 bg-red-50 text-red-500 rounded-xl group-hover:bg-white transition-colors">
                                        <LogOut className="h-5 w-5" />
                                    </div>
                                    <span className="font-bold text-[15px] tracking-tight">Log Out</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="text-center text-[11px] text-gray-400 py-6 font-mono tracking-wider">
                        Version 2.0.0 (MVP)
                    </div>
                </div>
            </div>
        </div>
    )
}
