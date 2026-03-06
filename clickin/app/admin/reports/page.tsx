"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import {
    BarChart3,
    PieChart,
    TrendingUp,
    Download,
    Calendar,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminReportsPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Business Intelligence</h1>
                    <p className="text-zinc-500 mt-2 text-lg">Analyze growth, revenue, and platform performance trends.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11">
                        <Calendar className="w-4 h-4 mr-2" />
                        Last 30 Days
                    </Button>
                    <Button className="h-11 bg-primary hover:bg-primary/90">
                        <Download className="w-4 h-4 mr-2" />
                        Export Data
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-none shadow-sm dark:bg-zinc-900">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold text-zinc-500 uppercase">Growth Rate</CardTitle>
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-zinc-900 dark:text-zinc-100">+24.8%</div>
                        <p className="text-xs text-emerald-600 flex items-center mt-2 font-bold">
                            <ArrowUpRight className="w-3 h-3 mr-1" /> 12% increase from last month
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm dark:bg-zinc-900">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold text-zinc-500 uppercase">Avg. Ticket Size</CardTitle>
                        <BarChart3 className="w-4 h-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-zinc-900 dark:text-zinc-100">₹425.50</div>
                        <p className="text-xs text-emerald-600 flex items-center mt-2 font-bold">
                            <ArrowUpRight className="w-3 h-3 mr-1" /> ₹12.00 increase
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm dark:bg-zinc-900">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold text-zinc-500 uppercase">Return Rate</CardTitle>
                        <PieChart className="w-4 h-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-zinc-900 dark:text-zinc-100">68.2%</div>
                        <p className="text-xs text-red-500 flex items-center mt-2 font-bold">
                            <ArrowDownRight className="w-3 h-3 mr-1" /> 2.1% lower than target
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-sm dark:bg-zinc-900">
                <CardHeader>
                    <CardTitle className="text-xl font-bold">Detailed Analytics Placeholder</CardTitle>
                </CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl m-6">
                    <div className="text-center">
                        <BarChart3 className="w-16 h-16 text-zinc-200 dark:text-zinc-800 mx-auto mb-4" />
                        <p className="text-zinc-500 font-medium">Coming Soon: Visual Data Insights</p>
                        <p className="text-zinc-400 text-sm mt-1">Advanced charting and data visualization is being prepared.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
