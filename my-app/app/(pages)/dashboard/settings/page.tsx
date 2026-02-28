"use client";

import React, { useState, useEffect } from "react";
import { User, Globe, LogOut, Trophy } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/components/ui/toast";

interface Badge {
    _id: string;
    badgeType: string;
    badgeName: string;
    description: string;
    icon?: string;
    earnedAt: string;
    metadata?: {
        problem?: string;
        milestone?: string;
        taskCount?: number;
        [key: string]: unknown;
    };
}

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [badges, setBadges] = useState<Badge[]>([]);
    const [formData, setFormData] = useState({
        email: '',
        mobile: '',
        dob: '',
        language: 'English'
    });
    const { showToast } = useToast();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const [profileRes, badgesRes] = await Promise.all([
                    fetch('/api/profile'),
                    fetch('/api/achievements/badges')
                ]);
                
                if (profileRes.ok) {
                    const data = await profileRes.json();
                    if (data.success) {
                        setFormData({
                            email: data.data.user?.email || '',
                            mobile: data.data.user?.mobile || '',
                            dob: data.data.profile?.dob || '',
                            language: data.data.profile?.language || 'English'
                        });
                    }
                }
                
                if (badgesRes.ok) {
                    const badgesData = await badgesRes.json();
                    if (badgesData.success) {
                        setBadges(badgesData.data || []);
                    }
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
                showToast('Failed to load profile', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [showToast]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                showToast('Profile updated successfully', 'success');
            } else {
                showToast(data.error || 'Failed to update profile', 'error');
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            showToast('Failed to update profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <Loader fullScreen text="Loading profile..." />;
    }

    return (
        <div className="p-8 min-h-screen space-y-8 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your account and preferences.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Settings Sidebar */}
                <div className="w-full lg:w-64 flex-shrink-0 space-y-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-white text-emerald-600 rounded-xl shadow-sm border border-border font-bold text-sm">
                        <User className="h-5 w-5" /> Account Profile
                    </button>
                    <div className="h-px bg-border my-2"></div>
                    <button 
                        onClick={async () => {
                            try {
                                const res = await fetch('/api/auth/logout', {
                                    method: 'POST'
                                });
                                if (res.ok) {
                                    window.location.href = '/auth/login';
                                } else {
                                    alert('Logout failed. Please try again.');
                                }
                            } catch (err) {
                                console.error('Logout error:', err);
                                alert('Logout failed. Please try again.');
                            }
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 rounded-xl transition-colors font-bold text-sm"
                    >
                        <LogOut className="h-5 w-5" /> Sign Out
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 space-y-6">
                    {/* Profile Card */}
                    <div className="bg-white rounded-3xl p-8 border border-border shadow-sm">
                        <h2 className="font-bold text-xl mb-6">Personal Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground">Email Address</label>
                                <input 
                                    type="email" 
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground">Phone Number</label>
                                <input 
                                    type="tel" 
                                    value={formData.mobile}
                                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground">Date of Birth</label>
                                <input 
                                    type="date" 
                                    value={formData.dob}
                                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                                    <Globe className="h-4 w-4" /> Language
                                </label>
                                <select
                                    value={formData.language}
                                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                >
                                    <option value="English">English</option>
                                    <option value="Hindi">हिन्दी (Hindi)</option>
                                </select>
                                <p className="text-xs text-muted-foreground mt-1">Other languages coming soon</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={handleSave}
                                disabled={saving}
                                className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-colors disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>

                    {/* Badges Section */}
                    <div className="bg-white rounded-3xl p-8 border border-border shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <Trophy className="h-6 w-6 text-yellow-500" />
                            <h2 className="font-bold text-xl">Your Badges</h2>
                        </div>

                        {badges.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {badges.map((badge) => (
                                    <div
                                        key={badge._id}
                                        className="p-4 rounded-xl border-2 border-gray-200 hover:border-emerald-300 transition-colors bg-gradient-to-br from-white to-gray-50"
                                    >
                                        <div className="text-3xl mb-2">{badge.icon || '🏆'}</div>
                                        <h3 className="font-bold text-sm mb-1">{badge.badgeName}</h3>
                                        <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {new Date(badge.earnedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                                <p className="text-muted-foreground font-medium">No badges earned yet</p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Complete tasks and reach milestones to earn badges!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
