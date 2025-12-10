# Healthcare Platform

This repository contains a small React + Vite frontend and an Express backend for uploading, listing, downloading and deleting PDF documents.

**Quick overview**
- **Backend**: `backend/` — Express + Multer, stores uploads in `backend/src/uploads` and persists metadata to MongoDB.
- **Frontend**: `frontend/` — React + Vite UI that talks to the backend at `http://localhost:5000/documents`.

**Requirements**
- Node.js (v16+ recommended)
- npm
- A MongoDB instance (connection string in `backend/.env` as `MONGO_URI`)

**Environment**
Create or update `backend/.env` with at least:

```
PORT=5000
MONGO_URI=your_mongo_connection_string
CORS_ORIGIN=*
```

Replace `your_mongo_connection_string` with a valid MongoDB URI.

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

Single file:

```bash
curl -v -F "files=@/path/to/document.pdf" http://localhost:5000/documents/upload
```

Multiple files:

```bash
curl -v -F "files=@/path/to/doc1.pdf" -F "files=@/path/to/doc2.pdf" http://localhost:5000/documents/upload
```

- Download a document by id (GET)

```bash
curl http://localhost:5000/documents/<DOCUMENT_ID> -o downloaded.pdf
```

- Delete a document by id (DELETE)

```bash
curl -X DELETE http://localhost:5000/documents/<DOCUMENT_ID>
```

**Notes & troubleshooting**
- Uploaded files are saved to `backend/src/uploads` by default.
- The backend performs a MIME-type check and currently only accepts PDF files.
- If you change the upload form field name in a client, make sure it matches the backend (currently `files`).
- If MongoDB fails to connect, ensure `MONGO_URI` is correct and reachable.

If you want, I can also add a `backend/README.md` with only backend-specific notes or update the frontend README to include screenshots and usage instructions. Would you like that?
