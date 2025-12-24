
"use client";

import { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { Copy, Check, Trash2, ExternalLink, Key, Lock, Loader2, HardDrive } from "lucide-react";

interface UploadedFile {
  url: string;
  name: string;
}

export default function Home() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  const handleUpload = async (files: File[]) => {
    try {
      if (!apiKey) {
        alert("Please enter the API Key first.");
        return;
      }

      if (files.length === 0) return;

      const formData = new FormData();
      const headers = {
        "Authorization": `Bearer ${apiKey}`
      };

      if (files.length === 1) {
        // Single upload
        formData.append("file", files[0]);
        const res = await fetch("/api/images", {
          method: "POST",
          headers,
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setUploadedFiles(prev => [...prev, { url: data.url, name: files[0].name }]);
        } else {
          alert(`Upload failed: ${data.error || res.statusText}`);
        }
      } else {
        // Multi upload
        files.forEach(file => formData.append("files", file));
        const res = await fetch("/api/images/multi", {
          method: "POST",
          headers,
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const newFiles = data.urls.map((url: string, i: number) => ({
            url,
            name: files[i].name
          }));
          setUploadedFiles(prev => [...prev, ...newFiles]);
        } else {
          alert(`Upload failed: ${data.error || res.statusText}`);
        }
      }
    } catch (error) {
      console.error("Error uploading:", error);
      alert("An error occurred during upload.");
    }
  };

  const handleDelete = async (file: UploadedFile, index: number) => {
    if (!apiKey) {
      alert("Please enter the API Key first.");
      return;
    }

    if (!confirm("Are you sure you want to delete this file?")) return;

    setDeletingIndex(index);
    try {
      const res = await fetch("/api/images", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({ publicUrl: file.url })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
      } else {
        alert(`Delete failed: ${data.error || res.statusText}`);
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("An error occurred during deletion.");
    } finally {
      setDeletingIndex(null);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const clearList = () => {
    setUploadedFiles([]);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="text-center space-y-6 pt-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl mb-2 hover:scale-105 transition-transform duration-300">
            <HardDrive className="w-10 h-10 text-white" />
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-zinc-100 dark:to-zinc-500">
              File System
            </h1>
            <p className="text-zinc-500 max-w-lg mx-auto text-lg">
              Secure, high-performance storage for your applications.
            </p>
          </div>

          <div className="flex gap-4">
            <a
              href="/doc"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              API Docs
            </a>
          </div>
        </header>

        <main className="space-y-12">
          <div className="max-w-md mx-auto space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <Key className="w-4 h-4" />
              API Secret Key
            </label>
            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API Key to upload/delete..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-zinc-500 focus:outline-none transition-all"
              />
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <section className={!apiKey ? "opacity-50 pointer-events-none grayscale transition-all" : "transition-all"}>
            <FileUpload
              multiple
              onUpload={handleUpload}
              className="max-w-xl mx-auto"
            />
          </section>

          {uploadedFiles.length > 0 && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Uploaded Files</h2>
                <button
                  onClick={clearList}
                  className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 flex items-center gap-1"
                >
                  Clear List (Local)
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {uploadedFiles.map((file, i) => (
                  <div key={i} className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="aspect-video relative bg-zinc-100 dark:bg-zinc-800">
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                        <button
                          onClick={() => handleDelete(file, i)}
                          disabled={deletingIndex === i}
                          className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full backdrop-blur-sm transition-colors"
                        >
                          {deletingIndex === i ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <p className="font-medium text-sm truncate" title={file.name}>
                        {file.name}
                      </p>

                      <div className="flex items-center gap-2">
                        <input
                          readOnly
                          value={file.url}
                          className="flex-1 text-xs bg-zinc-100 dark:bg-zinc-800 border-none rounded px-2 py-1 truncate focus:outline-none text-zinc-500"
                        />
                        <button
                          onClick={() => copyToClipboard(file.url, i)}
                          className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                          title="Copy URL"
                        >
                          {copiedIndex === i ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-zinc-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
