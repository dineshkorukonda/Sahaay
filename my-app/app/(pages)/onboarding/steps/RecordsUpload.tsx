"use client";

import React from "react";
import { CloudUpload, FileText, Image as ImageIcon, Trash2, CheckCircle2, Loader2 } from "lucide-react";

export default function RecordsUpload() {
    return (
        <div className="w-full max-w-3xl mx-auto space-y-10">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Medical Records</h2>
                <p className="text-gray-500 max-w-xl mx-auto">
                    Securely upload your previous health reports, prescriptions, or lab results. This helps our AI and doctors provide more accurate recommendations.
                </p>
            </div>

            {/* Upload Zone */}
            <div className="border-2 border-dashed border-[#22c55e]/30 bg-green-50/30 rounded-3xl p-10 text-center hover:bg-green-50/50 hover:border-[#22c55e]/50 transition-all cursor-pointer group">
                <div className="w-16 h-16 bg-[#22c55e]/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <CloudUpload className="w-8 h-8 text-[#22c55e]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Drag and drop files here</h3>
                <p className="text-sm text-gray-400 mb-6">Supports PDF, JPG, PNG (Max 10MB per file)</p>
                <button className="bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold py-2.5 px-6 rounded-lg shadow-lg shadow-green-500/20 transition-all active:scale-95">
                    Upload from Device
                </button>
            </div>

            {/* Recently Added List */}
            <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Recently Added</h4>
                <div className="space-y-3">

                    {/* File Item 1 - Ready */}
                    <div className="flex items-center p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-3 bg-red-50 rounded-lg mr-4">
                            <FileText className="w-6 h-6 text-red-500" />
                        </div>
                        <div className="flex-1">
                            <h5 className="font-bold text-gray-900 text-sm">Blood_Work_May_2023.pdf</h5>
                            <p className="text-xs text-gray-400">2.4 MB • Uploaded 2 mins ago</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-[#22c55e] bg-green-50 px-2.5 py-1 rounded-md">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Ready
                            </span>
                            <button className="text-gray-400 hover:text-red-500 transition-colors">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* File Item 2 - Scanning */}
                    <div className="flex items-center p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-3 bg-blue-50 rounded-lg mr-4">
                            <ImageIcon className="w-6 h-6 text-blue-500" />
                        </div>
                        <div className="flex-1">
                            <h5 className="font-bold text-gray-900 text-sm">Prescription_Dr._Smith.jpg</h5>
                            <p className="text-xs text-gray-400">840 KB • Processing...</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-md animate-pulse">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Scanning
                            </span>
                            <button className="text-gray-400 hover:text-red-500 transition-colors">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            <div className="flex justify-center pt-4">
                <button className="w-full max-w-md bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold py-3.5 rounded-lg shadow-lg shadow-green-500/20 transition-all transform active:scale-[0.98]">
                    Process Records
                </button>
            </div>

        </div>
    );
}
