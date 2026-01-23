"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();

    useEffect(() => {
        const checkOnboarding = async () => {
            try {
                const res = await fetch('/api/auth/onboarding-status');
                if (res.ok) {
                    const data = await res.json();
                    if (!data.hasCompletedOnboarding) {
                        router.push('/onboarding');
                    }
                }
            } catch (err) {
                console.error('Error checking onboarding:', err);
            }
        };
        checkOnboarding();
    }, [router]);

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <main className="flex-1 ml-64 min-h-screen transition-all duration-300 ease-in-out">
                {children}
            </main>
        </div>
    );
}
