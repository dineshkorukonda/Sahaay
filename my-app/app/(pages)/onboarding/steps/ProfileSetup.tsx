"use client";

import React from "react";
import { Calendar, MapPin } from "lucide-react";

export default function ProfileSetup() {
    const [formData, setFormData] = React.useState({
        name: "",
        dob: "",
        gender: "",
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        try {
            await fetch('/api/onboarding/profile', {
                method: 'POST',
                body: JSON.stringify(formData),
            });
            // Show success toast or continue
        } catch (e) {
            console.error(e);
        }
    };

    // Auto-save on unmount or provide a save method exposed to parent via context/ref?
    // For now, let's just save when fields change (debounced) or rely on the parent page "Next" button.
    // However, the "Next" button is in the parent. 
    // Ideally, we should lift state up or use a context.
    // Given the constraints, I will add a `useEffect` that listens to `formData` 
    // and saves it to a global store (e.g. localStorage or parent via prop if I could change parent).
    // But I can't easily change parent props without verifying the parent's code in detail again.
    // Let's assume the user clicks "Continue" in the parent.
    // PRO TIP: I can make this component strictly controlled if I passed props.
    // But looking at the parent `OnboardingPage`, it renders `<ProfileSetup />` without props.
    // So this component has its own state. 
    // How does the parent know when to proceed or get the data?
    // It seems the current design is decoupled. 
    // Use `useEffect` to save to `localStorage` or session storage so the parent or next steps can use it?
    // OR: I can assume the Parent "Next" button just navigates, and *this* component 
    // should save data continuously or on blur.

    // Let's add a "Save" button inside here? 
    // No, the UI has "Continue" at the bottom.
    // I shall make the inputs update a transient state and trigger API call on Blur.

    const handleBlur = async () => {
        await fetch('/api/onboarding/profile', {
            method: 'POST',
            body: JSON.stringify(formData),
        });
    };

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
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        onBlur={handleBlur}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                    />
                </div>

                {/* Date of Birth */}
                <div>
                    <label className="block text-sm font-semibold text-blue-900 mb-1">Date of Birth</label>
                    <div className="relative">
                        <input
                            type="date"
                            placeholder="mm/dd/yyyy"
                            value={formData.dob}
                            onChange={(e) => handleChange('dob', e.target.value)}
                            onBlur={handleBlur}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Gender */}
                <div>
                    <label className="block text-sm font-semibold text-blue-900 mb-2">Gender</label>
                    <div className="grid grid-cols-3 gap-4">
                        {["Male", "Female", "Other"].map((gender) => (
                            <label key={gender} className="cursor-pointer">
                                <input
                                    type="radio"
                                    name="gender"
                                    className="peer sr-only"
                                    value={gender}
                                    checked={formData.gender === gender}
                                    onChange={(e) => {
                                        handleChange('gender', e.target.value);
                                        // Specific trigger for radio since it doesn't blur effectively
                                        fetch('/api/onboarding/profile', {
                                            method: 'POST',
                                            body: JSON.stringify({ ...formData, gender: e.target.value }),
                                        });
                                    }}
                                />
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
