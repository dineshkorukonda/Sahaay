"use client";

import React, { useState } from "react";
import { CloudUpload, Trash2, CheckCircle2, Loader2, X } from "lucide-react";

interface UploadedFile {
    id: string;
    file: File;
    status: 'uploading' | 'processing' | 'ready' | 'error';
    progress?: number;
    fileName?: string;
    fileUrl?: string;
}

interface RecordsUploadProps {
    onRecordsChange?: (hasRecords: boolean) => void;
}

export default function RecordsUpload({ onRecordsChange }: RecordsUploadProps) {
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileSelect = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        Array.from(files).forEach((file) => {
            if (file.size > 10 * 1024 * 1024) {
                alert(`${file.name} is too large. Maximum size is 10MB.`);
                return;
            }

            const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            const newFile: UploadedFile = {
                id: fileId,
                file,
                status: 'uploading',
                progress: 0
            };

            setUploadedFiles((prev) => [...prev, newFile]);
            uploadFile(newFile);
        });
    };

    const uploadFile = async (fileItem: UploadedFile) => {
        const formData = new FormData();
        formData.append('file', fileItem.file);

        try {
            setUploadedFiles((prev) =>
                prev.map((f) =>
                    f.id === fileItem.id ? { ...f, status: 'processing' as const } : f
                )
            );

            const res = await fetch('/api/analyze-pdf', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setUploadedFiles((prev) =>
                    prev.map((f) =>
                        f.id === fileItem.id
                            ? {
                                ...f,
                                status: 'ready' as const,
                                fileName: fileItem.file.name,
                                fileUrl: data.data?.fileUrl
                            }
                            : f
                    )
                );
                if (onRecordsChange) {
                    onRecordsChange(true);
                }
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (err) {
            console.error('Upload error:', err);
            setUploadedFiles((prev) =>
                prev.map((f) =>
                    f.id === fileItem.id ? { ...f, status: 'error' as const } : f
                )
            );
            alert(`Failed to upload ${fileItem.file.name}`);
        }
    };

    const handleDelete = (fileId: string) => {
        setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
        if (uploadedFiles.length === 1 && onRecordsChange) {
            onRecordsChange(false);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto space-y-10">
            <div className="text-center">
                <h2 className="text-3xl font-serif font-medium text-foreground mb-2">Upload Medical Records</h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                    Securely upload your previous health reports, prescriptions, or lab results. This helps our AI and doctors provide more accurate recommendations.
                </p>
            </div>

            {/* Upload Zone */}
            <label
                className={`block border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer group ${
                    isDragging
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-muted/30 hover:bg-muted/50 hover:border-primary/50'
                }`}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFileSelect(e.dataTransfer.files);
                }}
            >
                <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.png,.jpeg"
                    multiple
                    onChange={(e) => handleFileSelect(e.target.files)}
                />
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <CloudUpload className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Drag and drop files here</h3>
                <p className="text-sm text-muted-foreground mb-6">Supports PDF, JPG, PNG (Max 10MB per file)</p>
                <div className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 px-6 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95 inline-block">
                    Upload from Device
                </div>
            </label>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
                <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                        Uploaded Files ({uploadedFiles.length})
                    </h4>
                    <div className="space-y-3">
                        {uploadedFiles.map((fileItem) => (
                            <div
                                key={fileItem.id}
                                className="flex items-center p-4 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className={`p-3 rounded-lg mr-4 ${
                                    fileItem.status === 'ready' ? 'bg-primary/10' :
                                    fileItem.status === 'error' ? 'bg-destructive/10' :
                                    'bg-secondary/10'
                                }`}>
                                    {fileItem.status === 'ready' ? (
                                        <CheckCircle2 className="w-6 h-6 text-primary" />
                                    ) : fileItem.status === 'error' ? (
                                        <X className="w-6 h-6 text-destructive" />
                                    ) : (
                                        <Loader2 className="w-6 h-6 text-secondary animate-spin" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h5 className="font-semibold text-foreground text-sm">
                                        {fileItem.fileName || fileItem.file.name}
                                    </h5>
                                    <p className="text-xs text-muted-foreground">
                                        {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB •{' '}
                                        {fileItem.status === 'uploading' && 'Uploading...'}
                                        {fileItem.status === 'processing' && 'Processing...'}
                                        {fileItem.status === 'ready' && 'Ready'}
                                        {fileItem.status === 'error' && 'Error'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    {fileItem.status === 'ready' && (
                                        <span className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            Ready
                                        </span>
                                    )}
                                    <button
                                        onClick={() => handleDelete(fileItem.id)}
                                        className="text-muted-foreground hover:text-destructive transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {uploadedFiles.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">No files uploaded yet. Upload your medical records to get started.</p>
                </div>
            )}
        </div>
    );
}
