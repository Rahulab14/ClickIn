"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import {
    Settings,
    Lock,
    Bell,
    Globe,
    Database,
    ShieldAlert,
    Save
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function AdminSettingsPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">System Settings</h1>
                    <p className="text-zinc-500 mt-2 text-lg">Configure global platform behavior and security protocols.</p>
                </div>
                <Button className="h-11 bg-primary hover:bg-primary/90">
                    <Save className="w-4 h-4 mr-2" />
                    Save All Changes
                </Button>
            </div>

            <div className="grid gap-6">
                <Card className="border-none shadow-sm dark:bg-zinc-900">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-orange-500" />
                            <CardTitle>Platform Maintenance</CardTitle>
                        </div>
                        <CardDescription>Emergency switches and general availability controls.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                            <div className="space-y-0.5">
                                <Label className="text-base font-bold">Maintenance Mode</Label>
                                <p className="text-sm text-zinc-500">Temporarily disable the app for all users except admins.</p>
                            </div>
                            <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                            <div className="space-y-0.5">
                                <Label className="text-base font-bold">Auto-Approve Vendors</Label>
                                <p className="text-sm text-zinc-500">Bypass manual review for new vendor signups.</p>
                            </div>
                            <Switch />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm dark:bg-zinc-900">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Lock className="w-5 h-5 text-blue-500" />
                            <CardTitle>Security & Access Control</CardTitle>
                        </div>
                        <CardDescription>Manage password policies and admin session security.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button variant="outline" className="h-12 justify-start">
                                <Database className="w-4 h-4 mr-3" />
                                Force Database Re-sync
                            </Button>
                            <Button variant="outline" className="h-12 justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
                                <Lock className="w-4 h-4 mr-3" />
                                Terminate All User Sessions
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
