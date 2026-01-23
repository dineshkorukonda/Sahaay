"use client";

import { Users, Bell, Folder, AlertCircle, Plus, Settings, MoreVertical, Activity, PersonStanding, ChevronRight } from "lucide-react";
import Image from "next/image";

const members = [
    {
        name: "Sarah Johnson",
        role: "MOTHER",
        status: "STABLE",
        statusColor: "bg-emerald-100 text-emerald-700",
        adherence: 95,
        adherenceColor: "bg-emerald-500",
        latestUpdate: "Latest: Blood pressure logged (120/80)",
        latestIcon: "✓",
        latestIconBg: "bg-emerald-100 text-emerald-600",
        emergencyAccess: true,
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200",
    },
    {
        name: "James Johnson",
        role: "SON",
        status: "ATTENTION REQ.",
        statusColor: "bg-red-100 text-red-700",
        adherence: 60,
        adherenceColor: "bg-red-500",
        latestUpdate: "Alert: Missed morning insulin dose",
        latestIcon: "!",
        latestIconBg: "bg-red-100 text-red-600",
        emergencyAccess: true,
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200",
    },
    {
        name: "Emily Davis",
        role: "GRANDMOTHER",
        status: "STABLE",
        statusColor: "bg-blue-100 text-blue-700",
        adherence: 92,
        adherenceColor: "bg-emerald-500",
        latestUpdate: "Latest: Daily walking goal reached",
        latestIcon: "🚶",
        latestIconBg: "bg-emerald-100 text-emerald-600",
        emergencyAccess: false,
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200",
    },
];

export default function FamilyPage() {
    return (
        <div className="p-8 min-h-screen space-y-8 pb-20">
            {/* Alert Banner */}
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 text-red-800 animate-in slide-in-from-top-2 fade-in duration-500">
                <div className="h-6 w-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-xs">!</span>
                </div>
                <p className="text-sm font-medium">James Johnson missed his 8:00 AM insulin dose. Notification sent to his device.</p>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Family Care Overview</h1>
                    <p className="text-emerald-600 text-sm font-medium">Last clinical data sync: 2 minutes ago</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-gray-100 text-foreground px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-gray-200 transition-colors">
                        <Settings className="h-4 w-4" /> Manage Access
                    </button>
                    <button className="bg-emerald-500 text-white px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-colors">
                        <Plus className="h-4 w-4" /> Invite Member
                    </button>
                </div>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-muted-foreground font-medium">Family Adherence</p>
                        <Activity className="h-5 w-5 text-emerald-500" />
                    </div>
                    <p className="text-4xl font-bold text-foreground mb-2">88.4%</p>
                    <p className="text-xs font-bold text-emerald-600">↗ +2.1% from last week</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-muted-foreground font-medium">Active Alerts</p>
                        <Bell className="h-5 w-5 text-red-500" />
                    </div>
                    <p className="text-4xl font-bold text-foreground mb-2">02</p>
                    <p className="text-xs font-bold text-red-600">! Requires immediate attention</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-muted-foreground font-medium">Shared Records</p>
                        <Folder className="h-5 w-5 text-blue-500" />
                    </div>
                    <p className="text-4xl font-bold text-foreground mb-2">12</p>
                    <p className="text-xs font-bold text-emerald-600">3 recently updated</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-6 border-b border-border pb-4">
                <button className="font-bold text-foreground border-b-2 border-emerald-500 pb-4 -mb-4.5 px-2">All Members</button>
                <button className="font-medium text-muted-foreground hover:text-foreground px-2">High Priority <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded ml-1">1</span></button>
                <button className="font-medium text-muted-foreground hover:text-foreground px-2">Shared Data</button>
            </div>

            {/* Member Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {members.map((member, i) => (
                    <div key={i} className={`bg-white rounded-3xl p-6 border ${member.status.includes("ATTENTION") ? 'border-red-200 shadow-red-100' : 'border-border'} shadow-sm relative`}>
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex gap-4">
                                <img src={member.image} alt={member.name} className="h-14 w-14 rounded-2xl object-cover" />
                                <div>
                                    <h3 className="font-bold text-lg">{member.name}</h3>
                                    <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${member.statusColor}`}>
                                        {member.role} • {member.status}
                                    </div>
                                </div>
                            </div>
                            <button className="text-muted-foreground hover:bg-gray-100 p-1 rounded"><MoreVertical className="h-5 w-5" /></button>
                        </div>

                        <div className="mb-6">
                            <div className="flex justify-between text-xs mb-2">
                                <span className="text-muted-foreground">Medication Adherence</span>
                                <span className={`font-bold ${member.adherence < 80 ? 'text-red-500' : 'text-emerald-600'}`}>{member.adherence}%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${member.adherenceColor}`} style={{ width: `${member.adherence}%` }}></div>
                            </div>
                        </div>

                        <div className="flex gap-3 mb-6 items-start">
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] ${member.latestIconBg}`}>
                                {member.latestIcon}
                            </div>
                            <p className={`text-xs ${member.status.includes("ATTENTION") ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
                                {member.latestUpdate}
                            </p>
                        </div>

                        <div className="pt-4 border-t border-border flex items-center justify-between">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Emergency Access</span>
                            <div className="flex items-center gap-2">
                                <div className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${member.emergencyAccess ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                                    <div className={`bg-white h-3 w-3 rounded-full shadow-sm transform transition-transform ${member.emergencyAccess ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                </div>
                                <button className="text-xs text-emerald-600 font-bold flex items-center hover:underline group">
                                    View Logs <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Permission Management */}
            <div className="bg-white rounded-3xl p-8 border border-border shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold">Permission Management</h3>
                        <p className="text-muted-foreground text-sm">Control which health data points are shared across the family group.</p>
                    </div>
                    <button className="border border-border text-foreground px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors">
                        Review Privacy Policy
                    </button>
                </div>

                <div className="flex flex-wrap gap-4">
                    <PermissionToggle icon="♥" label="Real-time Vitals" active={true} color="bg-emerald-500" />
                    <PermissionToggle icon="🧪" label="Lab Results" active={true} color="bg-emerald-500" />
                    <PermissionToggle icon="💊" label="Prescriptions" active={false} color="bg-gray-300" />
                    <PermissionToggle icon="📅" label="Appointments" active={true} color="bg-emerald-500" />
                </div>
            </div>
        </div>
    );
}

function PermissionToggle({ icon, label, active, color }: { icon: string, label: string, active: boolean, color: string }) {
    return (
        <div className="flex-1 min-w-[200px] border border-border rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <span className={`text-lg ${active ? 'text-emerald-500' : 'text-gray-400'}`}>{icon}</span>
                <span className="font-bold text-sm text-foreground">{label}</span>
            </div>
            <div className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${color}`}>
                <div className={`bg-white h-3 w-3 rounded-full shadow-sm transform transition-transform ${active ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </div>
        </div>
    )
}
