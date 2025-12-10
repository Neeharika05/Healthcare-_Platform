import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import Document from "../models/Document.js";

const router = express.Router();

// Fix __dirname support in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store uploads in backend/uploads
const uploadDir = path.resolve(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname)
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") cb(null, true);
  else cb(new Error("Only PDF files allowed"), false);
};

const upload = multer({ storage, fileFilter });

// POST /documents/upload  - upload single PDF
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const doc = await Document.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });

    res.json({ message: "Upload successful", document: doc });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /documents  - list all
router.get("/", async (req, res) => {
  try {
    const docs = await Document.find().sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    console.error("Fetch failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Helper to resolve file path
const getFilePath = async (id) => {
  const doc = await Document.findById(id);
  if (!doc) return { error: "Document not found" };

  const filePath = path.join(uploadDir, doc.filename);
  if (!fs.existsSync(filePath)) {
    return { error: "Stored file missing" };
  }

  return { doc, filePath };
};

// GET /documents/:id/view  - view PDF in browser
router.get("/:id/view", async (req, res) => {
  try {
    const { doc, filePath, error } = await getFilePath(req.params.id);
    if (error) return res.status(404).json({ error });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${doc.originalName}"`
    );
    res.sendFile(filePath);
  } catch (err) {
    console.error("View failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /documents/:id  - download PDF (spec endpoint)
router.get("/:id", async (req, res) => {
  try {
    const { doc, filePath, error } = await getFilePath(req.params.id);
    if (error) return res.status(404).json({ error });

    res.download(filePath, doc.originalName);
  } catch (err) {
    console.error("Download failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /documents/:id  - delete file + record
router.delete("/:id", async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    const filePath = path.join(uploadDir, doc.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: "Document deleted" });
  } catch (err) {
    console.error("Delete failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
