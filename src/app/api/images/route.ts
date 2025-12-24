
import { NextRequest, NextResponse } from "next/server";
import { uploadFile, deleteFile } from "@/services/storage";
import { validateRequest } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * @swagger
 * /api/images:
 *   post:
 *     summary: Upload a single image
 *     description: Uploads an image file to Firebase Storage and returns the public URL.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload
 *               path:
 *                 type: string
 *                 description: Optional folder path to store the file
 *     responses:
 *       201:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 url:
 *                   type: string
 *                   example: "https://firebasestorage.googleapis.com/..."
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Rate limit exceeded (Max 10 files per IP)
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete an image
 *     description: Deletes an image file from Firebase Storage using its public URL.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               publicUrl:
 *                 type: string
 *                 description: The public URL of the file to delete
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid request or missing URL
 *       500:
 *         description: Server error
 */

export async function POST(request: NextRequest) {
    try {
        if (!validateRequest(request)) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const ip = request.headers.get("x-forwarded-for") || "unknown";
        if (!checkRateLimit(ip, 1)) {
            return NextResponse.json(
                { success: false, error: "Rate limit exceeded. Max 10 files per IP." },
                { status: 429 }
            );
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
