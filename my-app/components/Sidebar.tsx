"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Activity,
    FileText,
    Users,
    LifeBuoy,
    Settings,
    MapPin,
    HeartPulse,
    Syringe,
    AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Nearby Care", href: "/nearby-care", icon: MapPin },
    { name: "Health Summary", href: "/health-summary", icon: Activity },
    { name: "Care Plan", href: "/care-plan", icon: FileText },
    { name: "Community", href: "/community", icon: Users },
    { name: "Family", href: "/family", icon: Users }, // Using Users for Family as well, or maybe HeartPulse? Let's use Users for now as per image looks like family
    { name: "Support", href: "/support", icon: LifeBuoy },
    { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border shadow-sm fixed left-0 top-0 overflow-y-auto">
            <div className="p-6">
                <div className="flex items-center gap-3 px-2 mb-8">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <HeartPulse className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-lg text-sidebar-foreground leading-tight">
                            CareConnect
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                            Medical Intelligence
                        </span>
                    </div>
                </div>

                <nav className="space-y-1.5">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href; // Simple exact match or startswith if needed
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-sidebar-accent text-sidebar-primary"
                                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5", isActive ? "text-sidebar-primary" : "text-muted-foreground")} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-6">
                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-destructive px-4 py-4 text-sm font-bold text-white shadow-lg shadow-destructive/20 hover:bg-destructive/90 transition-all active:scale-95 cursor-pointer">
                    <AlertTriangle className="h-5 w-5 fill-white text-white" />
                    Emergency SOS
                </button>
            </div>
        </div>
    );
}
