"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, HelpCircle, Mail, ArrowLeft } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/components/ui/toast";

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [countryCode, setCountryCode] = useState("+1 (US)");
    const [showOTP, setShowOTP] = useState(false);
    const [signupEmail, setSignupEmail] = useState("");
    const [isResendingOTP, setIsResendingOTP] = useState(false);
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        setShowOTP(false);
        setSignupEmail("");
    };

    const router = useRouter(); // Initialize router

    if (loading && !showOTP) {
        return <Loader fullScreen text="Processing..." />;
    }

    return (
        <div className="flex min-h-screen w-full flex-row">
            {/* Left Panel - Visuals (Desktop only) */}
            <div className="hidden lg:flex w-1/2 bg-[#052e16] relative flex-col justify-center items-center p-12 overflow-hidden">

                {/* Abstract 3D Image Container */}
                <div className="relative w-full max-w-lg aspect-square mb-12">
                    <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-3xl transform -translate-y-10" />
                    <Image
                        // Using a high-quality abstract medical/3d render web image as placeholder
                        src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?q=80&w=2691&auto=format&fit=crop"
                        alt="Medical Intelligence Abstract"
                        fill
                        className="object-cover rounded-3xl shadow-2xl relative z-10"
                        priority
                    />
                </div>

                <div className="relative z-10 text-center space-y-4 max-w-lg">
                    <h1 className="text-4xl font-semibold text-white tracking-tight leading-tight">
                        Empowering care management with medical intelligence
                    </h1>
                    <p className="text-gray-300 text-lg font-light leading-relaxed">
                        Access your comprehensive healthcare dashboard and real-time medical insights in one secure platform.
                    </p>
                </div>
            </div>

            {/* Right Panel - Auth Form */}
            <div className="flex-1 bg-[#f8fafc] flex flex-col justify-center items-center p-6 md:p-12 relative">
                <div className="w-full max-w-md space-y-8">

                    {/* Back to Home Button */}
                    <Link 
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#22c55e] transition-colors mb-4 self-start"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>

                    {/* Logo */}
                    <div className="mb-8">
                        <span className="text-xl font-bold text-gray-900 tracking-tight">Sahaay</span>
                    </div>

                    {/* Header */}
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            {showOTP ? "Verify Your Email" : isLogin ? "Welcome Back" : "Create Account"}
                        </h2>
                        <p className="text-[#22c55e] text-sm font-medium">
                            {showOTP
                                ? `We've sent an OTP to ${signupEmail}. Please check your inbox.`
                                : isLogin
                                ? "Enter your credentials to access your workspace."
                                : "Fill in your details to get started."}
                        </p>
                    </div>

                    {/* OTP Verification Form */}
                    {showOTP ? (
                        <form className="space-y-6" onSubmit={async (e) => {
                            e.preventDefault();
                            const otp = (document.getElementById('otp') as HTMLInputElement).value;

                            if (!otp || otp.length !== 6) {
                                alert("Please enter a valid 6-digit OTP");
                                return;
                            }

                            setLoading(true);
                            try {
                                const res = await fetch('/api/auth/verify-otp', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ email: signupEmail, otp })
                                });
                                const data = await res.json();

                                if (res.ok) {
                                    showToast('Email verified successfully!', 'success');
                                    // Redirect based on onboarding completion status
                                    setTimeout(() => {
                                        if (data.hasCompletedOnboarding) {
                                            router.push('/dashboard');
                                        } else {
                                            router.push('/onboarding');
                                        }
                                    }, 500);
                                } else {
                                    showToast(data.error || "OTP verification failed", 'error');
                                }
                            } catch (err) {
                                console.error(err);
                                showToast("Something went wrong", 'error');
                            } finally {
                                setLoading(false);
                            }
                        }}>
                            <div className="space-y-1">
                                <label htmlFor="otp" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Enter OTP
                                </label>
                                <input
                                    id="otp"
                                    type="text"
                                    required
                                    maxLength={6}
                                    placeholder="000000"
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent transition-all"
                                    pattern="[0-9]{6}"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold py-3 rounded-lg shadow-lg shadow-green-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? 'Verifying...' : 'Verify & Continue'}
                            </button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={async () => {
                                        setIsResendingOTP(true);
                                        try {
                                            const res = await fetch('/api/auth/resend-otp', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ email: signupEmail })
                                            });
                                            const data = await res.json();
                                            if (res.ok) {
                                                alert("OTP has been resent to your email");
                                            } else {
                                                alert(data.error || "Failed to resend OTP");
                                            }
                                        } catch (err) {
                                            console.error(err);
                                            alert("Something went wrong");
                                        } finally {
                                            setIsResendingOTP(false);
                                        }
                                    }}
                                    disabled={isResendingOTP}
                                    className="text-[#22c55e] text-sm font-semibold hover:underline disabled:opacity-50"
                                >
                                    {isResendingOTP ? "Sending..." : "Resend OTP"}
                                </button>
                            </div>
                        </form>
                    ) : (
                        /* Regular Login/Signup Form */
                        <form className="space-y-6" onSubmit={async (e) => {
                            e.preventDefault();
                            const password = (document.getElementById('password') as HTMLInputElement).value;
                            
                            if (isLogin) {
                                const emailOrMobile = (document.getElementById('email') as HTMLInputElement)?.value;
                                const formData = {
                                    email: emailOrMobile,
                                    password
                                };
                                
                                setLoading(true);
                                try {
                                    const endpoint = '/api/auth/login';
                                    const res = await fetch(endpoint, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(formData)
                                    });
                                    const data = await res.json();

                                    if (res.ok) {
                                        showToast('Login successful!', 'success');
                                        // Redirect based on onboarding completion status
                                        setTimeout(() => {
                                            if (data.hasCompletedOnboarding) {
                                                router.push('/dashboard');
                                            } else {
                                                router.push('/onboarding');
                                            }
                                        }, 500);
                                    } else {
                                        showToast(data.error || "Authentication failed", 'error');
                                    }
                                } catch (err) {
                                    console.error(err);
                                    showToast("Something went wrong", 'error');
                                } finally {
                                    setLoading(false);
                                }
                            } else {
                                const formData = {
                                    name: (document.getElementById('fullname') as HTMLInputElement).value,
                                    email: (document.getElementById('signupEmail') as HTMLInputElement).value,
                                    mobile: (document.getElementById('mobile') as HTMLInputElement)?.value || undefined,
                                    password
                                };
                                
                                if (!formData.email) {
                                    showToast("Email is required for signup", 'error');
                                    return;
                                }
                                
                                setLoading(true);
                                try {
                                    const endpoint = '/api/auth/signup';
                                    const res = await fetch(endpoint, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(formData)
                                    });
                                    const data = await res.json();

                                    if (res.ok) {
                                        showToast('OTP sent to your email!', 'success');
                                        setSignupEmail(formData.email);
                                        setShowOTP(true);
                                    } else {
                                        showToast(data.error || "Signup failed", 'error');
                                    }
                                } catch (err) {
                                    console.error(err);
                                    showToast("Something went wrong", 'error');
                                } finally {
                                    setLoading(false);
                                }
                            }

                        }}>

                            {!isLogin && (
                                <div className="space-y-1">
                                    <label htmlFor="fullname" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Full Name
                                    </label>
                                    <input
                                        id="fullname"
                                        type="text"
                                        required
                                        placeholder="John Doe"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent transition-all"
                                    />
                                </div>
                            )}

                            {!isLogin && (
                                <div className="space-y-1">
                                    <label htmlFor="signupEmail" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            id="signupEmail"
                                            type="email"
                                            required
                                            placeholder="john@example.com"
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            {!isLogin && (
                                <div className="space-y-1">
                                    <label htmlFor="mobile" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Mobile Number <span className="text-gray-400 font-normal lowercase">(optional)</span>
                                    </label>
                                    <div className="flex space-x-2">
                                        <div className="relative w-[140px]">
                                            <select
                                                value={countryCode}
                                                onChange={(e) => setCountryCode(e.target.value)}
                                                className="w-full appearance-none px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent cursor-pointer pr-10"
                                            >
                                                <option>+1 (US)</option>
                                                <option>+91 (IND)</option>
                                                <option>+44 (UK)</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                        <input
                                            id="mobile"
                                            type="tel"
                                            placeholder="000-000-0000"
                                            className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            {isLogin && (
                                <div className="space-y-1">
                                    <label htmlFor="email" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Email or Mobile
                                    </label>
                                    <input
                                        id="email"
                                        type="text"
                                        required
                                        placeholder="email@example.com or phone number"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent transition-all"
                                    />
                                </div>
                            )}

                            <div className="space-y-1">
                                <label htmlFor="password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent transition-all"
                                />
                            </div>

                            {!isLogin && (
                                <div className="flex items-start space-x-3">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="terms"
                                            type="checkbox"
                                            required
                                            className="w-4 h-4 text-[#22c55e] border-gray-300 rounded focus:ring-[#22c55e] focus:ring-offset-0"
                                        />
                                    </div>
                                    <label htmlFor="terms" className="text-sm text-gray-600">
                                        I agree to the <a href="#" className="text-[#22c55e] hover:underline font-medium">Terms of Service</a> and <a href="#" className="text-[#22c55e] hover:underline font-medium">Privacy Policy</a>.
                                    </label>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold py-3 rounded-lg shadow-lg shadow-green-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (isLogin ? "Logging in..." : "Creating account...") : (isLogin ? "Login & Continue" : "Create Account & Send OTP")}
                            </button>
                        </form>
                    )}

                    {/* Footer */}
                    <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
                        <p className="text-gray-500">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                            <button
                                onClick={toggleAuthMode}
                                className="text-[#22c55e] font-semibold hover:underline"
                            >
                                {isLogin ? "Sign up" : "Login"}
                            </button>
                        </p>

                        <button className="flex items-center text-gray-900 font-semibold hover:text-[#22c55e] transition-colors">
                            <HelpCircle className="w-4 h-4 mr-2" />
                            Support
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
