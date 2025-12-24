
import { NextRequest } from "next/server";

export function validateRequest(request: NextRequest): boolean {
    const authHeader = request.headers.get("Authorization");
    const secretKey = process.env.API_SECRET_KEY;

    if (!secretKey) {
        // If no key is configured on server, everything is forbidden for safety
        console.error("API_SECRET_KEY is not set in environment variables");
        return false;
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return false;
    }

    const token = authHeader.split(" ")[1];
    return token === secretKey;
}
