
// Simple in-memory rate limiter
// Map<IP_Address, File_Count>
const ipUploadCounts = new Map<string, number>();

// Maximum files allowed per IP
const MAX_FILES_PER_IP = 10;

export function checkRateLimit(ip: string, cost: number = 1): boolean {
    const currentCount = ipUploadCounts.get(ip) || 0;

    if (currentCount + cost > MAX_FILES_PER_IP) {
        return false;
    }

    ipUploadCounts.set(ip, currentCount + cost);
    return true;
}

export function getRemainingLimit(ip: string): number {
    const currentCount = ipUploadCounts.get(ip) || 0;
    return Math.max(0, MAX_FILES_PER_IP - currentCount);
}
