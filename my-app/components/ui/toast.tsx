"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = "info", duration: number = 3000) => {
        const id = Math.random().toString(36).substring(7);
        const toast: Toast = { id, message, type, duration };
        
        setToasts((prev) => [...prev, toast]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const getIcon = (type: ToastType) => {
        switch (type) {
            case "success":
                return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
            case "error":
                return <AlertCircle className="h-5 w-5 text-red-600" />;
            case "warning":
                return <AlertTriangle className="h-5 w-5 text-orange-600" />;
            default:
                return <Info className="h-5 w-5 text-blue-600" />;
        }
    };

    const getStyles = (type: ToastType) => {
        switch (type) {
            case "success":
                return "bg-emerald-50 border-emerald-200 text-emerald-800";
            case "error":
                return "bg-red-50 border-red-200 text-red-800";
            case "warning":
                return "bg-orange-50 border-orange-200 text-orange-800";
            default:
                return "bg-blue-50 border-blue-200 text-blue-800";
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`${getStyles(toast.type)} border rounded-xl p-4 shadow-lg min-w-[300px] max-w-md flex items-start gap-3 animate-in slide-in-from-right`}
                    >
                        {getIcon(toast.type)}
                        <p className="flex-1 text-sm font-medium">{toast.message}</p>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        // Fallback if not in provider (shouldn't happen but prevents crashes)
        return {
            showToast: (message: string, type?: ToastType) => {
                console.log(`Toast: ${message} (${type || 'info'})`);
                // Fallback to alert if toast provider not available
                if (typeof window !== 'undefined') {
                    alert(message);
                }
            }
        };
    }
    return context;
}
