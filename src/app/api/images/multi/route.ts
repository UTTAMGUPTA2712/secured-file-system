
import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/services/storage";
import { validateRequest } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * @swagger
 * /api/images/multi:
 *   post:
 *     summary: Upload multiple images
 *     description: Uploads up to 10 image files to Firebase Storage and returns their public URLs.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: The image files to upload (max 10)
 *               path:
 *                 type: string
 *                 description: Optional folder path to store the files
 *     responses:
 *       201:
 *         description: Images uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 urls:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["https://firebasestorage.googleapis.com/..."]
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Rate limit exceeded (Max 10 files per IP)
 *       400:
 *         description: No files uploaded or too many files
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
