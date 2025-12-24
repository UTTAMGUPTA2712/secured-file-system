
import { NextRequest, NextResponse } from "next/server";
import { uploadFile, deleteFile } from "@/services/storage";
import { validateRequest } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
    try {
        const isAuthenticated = validateRequest(request);
        const ip = request.headers.get("x-forwarded-for") || "unknown";

        // If NOT authenticated, check rate limit
        if (!isAuthenticated) {
            if (!checkRateLimit(ip, 1)) {
                return NextResponse.json(
                    { success: false, error: "Free tier limit reached (10 files). Enter API Key for unlimited uploads." },
                    { status: 429 }
                );
            }
        }

        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const path = formData.get("path") as string | undefined;

        if (!file) {
            return NextResponse.json(
                { success: false, error: "No file uploaded" },
                { status: 400 }
            );
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, error: "File size exceeds 5MB limit" },
                { status: 400 }
            );
        }

        const url = await uploadFile(file, path);

        return NextResponse.json({
            success: true,
            url,
        }, { status: 201 });
    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "An error occurred while uploading the file"
            },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        if (!validateRequest(request)) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { publicUrl } = body;

        if (!publicUrl) {
            return NextResponse.json(
                { success: false, error: "Missing publicUrl" },
                { status: 400 }
            );
        }

        await deleteFile(publicUrl);

        return NextResponse.json({
            success: true,
            message: `File with URL ${publicUrl} deleted successfully`
        }, { status: 200 });

    } catch (error: any) {
        console.error("Delete error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "An error occurred while deleting the file"
            },
            { status: 500 }
        );
    }
}
