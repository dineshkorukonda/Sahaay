"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, HelpCircle, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BriefcaseMedical } from "lucide-react";
import { Loader } from "@/components/ui/loader";

// Steps
import ProfileSetup from "./steps/ProfileSetup";
import LocationSetup from "./steps/LocationSetup";
import EmergencyInfo from "./steps/EmergencyInfo";
import RecordsUpload from "./steps/RecordsUpload";

export default function OnboardingPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [hasRecords, setHasRecords] = useState(false);
    const totalSteps = 3; // Profile, Location, Emergency

    // Load saved step from localStorage and check profile progress on mount
    useEffect(() => {
        const loadStep = async () => {
            try {
                // Check profile to determine which step user should be on
                const res = await fetch('/api/dashboard/home');
                if (res.ok) {
                    const data = await res.json();
                    const profile = data.data?.profile;

                    if (profile) {
                        // Determine step based on what's completed
                        if (!profile.dob) {
                            setCurrentStep(1); // Profile setup
                        } else if (!profile.location?.pinCode) {
                            setCurrentStep(2); // Location setup
                        } else if (!profile.emergencyContact) {
                            setCurrentStep(3); // Emergency info
                        } else {
                            // All required fields complete, check saved step or default to 3
                            const savedStep = localStorage.getItem('onboarding_step');
                            if (savedStep) {
                                const step = parseInt(savedStep, 10);
                                if (step >= 1 && step <= totalSteps) {
                                    setCurrentStep(step);
                                } else {
                                    setCurrentStep(3); // Default to Emergency step
                                }
                            } else {
                                setCurrentStep(3); // Default to Emergency step
                            }
                        }
                    } else {
                        // No profile, check saved step or default to 1 (Profile)
                        const savedStep = localStorage.getItem('onboarding_step');
                        if (savedStep) {
                            const step = parseInt(savedStep, 10);
                            if (step >= 1 && step <= totalSteps) {
                                setCurrentStep(step);
                            } else {
                                setCurrentStep(1);
                            }
                        } else {
                            setCurrentStep(1);
                        }
                    }
                }
            } catch (err) {
                console.error('Error loading step:', err);
                // Fallback to saved step
                const savedStep = localStorage.getItem('onboarding_step');
                if (savedStep) {
                    const step = parseInt(savedStep, 10);
                    if (step >= 1 && step <= totalSteps) {
                        setCurrentStep(step);
                    } else {
                        setCurrentStep(1);
                    }
                } else {
                    setCurrentStep(1);
                }
            }
        };
        loadStep();
    }, [totalSteps]);

    // Save current step to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('onboarding_step', currentStep.toString());
    }, [currentStep]);

    const [checkingStatus, setCheckingStatus] = useState(true);

    // Check if user has already completed onboarding and redirect to dashboard
    useEffect(() => {
        const checkOnboardingStatus = async () => {
            try {
                const res = await fetch('/api/auth/onboarding-status');
                if (res.ok) {
                    const data = await res.json();
                    // If onboarding is complete, redirect to dashboard
                    if (data.hasCompletedOnboarding) {
                        console.log('Onboarding already complete, redirecting to dashboard');
                        localStorage.removeItem('onboarding_step'); // Clear saved step
                        router.push('/dashboard');
                        return;
                    }
                }
            } catch (err) {
                console.error('Error checking onboarding status:', err);
            } finally {
                setCheckingStatus(false);
            }
        };
        checkOnboardingStatus();
    }, [router]);

    // Check for existing records when reaching final step
    useEffect(() => {
        if (currentStep === totalSteps) {
            const checkRecords = async () => {
                try {
                    const res = await fetch('/api/dashboard/home');
                    if (res.ok) {
                        const data = await res.json();
                        if (data.data?.records && data.data.records.length > 0) {
                            setHasRecords(true);
                        }
                    }
                } catch (err) {
                    console.error('Error checking records:', err);
                }
            };
            checkRecords();
        }
    }, [currentStep, totalSteps]);

    const nextStep = () => {
        if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const getStepTitle = () => {
        switch (currentStep) {
            case 1: return "Profile Creation";
            case 2: return "Location Setup";
            case 3: return "Emergency Details";
            default: return "";
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <ProfileSetup />;
            case 2:
                return <LocationSetup />;
            case 3:
                return <EmergencyInfo />;
            default:
                return null;
        }
    };

    if (checkingStatus) {
        return <Loader fullScreen text="Checking onboarding status..." />;
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">

            <main className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-12 flex flex-col">

                {/* Progress Header */}
                <div className="mb-12">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Step {currentStep} of {totalSteps}</span>
                            <h1 className="text-xl font-serif font-medium text-foreground mt-1">{getStepTitle()}</h1>
                        </div>
                        <span className="text-sm font-semibold text-muted-foreground">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
                    </div>
                    {/* Progress Bar Container */}
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {renderStep()}
                </div>

                {/* Navigation Footer */}
                <div className="mt-12 pt-8 border-t border-border flex justify-between items-center">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className={`flex items-center gap-2 font-semibold px-6 py-3 rounded-lg transition-colors ${currentStep === 1
                            ? "text-muted-foreground/50 cursor-not-allowed"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {currentStep === 1 ? "Start" : "Previous Step"}
                    </button>


                    {currentStep < totalSteps ? (
                        <button
                            onClick={nextStep}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-8 rounded-lg shadow-lg shadow-primary/20 transition-all transform active:scale-[0.98] flex items-center gap-2"
                        >
                            {currentStep === 1 ? "Get Started" : "Continue"}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={async () => {
                                // Clear saved step
                                localStorage.removeItem('onboarding_step');
                                // Check onboarding status one more time before redirecting
                                try {
                                    const res = await fetch('/api/auth/onboarding-status');
                                    if (res.ok) {
                                        const data = await res.json();
                                        if (data.hasCompletedOnboarding) {
                                            router.push('/dashboard');
                                        } else {
                                            // If not complete, stay on onboarding but show message
                                            alert('Please complete all required fields: Date of Birth, Location (PIN Code), and Emergency Contact');
                                        }
                                    }
                                } catch (err) {
                                    console.error('Error checking onboarding:', err);
                                    router.push('/dashboard');
                                }
                            }}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-8 rounded-lg shadow-lg shadow-primary/20 transition-all transform active:scale-[0.98] flex items-center gap-2"
                        >
                            Complete Setup
                        </button>
                    )}
                </div>

                <div className="text-center mt-12">
                    <p className="text-xs text-muted-foreground">
                        © 2026 Sahaay Platform. All medical data is encrypted and secure.
                        <br />
                        <span className="mx-2">Privacy Policy</span> • <span className="mx-2">Terms of Service</span> • <span className="mx-2">HIPAA Compliance</span>
                    </p>
                </div>

            </main>
        </div>
    );
}
