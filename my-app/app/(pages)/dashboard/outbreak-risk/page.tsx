"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { Loader } from "@/components/ui/loader";

import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";

interface AreaRisk {
    area: string;
    risk: "low" | "medium" | "high";
    symptomCount: number;
    waterFailCount: number;
    reason?: string;
    trends: { date: string; symptoms: number; waterFails: number }[];
}

function AreaCard({ areaData }: { areaData: AreaRisk }) {
    const [aiBrief, setAiBrief] = useState<string | null>(null);
    const [loadingBrief, setLoadingBrief] = useState(false);

    const generateAiBrief = async () => {
        setLoadingBrief(true);
        try {
            const res = await fetch("/api/outbreak-risk/brief", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    area: areaData.area,
                    symptomCount: areaData.symptomCount,
                    waterFailCount: areaData.waterFailCount
                })
            });
            const json = await res.json();
            if (json.success) {
                setAiBrief(json.summary);
            }
        } catch (e) {
            console.error("Error generating brief:", e);
        } finally {
            setLoadingBrief(false);
        }
    };

    return (
        <li className={`p-5 rounded-xl border ${areaData.risk === "high" ? "border-red-200 bg-red-50/50" : areaData.risk === "medium" ? "border-amber-200 bg-amber-50/50" : "border-green-200 bg-green-50/50"}`}>
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-bold text-lg">{areaData.area === "unknown" ? "Unspecified area" : `PIN Code: ${areaData.area}`}</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold shrink-0 ${areaData.risk === "high" ? "bg-red-200 text-red-900" : areaData.risk === "medium" ? "bg-amber-200 text-amber-900" : "bg-green-200 text-green-900"}`}>
                            {areaData.risk.toUpperCase()} RISK
                        </span>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                        <div className="bg-white px-3 py-2 rounded-lg shadow-sm border border-black/5">
                            <span className="text-muted-foreground block text-xs uppercase font-medium">Symptoms</span>
                            <span className="font-bold text-lg text-rose-600">{areaData.symptomCount}</span>
                        </div>
                        <div className="bg-white px-3 py-2 rounded-lg shadow-sm border border-black/5">
                            <span className="text-muted-foreground block text-xs uppercase font-medium">Water Fails</span>
                            <span className="font-bold text-lg text-blue-600">{areaData.waterFailCount}</span>
                        </div>
                    </div>

                    {areaData.reason && (
                        <p className="text-sm text-muted-foreground italic">&quot;{areaData.reason}&quot;</p>
                    )}

                    <div className="pt-2 border-t border-black/5">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 transition-colors"
                            onClick={generateAiBrief}
                            disabled={loadingBrief}
                        >
                            <Sparkles className="h-4 w-4" />
                            {loadingBrief ? "Generating Brief..." : "Generate AI Situation Report"}
                        </Button>

                        {aiBrief && (
                            <div className="mt-4 p-4 rounded-xl bg-white border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center gap-2 text-indigo-700 font-semibold mb-2 text-sm">
                                    <Sparkles className="h-4 w-4" />
                                    AI Situation Brief
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed">{aiBrief}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full md:w-64 h-48 bg-white p-3 rounded-xl shadow-sm border border-black/5">
                    <p className="text-xs font-semibold text-muted-foreground mb-4">7-Day Incident Trend</p>
                    <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={areaData.trends}>
                                <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line type="monotone" dataKey="symptoms" stroke="#e11d48" strokeWidth={2} dot={false} name="Symptoms" />
                                <Line type="monotone" dataKey="waterFails" stroke="#2563eb" strokeWidth={2} dot={false} name="Water Fails" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </li>
    );
}

export default function OutbreakRiskPage() {
    const [data, setData] = useState<{
        since: string;
        areas: AreaRisk[];
        aiSummary?: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRisk = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/outbreak-risk");
                const json = await res.json();
                if (json.success) {
                    setData({
                        since: json.since,
                        areas: json.areas || [],
                        aiSummary: json.aiSummary,
                    });
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchRisk();
    }, []);

    if (loading) return <Loader fullScreen text="Loading outbreak risk..." />;

    const highRisk = data?.areas.filter(a => a.risk === "high") ?? [];
    const mediumRisk = data?.areas.filter(a => a.risk === "medium") ?? [];
    const lowRisk = data?.areas.filter(a => a.risk === "low") ?? [];

    return (
        <div className="p-8 min-h-screen space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <AlertTriangle className="h-8 w-8 text-amber-500" />
                        Outbreak Surveillance
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-2xl">
                        AI-driven early warning risk monitoring based on aggregated symptom reports and water quality checks.
                    </p>
                    {data?.since && (
                        <p className="text-sm font-medium text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-block mt-4">
                            Monitoring since: {new Date(data.since).toLocaleDateString()}
                        </p>
                    )}
                </div>
            </div>

            {data?.aiSummary && (
                <div className="p-5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-100 shadow-sm">
                    <div className="flex items-center gap-2 text-indigo-700 font-semibold mb-2">
                        <Sparkles className="h-5 w-5" />
                        Global Situational Overview
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{data.aiSummary}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-white shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <AlertTriangle className="h-24 w-24 text-red-600" />
                    </div>
                    <div className="flex items-center gap-2 text-red-700 font-bold tracking-wide uppercase text-sm mb-2">
                        <AlertTriangle className="h-4 w-4" /> Critical Hotspots
                    </div>
                    <p className="text-4xl font-black text-red-700">{highRisk.length}</p>
                    <p className="text-red-600/70 text-sm mt-1 font-medium">Require immediate action</p>
                </div>

                <div className="p-5 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <AlertTriangle className="h-24 w-24 text-amber-600" />
                    </div>
                    <div className="flex items-center gap-2 text-amber-700 font-bold tracking-wide uppercase text-sm mb-2">
                        <AlertTriangle className="h-4 w-4" /> Watchlist Zones
                    </div>
                    <p className="text-4xl font-black text-amber-700">{mediumRisk.length}</p>
                    <p className="text-amber-600/70 text-sm mt-1 font-medium">Elevated risk levels detected</p>
                </div>

                <div className="p-5 rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-white shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ShieldCheck className="h-24 w-24 text-green-600" />
                    </div>
                    <div className="flex items-center gap-2 text-green-700 font-bold tracking-wide uppercase text-sm mb-2">
                        <ShieldCheck className="h-4 w-4" /> Stable Sectors
                    </div>
                    <p className="text-4xl font-black text-green-700">{lowRisk.length}</p>
                    <p className="text-green-600/70 text-sm mt-1 font-medium">Within normal parameters</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm p-6 mt-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-bold text-xl flex items-center gap-2 text-gray-800">
                        <MapPin className="h-5 w-5 text-gray-500" />
                        Regional Risk Directory
                    </h2>
                </div>

                {!data?.areas.length ? (
                    <div className="text-center py-12 px-4 border border-dashed rounded-xl bg-gray-50">
                        <AlertTriangle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">System Initialization</h3>
                        <p className="text-muted-foreground mt-1 max-w-sm mx-auto">No telemetry data recorded yet. Wait for inbound symptom queries and water grid testing to propagate.</p>
                    </div>
                ) : (
                    <ul className="grid grid-cols-1 gap-4">
                        {data.areas.map((a) => (
                            <AreaCard key={a.area} areaData={a} />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
