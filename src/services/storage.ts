
import { getStorage } from "@/lib/firebase-admin";

export async function uploadFile(file: File, folder?: string): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const bucket = getStorage();

    // Sanitize filename to prevent issues
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');

    let fileName = `${Date.now()}-${sanitizedName}`;
    if (folder) {
        const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
        if (cleanFolder) {
            fileName = `${cleanFolder}/${fileName}`;
        }
    }

    const fileUpload = bucket.file(fileName);

    await fileUpload.save(buffer, {
        metadata: {
            contentType: file.type,
        },
        public: true,
    });

    const encodedName = encodeURIComponent(fileName);
    return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedName}?alt=media`;
}

export async function deleteFile(fileUrl: string): Promise<void> {
    // Extract filename from URL
    // URL format: .../o/[filename]?alt=media...
    try {
        const urlObj = new URL(fileUrl);
        // Pathname might be /v0/b/bucket/o/filename
        const pathParts = urlObj.pathname.split('/o/');
        if (pathParts.length < 2) {
            throw new Error("Invalid URL format");
        }

        // The filename is URL encoded in the path
        const fileName = decodeURIComponent(pathParts[1]);

        const bucket = getStorage();
        const file = bucket.file(fileName);

        await file.delete();
    } catch (error) {
        console.error("Error deleting file:", error);
        throw error;
    }
}
