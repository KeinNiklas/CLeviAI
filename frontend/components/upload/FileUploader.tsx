"use client";

import * as React from "react";
import { Upload, FileText, AlertCircle, Loader2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

import { useLanguage } from "@/lib/LanguageContext";

interface FileUploaderProps {
    onUploadComplete: (data: any) => void;
}

export function FileUploader({ onUploadComplete }: FileUploaderProps) {
    const { t, language } = useLanguage();
    const [dragActive, setDragActive] = React.useState(false);
    const [files, setFiles] = React.useState<File[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const validateAndAddFiles = (newFiles: File[]) => {
        setError(null);
        if (files.length + newFiles.length > 10) {
            setError(t.uploader.error_max);
            return;
        }

        // Filter duplicates based on name and size
        const uniqueFiles = newFiles.filter(nf =>
            !files.some(f => f.name === nf.name && f.size === nf.size)
        );

        setFiles(prev => [...prev, ...uniqueFiles]);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            validateAndAddFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files.length > 0) {
            validateAndAddFiles(Array.from(e.target.files));
        }
        // Reset input value to allow selecting the same file again if needed after removal
        e.target.value = "";
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setLoading(true);
        setError(null);

        try {
            // Step 1: Upload each file to Gemini File API (as base64)
            const uploadPromises = files.map(async (file) => {
                // Convert file to base64
                const base64Data = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const result = reader.result as string;
                        // Remove data URL prefix (e.g., "data:application/pdf;base64,")
                        const base64 = result.split(',')[1];
                        resolve(base64);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });

                // Upload to Gemini File API via backend
                const uploadResponse = await fetch("/api/upload-to-gemini-base64", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        file_data: base64Data,
                        filename: file.name,
                        mime_type: file.type || "application/octet-stream",
                    }),
                });

                if (!uploadResponse.ok) {
                    const errorData = await uploadResponse.json();
                    throw new Error(errorData.detail || "Failed to upload file to Gemini");
                }

                const { file_uri } = await uploadResponse.json();
                return { file_uri, filename: file.name };
            });

            const uploadedFiles = await Promise.all(uploadPromises);

            // Step 2: Analyze all uploaded files
            const analyzePromises = uploadedFiles.map(async ({ file_uri, filename }) => {
                const analyzeResponse = await fetch("/api/analyze-file-uri", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        file_uri,
                        filename,
                        language,
                    }),
                });

                if (!analyzeResponse.ok) {
                    const errorData = await analyzeResponse.json();
                    throw new Error(errorData.detail || "Failed to analyze file");
                }

                return await analyzeResponse.json();
            });

            const results = await Promise.all(analyzePromises);

            // Flatten all topics from all files
            const allTopics = results.flat();

            onUploadComplete(allTopics);
            setFiles([]);
        } catch (err: any) {
            console.error("Upload error:", err);
            setError(err.message || t.uploader.error_fail);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            {/* Upload Area */}
            <div
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center text-center space-y-4 ${dragActive
                    ? "border-primary bg-primary/5 scale-[1.02]"
                    : "border-border hover:bg-secondary/50"
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    id="file-upload"
                    multiple
                    onChange={handleChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,image/*"
                />

                <div className="flex flex-col items-center gap-3">
                    <div className="p-4 rounded-full bg-primary/10">
                        <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <p className="text-lg font-medium">{t.uploader.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {t.uploader.subtitle}
                        </p>
                    </div>
                    <Button
                        variant="default"
                        size="lg"
                        type="button"
                        onClick={() => document.getElementById('file-upload')?.click()}
                    >
                        {t.uploader.button}
                    </Button>
                </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <Card className="p-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium">{t.uploader.files_selected}</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setFiles([])}
                                className="text-muted-foreground hover:text-destructive"
                            >
                                <X className="w-4 h-4 mr-1" />
                                {t.uploader.clear_all}
                            </Button>
                        </div>
                        {files.map((file, index) => (
                            <div
                                key={`${file.name}-${index}`}
                                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium truncate">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {(file.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(index)}
                                    className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                    <Button
                        onClick={handleUpload}
                        disabled={loading}
                        className="w-full mt-4"
                        size="lg"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {t.uploader.analyzing}
                            </>
                        ) : (
                            t.uploader.analyze
                        )}
                    </Button>
                </Card>
            )}

            {/* Error Display */}
            {error && (
                <Card className="p-4 border-destructive/50 bg-destructive/5">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-destructive">{t.uploader.error}</p>
                            <p className="text-sm text-destructive/80 mt-1">{error}</p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
