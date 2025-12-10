# Design Document — Healthcare Platform (Patient Documents)

This document answers the assignment questions, describes the architecture, API spec, data flow and assumptions.

1) Tech Stack Choices

- Q1. Frontend: React (used in this repo).
  - Reason: React is already present in the workspace; it provides a straightforward component model and fast developer feedback with Vite.

- Q2. Backend: Express (Node.js) — used in this repo.
  - Reason: Lightweight, flexible, and pairs well with Node/npm tooling. The existing code already uses Express and Multer for file handling.

- Q3. Database: MongoDB (currently used via Mongoose in the repo).
  - Reason: The repository is already configured to use MongoDB (easy to model document metadata). For a simple single-user prototype MongoDB is convenient. If the assignment strictly requires a relational DB (SQLite/Postgres), switching would require replacing Mongoose code with a small SQL layer — doable but not implemented here to preserve existing code.

- Q4. Changes to support 1,000 users
  - Move file storage to object storage (S3 or equivalent) rather than local disk.
  - Use a managed database (Postgres/RDS or MongoDB Atlas) with proper indexing and replica sets.
  - Add authentication and per-user isolation (user_id foreign key in metadata table/collection).
  - Add pagination for listing endpoints and background jobs for large file processing.
  - Run backend behind a load balancer and use stateless servers (store uploads in S3 and persist metadata in DB).

2) Architecture Overview

- Flow (high level):
  - Frontend (React) sends requests to Backend (Express) over HTTP.
  - Uploads: Backend receives multipart form, saves files to `backend/src/uploads` and creates metadata documents in the database.
  - List/Download/Delete: Backend reads metadata from DB and serves files from local uploads folder.

- Simple diagram (text):
  - Browser (React UI) <--> Express API (routes /documents/*) <--> Database (MongoDB via Mongoose)
  - Express also reads/writes files to local disk: `backend/src/uploads`

3) API Specification

Base URL: `http://localhost:5000`

- POST /documents/upload
  - Description: Upload one or more PDF files (multipart form, field name `files`).
  - Request (curl sample):
    - Single file: `curl -F "files=@/path/to/doc.pdf" http://localhost:5000/documents/upload`
    - Multiple: `curl -F "files=@doc1.pdf" -F "files=@doc2.pdf" http://localhost:5000/documents/upload`
  - Response (200):
    {
      "message": "Upload successful",
      "uploaded": 1,
      "documents": [ { "_id": "<id>", "filename": "<stored-filename>", "originalName":"doc.pdf", "size": 12345, "createdAt": "..." } ]
    }

- GET /documents
  - Description: Return all document metadata (sorted by most recent).
  - Sample request: `curl http://localhost:5000/documents`
  - Response (200): JSON array of document metadata objects: `[{ _id, filename, originalName, size, createdAt }, ...]`

- GET /documents/:id
  - Description: Download specific file by document id. The response is an attachment with the original filename.
  - Sample request: `curl http://localhost:5000/documents/<DOCUMENT_ID> -o out.pdf`
  - Response: File stream (200) or 404 if not found.

- DELETE /documents/:id
  - Description: Delete the metadata record and remove the stored file from disk.
  - Sample request: `curl -X DELETE http://localhost:5000/documents/<DOCUMENT_ID>`
  - Response (200): `{ "message": "Document deleted" }`

4) Data Flow Description

- Upload flow (step-by-step):
  1. User selects file(s) in the React UI and submits.
  2. Frontend creates a `FormData` instance and appends files under the `files` field.
  3. Frontend calls `POST /documents/upload` with multipart form body.
  4. Backend uses Multer middleware to parse the multipart body and store each file to `backend/src/uploads` with a timestamped filename.
  5. For each stored file the backend writes a metadata record to the database containing: stored filename, original filename, size, createdAt.
  6. Backend responds with success and the created metadata objects.

- Download flow (step-by-step):
  1. User clicks download in the UI (or calls `GET /documents/:id`).
  2. Backend looks up the metadata by id in the database, computes the stored file path.
  3. Backend verifies the file exists on disk and streams it to the client with `res.download(...)` using the original filename.

5) Assumptions

- Q6. Assumptions made:
  - Single-user system for this assignment (no authentication or multi-tenant separation).
  - File type: only PDFs allowed; validated by MIME type via Multer.
  - File size: no explicit limit configured in code; the runtime may impose defaults. For production, set a max file size in Multer and validate on client.
  - Concurrency: local disk storage and MongoDB single instance are fine for a prototype; for scale move to S3 and managed DB.
  - The repository currently uses MongoDB (Mongoose). The assignment requested SQLite/Postgres as examples — swapping would require small data access changes.

Appendix — Notes and corrections I applied to repository

- Frontend `frontend/src/api.js`: updated upload function to use `files` as the multipart field and support single or multiple files. This aligns the frontend with backend route `upload.array('files', 10)`.

- `README.md` (root): added run instructions and sample curl commands matching implemented endpoints and form field `files`.

If you'd like, I can:
- Replace MongoDB with SQLite (Knex or Sequelize) so the project uses a relational DB as requested in the assignment.
- Add `design.pdf` instead of `design.md` or add per-folder README files.
- Add server-side file size limits and better error messages.

Tell me which of the optional follow-ups you want me to implement next.
