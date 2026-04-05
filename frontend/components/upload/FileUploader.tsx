"use client";

import * as React from "react";
import { Upload, FileText, AlertCircle, Loader2, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { upload } from "@vercel/blob/client";
import { useLanguage } from "@/lib/LanguageContext";

interface FileUploaderProps {
    onUploadComplete: (data: any) => void;
}

type FileStatus = "pending" | "uploading" | "done" | "error";

interface TrackedFile {
    file: File;
    status: FileStatus;
    blobUrl?: string;
}

export function FileUploader({ onUploadComplete }: FileUploaderProps) {
    const { t, language } = useLanguage();
    const { token } = useAuth();
    const [dragActive, setDragActive] = React.useState(false);
    const [trackedFiles, setTrackedFiles] = React.useState<TrackedFile[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Convenience: raw File[] for validation
    const files = trackedFiles.map(tf => tf.file);

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
        if (trackedFiles.length + newFiles.length > 10) {
            setError(t.uploader.error_max);
            return;
        }
        const uniqueFiles = newFiles.filter(nf =>
            !trackedFiles.some(tf => tf.file.name === nf.name && tf.file.size === nf.size)
        );
        setTrackedFiles(prev => [
            ...prev,
            ...uniqueFiles.map(f => ({ file: f, status: "pending" as FileStatus }))
        ]);
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
        setTrackedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (trackedFiles.length === 0) return;
        setLoading(true);
        setError(null);

        try {
            const blobUrls: string[] = [];

            // Schritt 1 & 2: Jede Datei einzeln zu Vercel Blob hochladen
            for (let i = 0; i < trackedFiles.length; i++) {
                const { file } = trackedFiles[i];

                // Status auf "uploading" setzen
                setTrackedFiles(prev =>
                    prev.map((tf, idx) => idx === i ? { ...tf, status: "uploading" } : tf)
                );

                // Direkt zu Vercel Blob hochladen via Next.js Backend (/blob-upload)
                const blob = await upload(file.name, file, {
                    access: "public",
                    handleUploadUrl: "/blob-upload",
                    headers: { Authorization: `Bearer ${token}` }
                });

                blobUrls.push(blob.url);

                // Status auf "done" setzen
                setTrackedFiles(prev =>
                    prev.map((tf, idx) => idx === i ? { ...tf, status: "done", blobUrl: blob.url } : tf)
                );
            }

            // Schritt 3: Analyse mit den Blob-URLs
            const response = await fetch("/api/analyze-document", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ blob_urls: blobUrls, language }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(async () => ({ detail: await response.text() }));
                throw new Error(errorData.detail || errorData.message || (typeof errorData === "string" ? errorData : t.uploader.error_fail));
            }

            const data = await response.json();
            onUploadComplete(data);
        } catch (err: any) {
            setError(err.message || t.uploader.error_backend);
            console.error(err);
            // Alle noch-pendenden oder uploadenden Dateien auf error setzen
            setTrackedFiles(prev =>
                prev.map(tf =>
                    tf.status === "uploading" || tf.status === "pending"
                        ? { ...tf, status: "error" }
                        : tf
                )
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            {/* Upload Area */}
            <div
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center text-center space-y-4 ${
                    dragActive
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
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleChange}
                    accept=".pdf,.docx,.txt"
                    multiple
                />

                <div className="p-4 bg-secondary rounded-full shadow-inner">
                    <Upload className="w-8 h-8 text-primary" />
                </div>

                <div className="space-y-1">
                    <p className="font-medium text-lg">
                        {t.uploader.drop_title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {t.uploader.drop_desc}
                    </p>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-center space-x-2 text-destructive bg-destructive/10 p-4 rounded-lg text-sm border border-destructive/20 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                </div>
            )}

            {/* Generate Button */}
            <Button
                className="w-full text-lg h-12 shadow-lg hover:shadow-primary/20 transition-all"
                size="lg"
                onClick={handleUpload}
                disabled={files.length === 0 || loading}
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        {t.uploader.btn_analyzing} {files.length} {files.length !== 1 ? t.uploader.files : t.uploader.file}...
                    </>
                ) : (
                    <>
                        <FileText className="w-5 h-5 mr-3" />
                        {t.uploader.btn_generate} ({files.length} {files.length !== 1 ? t.uploader.files : t.uploader.file})
                    </>
                )}
            </Button>

            {/* File List Table */}
            {trackedFiles.length > 0 && (
                <Card className="overflow-hidden border-border/50 shadow-md">
                    <div className="bg-secondary/30 px-4 py-3 border-b border-border/50 flex justify-between items-center">
                        <h3 className="font-semibold text-sm">{t.uploader.table_title}</h3>
                        <span className="text-xs text-muted-foreground">{trackedFiles.length} / 10</span>
                    </div>
                    <div className="divide-y divide-border/20">
                        {trackedFiles.map(({ file, status }, index) => (
                            <div key={`${file.name}-${index}`} className="flex items-center justify-between p-3 hover:bg-secondary/20 transition-colors">
                                <div className="flex items-center space-x-3 overflow-hidden">
                                    <div className={`p-2 rounded-lg ${
                                        status === "done" ? "bg-green-500/10" :
                                        status === "error" ? "bg-destructive/10" :
                                        status === "uploading" ? "bg-primary/10 animate-pulse" :
                                        "bg-primary/10"
                                    }`}>
                                        {status === "done" ? (
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        ) : status === "uploading" ? (
                                            <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                        ) : status === "error" ? (
                                            <AlertCircle className="w-4 h-4 text-destructive" />
                                        ) : (
                                            <FileText className="w-4 h-4 text-primary" />
                                        )}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-medium truncate max-w-[200px] sm:max-w-[300px]" title={file.name}>
                                            {file.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {(file.size / 1024).toFixed(1)} KB
                                            {status === "uploading" && " · Wird hochgeladen…"}
                                            {status === "done" && " · Hochgeladen ✓"}
                                            {status === "error" && " · Fehler"}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeFile(index)}
                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                                    disabled={loading}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}
