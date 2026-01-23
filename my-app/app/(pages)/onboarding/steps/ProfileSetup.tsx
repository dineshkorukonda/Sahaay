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
                <h2 className="text-3xl font-serif font-medium text-foreground mb-2">Complete Your Profile</h2>
                <p className="text-muted-foreground">
                    Personalize your healthcare journey with Sahaay.
                </p>
            </div>

            <div className="space-y-6">
                {/* Full Name */}
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-semibold text-foreground">Full Name</label>
                        <span className="text-xs text-muted-foreground uppercase">Optional</span>
                    </div>
                    <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        onBlur={handleBlur}
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>

                {/* Date of Birth */}
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-1">
                        Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type="date"
                            placeholder="mm/dd/yyyy"
                            value={formData.dob}
                            onChange={(e) => handleChange('dob', e.target.value)}
                            onBlur={handleBlur}
                            required
                            className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                    </div>
                </div>

                {/* Gender */}
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                        Gender <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                        {["Male", "Female", "Other"].map((gender) => (
                            <label key={gender} className="cursor-pointer">
                                <input
                                    type="radio"
                                    name="gender"
                                    className="peer sr-only"
                                    value={gender}
                                    checked={formData.gender === gender}
                                    required
                                    onChange={(e) => {
                                        handleChange('gender', e.target.value);
                                        // Specific trigger for radio since it doesn't blur effectively
                                        fetch('/api/onboarding/profile', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ ...formData, gender: e.target.value }),
                                        });
                                    }}
                                />
                                <div className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-border bg-card hover:border-primary/50 peer-checked:border-primary peer-checked:text-primary transition-all">
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
            </div>
        </div>
    );
}
