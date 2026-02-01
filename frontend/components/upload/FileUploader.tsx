"use client";

import * as React from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/lib/LanguageContext";

interface FileUploaderProps {
    onUploadComplete: (data: any) => void;
}

export function FileUploader({ onUploadComplete }: FileUploaderProps) {
    const [dragActive, setDragActive] = React.useState(false);
    const [file, setFile] = React.useState<File | null>(null);
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

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setError(null);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://localhost:8000/analyze-document", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Analysis failed. Please try again.");
            }

            const data = await response.json();
            onUploadComplete(data);
        } catch (err) {
            setError("Failed to process file. Ensure backend is running.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto space-y-4">
            <div
                className={`relative border-2 border-dashed rounded-xl p-8 transition-colors flex flex-col items-center justify-center text-center space-y-4 ${dragActive
                        ? "border-primary bg-primary/5"
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
                />

                <div className="p-4 bg-secondary rounded-full">
                    <Upload className="w-8 h-8 text-primary" />
                </div>

                <div className="space-y-1">
                    <p className="font-medium text-lg">
                        {file ? file.name : "Drop your study material here"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {file ? "Ready to analyze" : "Supports PDF, DOCX, TXT"}
                    </p>
                </div>
            </div>

            {error && (
                <div className="flex items-center space-x-2 text-destructive bg-destructive/10 p-3 rounded-lg text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                </div>
            )}

            <Button
                className="w-full"
                size="lg"
                onClick={handleUpload}
                disabled={!file || loading}
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing with AI...
                    </>
                ) : (
                    <>
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Study Plan
                    </>
                )}
            </Button>
        </div>
    );
}
