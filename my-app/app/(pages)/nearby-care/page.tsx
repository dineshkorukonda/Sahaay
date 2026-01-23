"use client";

import { Search, MapPin, Navigation, Phone, Filter } from "lucide-react";
import Image from "next/image";

const facilities = [
    {
        name: "St. Jude Medical Center",
        type: "HOSPITAL",
        distance: "0.8 miles away",
        tags: ["Cardiology", "Radiology", "Surgery"],
        isOpen: true,
        isEmergency: true,
    },
    {
        name: "Metro Community Clinic",
        type: "CLINIC",
        distance: "1.4 miles away",
        tags: ["Pediatrics", "General Medicine"],
        isOpen: true,
        isEmergency: false,
    },
    {
        name: "Hope Health NGO",
        type: "NGO",
        distance: "2.1 miles away",
        tags: ["Vaccinations", "Counseling"],
        isOpen: true,
        isEmergency: false,
    },
];

export default function NearbyCarePage() {
    return (
        <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-background">
            {/* Left Panel - List */}
            <div className="w-full md:w-[450px] flex-shrink-0 border-r border-border bg-white flex flex-col">
                <div className="p-6 border-b border-border/50">
                    <div className="text-sm text-muted-foreground mb-1">Home / Nearby Care</div>
                    <h1 className="text-2xl font-bold mb-6">Nearby Care Centers</h1>

                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by name or specialty..."
                            className="w-full bg-gray-50 pl-10 pr-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-transparent focus:bg-white"
                        />
                    </div>

                    <div className="flex gap-2 text-xs overflow-x-auto pb-2 scrollbar-none">
                        <button className="px-3 py-1.5 bg-primary text-white rounded-lg whitespace-nowrap font-medium">All Facilities</button>
                        <button className="px-3 py-1.5 bg-gray-100 text-foreground rounded-lg whitespace-nowrap font-medium hover:bg-gray-200">Hospitals</button>
                        <button className="px-3 py-1.5 bg-gray-100 text-foreground rounded-lg whitespace-nowrap font-medium hover:bg-gray-200">Clinics</button>
                        <button className="px-3 py-1.5 bg-gray-100 text-foreground rounded-lg whitespace-nowrap font-medium hover:bg-gray-200">NGOs</button>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                        <div className="h-5 w-5 bg-primary rounded flex items-center justify-center text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <span className="text-sm font-medium">Emergency Services Only</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                    {facilities.map((center, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-border/60 hover:border-primary/30 transition-all group">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-lg">{center.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${center.type === 'HOSPITAL' ? 'bg-emerald-100 text-emerald-700' :
                                                center.type === 'CLINIC' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                            }`}>{center.type}</span>
                                        {center.isOpen && <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> OPEN
                                        </span>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                                <MapPin className="h-3.5 w-3.5" />
                                {center.distance}
                            </div>

                            <div className="flex flex-wrap gap-2 mb-5">
                                {center.tags.map(tag => (
                                    <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-600 font-medium">{tag}</span>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <button className="flex-1 bg-primary text-white py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                                    <Navigation className="h-4 w-4" /> Directions
                                </button>
                                <button className="flex-1 bg-white border border-primary text-primary py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors">
                                    <Phone className="h-4 w-4" /> Call Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel - Map */}
            <div className="flex-1 relative bg-gray-100">
                <img
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=2000&h=1500"
                    alt="Map of San Francisco"
                    className="w-full h-full object-cover"
                />

                <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <button className="h-10 w-10 bg-white rounded-lg shadow-lg flex items-center justify-center font-bold text-xl hover:bg-gray-50 text-foreground">+</button>
                    <button className="h-10 w-10 bg-white rounded-lg shadow-lg flex items-center justify-center font-bold text-xl hover:bg-gray-50 text-foreground">-</button>
                </div>

                {/* Legend Overlay */}
                <div className="absolute bottom-6 left-6 bg-white p-4 rounded-xl shadow-lg">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Map Legend</p>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-medium">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Hospital
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Clinic
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium">
                            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> NGO
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
