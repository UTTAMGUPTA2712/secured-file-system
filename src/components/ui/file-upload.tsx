
"use client";

import * as React from "react";
import { UploadCloud, X, FileIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
    onUpload?: (files: File[]) => Promise<void>;
    multiple?: boolean;
    className?: string;
}

export function FileUpload({ onUpload, multiple = false, className }: FileUploadProps) {
    const [isDragging, setIsDragging] = React.useState(false);
    const [files, setFiles] = React.useState<File[]>([]);
    const [uploading, setUploading] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(Array.from(e.target.files));
        }
    };

    const handleFiles = (newFiles: File[]) => {
        if (!multiple && newFiles.length > 1) {
            newFiles = [newFiles[0]];
        }

        // Filter for images if needed, but we'll accept all for now based on logic
        // Reference accepted image/*
        let validFiles = newFiles.filter(file => file.type.startsWith("image/"));

        if (validFiles.length < newFiles.length) {
            alert("Only image files are allowed.");
        }

        // Filter by size (5MB)
        const inSizeLimit = validFiles.filter(file => {
            if (file.size > 5 * 1024 * 1024) {
                alert(`File ${file.name} is too large (max 5MB).`);
                return false;
            }
            return true;
        });
        validFiles = inSizeLimit;

        if (multiple) {
            // Limit to 10 total
            const total = files.length + validFiles.length;
            if (total > 10) {
                alert("Maximum 10 files allowed.");
                setFiles([...files, ...validFiles].slice(0, 10));
            } else {
                setFiles([...files, ...validFiles]);
            }
        } else {
            if (validFiles.length > 0) {
                setFiles([validFiles[0]]);
            }
        }
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const triggerUpload = async () => {
        if (files.length === 0 || !onUpload) return;

        setUploading(true);
        try {
            await onUpload(files);
            setFiles([]); // Clear after successful upload
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={cn("w-full max-w-md mx-auto", className)}>
            <div
                className={cn(
                    "relative border-2 border-dashed rounded-xl p-8 transition-colors flex flex-col items-center justify-center gap-4 text-center cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50",
                    isDragging ? "border-blue-500 bg-blue-50/10" : "border-zinc-200 dark:border-zinc-800",
                    uploading && "opacity-50 pointer-events-none"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    multiple={multiple}
                    accept="image/*"
                    onChange={handleFileSelect}
                />

                <div className="p-4 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <UploadCloud className="w-8 h-8 text-zinc-500" />
                </div>

                <div className="space-y-1">
                    <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                        Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-zinc-500">
                        SVG, PNG, JPG or GIF (max. 10 files if multi-upload)
                    </p>
                </div>
            </div>

            {files.length > 0 && (
                <div className="mt-6 space-y-3">
                    {files.map((file, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
                            <div className="w-10 h-10 rounded-md bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shrink-0">
                                {/* Create a small preview if it's an image */}
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt="preview"
                                    className="w-full h-full object-cover rounded-md"
                                    onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-zinc-500">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                            <button
                                onClick={() => removeFile(i)}
                                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-zinc-500"
                                disabled={uploading}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}

                    <button
                        onClick={triggerUpload}
                        disabled={uploading}
                        className="w-full py-2.5 px-4 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            `Upload ${files.length} file${files.length > 1 ? 's' : ''}`
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
