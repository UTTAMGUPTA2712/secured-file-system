
import "server-only";
import admin from 'firebase-admin';

interface FirebaseAdminConfig {
    projectId: string;
    clientEmail: string;
    privateKey: string;
}

function formatPrivateKey(key: string) {
    return key.replace(/\\n/g, '\n');
}

export function createFirebaseAdminApp(config: FirebaseAdminConfig) {
    if (admin.apps.length > 0) {
        return admin.app();
    }

    return admin.initializeApp({
        credential: admin.credential.cert({
            projectId: config.projectId,
            clientEmail: config.clientEmail,
            privateKey: formatPrivateKey(config.privateKey),
        }),
    });
}

export function getStorage() {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const storageBucket = process.env.STORAGE_BUCKET;

    if (!projectId || !clientEmail || !privateKey || !storageBucket) {
        throw new Error('Missing Firebase configuration environment variables');
    }

    const app = createFirebaseAdminApp({
        projectId,
        clientEmail,
        privateKey,
    });

    return app.storage().bucket(storageBucket);
}
