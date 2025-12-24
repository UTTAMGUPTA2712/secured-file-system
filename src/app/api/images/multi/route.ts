
import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/services/storage";
import { validateRequest } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
    try {
        if (!validateRequest(request)) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const files = formData.getAll("files") as File[];
        const path = formData.get("path") as string | undefined;

        if (!files || files.length === 0) {
            return NextResponse.json(
                { success: false, error: "No files uploaded" },
                { status: 400 }
            );
        }

        if (files.length > 10) {
            return NextResponse.json(
                { success: false, error: "Maximum 10 files allowed" },
                { status: 400 }
            );
        }

        for (const file of files) {
            if (file.size > 5 * 1024 * 1024) {
                return NextResponse.json(
                    { success: false, error: `File ${file.name} exceeds 5MB limit` },
                    { status: 400 }
                );
            }
        }

        const ip = request.headers.get("x-forwarded-for") || "unknown";
        if (!checkRateLimit(ip, files.length)) {
            return NextResponse.json(
                { success: false, error: `Rate limit exceeded. Max 10 files per IP. You tried to upload ${files.length}.` },
                { status: 429 }
            );
        }

        // Upload in parallel
        const uploadPromises = files.map(file => uploadFile(file, path));
        const urls = await Promise.all(uploadPromises);

        return NextResponse.json({
            success: true,
            urls,
        }, { status: 201 });
    } catch (error: any) {
        console.error("Multi-upload error:", error);
        // ... rest of error handling
        return NextResponse.json(
            {
                success: false,
                error: error.message || "An error occurred"
            },
            { status: 500 }
        );
    }
}
