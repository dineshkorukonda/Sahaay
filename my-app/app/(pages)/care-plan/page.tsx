"use client";

import { ChevronLeft, ChevronRight, Plus, Calendar, AlertTriangle, Moon, Utensils, Activity, CheckSquare, Square, Check } from "lucide-react";

export default function CarePlanPage() {
    return (
        <div className="p-8 min-h-screen space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="text-sm text-muted-foreground mb-1">Patients / John Doe (MRN: 88231-A)</div>
                    <h1 className="text-3xl font-bold tracking-tight">Care Plan & Monitoring</h1>
                    <p className="text-muted-foreground mt-1">Management of patient health trajectories and real-time medical intelligence.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white border border-border text-foreground px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm">
                        Generate Summary
                    </button>
                    <button className="bg-emerald-500 text-white px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-colors">
                        <Plus className="h-4 w-4" /> Add Event
                    </button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">

                {/* Left Column (Wide) - Schedule & Stats */}
                <div className="xl:col-span-3 space-y-8">

                    {/* Treatment Schedule */}
                    <div className="bg-white rounded-3xl p-6 border border-border shadow-sm">
                        <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
                            <h3 className="font-bold text-xl">Treatment Schedule</h3>

                            <div className="flex items-center gap-4">
                                <div className="bg-gray-100 p-1 rounded-lg flex items-center text-sm font-bold">
                                    <button className="bg-white shadow-sm px-4 py-1.5 rounded-md text-foreground">Week</button>
                                    <button className="px-4 py-1.5 text-muted-foreground hover:text-foreground transition-colors">Month</button>
                                    <button className="px-4 py-1.5 text-muted-foreground hover:text-foreground transition-colors">Day</button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft className="h-5 w-5" /></button>
                                    <span className="font-bold">Oct 23 - Oct 29</span>
                                    <button className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight className="h-5 w-5" /></button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-px bg-gray-100 border border-gray-100 rounded-2xl overflow-hidden text-center">
                            {/* Days Header */}
                            {['MON 23', 'TUE 24', 'WED 25', 'THU 26', 'FRI 27', 'SAT 28', 'SUN 29'].map((day, i) => (
                                <div key={i} className="bg-white py-3 text-xs font-bold text-emerald-700 uppercase">{day}</div>
                            ))}

                            {/* Calendar Columns */}
                            {Array.from({ length: 7 }).map((_, colIndex) => (
                                <div key={colIndex} className="bg-white h-64 p-2 relative group hover:bg-gray-50/50 transition-colors">
                                    {colIndex === 0 && (
                                        <div className="bg-emerald-100 border-l-4 border-emerald-500 rounded p-2 text-left mb-2 cursor-pointer hover:scale-105 transition-transform">
                                            <p className="text-[10px] font-bold text-emerald-800">08:00 AM</p>
                                            <p className="text-[10px] font-medium text-emerald-700 leading-tight">Lisinopril 10mg</p>
                                        </div>
                                    )}
                                    {colIndex === 1 && (
                                        <div className="bg-blue-100 border-l-4 border-blue-500 rounded p-2 text-left mt-12 cursor-pointer hover:scale-105 transition-transform">
                                            <p className="text-[10px] font-bold text-blue-800">10:30 AM</p>
                                            <p className="text-[10px] font-medium text-blue-700 leading-tight">Physio Appt</p>
                                        </div>
                                    )}
                                    {colIndex === 2 && (
                                        <div className="bg-emerald-100 border-l-4 border-emerald-500 rounded p-2 text-left mb-2 cursor-pointer hover:scale-105 transition-transform">
                                            <p className="text-[10px] font-bold text-emerald-800">08:00 AM</p>
                                            <p className="text-[10px] font-medium text-emerald-700 leading-tight">Lisinopril 10mg</p>
                                        </div>
                                    )}
                                    {colIndex === 3 && (
                                        <>
                                            <div className="bg-orange-100 border-l-4 border-orange-500 rounded p-2 text-left mt-8 mb-2 cursor-pointer hover:scale-105 transition-transform">
                                                <p className="text-[10px] font-bold text-orange-800">09:15 AM</p>
                                                <p className="text-[10px] font-medium text-orange-700 leading-tight">Blood Test (Fast)</p>
                                            </div>
                                            <div className="bg-emerald-100 border-l-4 border-emerald-500 rounded p-2 text-left mt-24 cursor-pointer hover:scale-105 transition-transform">
                                                <p className="text-[10px] font-bold text-emerald-800">08:00 PM</p>
                                                <p className="text-[10px] font-medium text-emerald-700 leading-tight">Statin 20mg</p>
                                            </div>
                                        </>
                                    )}
                                    {colIndex === 4 && (
                                        <div className="bg-emerald-100 border-l-4 border-emerald-500 rounded p-2 text-left mb-2 cursor-pointer hover:scale-105 transition-transform">
                                            <p className="text-[10px] font-bold text-emerald-800">08:00 AM</p>
                                            <p className="text-[10px] font-medium text-emerald-700 leading-tight">Lisinopril 10mg</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Nutritional Intake */}
                        <div className="bg-white rounded-3xl p-6 border border-border shadow-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-10 w-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                                    <Utensils className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Nutritional Intake</h3>
                                    <p className="text-xs text-emerald-600 font-bold">Daily Goal</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-muted-foreground font-medium">Protein</span>
                                        <span className="font-bold">82g / 120g</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 w-[70%] rounded-full"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-muted-foreground font-medium">Fiber</span>
                                        <span className="font-bold">28g / 35g</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 w-[80%] rounded-full"></div>
                                    </div>
                                </div>
                            </div>

                            <button className="mt-8 text-emerald-600 text-sm font-bold flex items-center gap-2 hover:underline">
                                View dietary recommendations <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Physical Routine */}
                        <div className="bg-white rounded-3xl p-6 border border-border shadow-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                    <Activity className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Physical Routine</h3>
                                    <p className="text-xs text-emerald-600 font-bold">Prescribed</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 mb-6">
                                <div className="relative h-20 w-20 flex-shrink-0">
                                    {/* Simple conic gradient for donut */}
                                    <div className="h-full w-full rounded-full" style={{ background: 'conic-gradient(var(--primary) 75%, #f1f5f9 0)' }}></div>
                                    <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center font-bold text-sm">75%</div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">Post-Op Walking</h4>
                                    <p className="text-xs text-muted-foreground">15 mins of 20 mins completed</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-bold uppercase">Low Intensity</span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase">Cardiovascular</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-8">

                    {/* Active Alerts */}
                    <div className="bg-[#1C211E] rounded-3xl p-6 text-white overflow-hidden relative">
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <h3 className="font-bold flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-emerald-400" /> Active Alerts</h3>
                            <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">2 NEW</span>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div className="bg-red-50 text-red-900 p-3 rounded-xl border-l-4 border-red-500">
                                <h4 className="font-bold text-sm flex items-center gap-2"><Activity className="h-3 w-3" /> Irregular Pulse Detected</h4>
                                <p className="text-[10px] mt-1 leading-tight opacity-80">Deviation from baseline at 03:22 AM. Suggest ECG verification.</p>
                            </div>
                            <div className="bg-orange-50 text-orange-900 p-3 rounded-xl border-l-4 border-orange-500">
                                <h4 className="font-bold text-sm flex items-center gap-2"><Moon className="h-3 w-3" /> Sleep Pattern Shift</h4>
                                <p className="text-[10px] mt-1 leading-tight opacity-80">Restless sleep trend for 3 consecutive nights.</p>
                            </div>
                        </div>
                    </div>

                    {/* Daily Tasks */}
                    <div className="bg-white rounded-3xl p-6 border border-border shadow-sm">
                        <h3 className="font-bold text-lg mb-4">Daily Tasks</h3>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:bg-gray-50 transition-colors cursor-pointer group">
                                <div className="h-5 w-5 bg-emerald-500 rounded flex items-center justify-center text-white flex-shrink-0">
                                    <Check className="h-3 w-3" />
                                </div>
                                <span className="text-sm font-medium line-through text-muted-foreground">Blood Pressure Check</span>
                            </label>

                            <label className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:bg-gray-50 transition-colors cursor-pointer group">
                                <div className="h-5 w-5 border-2 border-gray-300 rounded flex items-center justify-center text-white flex-shrink-0 group-hover:border-emerald-500"></div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold">Fast for Blood Lab</span>
                                    <span className="text-[10px] text-muted-foreground">Due by 09:00 AM</span>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:bg-gray-50 transition-colors cursor-pointer group">
                                <div className="h-5 w-5 border-2 border-gray-300 rounded flex items-center justify-center text-white flex-shrink-0 group-hover:border-emerald-500"></div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold">Hydration Goal</span>
                                    <span className="text-[10px] text-muted-foreground">2.5L Intake</span>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:bg-gray-50 transition-colors cursor-pointer group">
                                <div className="h-5 w-5 border-2 border-gray-300 rounded flex items-center justify-center text-white flex-shrink-0 group-hover:border-emerald-500"></div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold">Vitals Logging</span>
                                    <span className="text-[10px] text-muted-foreground">Weight & Temp</span>
                                </div>
                            </label>
                        </div>

                        <button className="w-full mt-4 bg-gray-100 text-foreground text-sm font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors">
                            View Full History
                        </button>
                    </div>

                    {/* Mini Calendar Mock */}
                    <div className="bg-white rounded-3xl p-6 border border-border shadow-sm text-center">
                        <div className="flex items-center justify-between font-bold text-sm mb-4">
                            <span>November 2023</span>
                            <div className="flex gap-2">
                                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                        <div className="grid grid-cols-7 text-[10px] text-muted-foreground font-bold mb-2">
                            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                        </div>
                        <div className="grid grid-cols-7 text-xs font-medium gap-y-3">
                            <span className="text-muted-foreground/30">29</span>
                            <span className="text-muted-foreground/30">30</span>
                            <span className="text-muted-foreground/30">31</span>
                            <span>1</span>
                            <span>2</span>
                            <span>3</span>
                            <span>4</span>
                            <span>5</span>
                            <span>6</span>
                            <span className="bg-emerald-500 text-white h-6 w-6 rounded-full flex items-center justify-center mx-auto">7</span>
                            <span>8</span>
                            <span>9</span>
                            <span>10</span>
                            <span>11</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
