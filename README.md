# File System Microservice

A dedicated, secure file storage microservice built with Next.js and Firebase Storage. This application is designed to be hosted separately from your main application to handle all file management needs efficiently.

## 🚀 Capabilities

- **Secure Uploads**: API Key authentication required for all operations.
- **Single & Multi-Upload**: Support for uploading one or multiple files (up to 10) simultaneously.
- **Custom Paths**: Organize files into specific folders/paths within the bucket.
- **Rate Limiting**: Built-in protection limiting uploads to 10 files per IP address.
- **Size Limits**: Enforced 5MB limit per file.
- **Deletion**: Secure API to delete files via their public URL.
- **OpenAPI Documentation**: Auto-generated Swagger UI for easy API testing and integration.

## 🛠️ Setup

1. **Environment Variables**:
   Copy `.env.example` (or use the provided keys) to `.env.local`:
   ```bash
   FIREBASE_PROJECT_ID=...
   FIREBASE_CLIENT_EMAIL=...
   FIREBASE_PRIVATE_KEY=...
   STORAGE_BUCKET=...
   API_SECRET_KEY=...
   ```

2. **Run Locally**:
   ```bash
   npm run dev
   ```

3. **Documentation**:
   Visit `http://localhost:3000/doc` to explore the API.

## 📦 API Overview

### `POST /api/images`
Upload a single file.
- Body: `file` (binary), `path` (optional string)
- Header: `Authorization: Bearer <API_SECRET_KEY>`

### `POST /api/images/multi`
Upload multiple files.
- Body: `files` (binary array), `path` (optional string)
- Header: `Authorization: Bearer <API_SECRET_KEY>`

### `DELETE /api/images`
Delete a file.
- Body: `publicUrl` (string)
- Header: `Authorization: Bearer <API_SECRET_KEY>`
