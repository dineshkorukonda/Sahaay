"use client";

import { useState, useEffect } from "react";
import { Droplets, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/components/ui/toast";

const SOURCES = [
    { value: "hand_pump", label: "Hand pump" },
    { value: "well", label: "Well" },
    { value: "tap", label: "Tap" },
    { value: "pond", label: "Pond" },
    { value: "other", label: "Other" },
];
const TURBIDITY_OPTIONS = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
];
const BACTERIAL_OPTIONS = [
    { value: "pass", label: "Pass (safe)" },
    { value: "fail", label: "Fail (contaminated)" },
    { value: "unknown", label: "Unknown" },
];

export default function WaterQualityPage() {
    const [reports, setReports] = useState<Array<{
        _id: string;
        source: string;
        turbidity: string;
        pH: number;
        bacterialPresence: string;
        pinCode?: string;
        reportedAt: string;
    }>>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        pinCode: "",
        source: "hand_pump",
        turbidity: "low",
        pH: 7,
        bacterialPresence: "unknown" as "pass" | "fail" | "unknown",
        notes: "",
    });
    const { showToast } = useToast();

    const fetchReports = async () => {
        try {
            const res = await fetch("/api/water-quality?limit=20");
            const json = await res.json();
            if (json.success) setReports(json.reports || []);
        } catch (e) {
            console.error(e);
            showToast("Failed to load water quality reports", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/water-quality", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pinCode: form.pinCode || undefined,
                    source: form.source,
                    turbidity: form.turbidity,
                    pH: form.pH,
                    bacterialPresence: form.bacterialPresence,
                    notes: form.notes || undefined,
                }),
            });
            const json = await res.json();
            if (json.success) {
                showToast("Water quality report submitted successfully", "success");
                setForm({ ...form, notes: "" });
                fetchReports();
            } else {
                showToast(json.error || "Failed to submit", "error");
            }
        } catch (err) {
            showToast("Failed to submit report", "error");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loader fullScreen text="Loading..." />;

    return (
        <div className="p-8 min-h-screen space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Droplets className="h-8 w-8 text-blue-500" />
                    Water Quality Reporting
                </h1>
                <p className="text-muted-foreground mt-1">
                    Report water source test results to support community health surveillance. Used with manual test kits or sensors.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-xl space-y-4 p-6 bg-white rounded-2xl border border-border shadow-sm">
                <h2 className="font-semibold text-lg">Submit a report</h2>
                <div>
                    <label className="block text-sm font-medium mb-1">PIN Code (optional)</label>
                    <input
                        type="text"
                        className="w-full border border-border rounded-lg px-3 py-2"
                        value={form.pinCode}
                        onChange={(e) => setForm({ ...form, pinCode: e.target.value })}
                        placeholder="e.g. 781001"
                        maxLength={6}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Water source *</label>
                    <select
                        className="w-full border border-border rounded-lg px-3 py-2"
                        value={form.source}
                        onChange={(e) => setForm({ ...form, source: e.target.value })}
                    >
                        {SOURCES.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Turbidity *</label>
                    <select
                        className="w-full border border-border rounded-lg px-3 py-2"
                        value={form.turbidity}
                        onChange={(e) => setForm({ ...form, turbidity: e.target.value })}
                    >
                        {TURBIDITY_OPTIONS.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">pH *</label>
                    <input
                        type="number"
                        min={0}
                        max={14}
                        step={0.1}
                        className="w-full border border-border rounded-lg px-3 py-2"
                        value={form.pH}
                        onChange={(e) => setForm({ ...form, pH: parseFloat(e.target.value) || 7 })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Bacterial presence *</label>
                    <select
                        className="w-full border border-border rounded-lg px-3 py-2"
                        value={form.bacterialPresence}
                        onChange={(e) => setForm({ ...form, bacterialPresence: e.target.value as "pass" | "fail" | "unknown" })}
                    >
                        {BACTERIAL_OPTIONS.map((b) => (
                            <option key={b.value} value={b.value}>{b.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Notes (optional)</label>
                    <textarea
                        className="w-full border border-border rounded-lg px-3 py-2"
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        rows={2}
                        placeholder="Any additional notes"
                    />
                </div>
                <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50"
                >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Submit report
                </button>
            </form>

            <div>
                <h2 className="font-semibold text-lg mb-4">Recent reports</h2>
                {reports.length === 0 ? (
                    <p className="text-muted-foreground">No water quality reports yet. Submit one above.</p>
                ) : (
                    <ul className="space-y-3">
                        {reports.map((r) => (
                            <li
                                key={r._id}
                                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-border"
                            >
                                <div className={r.bacterialPresence === "fail" ? "text-red-500" : "text-green-500"}>
                                    {r.bacterialPresence === "fail" ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                                </div>
                                <div className="flex-1">
                                    <span className="font-medium capitalize">{r.source.replace("_", " ")}</span>
                                    {r.pinCode && <span className="text-muted-foreground ml-2">PIN {r.pinCode}</span>}
                                    <span className="text-muted-foreground ml-2">pH {r.pH}, Turbidity: {r.turbidity}</span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    {new Date(r.reportedAt).toLocaleDateString()}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
