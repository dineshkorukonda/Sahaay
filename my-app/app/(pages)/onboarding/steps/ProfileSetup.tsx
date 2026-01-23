"use client";

import React from "react";
import { Calendar, MapPin } from "lucide-react";

export default function ProfileSetup() {
    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-blue-900 mb-2">Complete Your Profile</h2>
                <p className="text-gray-500">
                    Personalize your healthcare journey with Sahaay.
                </p>
            </div>

            <div className="space-y-6">
                {/* Full Name */}
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-semibold text-blue-900">Full Name</label>
                        <span className="text-xs text-gray-400 uppercase">Optional</span>
                    </div>
                    <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                    />
                </div>

                {/* Date of Birth */}
                <div>
                    <label className="block text-sm font-semibold text-blue-900 mb-1">Date of Birth</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="mm/dd/yyyy"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                </div>

                {/* Gender */}
                <div>
                    <label className="block text-sm font-semibold text-blue-900 mb-2">Gender</label>
                    <div className="grid grid-cols-3 gap-4">
                        {["Male", "Female", "Other"].map((gender) => (
                            <label key={gender} className="cursor-pointer">
                                <input type="radio" name="gender" className="peer sr-only" />
                                <div className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-gray-100 bg-white hover:border-green-200 peer-checked:border-[#22c55e] peer-checked:text-[#22c55e] transition-all">
                                    {/* Placeholder Icons */}
                                    <span className="mb-2 text-2xl">
                                        {gender === "Male" ? "♂" : gender === "Female" ? "♀" : "⚦"}
                                    </span>
                                    <span className="font-medium">{gender}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Location Access */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="p-2 bg-white rounded-full shadow-sm">
                            <MapPin className="w-6 h-6 text-[#22c55e]" />
                        </div>
                        <div>
                            <h4 className="font-bold text-blue-900">Location Access</h4>
                            <p className="text-sm text-gray-500 mt-1">
                                We use your location to find the nearest doctors and pharmacies in your network.
                            </p>
                        </div>
                    </div>
                    <button className="w-full py-3 border-2 border-[#22c55e] text-[#22c55e] font-semibold rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Enable My Location
                    </button>
                </div>
            </div>
        </div>
    );
}
