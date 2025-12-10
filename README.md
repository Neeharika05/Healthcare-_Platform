# Healthcare Platform

This repository contains a small React + Vite frontend and an Express backend for uploading, listing, downloading and deleting PDF documents.

**Features**

- Drag-and-drop PDF upload with modern UI
- File chooser and upload button 
- Duplicate file name detection and rename prompt
- Toast notifications for upload, delete, and download actions
- View, download, and delete PDFs securely
- Fixed table header with scrollable document list
- Responsive and clean design (Tailwind CSS)

**Quick overview**
- **Backend**: `backend/` — Express + Multer, stores uploads in `backend/src/uploads` and persists metadata to MongoDB.
- **Frontend**: `frontend/` — React + Vite UI that talks to the backend at `http://localhost:5000/documents`.

**Requirements**
- Node.js (v16+ recommended)
- npm
- A MongoDB instance (connection string in `backend/.env` as `MONGO_URI`)

**Environment**
CORS_ORIGIN=*
```
**Run (development)**

- Start the backend

```powershell
cd backend
npm install
npm run dev
```

- Start the frontend (in a separate terminal)

```powershell
cd frontend
npm install
npm run dev
```

Open the frontend URL printed by Vite (typically `http://localhost:5173`) or use the API directly.

**API / Example curl calls**

Base URL: `http://localhost:5000/documents`

- Health check

```bash
curl http://localhost:5000/
```

- List documents (GET)

```bash
curl http://localhost:5000/documents
```

- Upload one or more PDF files (multipart form)

Note: the backend route accepts an array field named `files` (up to 10 files) and currently only allows `application/pdf`.


```bash
curl -v -F "files=@/path/to/document.pdf" http://localhost:5000/documents/upload

Multiple files:

curl -v -F "files=@/path/to/doc1.pdf" -F "files=@/path/to/doc2.pdf" http://localhost:5000/documents/upload
```


```bash
curl http://localhost:5000/documents/<DOCUMENT_ID> -o downloaded.pdf

- Delete a document by id (DELETE)

```bash
curl -X DELETE http://localhost:5000/documents/<DOCUMENT_ID>
**Notes & troubleshooting**
- Uploaded files are saved to `backend/src/uploads` by default.
If you want, I can also add a `backend/README.md` with only backend-specific notes or update the frontend README to include screenshots and usage instructions. Would you like that?