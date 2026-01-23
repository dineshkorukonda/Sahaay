"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, HelpCircle, User } from "lucide-react";
import Link from "next/link";
import { BriefcaseMedical } from "lucide-react";

// Steps
import LanguageSelection from "./steps/LanguageSelection";
import ProfileSetup from "./steps/ProfileSetup";
import EmergencyInfo from "./steps/EmergencyInfo";
import FamilySetup from "./steps/FamilySetup";
import RecordsUpload from "./steps/RecordsUpload";

export default function OnboardingPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 5;

    const [selectedLanguage, setSelectedLanguage] = useState("English");

    const nextStep = () => {
        if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const getStepTitle = () => {
        switch (currentStep) {
            case 1: return "Language Selection";
            case 2: return "Profile Creation";
            case 3: return "Emergency Details";
            case 4: return "Family Setup";
            case 5: return "Medical Records Upload";
            default: return "";
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <LanguageSelection selectedLanguage={selectedLanguage} onSelect={(lang) => setSelectedLanguage(lang)} />;
            case 2:
                return <ProfileSetup />;
            case 3:
                return <EmergencyInfo />;
            case 4:
                return <FamilySetup />;
            case 5:
                return <RecordsUpload />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-100 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-[#22c55e] rounded-lg">
                        <BriefcaseMedical className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-gray-900 tracking-tight">Sahaay</span>
                </div>
                <div className="flex items-center gap-6">
                    <Link href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Dashboard</Link>
                    <Link href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Profile</Link>
                    <Link href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Settings</Link>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-400 to-teal-500 border border-white shadow-sm" />
                </div>
            </nav>

            <main className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-12 flex flex-col">

                {/* Progress Header */}
                <div className="mb-12">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Step {currentStep} of {totalSteps}</span>
                            <h1 className="text-xl font-bold text-gray-900 mt-1">{getStepTitle()}</h1>
                        </div>
                        <span className="text-sm font-bold text-gray-500">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
                    </div>
                    {/* Progress Bar Container */}
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-teal-500 to-[#22c55e] rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {renderStep()}
                </div>

                {/* Navigation Footer */}
                <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className={`flex items-center gap-2 font-bold px-6 py-3 rounded-lg transition-colors ${currentStep === 1
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            }`}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {currentStep === 1 ? "Start" : "Previous Step"}
                    </button>


                    {currentStep < totalSteps ? (
                        <button
                            onClick={nextStep}
                            className="bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold py-3 px-8 rounded-lg shadow-lg shadow-green-500/20 transition-all transform active:scale-[0.98] flex items-center gap-2"
                        >
                            {currentStep === 1 ? "Get Started" : "Continue"}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-teal-500/20 transition-all transform active:scale-[0.98] flex items-center gap-2">
                            Complete Setup
                        </button>
                    )}
                </div>

                <div className="text-center mt-12">
                    <p className="text-xs text-gray-400">
                        © 2024 Sahaay Healthcare Systems. All medical data is encrypted and secure.
                        <br />
                        <span className="mx-2">Privacy Policy</span> • <span className="mx-2">Terms of Service</span> • <span className="mx-2">HIPAA Compliance</span>
                    </p>
                </div>

            </main>
        </div>
    );
}
