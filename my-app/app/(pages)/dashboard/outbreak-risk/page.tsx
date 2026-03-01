"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { Loader } from "@/components/ui/loader";

interface AreaRisk {
    area: string;
    risk: "low" | "medium" | "high";
    symptomCount: number;
    waterFailCount: number;
    reason?: string;
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
        <div className="p-8 min-h-screen space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <AlertTriangle className="h-8 w-8 text-amber-500" />
                    Outbreak Risk & Surveillance
                </h1>
                <p className="text-muted-foreground mt-1">
                    AI-driven early warning: risk levels by area based on symptom reports and water quality (last 14 days).
                </p>
                {data?.since && (
                    <p className="text-sm text-muted-foreground mt-1">
                        Data since {new Date(data.since).toLocaleDateString()}
                    </p>
                )}
            </div>

            {data?.aiSummary && (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 text-primary font-semibold mb-2">
                        <Sparkles className="h-5 w-5" />
                        Risk summary
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{data.aiSummary}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-red-200 bg-red-50">
                    <div className="flex items-center gap-2 text-red-700 font-semibold">
                        <AlertTriangle className="h-5 w-5" /> High risk areas
                    </div>
                    <p className="text-2xl font-bold text-red-800 mt-1">{highRisk.length}</p>
                </div>
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50">
                    <div className="flex items-center gap-2 text-amber-700 font-semibold">
                        <AlertTriangle className="h-5 w-5" /> Medium risk areas
                    </div>
                    <p className="text-2xl font-bold text-amber-800 mt-1">{mediumRisk.length}</p>
                </div>
                <div className="p-4 rounded-xl border border-green-200 bg-green-50">
                    <div className="flex items-center gap-2 text-green-700 font-semibold">
                        <ShieldCheck className="h-5 w-5" /> Low risk areas
                    </div>
                    <p className="text-2xl font-bold text-green-800 mt-1">{lowRisk.length}</p>
                </div>
            </div>

            <div>
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5" /> Risk by area
                </h2>
                {!data?.areas.length ? (
                    <p className="text-muted-foreground">No area data yet. Symptom and water quality reports will populate this view.</p>
                ) : (
                    <ul className="space-y-2">
                        {data.areas.map((a) => (
                            <li
                                key={a.area}
                                className={`p-4 rounded-xl border ${a.risk === "high" ? "border-red-200 bg-red-50" :
                                        a.risk === "medium" ? "border-amber-200 bg-amber-50" :
                                            "border-green-200 bg-green-50"
                                    }`}
                            >
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <span className="font-medium">{a.area === "unknown" ? "Unspecified area" : a.area}</span>
                                    <span className={`px-2 py-1 rounded-full text-sm font-medium shrink-0 ${a.risk === "high" ? "bg-red-200 text-red-800" :
                                            a.risk === "medium" ? "bg-amber-200 text-amber-800" :
                                                "bg-green-200 text-green-800"
                                        }`}>
                                        {a.risk.toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                    <span>Symptoms: {a.symptomCount}, Water fails: {a.waterFailCount}</span>
                                </div>
                                {a.reason && (
                                    <p className="text-sm text-muted-foreground mt-1 italic">&quot;{a.reason}&quot;</p>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
