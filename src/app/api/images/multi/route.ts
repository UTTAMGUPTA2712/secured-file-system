
import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/services/storage";
import { validateRequest } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
    try {
        const isAuthenticated = validateRequest(request);

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

        // If NOT authenticated, check rate limit
        if (!isAuthenticated) {
            if (!checkRateLimit(ip, files.length)) {
                return NextResponse.json(
                    { success: false, error: `Free tier limit reached. You tried to upload ${files.length} files. Enter API Key for unlimited.` },
                    { status: 429 }
                );
            }
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
