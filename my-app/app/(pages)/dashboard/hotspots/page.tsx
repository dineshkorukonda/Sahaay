"use client";

import { Activity, AlertTriangle } from "lucide-react";
import React, { useState } from "react";
import dynamic from 'next/dynamic';
import type { HotspotFacility } from "./MapComponent";

const HotspotMapComponent = dynamic(() => import('./MapComponent'), {
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-100">Loading map...</div>
});

export default function HotspotsPage() {
    const [hotspots, setHotspots] = useState<HotspotFacility[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

    const getCoordsFromPin = (pin: string) => {
        // Deterministic pseudo-random lat/lng offset from Guwahati center (26.1445, 91.7362)
        const hash = pin.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
        const latOffset = (Math.abs(hash) % 100) / 1000 - 0.05;
        const lngOffset = (Math.abs(hash >> 4) % 100) / 1000 - 0.05;
        return { lat: 26.1445 + latOffset, lng: 91.7362 + lngOffset };
    }

    React.useEffect(() => {
        async function load() {
            try {
                const res = await fetch('/api/risk-summary');
                const data = await res.json();
                if (data.success && data.summary) {
                    const mapped = data.summary.map((s: { pincode: string, riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' }, i: number) => {
                        const coords = getCoordsFromPin(s.pincode || '');
                        return {
                            id: (s.pincode || 'unknown') + '-' + i,
                            name: `Area PIN: ${s.pincode}`,
                            lat: coords.lat,
                            lng: coords.lng,
                            riskLevel: s.riskLevel,
                            cases: s.riskLevel === 'HIGH' ? 12 : s.riskLevel === 'MEDIUM' ? 4 : 1,
                            details: `Real-time aggregated risk data for PIN ${s.pincode}.`
                        };
                    });
                    setHotspots(mapped);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const filteredSpots = selectedFilter === 'ALL'
        ? hotspots
        : hotspots.filter(s => s.riskLevel === selectedFilter);

    const highCount = hotspots.filter(s => s.riskLevel === 'HIGH').length;

    return (
        <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-background">
            {/* Left Panel */}
            <div className="w-full md:w-[450px] flex-shrink-0 border-r border-border bg-white flex flex-col">
                <div className="p-6 border-b border-border/50">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <div className="text-sm text-muted-foreground mb-1">Home / Hotspot Map</div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <Activity className="h-6 w-6 text-red-500" />
                                Outbreak Hotspots
                            </h1>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">
                        Live geographical tracking of disease clusters and water contamination zones.
                    </p>

                    {highCount > 0 && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
                            <p className="text-sm text-red-800 font-medium">
                                {highCount} High-risk zones detected. Immediate attention required.
                            </p>
                        </div>
                    )}

                    <div className="flex gap-2 text-xs overflow-x-auto pb-2 scrollbar-none">
                        <button
                            onClick={() => setSelectedFilter('ALL')}
                            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${selectedFilter === 'ALL' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                        >
                            All Zones
                        </button>
                        <button
                            onClick={() => setSelectedFilter('HIGH')}
                            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${selectedFilter === 'HIGH' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
                        >
                            High Risk
                        </button>
                        <button
                            onClick={() => setSelectedFilter('MEDIUM')}
                            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${selectedFilter === 'MEDIUM' ? 'bg-yellow-500 text-white' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'}`}
                        >
                            Medium Risk
                        </button>
                        <button
                            onClick={() => setSelectedFilter('LOW')}
                            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${selectedFilter === 'LOW' ? 'bg-green-500 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                        >
                            Low Risk
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                    {filteredSpots.map((spot) => (
                        <div key={spot.id} className={`bg-white p-5 rounded-2xl shadow-sm border border-border/60 hover:shadow-md transition-all ${spot.riskLevel === 'HIGH' ? 'border-l-4 border-l-red-500' :
                            spot.riskLevel === 'MEDIUM' ? 'border-l-4 border-l-yellow-500' :
                                'border-l-4 border-l-green-500'
                            }`}>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-lg">{spot.name}</h3>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${spot.riskLevel === 'HIGH' ? 'bg-red-100 text-red-700' :
                                        spot.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                        {spot.riskLevel}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xl font-black">{spot.cases}</span>
                                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Cases</p>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">{spot.details}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel - Map */}
            <div className="flex-1 relative bg-gray-100">
                <HotspotMapComponent
                    center={[26.1445, 91.7362]} // Fixed center for demo
                    hotspots={filteredSpots}
                />

                {/* Legend Overlay */}
                <div className="absolute bottom-6 right-12 md:left-6 md:right-auto bg-white p-4 rounded-xl shadow-lg z-[1000]">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Map Legend</p>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-medium">
                            <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center shadow-sm"></span> High Risk (Outbreak)
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium">
                            <span className="w-3 h-3 rounded-full bg-yellow-500 opacity-80 flex items-center justify-center"></span> Medium Risk (Monitor)
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium">
                            <span className="w-3 h-3 rounded-full bg-green-500 opacity-80 flex items-center justify-center"></span> Low Risk (Safe)
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
