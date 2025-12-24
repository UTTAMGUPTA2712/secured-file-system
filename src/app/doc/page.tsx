
"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { ArrowLeft } from "lucide-react";
import Link from "next/link"; // Use next/link for better navigation

export default function ApiDoc() {
    return (
        <div className="bg-white min-h-screen">
            <div className="bg-zinc-50 border-b border-zinc-200 p-4 sticky top-0 z-50 flex items-center gap-4">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>
                <div className="h-4 w-px bg-zinc-300 mx-2" />
                <span className="text-sm font-semibold text-zinc-900">API Documentation</span>
            </div>
            <SwaggerUI url="/api/doc" />
        </div>
    );
}
