"use client";

import React from "react";
import { Bell, Flame, Medal, CheckCircle2, MessageSquare, Pill } from "lucide-react";
import Image from "next/image";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/components/ui/toast";

export default function DashboardPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [data, setData] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const { showToast } = useToast();

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/dashboard/home');
                const json = await res.json();
                if (json.success) {
                    setData(json.data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <Loader fullScreen text="Loading dashboard..." />;
    }

    const { user, profile, stats, actions } = data || {};
    const userName = user?.name || "User";
    const streak = stats?.streak || 0;
    const points = stats?.points || 0;

    return (
        <div className="p-8 min-h-screen space-y-8">
            {/* Header */}
            <header className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Main Dashboard</h1>
                <div className="flex items-center gap-6">
                    <div className="relative w-96">
                        <input
                            type="text"
                            placeholder="Search medical records..."
                            className="w-full bg-white rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all border-none shadow-sm"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                        <Bell className="h-6 w-6" />
                        <span className="absolute top-1.5 right-2 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background"></span>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-sm font-bold leading-none">{userName}</p>
                            <p className="text-xs text-muted-foreground pt-1">Patient ID: #{user?._id?.toString().slice(-4)}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-emerald-100 overflow-hidden border border-white shadow-sm">
                            <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100&h=100" alt="Profile" className="h-full w-full object-cover" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Welcome & Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Welcome Block */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-4xl font-bold tracking-tight text-foreground">Good Morning, {userName}</h2>
                        <div className="flex items-center gap-4">
                            {streak > 0 && (
                                <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full border border-orange-200">
                                    <Flame className="h-5 w-5 text-orange-500" />
                                    <span className="text-orange-700 font-bold">{streak}-day streak</span>
                                </div>
                            )}
                            {points > 0 && (
                                <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200">
                                    <Medal className="h-5 w-5 text-emerald-500" />
                                    <span className="text-emerald-700 font-bold">{points} points</span>
                                </div>
                            )}
                        </div>
                        {streak > 0 ? (
                            <p className="text-muted-foreground text-lg">You&apos;re on a {streak}-day streak! Keep up the great work and stay healthy.</p>
                        ) : (
                            <p className="text-muted-foreground text-lg">Welcome to your health dashboard. Start tracking your health journey today.</p>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <button className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-95">
                            View Health Report
                        </button>
                        <button className="bg-white/80 backdrop-blur-sm border border-border text-foreground px-6 py-3 rounded-xl font-semibold hover:bg-white transition-all active:scale-95">
                            Care Plan Details
                        </button>
                    </div>

                    {/* Medication Reminders - Priority Section */}
                    {actions && actions.filter((a: any) => a.type === 'medication').length > 0 && (
                        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-3xl p-6 border border-emerald-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                                    <Pill className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl">Medication Reminders</h3>
                                    <p className="text-sm text-muted-foreground">Take your medications to boost your health score!</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {actions.filter((a: any) => a.type === 'medication').map((action: any) => (
                                    <div key={action.id} className="bg-white rounded-xl p-4 border border-emerald-200 flex items-center justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-lg">{action.title}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {action.dosage && `${action.dosage} • `}
                                                {action.frequency}
                                                {action.time && ` • ${action.time}`}
                                            </p>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    // Get current care plan
                                                    const carePlanRes = await fetch('/api/care-plan');
                                                    const carePlanJson = await carePlanRes.json();
                                                    
                                                    if (carePlanJson.success && carePlanJson.data) {
                                                        const meds = [...(carePlanJson.data.medications || [])];
                                                        const medIndex = parseInt(action.id.replace('med-', ''));
                                                        if (meds[medIndex]) {
                                                            meds[medIndex] = { ...meds[medIndex], status: 'completed' };
                                                            
                                                            const res = await fetch('/api/care-plan', {
                                                                method: 'PUT',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({
                                                                    medications: meds
                                                                })
                                                            });
                                                            
                                                            if (res.ok) {
                                                                // Award points
                                                                await fetch('/api/health-stats/update', {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ points: 15 })
                                                                });
                                                                showToast('Medication logged! +15 points', 'success');
                                                                
                                                                // Refresh data
                                                                const refreshRes = await fetch('/api/dashboard/home');
                                                                const refreshJson = await refreshRes.json();
                                                                if (refreshJson.success) {
                                                                    setData(refreshJson.data);
                                                                }
                                                            }
                                                        }
                                                    }
                                                } catch (err) {
                                                    console.error('Error logging medication:', err);
                                                    showToast('Failed to log medication', 'error');
                                                }
                                            }}
                                            className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-600 transition-colors flex items-center gap-2"
                                        >
                                            <CheckCircle2 className="h-4 w-4" />
                                            Taken
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Today's Actions */}
                    <div className="pt-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <span className="text-primary">📅</span> Today&apos;s Actions
                            </h3>
                            <button className="text-sm font-semibold text-primary hover:underline">View Schedule</button>
                        </div>

                        <div className="space-y-4">
                            {/* Actions List from API - Exclude medications (shown above) */}
                            {actions && actions.filter((a: any) => a.type !== 'medication').length > 0 ? (
                                actions.filter((a: any) => a.type !== 'medication').map((action: any) => (
                                    <div key={action.id} className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-border/40">
                                        <div className="flex items-center gap-4">
                                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${action.type === 'checkup' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                                <span className="text-2xl">{action.type === 'checkup' ? '🏥' : '📋'}</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-foreground">{action.title}</h4>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    {action.time && <><span className="w-1.5 h-1.5 rounded-full bg-primary"></span> {action.time}</>}
                                                </p>
                                            </div>
                                        </div>
                                        <button className="bg-primary text-primary-foreground px-5 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors">
                                            <CheckCircle2 className="h-4 w-4" /> Log
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white rounded-2xl p-8 text-center border border-border/40">
                                    <p className="text-muted-foreground">No other actions scheduled for today.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column Stats */}
                <div className="space-y-6">
                    {/* Streak Card - Only show if stats exist */}
                    {stats && (
                        <>
                            <div className="bg-[#E3F5EE] rounded-3xl p-6 relative overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-primary font-medium mb-1">Current Streak</p>
                                    <p className="text-4xl font-bold text-foreground">{stats.streak || 0} Days</p>
                                </div>
                                <div className="absolute top-6 right-6 h-12 w-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                                    <Flame className="h-6 w-6 fill-current" />
                                </div>
                            </div>

                            {/* Points Card */}
                            <div className="bg-[#E3F5EE] rounded-3xl p-6 relative overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-primary font-medium mb-1">Health Points</p>
                                    <p className="text-4xl font-bold text-foreground">{stats.points || 0}</p>
                                </div>
                                <div className="absolute top-6 right-6 h-12 w-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                                    <Medal className="h-6 w-6 fill-current" />
                                </div>
                            </div>

                            {/* Vitals Card - Only show if vitals exist */}
                            {stats.vitals && (stats.vitals.bp || stats.vitals.hr) && (
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-border/40">
                                    <h3 className="font-bold text-lg mb-6">Recent Vitals</h3>

                                    <div className="flex justify-between mb-8">
                                        {stats.vitals.bp && (
                                            <div>
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Blood Pressure</p>
                                                <p className="text-2xl font-bold text-foreground">{stats.vitals.bp}</p>
                                            </div>
                                        )}
                                        {stats.vitals.hr && (
                                            <div>
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Heart Rate</p>
                                                <p className="text-2xl font-bold text-foreground">{stats.vitals.hr} <span className="text-sm text-muted-foreground font-medium">bpm</span></p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Family Card - Removed dummy data */}
                    <div className="bg-[#1C211E] rounded-3xl p-6 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-2">Connect with Family</h3>
                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">Add family members to share health information and care plans.</p>

                            <button className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl font-semibold transition-colors">
                                Add Family Member
                            </button>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                    </div>

                </div>
            </div>
        </div>
    );
}
