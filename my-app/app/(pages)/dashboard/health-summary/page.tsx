"use client";

import { FileText, Pill, AlertTriangle, ShieldCheck, Download, Upload, Filter, Search, ChevronRight, FileBarChart, Activity, Plus, X, Loader2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/components/ui/toast";

interface ClinicalCondition {
    id: string;
    conditionName: string;
    icd10Code: string;
    severity: string;
    sourceDocument: string;
    confidence: number;
}

interface RecentReport {
    id: string;
    name: string;
    fileName: string;
    fileType: string;
    analyzedAt: string;
    source: string;
}

interface HealthSummaryData {
    stats: {
        highRiskConditions: number;
        activeMedications: number;
        recentReports: number;
        aiConfidence: number;
    };
    clinicalConditions: ClinicalCondition[];
    recentReports: RecentReport[];
    totalReports: number;
}

export default function HealthSummaryPage() {
    const [data, setData] = useState<HealthSummaryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();

    useEffect(() => {
        fetchHealthSummary();
    }, []);

    const fetchHealthSummary = async () => {
        try {
            const res = await fetch('/api/health-summary');
            const json = await res.json();
            if (json.success) {
                setData(json.data);
            }
        } catch (err) {
            console.error('Error fetching health summary:', err);
            showToast('Failed to load health summary', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file: File) => {
        if (!file) return;

        // Validate file type
        const isPDF = file.type === 'application/pdf' || file.name.endsWith('.pdf');
        const isImage = file.type.startsWith('image/') || file.name.match(/\.(png|jpg|jpeg|gif)$/i);
        
        if (!isPDF && !isImage) {
            showToast('Please upload a PDF or PNG/Image file', 'error');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            showToast('File size must be less than 10MB', 'error');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/analyze-pdf', {
                method: 'POST',
                body: formData
            });

            const json = await res.json();
            if (json.success) {
                showToast('Report uploaded and analyzed successfully', 'success');
                setShowUploadModal(false);
                // Reset file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                // Refresh data
                await fetchHealthSummary();
            } else {
                showToast(json.error || 'Failed to upload report', 'error');
            }
        } catch (err) {
            console.error('Upload error:', err);
            showToast('Failed to upload report', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getSeverityColor = (severity: string) => {
        if (severity === 'High Risk') return 'bg-red-100 text-red-700';
        if (severity === 'Moderate') return 'bg-orange-100 text-orange-700';
        return 'bg-blue-100 text-blue-700';
    };

    if (loading) {
        return <Loader fullScreen text="Loading health summary..." />;
    }

    const stats = data?.stats || {
        highRiskConditions: 0,
        activeMedications: 0,
        recentReports: 0,
        aiConfidence: 0
    };
    const clinicalConditions = data?.clinicalConditions || [];
    const recentReports = data?.recentReports || [];
    const hasData = data && data.totalReports > 0;
    return (
        <div className="p-8 min-h-screen space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="text-sm text-muted-foreground mb-1">Health Summary & Medical Records</div>
                    <h1 className="text-3xl font-bold tracking-tight">Health Summary & Intelligence</h1>
                    <p className="text-muted-foreground mt-1">AI-extracted medical overview and clinical risk stratification.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white border border-border text-foreground px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm">
                        <Download className="h-4 w-4" /> Export PDF
                    </button>
                    <button 
                        onClick={() => setShowUploadModal(true)}
                        className="bg-emerald-500 text-white px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-colors"
                    >
                        <Plus className="h-4 w-4" /> Upload Report
                    </button>
                </div>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">High Risk Conditions</p>
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                    </div>
                    <p className="text-4xl font-bold text-foreground mb-2">{stats.highRiskConditions}</p>
                    {hasData ? (
                        <div className="flex items-center gap-1 text-xs font-bold text-red-600">
                            <span className="text-red-500">↗</span> Requires attention
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground">No high-risk conditions detected</p>
                    )}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-4 -mt-4 -z-10 group-hover:scale-110 transition-transform"></div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Medications</p>
                        <Pill className="h-5 w-5 text-emerald-500" />
                    </div>
                    <p className="text-4xl font-bold text-foreground mb-2">{stats.activeMedications}</p>
                    {hasData ? (
                        <p className="text-xs text-muted-foreground">From medical records</p>
                    ) : (
                        <p className="text-xs text-muted-foreground">No medications recorded</p>
                    )}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 -z-10 group-hover:scale-110 transition-transform"></div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Recent Reports</p>
                        <FileText className="h-5 w-5 text-blue-500" />
                    </div>
                    <p className="text-4xl font-bold text-foreground mb-2">{stats.recentReports}</p>
                    {hasData && recentReports.length > 0 ? (
                        <p className="text-xs text-muted-foreground">
                            Last updated: {formatDate(recentReports[0].analyzedAt)}
                        </p>
                    ) : (
                        <p className="text-xs text-muted-foreground">No reports uploaded</p>
                    )}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 -z-10 group-hover:scale-110 transition-transform"></div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-emerald-100 bg-emerald-50/30 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">AI Confidence</p>
                        <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    </div>
                    <p className="text-4xl font-bold text-emerald-900 mb-2">{stats.aiConfidence}%</p>
                    {hasData ? (
                        <p className="text-xs text-emerald-700">High extraction accuracy</p>
                    ) : (
                        <p className="text-xs text-emerald-700">Upload reports to analyze</p>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-gray-100/50 p-1.5 rounded-xl inline-flex gap-1">
                <button className="bg-white shadow-sm text-foreground px-6 py-2 rounded-lg text-sm font-bold">Clinical View</button>
                <button className="text-muted-foreground hover:bg-white/50 px-6 py-2 rounded-lg text-sm font-medium transition-colors">Risk Analysis</button>
                <button className="text-muted-foreground hover:bg-white/50 px-6 py-2 rounded-lg text-sm font-medium transition-colors">Patient Explanations</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Main Content - Clinical Conditions */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <h3 className="font-bold text-lg">AI-Extracted Clinical Conditions</h3>
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-gray-50 rounded-lg"><Filter className="h-4 w-4 text-muted-foreground" /></button>
                                <button className="p-2 hover:bg-gray-50 rounded-lg"><Search className="h-4 w-4 text-muted-foreground" /></button>
                            </div>
                        </div>

                        {hasData && clinicalConditions.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50/50 text-muted-foreground text-xs uppercase font-bold">
                                        <tr>
                                            <th className="px-6 py-4">Condition Name</th>
                                            <th className="px-6 py-4">ICD-10 Code</th>
                                            <th className="px-6 py-4">Severity</th>
                                            <th className="px-6 py-4">Source Document</th>
                                            <th className="px-6 py-4">Confidence</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {clinicalConditions.map((condition) => (
                                            <tr key={condition.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-foreground">
                                                    {condition.conditionName}
                                                </td>
                                                <td className="px-6 py-4 text-emerald-600 font-medium">{condition.icd10Code}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`${getSeverityColor(condition.severity)} px-2 py-1 rounded-md text-[10px] font-bold uppercase`}>
                                                        {condition.severity}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground flex items-center gap-2">
                                                    <span className="text-emerald-500">📎</span> {condition.sourceDocument}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-emerald-500" style={{ width: `${condition.confidence}%` }}></div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <p className="text-muted-foreground font-medium mb-2">No clinical conditions found</p>
                                <p className="text-sm text-muted-foreground">Upload medical reports to extract conditions</p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Recent Reports Widget */}
                        <div className="bg-white p-6 rounded-3xl border border-border shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-lg">Recent Reports</h3>
                                <button 
                                    onClick={() => setShowUploadModal(true)}
                                    className="h-8 w-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-sm"
                                    title="Upload Report"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                            {hasData && recentReports.length > 0 ? (
                                <div className="space-y-4">
                                    {recentReports.map((report) => {
                                        const isPDF = report.fileType === 'application/pdf' || report.fileName.endsWith('.pdf');
                                        const isImage = report.fileType?.startsWith('image/') || report.fileName.match(/\.(png|jpg|jpeg|gif)$/i);
                                        return (
                                            <div key={report.id} className="flex items-center gap-4 p-3 rounded-xl border border-border hover:bg-gray-50 transition-colors cursor-pointer group">
                                                <div className={`h-10 w-10 ${isPDF ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'} rounded-lg flex items-center justify-center font-bold text-xs uppercase group-hover:${isPDF ? 'bg-red-100' : 'bg-blue-100'} transition-colors`}>
                                                    {isPDF ? 'PDF' : 'IMG'}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-sm">{report.name}</p>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        {formatDate(report.analyzedAt)} • {report.fileName}
                                                    </p>
                                                </div>
                                                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">Analyzed</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                                    <p className="text-sm text-muted-foreground mb-4">No reports uploaded yet</p>
                                    <button
                                        onClick={() => setShowUploadModal(true)}
                                        className="text-emerald-600 text-sm font-bold hover:underline"
                                    >
                                        Upload your first report
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Vitals History Widget */}
                        <div className="bg-white p-6 rounded-3xl border border-border shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-lg">Vitals History</h3>
                                <Activity className="h-5 w-5 text-muted-foreground" />
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6 border border-dashed border-gray-200 text-center relative mb-4">
                                {/* Range Visualization */}
                                <div className="h-2 w-full bg-emerald-200 rounded-full relative my-8">
                                    <div className="absolute top-1/2 left-[20%] right-[20%] h-4 -mt-2 bg-emerald-100/50 border-x-2 border-emerald-300"></div>
                                    <div className="absolute top-1/2 left-[44%] h-4 w-4 bg-emerald-500 rounded-full border-4 border-white shadow-lg -translate-y-1/2"></div>
                                    <div className="absolute top-1/2 left-[80%] h-3 w-3 bg-red-400 rounded-full -translate-y-1/2 opacity-50"></div>
                                </div>
                                <p className="text-[10px] font-bold text-emerald-700 bg-emerald-50 inline-block px-2 py-1 rounded">BP: 138/92 (Stage 1 Hypertension)</p>
                            </div>

                            <div className="flex justify-between text-center px-4">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Glucose</p>
                                    <p className="text-xl font-bold">108 <span className="text-xs text-muted-foreground font-normal">mg/dL</span></p>
                                </div>
                                <div className="w-px bg-border"></div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">BMI</p>
                                    <p className="text-xl font-bold">28.4</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar / Right Panel */}
                <div className="space-y-6">
                    <div className="bg-[#E3F5EE] rounded-3xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-8 w-8 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                                <ShieldCheck className="h-4 w-4" />
                            </div>
                            <span className="font-bold text-emerald-900">Why this matters</span>
                        </div>

                        <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
                            <p className="text-xs font-bold text-emerald-600 mb-2 uppercase tracking-wide">Kidney Function</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                John&apos;s GFR has dropped to 48 ml/min. This indicates Stage 3 Chronic Kidney Disease. This matters because it requires adjustment of his Metformin dosage.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
                            <p className="text-xs font-bold text-emerald-600 mb-2 uppercase tracking-wide">Medication Adherence</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Analysis of recent pharmacy data suggests a 14-day gap in Lisinopril refills. Sudden discontinuation can lead to rebound hypertension.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-4 shadow-sm">
                            <p className="text-xs font-bold text-emerald-600 mb-2 uppercase tracking-wide">Diagnostic Gap</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                AI detected mentions of &quot;peripheral neuropathy&quot; in imaging notes, but no formal diagnosis is recorded. Screening recommended.
                            </p>
                        </div>

                        <button className="w-full mt-6 bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition-colors">
                            Generate Patient Summary
                        </button>
                    </div>

                    <div className="bg-white rounded-3xl p-6 border border-border shadow-sm">
                        <h3 className="font-bold text-sm mb-4">Quick Intelligence Actions</h3>
                        <div className="space-y-3">
                            <button className="w-full flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-gray-50 p-2 rounded-lg transition-colors text-left">
                                <span className="bg-emerald-100 text-emerald-700 h-6 w-6 rounded-full flex items-center justify-center text-[10px]">✓</span> Confirm All AI Extractions
                            </button>
                            <button className="w-full flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-gray-50 p-2 rounded-lg transition-colors text-left">
                                <span className="bg-gray-100 text-gray-700 h-6 w-6 rounded-full flex items-center justify-center text-[10px]">↺</span> Review Audit Trail
                            </button>
                            <button className="w-full flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-gray-50 p-2 rounded-lg transition-colors text-left">
                                <span className="bg-gray-100 text-gray-700 h-6 w-6 rounded-full flex items-center justify-center text-[10px]">↗</span> Refer to Specialist
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Upload Medical Report</h2>
                            <button
                                onClick={() => {
                                    setShowUploadModal(false);
                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = '';
                                    }
                                }}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                                disabled={uploading}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-emerald-500 transition-colors">
                                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="font-semibold mb-2">Upload PDF or Image</p>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Supports PDF, PNG, JPG files (max 10MB)
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.png,.jpg,.jpeg,.gif,application/pdf,image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    disabled={uploading}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="bg-emerald-500 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4" />
                                            Choose File
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <p className="text-xs text-blue-800">
                                    <strong>Note:</strong> Your report will be analyzed using AI to extract medical conditions and medications. 
                                    The file will be stored securely in your account.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
