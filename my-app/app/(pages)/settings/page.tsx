"use client";

import { User, Bell, Lock, Shield, Smartphone, Globe, LogOut, ChevronRight, Camera } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="p-8 min-h-screen space-y-8 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your account, preferences, and privacy settings.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Settings Sidebar */}
                <div className="w-full lg:w-64 flex-shrink-0 space-y-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-white text-emerald-600 rounded-xl shadow-sm border border-border font-bold text-sm">
                        <User className="h-5 w-5" /> Account Profile
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/50 text-muted-foreground rounded-xl transition-colors font-medium text-sm">
                        <Bell className="h-5 w-5" /> Notifications
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/50 text-muted-foreground rounded-xl transition-colors font-medium text-sm">
                        <Lock className="h-5 w-5" /> Security
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/50 text-muted-foreground rounded-xl transition-colors font-medium text-sm">
                        <Globe className="h-5 w-5" /> Language & Region
                    </button>
                    <div className="h-px bg-border my-2"></div>
                    <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 rounded-xl transition-colors font-bold text-sm">
                        <LogOut className="h-5 w-5" /> Sign Out
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 space-y-6">

                    {/* Profile Card */}
                    <div className="bg-white rounded-3xl p-8 border border-border shadow-sm">
                        <h2 className="font-bold text-xl mb-6">Personal Information</h2>

                        <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
                            <div className="relative group cursor-pointer">
                                <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-gray-50">
                                    <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200&h=200" alt="Profile" className="h-full w-full object-cover" />
                                </div>
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 w-full">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-muted-foreground">Full Name</label>
                                    <input type="text" defaultValue="Alex Johnson" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-muted-foreground">Email Address</label>
                                    <input type="email" defaultValue="alex.johnson@example.com" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-muted-foreground">Phone Number</label>
                                    <input type="tel" defaultValue="+1 (555) 123-4567" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-muted-foreground">Date of Birth</label>
                                    <input type="date" defaultValue="1985-04-12" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button className="px-6 py-2.5 rounded-xl font-bold text-sm text-foreground bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                            <button className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-colors">Save Changes</button>
                        </div>
                    </div>

                    {/* Other Settings Sections (Mocked) */}
                    <div className="bg-white rounded-3xl p-8 border border-border shadow-sm">
                        <h2 className="font-bold text-xl mb-6">Connected Devices</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-border rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                        <Smartphone className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm">iPhone 14 Pro</h4>
                                        <p className="text-xs text-muted-foreground">Last synced: 2 mins ago</p>
                                    </div>
                                </div>
                                <button className="text-red-500 text-xs font-bold hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">Disconnect</button>
                            </div>
                            <div className="flex items-center justify-between p-4 border border-border rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                        <Activity className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm">Apple Watch Series 8</h4>
                                        <p className="text-xs text-muted-foreground">Real-time vitals monitoring active</p>
                                    </div>
                                </div>
                                <button className="text-red-500 text-xs font-bold hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">Disconnect</button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

// Missing imports
import { Activity } from "lucide-react";
