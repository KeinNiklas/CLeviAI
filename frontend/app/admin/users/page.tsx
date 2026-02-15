'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader2, Users, Search, Edit2, Shield, Power, Trash2, MoreVertical, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
    id: string;
    email: string;
    full_name: string;
    role: string;
    tier: string;
    disabled: boolean;
}

import { useLanguage } from '@/lib/LanguageContext';

export default function AdminUsersPage() {
    const { token } = useAuth();
    const { t } = useLanguage();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null); // Track specific action loading state

    const fetchUsers = async () => {
        if (!token) return;
        try {
            const res = await fetch('http://localhost:8000/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Ensure tier defaults if missing from old data
                const usersWithTier = data.map((u: any) => ({
                    ...u,
                    tier: u.tier || 'standard'
                }));
                setUsers(usersWithTier);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [token]);

    const handleUpdateUser = async (user: User, updates: Partial<User>) => {
        if (!token) return;
        setActionLoading(user.id);
        try {
            const res = await fetch(`http://localhost:8000/users/${user.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });

            if (res.ok) {
                setUsers(users.map(u => u.id === user.id ? { ...u, ...updates } : u));
                setEditingUserId(null); // Close menu on success
            } else {
                console.error("Failed to update");
            }
        } catch (error) {
            console.error("Failed to update user", error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteUser = async (user: User) => {
        if (!token) return;
        if (!confirm(`${t.admin.confirm_delete} "${user.full_name}"${t.admin.confirm_delete_suffix}`)) return;

        setActionLoading(user.id);
        try {
            const res = await fetch(`http://localhost:8000/users/${user.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                setUsers(users.filter(u => u.id !== user.id));
            } else {
                alert("Failed to delete user");
            }
        } catch (error) {
            console.error("Failed to delete user", error);
        } finally {
            setActionLoading(null);
        }
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{t.admin.users_title}</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder={t.admin.users_search}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 w-64 rounded-lg bg-secondary/50 border border-border/50 focus:border-primary/50 outline-none transition-all focus:w-80"
                    />
                </div>
            </div>

            <Card className="border-border/50 bg-card/30 backdrop-blur-xl overflow-visible">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-primary" />
                        <span>{t.admin.users_all} ({users.length})</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="overflow-visible">
                    <div className="overflow-visible min-h-[400px]"> {/* Ensure space for dropdowns */}
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-border/50 text-left">
                                    <th className="py-3 px-4 font-medium text-muted-foreground">{t.admin.table_name}</th>
                                    <th className="py-3 px-4 font-medium text-muted-foreground">{t.admin.table_email}</th>
                                    <th className="py-3 px-4 font-medium text-muted-foreground">{t.admin.table_role}</th>
                                    <th className="py-3 px-4 font-medium text-muted-foreground">{t.admin.table_tier}</th>
                                    <th className="py-3 px-4 font-medium text-muted-foreground">{t.admin.table_status}</th>
                                    <th className="py-3 px-4 font-medium text-muted-foreground text-right">{t.admin.table_actions}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center">
                                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-muted-foreground">
                                            {t.admin.users_search}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="group hover:bg-secondary/30 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary ring-1 ring-primary/20">
                                                        {user.full_name?.[0]?.toUpperCase() || 'U'}
                                                    </div>
                                                    <span className="font-medium">{user.full_name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-muted-foreground font-mono">{user.email}</td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.role === 'admin'
                                                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                    }`}>
                                                    {user.role === 'admin' ? t.admin.role_admin : t.admin.role_user}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.tier === 'pro'
                                                    ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                    : 'bg-secondary text-muted-foreground border-border'
                                                    }`}>
                                                    {user.tier === 'pro' ? t.admin.tier_pro : t.admin.tier_standard}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${!user.disabled
                                                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                                                    }`}>
                                                    {!user.disabled ? t.admin.status_active : t.admin.status_disabled}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right relative">
                                                <div className="flex items-center justify-end space-x-2">
                                                    {/* Edit Button & Dropdown */}
                                                    <div className="relative">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            disabled={actionLoading === user.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingUserId(editingUserId === user.id ? null : user.id);
                                                            }}
                                                            className={`h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary ${editingUserId === user.id ? 'bg-primary/10 text-primary' : ''}`}
                                                        >
                                                            {actionLoading === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit2 className="w-4 h-4" />}
                                                        </Button>

                                                        <AnimatePresence>
                                                            {editingUserId === user.id && (
                                                                <>
                                                                    <div
                                                                        className="fixed inset-0 z-40 bg-transparent"
                                                                        onClick={() => setEditingUserId(null)}
                                                                    />
                                                                    <motion.div
                                                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                                        transition={{ duration: 0.15 }}
                                                                        className="absolute right-0 mt-2 w-56 rounded-lg border border-border/50 bg-background/95 backdrop-blur-xl shadow-xl z-50 overflow-hidden"
                                                                    >
                                                                        <div className="p-1 space-y-1">
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation(); // Prevent closing immediately
                                                                                    handleUpdateUser(user, { role: user.role === 'admin' ? 'user' : 'admin' });
                                                                                }}
                                                                                className="flex w-full items-center space-x-2 px-3 py-2 rounded-md hover:bg-secondary/80 text-sm transition-colors"
                                                                            >
                                                                                <Shield className="w-4 h-4 text-purple-400" />
                                                                                <span>{user.role === 'admin' ? t.admin.demote_user : t.admin.promote_admin}</span>
                                                                            </button>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleUpdateUser(user, { tier: user.tier === 'pro' ? 'standard' : 'pro' });
                                                                                }}
                                                                                className="flex w-full items-center space-x-2 px-3 py-2 rounded-md hover:bg-secondary/80 text-sm transition-colors"
                                                                            >
                                                                                {user.tier === 'pro' ? (
                                                                                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                                                                                ) : (
                                                                                    <div className="w-4 h-4 text-yellow-500 font-bold" >★</div>
                                                                                )}
                                                                                <span>{user.tier === 'pro' ? t.admin.downgrade_standard : t.admin.upgrade_pro}</span>
                                                                            </button>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleUpdateUser(user, { disabled: !user.disabled });
                                                                                }}
                                                                                className="flex w-full items-center space-x-2 px-3 py-2 rounded-md hover:bg-destructive/10 text-sm text-destructive transition-colors"
                                                                            >
                                                                                <Power className="w-4 h-4" />
                                                                                <span>{user.disabled ? t.admin.enable_account : t.admin.disable_account}</span>
                                                                            </button>
                                                                        </div>
                                                                    </motion.div>
                                                                </>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>

                                                    {/* Delete Button */}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={actionLoading === user.id}
                                                        onClick={() => handleDeleteUser(user)}
                                                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                                                        title={t.admin.delete_user}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
