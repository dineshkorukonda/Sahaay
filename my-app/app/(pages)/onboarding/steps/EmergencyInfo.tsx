"use client";

import React from "react";
import { ChevronDown, FileText, UserSquare2 } from "lucide-react";

export default function EmergencyInfo() {
    return (
        <div className="w-full max-w-2xl mx-auto space-y-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Emergency Information</h2>
                <p className="text-gray-500">
                    Critical details to ensure your safety and rapid response when it matters most.
                </p>
            </div>

            {/* Emergency Contact Section */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-teal-50 rounded-lg">
                        <UserSquare2 className="w-6 h-6 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Emergency Contact</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Full Name</label>
                        <input
                            type="text"
                            placeholder="Legal name of contact"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Relationship</label>
                        <div className="relative">
                            <select className="w-full appearance-none px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent cursor-pointer">
                                <option>How are you related?</option>
                                <option>Parent</option>
                                <option>Spouse</option>
                                <option>Sibling</option>
                                <option>Friend</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                    <div className="md:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Phone Number</label>
                        <div className="flex space-x-2">
                            <div className="relative w-[120px]">
                                <select
                                    className="w-full appearance-none px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent cursor-pointer text-sm"
                                >
                                    <option>🇺🇸 +1 (US)</option>
                                    <option>🇮🇳 +91 (IN)</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                            <input
                                type="tel"
                                placeholder="000-000-0000"
                                className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Health Profile Section */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-teal-50 rounded-lg">
                        <FileText className="w-6 h-6 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Health Profile</h3>
                </div>

                <div className="space-y-6">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Blood Group</label>
                        <div className="relative w-full md:w-1/2">
                            <select className="w-full appearance-none px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent cursor-pointer">
                                <option>Select blood type</option>
                                <option>A+</option>
                                <option>A-</option>
                                <option>B+</option>
                                <option>B-</option>
                                <option>O+</option>
                                <option>O-</option>
                                <option>AB+</option>
                                <option>AB-</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Known Allergies</label>
                        <textarea
                            rows={3}
                            placeholder="e.g., Penicillin, Peanuts, Pollen... If none, please type 'No known allergies'"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent resize-none"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Chronic Conditions</label>
                        <textarea
                            rows={3}
                            placeholder="e.g., Asthma, Type 2 Diabetes, Hypertension... If none, please type 'None'"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent resize-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
