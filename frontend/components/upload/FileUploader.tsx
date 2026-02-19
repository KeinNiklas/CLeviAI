"use client";

import * as React from "react";
import { Upload, FileText, AlertCircle, Loader2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";

import { useLanguage } from "@/lib/LanguageContext";
import { API_URL } from '@/lib/api';

interface FileUploaderProps {
    onUploadComplete: (data: any) => void;
}

export function FileUploader({ onUploadComplete }: FileUploaderProps) {
    const { t, language } = useLanguage();
    const { token } = useAuth();
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

        const formData = new FormData();
        files.forEach(file => {
            formData.append("files", file);
        });
        formData.append("language", language);

        try {
            const response = await fetch(`${API_URL}/analyze-document`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(async () => ({ detail: await response.text() }));
                throw new Error(errorData.detail || errorData.message || (typeof errorData === 'string' ? errorData : t.uploader.error_fail));
            }

            const data = await response.json();
            onUploadComplete(data);
        } catch (err: any) {
            setError(err.message || t.uploader.error_backend);
            console.error(err);
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
            {files.length > 0 && (
                <Card className="overflow-hidden border-border/50 shadow-md">
                    <div className="bg-secondary/30 px-4 py-3 border-b border-border/50 flex justify-between items-center">
                        <h3 className="font-semibold text-sm">{t.uploader.table_title}</h3>
                        <span className="text-xs text-muted-foreground">{files.length} / 10</span>
                    </div>
                    <div className="divide-y divide-border/20">
                        {files.map((file, index) => (
                            <div key={`${file.name}-${index}`} className="flex items-center justify-between p-3 hover:bg-secondary/20 transition-colors">
                                <div className="flex items-center space-x-3 overflow-hidden">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <FileText className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-medium truncate max-w-[200px] sm:max-w-[300px]" title={file.name}>
                                            {file.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {(file.size / 1024).toFixed(1)} KB
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
