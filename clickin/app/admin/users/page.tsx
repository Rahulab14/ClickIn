"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
    collection,
    query,
    onSnapshot,
    updateDoc,
    doc,
    orderBy
} from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Loader2, Users, Search, Filter, Ban, CheckCircle, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type UserData = {
    id: string;
    email: string;
    fullName: string;
    role: string;
    status: string;
    createdAt: string;
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [actionId, setActionId] = useState<string | null>(null);

    useEffect(() => {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const results: UserData[] = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            } as UserData));
            setUsers(results);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleToggleStatus = async (uid: string, currentStatus: string) => {
        setActionId(uid);
        try {
            const newStatus = currentStatus === "blocked" ? "active" : "blocked";
            await updateDoc(doc(db, "users", uid), { status: newStatus });
        } catch (error) {
            console.error("Failed to update user status", error);
        } finally {
            setActionId(null);
        }
    };

    const filteredUsers = users.filter(u =>
        u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Syncing user database...</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">User Management</h1>
                    <p className="text-zinc-500 mt-2 text-lg">Maintain security and oversee all platform participants.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <Input
                            placeholder="Search users..."
                            className="pl-10 h-11 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="h-11">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-sm overflow-hidden dark:bg-zinc-900">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                                <tr>
                                    <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider">Identity</th>
                                    <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider">Level / Role</th>
                                    <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider">Access Status</th>
                                    <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider">Joined</th>
                                    <th className="px-6 py-4 text-sm font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {filteredUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-600">
                                                    {u.fullName?.charAt(0) || u.email?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-zinc-900 dark:text-zinc-100">{u.fullName}</p>
                                                    <p className="text-sm text-zinc-500 font-mono">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className={`font-semibold capitalize ${u.role === 'admin' ? 'border-primary text-primary bg-primary/5' :
                                                    u.role === 'vendor_owner' ? 'border-blue-500 text-blue-500 bg-blue-50' :
                                                        u.role === 'vendor_staff' ? 'border-orange-500 text-orange-500 bg-orange-50' :
                                                            'border-zinc-300 text-zinc-500'
                                                }`}>
                                                {u.role?.replace('_', ' ')}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`h-2 w-2 rounded-full ${u.status === 'blocked' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                                <span className="text-sm font-medium capitalize">{u.status || 'active'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-500">
                                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleToggleStatus(u.id, u.status || 'active')}
                                                disabled={actionId === u.id || u.role === 'admin'}
                                                className={u.status === 'blocked' ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50' : 'text-red-500 hover:text-red-600 hover:bg-red-50'}
                                            >
                                                {actionId === u.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : u.status === 'blocked' ? (
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                ) : (
                                                    <Ban className="w-4 h-4 mr-2" />
                                                )}
                                                {u.status === 'blocked' ? 'Unblock' : 'Block'}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
